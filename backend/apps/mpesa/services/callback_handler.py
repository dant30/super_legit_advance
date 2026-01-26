# backend/apps/mpesa/services/callback_handler.py
import logging
from django.utils import timezone
from apps.mpesa.models import MpesaPayment, MpesaTransaction, MpesaCallback
from apps.customers.models import Customer
from apps.loans.models import Loan
from apps.repayments.models import Repayment

logger = logging.getLogger(__name__)


class CallbackHandler:
    """
    Handler for processing M-Pesa callbacks.
    """
    
    def handle_stk_push_callback(self, callback_data):
        """
        Handle STK push callback.
        
        Args:
            callback_data (dict): Callback data from M-Pesa
            
        Returns:
            dict: Processing result
        """
        try:
            logger.info(f"Handling STK push callback: {callback_data}")
            
            # Extract key information
            if 'Body' in callback_data and 'stkCallback' in callback_data['Body']:
                stk_callback = callback_data['Body']['stkCallback']
                
                merchant_request_id = stk_callback.get('MerchantRequestID')
                checkout_request_id = stk_callback.get('CheckoutRequestID')
                result_code = stk_callback.get('ResultCode')
                result_desc = stk_callback.get('ResultDesc')
                
                # Find payment
                try:
                    payment = MpesaPayment.objects.get(
                        merchant_request_id=merchant_request_id,
                        checkout_request_id=checkout_request_id
                    )
                except MpesaPayment.DoesNotExist:
                    logger.error(f"Payment not found for callback: {merchant_request_id}, {checkout_request_id}")
                    return {
                        'success': False,
                        'message': 'Payment not found'
                    }
                
                # Update payment status
                if result_code == 0:
                    # Successful payment
                    payment.mark_as_successful(result_code, result_desc)
                    
                    # Extract transaction details
                    callback_metadata = {}
                    if 'CallbackMetadata' in stk_callback:
                        for item in stk_callback['CallbackMetadata']['Item']:
                            if 'Name' in item and 'Value' in item:
                                callback_metadata[item['Name']] = item['Value']
                    
                    payment.callback_metadata = callback_metadata
                    payment.save()
                    
                    # Create transaction record
                    if 'MpesaReceiptNumber' in callback_metadata:
                        MpesaTransaction.create_from_payment(payment)
                    
                    # Process payment completion
                    payment.process_payment_completion()
                    
                    logger.info(f"STK push payment successful: {payment.payment_reference}")
                    
                    return {
                        'success': True,
                        'message': 'Payment processed successfully',
                        'payment_id': payment.id,
                        'payment_reference': payment.payment_reference,
                        'receipt_number': callback_metadata.get('MpesaReceiptNumber', '')
                    }
                else:
                    # Failed payment
                    payment.mark_as_failed(
                        error_code=str(result_code),
                        error_message=result_desc
                    )
                    
                    logger.warning(f"STK push payment failed: {payment.payment_reference}, Code: {result_code}")
                    
                    return {
                        'success': False,
                        'message': 'Payment failed',
                        'payment_id': payment.id,
                        'payment_reference': payment.payment_reference,
                        'error_code': result_code,
                        'error_message': result_desc
                    }
            
            else:
                logger.error("Invalid STK push callback structure")
                return {
                    'success': False,
                    'message': 'Invalid callback structure'
                }
                
        except Exception as e:
            logger.error(f"Error handling STK push callback: {str(e)}")
            return {
                'success': False,
                'message': f'Error processing callback: {str(e)}'
            }
    
    def handle_c2b_validation(self, callback_data):
        """
        Handle C2B validation callback.
        
        Args:
            callback_data (dict): C2B validation data
            
        Returns:
            dict: Validation result with response for M-Pesa
        """
        try:
            logger.info(f"Handling C2B validation: {callback_data}")
            
            # Extract validation data
            trans_type = callback_data.get('TransType', '')
            trans_id = callback_data.get('TransID', '')
            trans_time = callback_data.get('TransTime', '')
            trans_amount = float(callback_data.get('TransAmount', 0))
            business_shortcode = callback_data.get('BusinessShortCode', '')
            bill_ref_number = callback_data.get('BillRefNumber', '')
            msisdn = callback_data.get('MSISDN', '')
            
            # Validate the transaction
            validation_result = self._validate_c2b_transaction(
                trans_type=trans_type,
                trans_amount=trans_amount,
                business_shortcode=business_shortcode,
                bill_ref_number=bill_ref_number,
                msisdn=msisdn
            )
            
            if validation_result['valid']:
                # Create pending payment record
                payment = MpesaPayment.objects.create(
                    phone_number=msisdn,
                    amount=trans_amount,
                    description=f"C2B Payment: {bill_ref_number}",
                    payment_type='LOAN_REPAYMENT',
                    status='PENDING',
                    callback_metadata=callback_data
                )
                
                # Try to link to customer by phone number or account reference
                self._link_c2b_payment(payment, msisdn, bill_ref_number)
                
                logger.info(f"C2B validation passed: {trans_id}, Amount: {trans_amount}")
                
                return {
                    'success': True,
                    'message': 'Validation passed',
                    'response': {
                        'ResultCode': 0,
                        'ResultDesc': 'Accepted'
                    }
                }
            else:
                logger.warning(f"C2B validation rejected: {validation_result['reason']}")
                
                return {
                    'success': False,
                    'message': 'Validation rejected',
                    'response': {
                        'ResultCode': validation_result.get('error_code', 1),
                        'ResultDesc': validation_result.get('reason', 'Rejected')
                    }
                }
                
        except Exception as e:
            logger.error(f"Error handling C2B validation: {str(e)}")
            return {
                'success': False,
                'message': f'Error processing validation: {str(e)}',
                'response': {
                    'ResultCode': 1,
                    'ResultDesc': 'System error'
                }
            }
    
    def handle_c2b_confirmation(self, callback_data):
        """
        Handle C2B confirmation callback.
        
        Args:
            callback_data (dict): C2B confirmation data
            
        Returns:
            dict: Processing result
        """
        try:
            logger.info(f"Handling C2B confirmation: {callback_data}")
            
            # Extract confirmation data
            trans_id = callback_data.get('TransID', '')
            trans_amount = float(callback_data.get('TransAmount', 0))
            bill_ref_number = callback_data.get('BillRefNumber', '')
            msisdn = callback_data.get('MSISDN', '')
            
            # Find existing payment by metadata or create new
            payments = MpesaPayment.objects.filter(
                phone_number__contains=msisdn[-9:],  # Match by phone number
                amount=trans_amount,
                status='PENDING'
            ).order_by('-created_at')
            
            if payments.exists():
                payment = payments.first()
            else:
                # Create new payment
                payment = MpesaPayment.objects.create(
                    phone_number=msisdn,
                    amount=trans_amount,
                    description=f"C2B Payment: {bill_ref_number}",
                    payment_type='LOAN_REPAYMENT',
                    status='PROCESSING',
                    callback_metadata=callback_data
                )
            
            # Update payment with transaction details
            payment.merchant_request_id = f"C2B-{trans_id}"
            payment.checkout_request_id = trans_id
            payment.result_code = 0
            payment.result_description = 'C2B payment confirmed'
            payment.mark_as_successful(0, 'C2B payment completed')
            
            # Link to customer and process
            self._link_c2b_payment(payment, msisdn, bill_ref_number)
            payment.process_payment_completion()
            
            # Create transaction record
            transaction = MpesaTransaction.objects.create(
                payment=payment,
                transaction_id=f"C2B-{trans_id}",
                mpesa_receipt_number=trans_id,
                amount=trans_amount,
                phone_number=msisdn,
                transaction_date=timezone.now(),
                account_reference=bill_ref_number,
                transaction_description=f"C2B Payment: {bill_ref_number}",
                raw_response=callback_data
            )
            
            logger.info(f"C2B confirmation processed: {trans_id}, Payment: {payment.payment_reference}")
            
            return {
                'success': True,
                'message': 'C2B confirmation processed',
                'payment_id': payment.id,
                'transaction_id': transaction.id
            }
            
        except Exception as e:
            logger.error(f"Error handling C2B confirmation: {str(e)}")
            return {
                'success': False,
                'message': f'Error processing confirmation: {str(e)}'
            }
    
    def handle_b2c_result(self, callback_data):
        """
        Handle B2C result callback.
        
        Args:
            callback_data (dict): B2C result data
            
        Returns:
            dict: Processing result
        """
        try:
            logger.info(f"Handling B2C result: {callback_data}")
            
            # Extract B2C result data
            result_type = callback_data.get('Result', {})
            result_code = result_type.get('ResultCode', '')
            result_desc = result_type.get('ResultDesc', '')
            transaction_id = result_type.get('TransactionID', '')
            
            # Process based on result code
            if result_code == 0:
                # Successful disbursement
                logger.info(f"B2C disbursement successful: {transaction_id}")
                
                # TODO: Update loan disbursement status
                # TODO: Send notification to customer
                
                return {
                    'success': True,
                    'message': 'B2C disbursement successful',
                    'transaction_id': transaction_id
                }
            else:
                # Failed disbursement
                logger.warning(f"B2C disbursement failed: {transaction_id}, Code: {result_code}")
                
                # TODO: Update loan disbursement status
                # TODO: Notify admin of failure
                
                return {
                    'success': False,
                    'message': f'B2C disbursement failed: {result_desc}',
                    'error_code': result_code,
                    'transaction_id': transaction_id
                }
                
        except Exception as e:
            logger.error(f"Error handling B2C result: {str(e)}")
            return {
                'success': False,
                'message': f'Error processing B2C result: {str(e)}'
            }
    
    def handle_b2c_timeout(self, callback_data):
        """
        Handle B2C timeout callback.
        
        Args:
            callback_data (dict): B2C timeout data
            
        Returns:
            dict: Processing result
        """
        try:
            logger.warning(f"Handling B2C timeout: {callback_data}")
            
            # Extract timeout data
            result = callback_data.get('Result', {})
            transaction_id = result.get('TransactionID', '')
            
            # TODO: Handle B2C timeout
            # - Update disbursement status
            # - Log the timeout
            # - Notify admin
            
            return {
                'success': True,
                'message': 'B2C timeout processed',
                'transaction_id': transaction_id
            }
            
        except Exception as e:
            logger.error(f"Error handling B2C timeout: {str(e)}")
            return {
                'success': False,
                'message': f'Error processing B2C timeout: {str(e)}'
            }
    
    def handle_reversal_result(self, callback_data):
        """
        Handle reversal result callback.
        
        Args:
            callback_data (dict): Reversal result data
            
        Returns:
            dict: Processing result
        """
        try:
            logger.info(f"Handling reversal result: {callback_data}")
            
            # Extract reversal data
            result = callback_data.get('Result', {})
            result_code = result.get('ResultCode', '')
            result_desc = result.get('ResultDesc', '')
            transaction_id = result.get('TransactionID', '')
            original_transaction_id = result.get('OriginalTransactionID', '')
            
            # Find transaction
            try:
                transaction = MpesaTransaction.objects.get(
                    mpesa_receipt_number=original_transaction_id
                )
            except MpesaTransaction.DoesNotExist:
                logger.error(f"Transaction not found for reversal: {original_transaction_id}")
                return {
                    'success': False,
                    'message': 'Transaction not found'
                }
            
            # Update transaction based on result
            if result_code == 0:
                # Successful reversal
                transaction.status = 'REVERSED'
                transaction.reversal_reason = result_desc
                transaction.reversed_at = timezone.now()
                transaction.save()
                
                # Update payment status
                transaction.payment.status = 'CANCELLED'
                transaction.payment.save()
                
                logger.info(f"Reversal successful: {original_transaction_id}")
                
                return {
                    'success': True,
                    'message': 'Reversal processed successfully',
                    'transaction_id': transaction_id,
                    'original_transaction_id': original_transaction_id
                }
            else:
                # Failed reversal
                logger.warning(f"Reversal failed: {original_transaction_id}, Code: {result_code}")
                
                return {
                    'success': False,
                    'message': f'Reversal failed: {result_desc}',
                    'error_code': result_code,
                    'original_transaction_id': original_transaction_id
                }
                
        except Exception as e:
            logger.error(f"Error handling reversal result: {str(e)}")
            return {
                'success': False,
                'message': f'Error processing reversal result: {str(e)}'
            }
    
    def _validate_c2b_transaction(self, trans_type, trans_amount, business_shortcode,
                                 bill_ref_number, msisdn):
        """
        Validate C2B transaction.
        
        Args:
            trans_type (str): Transaction type
            trans_amount (float): Transaction amount
            business_shortcode (str): Business shortcode
            bill_ref_number (str): Bill reference number
            msisdn (str): Customer phone number
            
        Returns:
            dict: Validation result
        """
        from django.conf import settings
        
        # Check business shortcode
        expected_shortcode = getattr(settings, 'MPESA_SHORTCODE', '')
        if business_shortcode != expected_shortcode:
            return {
                'valid': False,
                'reason': 'Invalid business shortcode',
                'error_code': 'C2B00001'
            }
        
        # Check minimum amount
        if trans_amount < 1:
            return {
                'valid': False,
                'reason': 'Amount too low',
                'error_code': 'C2B00002'
            }
        
        # Check maximum amount (optional)
        max_amount = getattr(settings, 'MPESA_MAX_C2B_AMOUNT', 70000)
        if trans_amount > max_amount:
            return {
                'valid': False,
                'reason': f'Amount exceeds maximum of {max_amount}',
                'error_code': 'C2B00003'
            }
        
        # Validate account reference format
        if not bill_ref_number or len(bill_ref_number) < 3:
            return {
                'valid': False,
                'reason': 'Invalid account reference',
                'error_code': 'C2B00004'
            }
        
        # Validate phone number
        if not msisdn or len(msisdn) < 12:
            return {
                'valid': False,
                'reason': 'Invalid phone number',
                'error_code': 'C2B00005'
            }
        
        # Additional business logic validation
        # Example: Check if customer exists and has active loan
        try:
            # Try to find customer by phone number
            phone_number = self._format_phone_for_lookup(msisdn)
            customer = Customer.objects.filter(phone_number=phone_number).first()
            
            if customer and customer.is_blacklisted:
                return {
                    'valid': False,
                    'reason': 'Customer is blacklisted',
                    'error_code': 'C2B00006'
                }
            
            # Check if bill reference matches loan or customer number
            if bill_ref_number.startswith('LN'):
                # Loan reference
                try:
                    loan = Loan.objects.get(loan_number=bill_ref_number)
                    if loan.customer != customer:
                        return {
                            'valid': False,
                            'reason': 'Loan does not belong to customer',
                            'error_code': 'C2B00007'
                        }
                except Loan.DoesNotExist:
                    return {
                        'valid': False,
                        'reason': 'Loan not found',
                        'error_code': 'C2B00008'
                    }
            
        except Exception as e:
            logger.warning(f"Error during C2B validation: {str(e)}")
            # Continue with validation even if customer lookup fails
        
        return {
            'valid': True,
            'reason': 'Validation passed'
        }
    
    def _link_c2b_payment(self, payment, msisdn, bill_ref_number):
        """
        Link C2B payment to customer and loan.
        
        Args:
            payment (MpesaPayment): Payment instance
            msisdn (str): Customer phone number
            bill_ref_number (str): Bill reference number
        """
        try:
            # Format phone number for lookup
            phone_number = self._format_phone_for_lookup(msisdn)
            
            # Try to find customer by phone number
            customer = Customer.objects.filter(phone_number=phone_number).first()
            if customer:
                payment.customer = customer
                
                # Try to link to loan by reference
                if bill_ref_number.startswith('LN'):
                    try:
                        loan = Loan.objects.get(loan_number=bill_ref_number, customer=customer)
                        payment.loan = loan
                        
                        # Try to link to specific repayment
                        # Find the next due repayment
                        next_repayment = Repayment.objects.filter(
                            loan=loan,
                            status='PENDING'
                        ).order_by('due_date').first()
                        
                        if next_repayment and next_repayment.amount_due == payment.amount:
                            payment.repayment = next_repayment
                            
                    except Loan.DoesNotExist:
                        pass
                
                payment.save()
                
        except Exception as e:
            logger.error(f"Error linking C2B payment: {str(e)}")
    
    def _format_phone_for_lookup(self, phone_number):
        """
        Format phone number for database lookup.
        
        Args:
            phone_number (str): Raw phone number
            
        Returns:
            str: Formatted phone number
        """
        import re
        
        # Remove any non-digit characters except +
        phone_number = re.sub(r'[^\d+]', '', phone_number)
        
        # Convert to standard format
        if phone_number.startswith('0'):
            phone_number = '+254' + phone_number[1:]
        elif phone_number.startswith('254'):
            phone_number = '+' + phone_number
        elif phone_number.startswith('7') and len(phone_number) == 9:
            phone_number = '+254' + phone_number
        
        return phone_number