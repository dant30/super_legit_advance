# backend/apps/repayments/serializers/repayment.py
from rest_framework import serializers
from django.utils import timezone
from django.core.exceptions import ValidationError as DjangoValidationError

from apps.repayments.models import Repayment
from apps.loans.models import Loan
from apps.customers.models import Customer
from apps.core.utils.validators import validate_payment_amount, validate_date_not_in_past


class RepaymentSerializer(serializers.ModelSerializer):
    """Basic repayment serializer for list views."""
    
    loan_number = serializers.CharField(source='loan.loan_number', read_only=True)
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    customer_number = serializers.CharField(source='customer.customer_number', read_only=True)
    collected_by_name = serializers.CharField(
        source='collected_by.get_full_name',
        read_only=True
    )
    
    # Calculated fields
    is_paid = serializers.BooleanField(read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    is_partial = serializers.BooleanField(read_only=True)
    payment_status = serializers.SerializerMethodField()
    payment_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    
    class Meta:
        model = Repayment
        fields = [
            'id',
            'repayment_number',
            'loan', 'loan_number',
            'customer', 'customer_name', 'customer_number',
            'amount_due',
            'amount_paid',
            'amount_outstanding',
            'principal_amount',
            'interest_amount',
            'penalty_amount',
            'fee_amount',
            'payment_method',
            'repayment_type',
            'status',
            'due_date',
            'payment_date',
            'days_overdue',
            'payment_reference',
            'transaction_id',
            'is_paid',
            'is_overdue',
            'is_partial',
            'payment_status',
            'payment_percentage',
            'collected_by', 'collected_by_name',
            'created_at',
        ]
        read_only_fields = [
            'repayment_number', 'amount_outstanding', 'days_overdue',
            'is_paid', 'is_overdue', 'is_partial', 'payment_percentage',
            'created_at'
        ]
    
    def get_payment_status(self, obj):
        """Get payment status display."""
        status, _ = obj.payment_status
        return status


class RepaymentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating repayments."""
    
    class Meta:
        model = Repayment
        fields = [
            'loan',
            'amount_due',
            'principal_amount',
            'interest_amount',
            'penalty_amount',
            'fee_amount',
            'payment_method',
            'repayment_type',
            'due_date',
            'scheduled_date',
            'payment_reference',
            'notes',
            'receipt_file',
        ]
    
    def validate(self, data):
        """Validate repayment data."""
        loan = data.get('loan')
        
        # Validate loan exists and is active
        if loan and loan.status not in ['ACTIVE', 'APPROVED', 'OVERDUE']:
            raise serializers.ValidationError({
                'loan': 'Loan must be active, approved, or overdue to accept repayments.'
            })
        
        # Validate amount due is positive
        amount_due = data.get('amount_due', 0)
        if amount_due <= 0:
            raise serializers.ValidationError({
                'amount_due': 'Amount due must be greater than 0.'
            })
        
        # Validate breakdown adds up to amount due
        breakdown_total = (
            data.get('principal_amount', 0) +
            data.get('interest_amount', 0) +
            data.get('penalty_amount', 0) +
            data.get('fee_amount', 0)
        )
        
        if abs(breakdown_total - amount_due) > 0.01:  # Allow small rounding differences
            raise serializers.ValidationError({
                'amount_due': 'Breakdown amounts must sum to amount due.'
            })
        
        # Validate due date is not in the past for new repayments
        due_date = data.get('due_date')
        if due_date and due_date < timezone.now().date():
            raise serializers.ValidationError({
                'due_date': 'Due date cannot be in the past for new repayments.'
            })
        
        return data
    
    def create(self, validated_data):
        """Create repayment instance."""
        # Set customer from loan
        loan = validated_data['loan']
        validated_data['customer'] = loan.customer
        
        return super().create(validated_data)


class RepaymentUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating repayments."""
    
    class Meta:
        model = Repayment
        fields = [
            'amount_paid',
            'payment_method',
            'payment_date',
            'payment_reference',
            'transaction_id',
            'receipt_number',
            'receipt_file',
            'notes',
            'verified_by',
            'verification_date',
        ]
        read_only_fields = ['verified_by', 'verification_date']
    
    def validate(self, data):
        """Validate update data."""
        # If updating amount_paid, ensure it doesn't exceed amount_due
        if 'amount_paid' in data:
            instance = self.instance
            new_amount_paid = data['amount_paid']
            
            if new_amount_paid < 0:
                raise serializers.ValidationError({
                    'amount_paid': 'Amount paid cannot be negative.'
                })
            
            if new_amount_paid > instance.amount_due and instance.status != Repayment.STATUS_WAIVED:
                raise serializers.ValidationError({
                    'amount_paid': 'Amount paid cannot exceed amount due.'
                })
        
        return data


class RepaymentDetailSerializer(serializers.ModelSerializer):
    """Detailed repayment serializer with related data."""
    
    loan_number = serializers.CharField(source='loan.loan_number', read_only=True)
    loan_details = serializers.SerializerMethodField()
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    customer_number = serializers.CharField(source='customer.customer_number', read_only=True)
    collected_by_name = serializers.CharField(
        source='collected_by.get_full_name',
        read_only=True
    )
    verified_by_name = serializers.CharField(
        source='verified_by.get_full_name',
        read_only=True
    )
    
    # Calculated fields
    is_paid = serializers.BooleanField(read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    is_partial = serializers.BooleanField(read_only=True)
    payment_status = serializers.SerializerMethodField()
    payment_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    
    # Related data
    penalties = serializers.SerializerMethodField()
    schedule_items = serializers.SerializerMethodField()
    
    # M-Pesa payment details
    mpesa_payment_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Repayment
        fields = [
            'id',
            'repayment_number',
            
            # Loan Information
            'loan', 'loan_number', 'loan_details',
            
            # Customer Information
            'customer', 'customer_name', 'customer_number',
            
            # Amount Information
            'amount_due',
            'amount_paid',
            'amount_outstanding',
            'principal_amount',
            'interest_amount',
            'penalty_amount',
            'fee_amount',
            
            # Payment Details
            'payment_method',
            'repayment_type',
            'status',
            'due_date',
            'payment_date',
            'scheduled_date',
            'days_overdue',
            'late_fee_applied',
            
            # Payment Reference
            'payment_reference',
            'transaction_id',
            'receipt_number',
            
            # Calculated Fields
            'is_paid',
            'is_overdue',
            'is_partial',
            'payment_status',
            'payment_percentage',
            
            # Related Data
            'penalties',
            'schedule_items',
            'mpesa_payment', 'mpesa_payment_details',
            
            # Verification
            'verified_by', 'verified_by_name',
            'verification_date',
            
            # Collection
            'collected_by', 'collected_by_name',
            
            # Documents
            'receipt_file',
            
            # Metadata
            'notes',
            
            # Audit
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'repayment_number', 'amount_outstanding', 'days_overdue',
            'is_paid', 'is_overdue', 'is_partial', 'payment_percentage',
            'created_at', 'updated_at'
        ]
    
    def get_loan_details(self, obj):
        """Get loan details."""
        from apps.loans.serializers.loan import LoanSerializer
        return LoanSerializer(obj.loan).data if obj.loan else None
    
    def get_payment_status(self, obj):
        """Get payment status display."""
        status, _ = obj.payment_status
        return status
    
    def get_penalties(self, obj):
        """Get penalties for this repayment."""
        from .penalty import PenaltySerializer
        
        penalties = obj.penalties.all()
        return PenaltySerializer(penalties, many=True).data
    
    def get_schedule_items(self, obj):
        """Get schedule items for this repayment."""
        from .schedule import ScheduleSerializer
        
        schedule_items = obj.schedule_items.all()
        return ScheduleSerializer(schedule_items, many=True).data
    
    def get_mpesa_payment_details(self, obj):
        """Get M-Pesa payment details."""
        from apps.mpesa.serializers.payment import PaymentSerializer
        
        if obj.mpesa_payment:
            return PaymentSerializer(obj.mpesa_payment).data
        return None
