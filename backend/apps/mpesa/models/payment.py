# backend/apps/mpesa/models/payment.py
from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator
from apps.core.models.base import BaseModel
from apps.customers.models import Customer
from apps.loans.models import Loan
import uuid


class MpesaPayment(BaseModel):
    """
    M-Pesa Payment model for tracking payment requests and results.
    """
    
    # Payment statuses
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('SUCCESSFUL', 'Successful'),
        ('FAILED', 'Failed'),
        ('CANCELLED', 'Cancelled'),
        ('TIMEOUT', 'Timeout'),
    ]
    
    # Payment types
    PAYMENT_TYPE_CHOICES = [
        ('LOAN_REPAYMENT', 'Loan Repayment'),
        ('LOAN_APPLICATION_FEE', 'Loan Application Fee'),
        ('PENALTY_PAYMENT', 'Penalty Payment'),
        ('OTHER', 'Other'),
    ]
    
    # M-Pesa transaction types
    TRANSACTION_TYPE_CHOICES = [
        ('CUSTOMER_PAY_BILL_ONLINE', 'Customer Pay Bill Online'),
        ('CUSTOMER_BUY_GOODS_ONLINE', 'Customer Buy Goods Online'),
    ]
    
    # Fields
    payment_reference = models.CharField(
        max_length=50,
        unique=True,
        verbose_name="Payment Reference"
    )
    
    customer = models.ForeignKey(
        Customer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='mpesa_payments',
        verbose_name="Customer"
    )
    
    loan = models.ForeignKey(
        Loan,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='mpesa_payments',
        verbose_name="Loan"
    )
    
    repayment = models.ForeignKey(
        'repayments.Repayment',  # Use string reference instead
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='mpesa_payments',
        verbose_name="Repayment"
    )
    
    # Payment details
    phone_number = models.CharField(
        max_length=15,
        verbose_name="Phone Number"
    )
    
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(1)],
        verbose_name="Amount (KES)"
    )
    
    description = models.TextField(
        blank=True,
        verbose_name="Payment Description"
    )
    
    payment_type = models.CharField(
        max_length=30,
        choices=PAYMENT_TYPE_CHOICES,
        default='LOAN_REPAYMENT',
        verbose_name="Payment Type"
    )
    
    transaction_type = models.CharField(
        max_length=50,
        choices=TRANSACTION_TYPE_CHOICES,
        default='CUSTOMER_PAY_BILL_ONLINE',
        verbose_name="Transaction Type"
    )
    
    # M-Pesa specific fields
    merchant_request_id = models.CharField(
        max_length=50,
        unique=True,
        null=True,
        blank=True,
        verbose_name="Merchant Request ID"
    )
    
    checkout_request_id = models.CharField(
        max_length=50,
        unique=True,
        null=True,
        blank=True,
        verbose_name="Checkout Request ID"
    )
    
    result_code = models.IntegerField(
        null=True,
        blank=True,
        verbose_name="Result Code"
    )
    
    result_description = models.TextField(
        blank=True,
        verbose_name="Result Description"
    )
    
    # Status tracking
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING',
        verbose_name="Payment Status"
    )
    
    initiated_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Initiated At"
    )
    
    processed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Processed At"
    )
    
    completed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Completed At"
    )
    
    # Callback data (stored as JSON)
    callback_metadata = models.JSONField(
        default=dict,
        blank=True,
        verbose_name="Callback Metadata"
    )
    
    # Error tracking
    error_code = models.CharField(
        max_length=50,
        blank=True,
        verbose_name="Error Code"
    )
    
    error_message = models.TextField(
        blank=True,
        verbose_name="Error Message"
    )
    
    # Retry logic
    retry_count = models.IntegerField(
        default=0,
        verbose_name="Retry Count"
    )
    
    last_retry_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Last Retry At"
    )
    
    # Audit fields
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        verbose_name="IP Address"
    )
    
    user_agent = models.TextField(
        blank=True,
        verbose_name="User Agent"
    )
    
    class Meta:
        verbose_name = "M-Pesa Payment"
        verbose_name_plural = "M-Pesa Payments"
        ordering = ['-initiated_at']
        indexes = [
            models.Index(fields=['payment_reference']),
            models.Index(fields=['merchant_request_id']),
            models.Index(fields=['checkout_request_id']),
            models.Index(fields=['status']),
            models.Index(fields=['customer', 'status']),
            models.Index(fields=['initiated_at']),
        ]
    
    def __str__(self):
        return f"{self.payment_reference} - {self.phone_number} - KES {self.amount}"
    
    def save(self, *args, **kwargs):
        """
        Override save to generate payment reference if not set.
        """
        if not self.payment_reference:
            self.payment_reference = self.generate_payment_reference()
        
        # Format phone number
        self.phone_number = self.format_phone_number(self.phone_number)
        
        # Update timestamps based on status
        if self.status in ['SUCCESSFUL', 'FAILED', 'CANCELLED'] and not self.completed_at:
            self.completed_at = timezone.now()
        
        super().save(*args, **kwargs)
    
    @staticmethod
    def generate_payment_reference():
        """
        Generate unique payment reference.
        Format: MPESA-YYYYMMDD-XXXXXX
        """
        from django.utils import timezone
        import random
        
        date_str = timezone.now().strftime('%Y%m%d')
        random_str = str(random.randint(100000, 999999))
        return f"MPESA-{date_str}-{random_str}"
    
    @staticmethod
    def format_phone_number(phone_number):
        """
        Format phone number to M-Pesa format (+254XXXXXXXXX).
        """
        import re
        
        # Remove any non-digit characters except +
        phone_number = re.sub(r'[^\d+]', '', phone_number)
        
        # Convert to M-Pesa format
        if phone_number.startswith('0'):
            phone_number = '+254' + phone_number[1:]
        elif phone_number.startswith('254'):
            phone_number = '+' + phone_number
        elif phone_number.startswith('7') and len(phone_number) == 9:
            phone_number = '+254' + phone_number
        elif not phone_number.startswith('+254'):
            phone_number = '+254' + phone_number[-9:]
        
        return phone_number
    
    @property
    def is_successful(self):
        """Check if payment was successful."""
        return self.status == 'SUCCESSFUL'
    
    @property
    def is_pending(self):
        """Check if payment is pending."""
        return self.status == 'PENDING'
    
    @property
    def is_failed(self):
        """Check if payment failed."""
        return self.status == 'FAILED'
    
    @property
    def formatted_amount(self):
        """Return formatted amount."""
        return f"KES {self.amount:,.2f}"
    
    @property
    def processing_time(self):
        """Calculate processing time in seconds."""
        if self.completed_at and self.initiated_at:
            return (self.completed_at - self.initiated_at).total_seconds()
        return None
    
    def mark_as_processing(self):
        """Mark payment as processing."""
        self.status = 'PROCESSING'
        self.save()
    
    def mark_as_successful(self, result_code=0, result_description=""):
        """Mark payment as successful."""
        self.status = 'SUCCESSFUL'
        self.result_code = result_code
        self.result_description = result_description
        self.completed_at = timezone.now()
        self.save()
    
    def mark_as_failed(self, error_code="", error_message=""):
        """Mark payment as failed."""
        self.status = 'FAILED'
        self.error_code = error_code
        self.error_message = error_message
        self.completed_at = timezone.now()
        self.save()
    
    def mark_as_cancelled(self):
        """Mark payment as cancelled."""
        self.status = 'CANCELLED'
        self.completed_at = timezone.now()
        self.save()
    
    def increment_retry(self):
        """Increment retry count."""
        self.retry_count += 1
        self.last_retry_at = timezone.now()
        self.save()
    
    def can_retry(self):
        """Check if payment can be retried."""
        max_retries = 3
        return self.retry_count < max_retries and self.status in ['FAILED', 'TIMEOUT']
    
    def get_transaction(self):
        """Get associated M-Pesa transaction."""
        try:
            return self.transaction
        except MpesaTransaction.DoesNotExist:
            return None
    
    def update_from_callback(self, callback_data):
        """
        Update payment from callback data.
        
        Args:
            callback_data (dict): Callback data from M-Pesa
        """
        from .callback import MpesaCallback
        
        # Create callback record
        callback = MpesaCallback.objects.create(
            payment=self,
            callback_data=callback_data,
            callback_type='STK_PUSH'
        )
        
        # Update payment based on callback
        if 'Body' in callback_data and 'stkCallback' in callback_data['Body']:
            stk_callback = callback_data['Body']['stkCallback']
            
            if 'MerchantRequestID' in stk_callback:
                self.merchant_request_id = stk_callback['MerchantRequestID']
            
            if 'CheckoutRequestID' in stk_callback:
                self.checkout_request_id = stk_callback['CheckoutRequestID']
            
            if 'ResultCode' in stk_callback:
                result_code = stk_callback['ResultCode']
                self.result_code = result_code
                
                if result_code == 0:
                    self.mark_as_successful(
                        result_code=result_code,
                        result_description=stk_callback.get('ResultDesc', '')
                    )
                    
                    # Extract transaction details
                    if 'CallbackMetadata' in stk_callback:
                        callback_metadata = {}
                        for item in stk_callback['CallbackMetadata']['Item']:
                            if 'Name' in item and 'Value' in item:
                                callback_metadata[item['Name']] = item['Value']
                        
                        self.callback_metadata = callback_metadata
                        
                        # Create transaction record
                        if 'MpesaReceiptNumber' in callback_metadata:
                            MpesaTransaction.objects.create_from_payment(self)
                
                else:
                    self.mark_as_failed(
                        error_code=str(result_code),
                        error_message=stk_callback.get('ResultDesc', 'Request failed')
                    )
        
        self.save()
        return callback
    
    def process_payment_completion(self):
        """
        Process payment completion - link to repayment and update loan.
        """
        if not self.is_successful:
            return False
        
        try:
            # If payment is linked to a repayment, mark it as paid
            if self.repayment:
                self.repayment.mark_as_paid(
                    payment_method='MPESA',
                    transaction_reference=self.callback_metadata.get('MpesaReceiptNumber', ''),
                    notes=f"Paid via M-Pesa: {self.payment_reference}"
                )
            
            # If payment is linked to a loan, update loan status
            if self.loan:
                # Check if this completes the loan
                if self.loan.outstanding_balance <= 0:
                    self.loan.mark_as_completed(
                        notes=f"Loan completed via M-Pesa payment: {self.payment_reference}"
                    )
            
            return True
            
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error processing payment completion for {self.payment_reference}: {str(e)}")
            return False