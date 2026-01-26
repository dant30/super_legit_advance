# backend/apps/mpesa/models/callback.py
from django.db import models
from django.utils import timezone
from apps.core.models.base import BaseModel


class MpesaCallback(BaseModel):
    """
    M-Pesa Callback model for storing callback data from M-Pesa.
    """
    
    # Callback types
    CALLBACK_TYPE_CHOICES = [
        ('STK_PUSH', 'STK Push Callback'),
        ('C2B_VALIDATION', 'C2B Validation'),
        ('C2B_CONFIRMATION', 'C2B Confirmation'),
        ('B2C_RESULT', 'B2C Result'),
        ('B2C_TIMEOUT', 'B2C Timeout'),
        ('REVERSAL_RESULT', 'Reversal Result'),
    ]
    
    # Fields
    payment = models.ForeignKey(
        'MpesaPayment',
        on_delete=models.CASCADE,
        related_name='callbacks',
        null=True,
        blank=True,
        verbose_name="M-Pesa Payment"
    )
    
    callback_type = models.CharField(
        max_length=30,
        choices=CALLBACK_TYPE_CHOICES,
        verbose_name="Callback Type"
    )
    
    # Callback data
    callback_data = models.JSONField(
        default=dict,
        verbose_name="Callback Data"
    )
    
    # Request metadata
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        verbose_name="IP Address"
    )
    
    user_agent = models.TextField(
        blank=True,
        verbose_name="User Agent"
    )
    
    headers = models.JSONField(
        default=dict,
        verbose_name="Request Headers"
    )
    
    # Processing status
    is_processed = models.BooleanField(
        default=False,
        verbose_name="Processed"
    )
    
    processed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Processed At"
    )
    
    processing_notes = models.TextField(
        blank=True,
        verbose_name="Processing Notes"
    )
    
    # Error tracking
    has_error = models.BooleanField(
        default=False,
        verbose_name="Has Error"
    )
    
    error_message = models.TextField(
        blank=True,
        verbose_name="Error Message"
    )
    
    class Meta:
        verbose_name = "M-Pesa Callback"
        verbose_name_plural = "M-Pesa Callbacks"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['callback_type']),
            models.Index(fields=['is_processed']),
            models.Index(fields=['has_error']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.callback_type} - {self.created_at.strftime('%Y-%m-%d %H:%M:%S')}"
    
    @property
    def is_stk_push_callback(self):
        """Check if callback is STK push callback."""
        return self.callback_type == 'STK_PUSH'
    
    @property
    def is_c2b_callback(self):
        """Check if callback is C2B callback."""
        return self.callback_type in ['C2B_VALIDATION', 'C2B_CONFIRMATION']
    
    @property
    def result_code(self):
        """Get result code from callback data."""
        if self.is_stk_push_callback:
            body = self.callback_data.get('Body', {})
            stk_callback = body.get('stkCallback', {})
            return stk_callback.get('ResultCode')
        
        elif self.is_c2b_callback:
            return self.callback_data.get('ResultCode')
        
        return None
    
    @property
    def result_description(self):
        """Get result description from callback data."""
        if self.is_stk_push_callback:
            body = self.callback_data.get('Body', {})
            stk_callback = body.get('stkCallback', {})
            return stk_callback.get('ResultDesc', '')
        
        elif self.is_c2b_callback:
            return self.callback_data.get('ResultDesc', '')
        
        return ''
    
    @property
    def merchant_request_id(self):
        """Get merchant request ID from callback data."""
        if self.is_stk_push_callback:
            body = self.callback_data.get('Body', {})
            stk_callback = body.get('stkCallback', {})
            return stk_callback.get('MerchantRequestID', '')
        
        return ''
    
    @property
    def checkout_request_id(self):
        """Get checkout request ID from callback data."""
        if self.is_stk_push_callback:
            body = self.callback_data.get('Body', {})
            stk_callback = body.get('stkCallback', {})
            return stk_callback.get('CheckoutRequestID', '')
        
        return ''
    
    @property
    def callback_metadata(self):
        """Get callback metadata items."""
        if self.is_stk_push_callback:
            body = self.callback_data.get('Body', {})
            stk_callback = body.get('stkCallback', {})
            
            if 'CallbackMetadata' in stk_callback:
                metadata = {}
                for item in stk_callback['CallbackMetadata']['Item']:
                    if 'Name' in item and 'Value' in item:
                        metadata[item['Name']] = item['Value']
                return metadata
        
        return {}
    
    def mark_as_processed(self, notes=""):
        """Mark callback as processed."""
        self.is_processed = True
        self.processed_at = timezone.now()
        if notes:
            self.processing_notes = notes
        self.save()
    
    def mark_as_error(self, error_message=""):
        """Mark callback as having error."""
        self.has_error = True
        self.error_message = error_message
        self.save()
    
    def process_callback(self):
        """
        Process callback based on type.
        
        Returns:
            bool: True if processing was successful
        """
        try:
            if self.is_stk_push_callback:
                return self._process_stk_push_callback()
            
            elif self.is_c2b_callback:
                return self._process_c2b_callback()
            
            else:
                self.processing_notes = f"Unsupported callback type: {self.callback_type}"
                self.mark_as_processed()
                return False
                
        except Exception as e:
            error_msg = f"Error processing callback: {str(e)}"
            self.mark_as_error(error_msg)
            
            import logging
            logger = logging.getLogger(__name__)
            logger.error(error_msg)
            
            return False
    
    def _process_stk_push_callback(self):
        """Process STK push callback."""
        from apps.mpesa.services.callback_handler import CallbackHandler
        
        try:
            # Find payment by checkout request ID
            checkout_request_id = self.checkout_request_id
            
            if not checkout_request_id:
                self.processing_notes = "No checkout request ID found in callback"
                self.mark_as_processed()
                return False
            
            # Find payment
            from .payment import MpesaPayment
            try:
                payment = MpesaPayment.objects.get(checkout_request_id=checkout_request_id)
            except MpesaPayment.DoesNotExist:
                self.processing_notes = f"Payment not found for checkout request ID: {checkout_request_id}"
                self.mark_as_processed()
                return False
            
            # Update payment from callback
            payment.update_from_callback(self.callback_data)
            
            # Process payment completion
            payment.process_payment_completion()
            
            # Use callback handler for additional processing
            handler = CallbackHandler()
            handler.handle_stk_push_callback(self.callback_data)
            
            self.processing_notes = f"Successfully processed callback for payment {payment.payment_reference}"
            self.mark_as_processed()
            
            return True
            
        except Exception as e:
            raise Exception(f"Error processing STK push callback: {str(e)}")
    
    def _process_c2b_callback(self):
        """Process C2B callback."""
        from apps.mpesa.services.callback_handler import CallbackHandler
        
        try:
            handler = CallbackHandler()
            
            if self.callback_type == 'C2B_VALIDATION':
                result = handler.handle_c2b_validation(self.callback_data)
            elif self.callback_type == 'C2B_CONFIRMATION':
                result = handler.handle_c2b_confirmation(self.callback_data)
            else:
                result = {'success': False, 'message': 'Unsupported C2B callback type'}
            
            if result.get('success', False):
                self.processing_notes = result.get('message', 'C2B callback processed successfully')
                self.mark_as_processed()
            else:
                self.processing_notes = result.get('message', 'Failed to process C2B callback')
                self.mark_as_error(self.processing_notes)
            
            return result.get('success', False)
            
        except Exception as e:
            raise Exception(f"Error processing C2B callback: {str(e)}")
    
    def get_formatted_data(self):
        """Get formatted callback data for display."""
        import json
        return json.dumps(self.callback_data, indent=2, default=str)