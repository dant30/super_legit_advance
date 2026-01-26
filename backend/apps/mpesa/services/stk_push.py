# backend/apps/mpesa/services/stk_push.py
from django.conf import settings
from django.utils import timezone
from apps.mpesa.models import MpesaPayment
from apps.mpesa.services.mpesa_service import MpesaService
import logging

logger = logging.getLogger(__name__)


class STKPushService:
    """
    Service for handling STK Push payments.
    """
    
    def __init__(self):
        """Initialize STK push service."""
        self.mpesa_service = MpesaService()
    
    def initiate_stk_push(self, phone_number, amount, account_reference,
                         transaction_description, customer=None, loan=None,
                         repayment=None, payment_type='LOAN_REPAYMENT', request=None):
        """
        Initiate STK push payment.
        
        Args:
            phone_number (str): Customer phone number
            amount (float): Amount to charge
            account_reference (str): Account reference
            transaction_description (str): Transaction description
            customer (Customer): Customer object (optional)
            loan (Loan): Loan object (optional)
            repayment (Repayment): Repayment object (optional)
            payment_type (str): Payment type
            request (HttpRequest): Request object for audit
            
        Returns:
            dict: Response data
        """
        try:
            # Create payment record
            payment = MpesaPayment.objects.create(
                phone_number=phone_number,
                amount=amount,
                description=transaction_description,
                payment_type=payment_type,
                customer=customer,
                loan=loan,
                repayment=repayment,
                ip_address=self._get_client_ip(request) if request else None,
                user_agent=request.META.get('HTTP_USER_AGENT', '') if request else ''
            )
            
            # If account reference not provided, use payment reference
            if not account_reference:
                account_reference = payment.payment_reference
            
            # Build callback URL
            callback_url = self._get_callback_url()
            
            # Initiate STK push with M-Pesa
            response = self.mpesa_service.stk_push(
                phone_number=phone_number,
                amount=amount,
                account_reference=account_reference,
                transaction_desc=transaction_description,
                callback_url=callback_url
            )
            
            if response.get('success', False):
                # Update payment with M-Pesa response
                payment.merchant_request_id = response.get('merchant_request_id')
                payment.checkout_request_id = response.get('checkout_request_id')
                payment.status = 'PROCESSING'
                payment.save()
                
                logger.info(f"STK push initiated for payment {payment.payment_reference}")
                
                return {
                    'success': True,
                    'message': 'Payment request initiated successfully',
                    'payment_id': payment.id,
                    'payment_reference': payment.payment_reference,
                    'merchant_request_id': payment.merchant_request_id,
                    'checkout_request_id': payment.checkout_request_id,
                    'customer_message': response.get('customer_message', 'Check your phone to complete payment')
                }
            else:
                # Mark payment as failed
                payment.status = 'FAILED'
                payment.error_code = response.get('error_code')
                payment.error_message = response.get('error_message')
                payment.save()
                
                logger.error(f"STK push failed for payment {payment.payment_reference}: {response.get('error_message')}")
                
                return {
                    'success': False,
                    'message': response.get('message', 'Failed to initiate payment'),
                    'error_code': response.get('error_code'),
                    'error_message': response.get('error_message'),
                    'payment_id': payment.id,
                    'details': response
                }
                
        except Exception as e:
            logger.error(f"Error initiating STK push: {str(e)}")
            
            return {
                'success': False,
                'message': 'Failed to initiate payment',
                'error': str(e),
                'error_code': 'INTERNAL_ERROR'
            }
    
    def _get_callback_url(self):
        """
        Get callback URL for STK push.
        
        Returns:
            str: Callback URL
        """
        base_url = getattr(settings, 'MPESA_CALLBACK_URL', '')
        if not base_url:
            # Try to get from settings or use default
            from django.contrib.sites.models import Site
            current_site = Site.objects.get_current()
            base_url = f"https://{current_site.domain}"
        
        return f"{base_url}/api/mpesa/stk-push/callback/"
    
    def _get_client_ip(self, request):
        """
        Get client IP address from request.
        
        Args:
            request (HttpRequest): Request object
            
        Returns:
            str: Client IP address
        """
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def process_stk_push_callback(self, callback_data):
        """
        Process STK push callback from M-Pesa.
        
        Args:
            callback_data (dict): Callback data from M-Pesa
            
        Returns:
            dict: Processing result
        """
        try:
            logger.info(f"Processing STK push callback: {callback_data}")
            
            # Extract checkout request ID
            if 'Body' in callback_data and 'stkCallback' in callback_data['Body']:
                stk_callback = callback_data['Body']['stkCallback']
                checkout_request_id = stk_callback.get('CheckoutRequestID')
                result_code = stk_callback.get('ResultCode')
                
                if not checkout_request_id:
                    logger.error("No checkout request ID in callback")
                    return {
                        'success': False,
                        'message': 'No checkout request ID in callback'
                    }
                
                # Find payment by checkout request ID
                try:
                    payment = MpesaPayment.objects.get(checkout_request_id=checkout_request_id)
                except MpesaPayment.DoesNotExist:
                    logger.error(f"Payment not found for checkout request ID: {checkout_request_id}")
                    return {
                        'success': False,
                        'message': f'Payment not found for checkout request ID: {checkout_request_id}'
                    }
                
                # Update payment from callback
                callback = payment.update_from_callback(callback_data)
                
                # Process payment completion
                if payment.is_successful:
                    success = payment.process_payment_completion()
                    
                    if success:
                        logger.info(f"Payment {payment.payment_reference} processed successfully")
                        return {
                            'success': True,
                            'message': 'Payment processed successfully',
                            'payment_id': payment.id,
                            'payment_reference': payment.payment_reference,
                            'status': payment.status,
                            'callback_id': callback.id
                        }
                    else:
                        logger.warning(f"Payment {payment.payment_reference} successful but completion processing failed")
                        return {
                            'success': False,
                            'message': 'Payment successful but completion processing failed',
                            'payment_id': payment.id,
                            'payment_reference': payment.payment_reference,
                            'status': payment.status
                        }
                else:
                    logger.warning(f"Payment {payment.payment_reference} failed with code {result_code}")
                    return {
                        'success': False,
                        'message': f'Payment failed with code {result_code}',
                        'payment_id': payment.id,
                        'payment_reference': payment.payment_reference,
                        'status': payment.status,
                        'error_code': result_code,
                        'error_message': stk_callback.get('ResultDesc', '')
                    }
            
            else:
                logger.error("Invalid callback data structure")
                return {
                    'success': False,
                    'message': 'Invalid callback data structure'
                }
                
        except Exception as e:
            logger.error(f"Error processing STK push callback: {str(e)}")
            return {
                'success': False,
                'message': f'Error processing callback: {str(e)}'
            }
    
    def query_payment_status(self, payment_reference=None, checkout_request_id=None):
        """
        Query payment status from M-Pesa.
        
        Args:
            payment_reference (str): Payment reference
            checkout_request_id (str): Checkout request ID
            
        Returns:
            dict: Status query result
        """
        try:
            # Find payment
            if payment_reference:
                payment = MpesaPayment.objects.get(payment_reference=payment_reference)
            elif checkout_request_id:
                payment = MpesaPayment.objects.get(checkout_request_id=checkout_request_id)
            else:
                return {
                    'success': False,
                    'message': 'Provide payment_reference or checkout_request_id'
                }
            
            # Query M-Pesa for status
            response = self.mpesa_service.query_transaction_status(payment.checkout_request_id)
            
            if response.get('success', False):
                result_code = response.get('result_code')
                
                # Update payment status based on response
                if result_code == 0:
                    payment.mark_as_successful(
                        result_code=result_code,
                        result_description=response.get('result_description', '')
                    )
                    
                    # Process payment completion
                    payment.process_payment_completion()
                    
                    return {
                        'success': True,
                        'message': 'Payment successful',
                        'payment_id': payment.id,
                        'payment_reference': payment.payment_reference,
                        'status': payment.status,
                        'result_code': result_code
                    }
                else:
                    payment.mark_as_failed(
                        error_code=str(result_code),
                        error_message=response.get('result_description', '')
                    )
                    
                    return {
                        'success': False,
                        'message': 'Payment failed',
                        'payment_id': payment.id,
                        'payment_reference': payment.payment_reference,
                        'status': payment.status,
                        'error_code': result_code,
                        'error_message': response.get('result_description', '')
                    }
            else:
                return {
                    'success': False,
                    'message': 'Failed to query payment status',
                    'error_code': response.get('error_code'),
                    'error_message': response.get('error_message'),
                    'payment_id': payment.id
                }
                
        except MpesaPayment.DoesNotExist:
            return {
                'success': False,
                'message': 'Payment not found'
            }
        except Exception as e:
            logger.error(f"Error querying payment status: {str(e)}")
            return {
                'success': False,
                'message': f'Error querying payment status: {str(e)}'
            }