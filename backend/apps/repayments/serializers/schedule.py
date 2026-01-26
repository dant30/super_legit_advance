# backend/apps/repayments/serializers/schedule.py
from rest_framework import serializers
from django.utils import timezone

from apps.repayments.models import RepaymentSchedule
from apps.loans.models import Loan
from apps.customers.models import Customer


class ScheduleSerializer(serializers.ModelSerializer):
    """Serializer for repayment schedule."""
    
    loan_number = serializers.CharField(source='loan.loan_number', read_only=True)
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    customer_number = serializers.CharField(source='customer.customer_number', read_only=True)
    
    # Calculated fields
    is_paid = serializers.BooleanField(read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    is_upcoming = serializers.BooleanField(read_only=True)
    payment_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    remaining_balance = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    
    # Repayment link
    repayment_details = serializers.SerializerMethodField()
    
    class Meta:
        model = RepaymentSchedule
        fields = [
            'id',
            'loan', 'loan_number',
            'customer', 'customer_name', 'customer_number',
            'installment_number',
            'due_date',
            'principal_amount',
            'interest_amount',
            'total_amount',
            'status',
            'amount_paid',
            'amount_outstanding',
            'payment_date',
            'days_overdue',
            'late_fee',
            'repayment', 'repayment_details',
            'is_adjusted',
            'adjustment_reason',
            'original_due_date',
            'original_amount',
            'is_paid',
            'is_overdue',
            'is_upcoming',
            'payment_percentage',
            'remaining_balance',
            'notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'amount_outstanding', 'days_overdue', 'is_paid', 'is_overdue',
            'is_upcoming', 'payment_percentage', 'remaining_balance',
            'created_at', 'updated_at'
        ]
    
    def get_repayment_details(self, obj):
        """Get repayment details if linked."""
        from .repayment import RepaymentSerializer
        
        if obj.repayment:
            return RepaymentSerializer(obj.repayment).data
        return None


class ScheduleCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating schedule items."""
    
    class Meta:
        model = RepaymentSchedule
        fields = [
            'loan',
            'installment_number',
            'due_date',
            'principal_amount',
            'interest_amount',
            'total_amount',
            'notes',
        ]
    
    def validate(self, data):
        """Validate schedule data."""
        loan = data.get('loan')
        installment_number = data.get('installment_number')
        due_date = data.get('due_date')
        
        # Check for duplicate installment number for this loan
        if RepaymentSchedule.objects.filter(
            loan=loan,
            installment_number=installment_number
        ).exists():
            raise serializers.ValidationError({
                'installment_number': f'Installment number {installment_number} already exists for this loan.'
            })
        
        # Validate total amount equals principal + interest
        principal = data.get('principal_amount', 0)
        interest = data.get('interest_amount', 0)
        total = data.get('total_amount', 0)
        
        if abs((principal + interest) - total) > 0.01:  # Allow small rounding differences
            raise serializers.ValidationError({
                'total_amount': 'Total amount must equal principal + interest.'
            })
        
        # Validate due date is not in the past
        if due_date and due_date < timezone.now().date():
            raise serializers.ValidationError({
                'due_date': 'Due date cannot be in the past for new schedule items.'
            })
        
        return data
    
    def create(self, validated_data):
        """Create schedule item."""
        # Set customer from loan
        loan = validated_data['loan']
        validated_data['customer'] = loan.customer
        
        return super().create(validated_data)


class ScheduleUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating schedule items."""
    
    class Meta:
        model = RepaymentSchedule
        fields = [
            'amount_paid',
            'payment_date',
            'late_fee',
            'notes',
            'is_adjusted',
            'adjustment_reason',
        ]
    
    def validate(self, data):
        """Validate update data."""
        # If updating amount_paid, ensure it doesn't exceed total_amount
        if 'amount_paid' in data:
            instance = self.instance
            new_amount_paid = data['amount_paid']
            
            if new_amount_paid < 0:
                raise serializers.ValidationError({
                    'amount_paid': 'Amount paid cannot be negative.'
                })
            
            if new_amount_paid > instance.total_amount:
                raise serializers.ValidationError({
                    'amount_paid': 'Amount paid cannot exceed total amount.'
                })
        
        return data