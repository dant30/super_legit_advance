# backend/apps/mpesa/serializers/payment.py
from rest_framework import serializers
from django.core.validators import MinValueValidator
from apps.mpesa.models import MpesaPayment
from apps.customers.models import Customer
from apps.loans.models import Loan
from apps.repayments.models import Repayment
from apps.core.utils.validators import validate_phone_number
from django.core.exceptions import ValidationError as DjangoValidationError


class STKPushSerializer(serializers.Serializer):
    """
    Serializer for initiating STK push payment.
    """
    
    phone_number = serializers.CharField(
        max_length=15,
        required=True,
        help_text="Phone number in format: 0712345678 or +254712345678"
    )
    
    amount = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=True,
        validators=[MinValueValidator(1)],
        help_text="Amount in KES (minimum: 1)"
    )
    
    account_reference = serializers.CharField(
        max_length=20,
        required=False,
        default='',
        help_text="Account reference (optional)"
    )
    
    description = serializers.CharField(
        max_length=100,
        required=False,
        default='Loan Repayment',
        help_text="Payment description"
    )
    
    customer_id = serializers.IntegerField(
        required=False,
        allow_null=True,
        help_text="Customer ID (optional)"
    )
    
    loan_id = serializers.IntegerField(
        required=False,
        allow_null=True,
        help_text="Loan ID (optional)"
    )
    
    repayment_id = serializers.IntegerField(
        required=False,
        allow_null=True,
        help_text="Repayment ID (optional)"
    )
    
    payment_type = serializers.ChoiceField(
        choices=MpesaPayment.PAYMENT_TYPE_CHOICES,
        default='LOAN_REPAYMENT',
        help_text="Payment type"
    )
    
    def validate(self, data):
        """Validate STK push data."""
        # Validate phone number
        phone_number = data.get('phone_number')
        if phone_number:
            try:
                validate_phone_number(phone_number)
                # Format phone number
                data['phone_number'] = MpesaPayment.format_phone_number(phone_number)
            except DjangoValidationError as e:
                raise serializers.ValidationError({'phone_number': e.messages})
        
        # Validate amount
        amount = data.get('amount')
        if amount and amount < 1:
            raise serializers.ValidationError({
                'amount': 'Amount must be at least 1 KES.'
            })
        
        # Validate customer if provided
        customer_id = data.get('customer_id')
        if customer_id:
            try:
                customer = Customer.objects.get(id=customer_id)
                data['customer'] = customer
                
                # Verify customer phone number matches if provided
                if phone_number and customer.phone_number != data['phone_number']:
                    raise serializers.ValidationError({
                        'phone_number': 'Phone number does not match customer record.'
                    })
                    
            except Customer.DoesNotExist:
                raise serializers.ValidationError({
                    'customer_id': 'Customer not found.'
                })
        
        # Validate loan if provided
        loan_id = data.get('loan_id')
        if loan_id:
            try:
                loan = Loan.objects.get(id=loan_id)
                data['loan'] = loan
                
                # Verify loan belongs to customer if customer is provided
                if 'customer' in data and loan.customer != data['customer']:
                    raise serializers.ValidationError({
                        'loan_id': 'Loan does not belong to the specified customer.'
                    })
                    
            except Loan.DoesNotExist:
                raise serializers.ValidationError({
                    'loan_id': 'Loan not found.'
                })
        
        # Validate repayment if provided
        repayment_id = data.get('repayment_id')
        if repayment_id:
            try:
                repayment = Repayment.objects.get(id=repayment_id)
                data['repayment'] = repayment
                
                # Verify repayment belongs to loan if loan is provided
                if 'loan' in data and repayment.loan != data['loan']:
                    raise serializers.ValidationError({
                        'repayment_id': 'Repayment does not belong to the specified loan.'
                    })
                    
                # Check if repayment is already paid
                if repayment.is_paid:
                    raise serializers.ValidationError({
                        'repayment_id': 'Repayment is already paid.'
                    })
                    
                # Validate amount matches repayment amount
                if amount and amount != repayment.amount_due:
                    raise serializers.ValidationError({
                        'amount': f'Amount must be exactly {repayment.amount_due} KES for this repayment.'
                    })
                    
            except Repayment.DoesNotExist:
                raise serializers.ValidationError({
                    'repayment_id': 'Repayment not found.'
                })
        
        return data


class MpesaPaymentSerializer(serializers.ModelSerializer):
    """Serializer for M-Pesa payment list view."""
    
    customer_name = serializers.CharField(
        source='customer.full_name',
        read_only=True
    )
    
    customer_number = serializers.CharField(
        source='customer.customer_number',
        read_only=True
    )
    
    loan_number = serializers.CharField(
        source='loan.loan_number',
        read_only=True
    )
    
    repayment_number = serializers.CharField(
        source='repayment.repayment_number',
        read_only=True
    )
    
    formatted_amount = serializers.CharField(
        read_only=True
    )
    
    is_successful = serializers.BooleanField(read_only=True)
    is_pending = serializers.BooleanField(read_only=True)
    is_failed = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = MpesaPayment
        fields = [
            'id',
            'payment_reference',
            'customer', 'customer_name', 'customer_number',
            'loan', 'loan_number',
            'repayment', 'repayment_number',
            'phone_number',
            'amount', 'formatted_amount',
            'description',
            'payment_type',
            'status',
            'is_successful', 'is_pending', 'is_failed',
            'result_code',
            'result_description',
            'initiated_at',
            'completed_at',
            'processing_time',
        ]
        read_only_fields = [
            'payment_reference', 'status', 'result_code',
            'result_description', 'initiated_at', 'completed_at'
        ]


class MpesaPaymentDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for M-Pesa payment."""
    
    customer_name = serializers.CharField(
        source='customer.full_name',
        read_only=True
    )
    
    customer_phone = serializers.CharField(
        source='customer.phone_number',
        read_only=True
    )
    
    loan_number = serializers.CharField(
        source='loan.loan_number',
        read_only=True
    )
    
    loan_amount = serializers.DecimalField(
        source='loan.amount_approved',
        max_digits=10,
        decimal_places=2,
        read_only=True
    )
    
    repayment_details = serializers.CharField(
        source='repayment.repayment_details',
        read_only=True
    )
    
    formatted_amount = serializers.CharField(read_only=True)
    is_successful = serializers.BooleanField(read_only=True)
    is_pending = serializers.BooleanField(read_only=True)
    is_failed = serializers.BooleanField(read_only=True)
    
    transaction = serializers.SerializerMethodField()
    callbacks = serializers.SerializerMethodField()
    
    class Meta:
        model = MpesaPayment
        fields = [
            'id',
            'payment_reference',
            
            # Customer details
            'customer', 'customer_name', 'customer_phone',
            
            # Loan details
            'loan', 'loan_number', 'loan_amount',
            
            # Repayment details
            'repayment', 'repayment_details',
            
            # Payment details
            'phone_number',
            'amount', 'formatted_amount',
            'description',
            'payment_type',
            'transaction_type',
            
            # M-Pesa details
            'merchant_request_id',
            'checkout_request_id',
            'result_code',
            'result_description',
            'callback_metadata',
            
            # Status
            'status',
            'is_successful', 'is_pending', 'is_failed',
            
            # Timestamps
            'initiated_at',
            'processed_at',
            'completed_at',
            'processing_time',
            
            # Error tracking
            'error_code',
            'error_message',
            
            # Retry information
            'retry_count',
            'last_retry_at',
            
            # Audit
            'ip_address',
            'user_agent',
            
            # Related data
            'transaction',
            'callbacks',
            
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'payment_reference',
            
            # Customer details
            'customer', 'customer_name', 'customer_phone',
            
            # Loan details
            'loan', 'loan_number', 'loan_amount',
            
            # Repayment details
            'repayment', 'repayment_details',
            
            # Payment details
            'phone_number',
            'amount', 'formatted_amount',
            'description',
            'payment_type',
            'transaction_type',
            
            # M-Pesa details
            'merchant_request_id',
            'checkout_request_id',
            'result_code',
            'result_description',
            'callback_metadata',
            
            # Status
            'status',
            'is_successful', 'is_pending', 'is_failed',
            
            # Timestamps
            'initiated_at',
            'processed_at',
            'completed_at',
            'processing_time',
            
            # Error tracking
            'error_code',
            'error_message',
            
            # Retry information
            'retry_count',
            'last_retry_at',
            
            # Audit
            'ip_address',
            'user_agent',
            
            # Related data
            'transaction',
            'callbacks',
            
            'created_at',
            'updated_at',
        ]
    
    def get_transaction(self, obj):
        """Get transaction details."""
        from apps.mpesa.serializers.transaction import MpesaTransactionSerializer
        
        try:
            transaction = obj.transaction
            return MpesaTransactionSerializer(transaction).data
        except MpesaPayment.transaction.RelatedObjectDoesNotExist:
            return None
    
    def get_callbacks(self, obj):
        """Get callback details."""
        callbacks = obj.callbacks.all()[:5]  # Get last 5 callbacks
        return [
            {
                'id': cb.id,
                'callback_type': cb.callback_type,
                'result_code': cb.result_code,
                'result_description': cb.result_description,
                'is_processed': cb.is_processed,
                'has_error': cb.has_error,
                'created_at': cb.created_at
            }
            for cb in callbacks
        ]


class PaymentRetrySerializer(serializers.Serializer):
    """
    Serializer for retrying failed payment.
    """
    
    phone_number = serializers.CharField(
        max_length=15,
        required=False,
        help_text="New phone number (optional)"
    )
    
    def validate(self, data):
        """Validate retry data."""
        phone_number = data.get('phone_number')
        
        if phone_number:
            try:
                validate_phone_number(phone_number)
                # Format phone number
                data['phone_number'] = MpesaPayment.format_phone_number(phone_number)
            except DjangoValidationError as e:
                raise serializers.ValidationError({'phone_number': e.messages})
        
        return data


class PaymentReversalSerializer(serializers.Serializer):
    """
    Serializer for reversing payment.
    """
    
    reason = serializers.CharField(
        max_length=255,
        required=True,
        help_text="Reason for reversal"
    )
    
    def validate(self, data):
        """Validate reversal data."""
        reason = data.get('reason', '').strip()
        
        if not reason:
            raise serializers.ValidationError({
                'reason': 'Reason is required for reversal.'
            })
        
        if len(reason) < 5:
            raise serializers.ValidationError({
                'reason': 'Please provide a detailed reason (minimum 5 characters).'
            })
        
        return data