# backend/apps/mpesa/models/transaction.py
from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator
from apps.core.models.base import BaseModel


class MpesaTransaction(BaseModel):
    """
    M-Pesa Transaction model for storing completed transaction details.
    """
    
    # Transaction statuses
    STATUS_CHOICES = [
        ('COMPLETED', 'Completed'),
        ('REVERSED', 'Reversed'),
        ('FAILED', 'Failed'),
    ]
    
    # Transaction types
    TRANSACTION_TYPE_CHOICES = [
        ('PAYMENT', 'Payment'),
        ('REVERSAL', 'Reversal'),
        ('REFUND', 'Refund'),
    ]
    
    # Fields
    payment = models.OneToOneField(
        'MpesaPayment',
        on_delete=models.CASCADE,
        related_name='transaction',
        verbose_name="M-Pesa Payment"
    )
    
    transaction_id = models.CharField(
        max_length=50,
        unique=True,
        verbose_name="Transaction ID"
    )
    
    mpesa_receipt_number = models.CharField(
        max_length=50,
        unique=True,
        verbose_name="M-Pesa Receipt Number"
    )
    
    # Transaction details
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(1)],
        verbose_name="Amount (KES)"
    )
    
    phone_number = models.CharField(
        max_length=15,
        verbose_name="Phone Number"
    )
    
    transaction_date = models.DateTimeField(
        verbose_name="Transaction Date"
    )
    
    transaction_type = models.CharField(
        max_length=20,
        choices=TRANSACTION_TYPE_CHOICES,
        default='PAYMENT',
        verbose_name="Transaction Type"
    )
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='COMPLETED',
        verbose_name="Transaction Status"
    )
    
    # Additional M-Pesa fields
    conversation_id = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Conversation ID"
    )
    
    originator_conversation_id = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Originator Conversation ID"
    )
    
    account_reference = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Account Reference"
    )
    
    transaction_description = models.TextField(
        blank=True,
        verbose_name="Transaction Description"
    )
    
    # Balance information
    balance = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Balance (KES)"
    )
    
    # Reversal information
    original_transaction_id = models.CharField(
        max_length=50,
        blank=True,
        verbose_name="Original Transaction ID"
    )
    
    reversal_reason = models.TextField(
        blank=True,
        verbose_name="Reversal Reason"
    )
    
    reversed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Reversed At"
    )
    
    # Metadata
    raw_response = models.JSONField(
        default=dict,
        verbose_name="Raw Response"
    )
    
    class Meta:
        verbose_name = "M-Pesa Transaction"
        verbose_name_plural = "M-Pesa Transactions"
        ordering = ['-transaction_date']
        indexes = [
            models.Index(fields=['mpesa_receipt_number']),
            models.Index(fields=['transaction_id']),
            models.Index(fields=['status']),
            models.Index(fields=['transaction_date']),
            models.Index(fields=['phone_number']),
        ]
    
    def __str__(self):
        return f"{self.mpesa_receipt_number} - {self.phone_number} - KES {self.amount}"
    
    @classmethod
    def create_from_payment(cls, payment):
        """
        Create transaction record from successful payment.
        
        Args:
            payment (MpesaPayment): Successful payment instance
            
        Returns:
            MpesaTransaction: Created transaction instance
        """
        if not payment.is_successful:
            raise ValueError("Cannot create transaction from unsuccessful payment")
        
        callback_metadata = payment.callback_metadata
        
        # Extract transaction details from callback metadata
        mpesa_receipt_number = callback_metadata.get('MpesaReceiptNumber', '')
        transaction_date_str = callback_metadata.get('TransactionDate', '')
        
        # Parse transaction date
        from datetime import datetime
        try:
            # M-Pesa date format: YYYYMMDDHHMMSS
            transaction_date = datetime.strptime(transaction_date_str, '%Y%m%d%H%M%S')
            transaction_date = timezone.make_aware(transaction_date)
        except (ValueError, TypeError):
            transaction_date = timezone.now()
        
        # Generate unique transaction ID
        transaction_id = f"TXN-{mpesa_receipt_number}"
        
        # Create transaction
        transaction = cls.objects.create(
            payment=payment,
            transaction_id=transaction_id,
            mpesa_receipt_number=mpesa_receipt_number,
            amount=payment.amount,
            phone_number=payment.phone_number,
            transaction_date=transaction_date,
            account_reference=payment.payment_reference,
            transaction_description=payment.description,
            balance=callback_metadata.get('Balance', None),
            raw_response=callback_metadata
        )
        
        return transaction
    
    @property
    def is_reversed(self):
        """Check if transaction is reversed."""
        return self.status == 'REVERSED'
    
    @property
    def formatted_amount(self):
        """Return formatted amount."""
        return f"KES {self.amount:,.2f}"
    
    @property
    def formatted_balance(self):
        """Return formatted balance."""
        if self.balance:
            return f"KES {self.balance:,.2f}"
        return "N/A"
    
    @property
    def formatted_transaction_date(self):
        """Return formatted transaction date."""
        return self.transaction_date.strftime('%Y-%m-%d %H:%M:%S')
    
    def reverse_transaction(self, reason=""):
        """
        Reverse the transaction.
        
        Args:
            reason (str): Reason for reversal
            
        Returns:
            bool: True if reversal was successful
        """
        from apps.mpesa.services.mpesa_service import MpesaService
        
        if self.is_reversed:
            return False
        
        try:
            # Call M-Pesa reversal API
            mpesa_service = MpesaService()
            reversal_response = mpesa_service.reverse_transaction(
                transaction_id=self.mpesa_receipt_number,
                amount=self.amount,
                remarks=f"Reversal: {reason}"
            )
            
            if reversal_response.get('success', False):
                # Update transaction status
                self.status = 'REVERSED'
                self.reversal_reason = reason
                self.reversed_at = timezone.now()
                self.save()
                
                # Update payment status
                self.payment.status = 'CANCELLED'
                self.payment.save()
                
                # Log reversal
                import logging
                logger = logging.getLogger(__name__)
                logger.info(f"Transaction {self.mpesa_receipt_number} reversed successfully.")
                
                return True
            else:
                return False
                
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error reversing transaction {self.mpesa_receipt_number}: {str(e)}")
            return False
    
    def validate_transaction(self):
        """
        Validate transaction with M-Pesa API.
        
        Returns:
            dict: Validation result
        """
        from apps.mpesa.services.mpesa_service import MpesaService
        
        try:
            mpesa_service = MpesaService()
            validation_result = mpesa_service.query_transaction_status(
                checkout_request_id=self.payment.checkout_request_id
            )
            
            return {
                'valid': validation_result.get('success', False),
                'details': validation_result,
                'transaction': self
            }
            
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error validating transaction {self.mpesa_receipt_number}: {str(e)}")
            
            return {
                'valid': False,
                'error': str(e),
                'transaction': self
            }