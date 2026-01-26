from rest_framework import serializers
from django.utils import timezone

from apps.repayments.models import Penalty
from apps.loans.models import Loan
from apps.customers.models import Customer


class PenaltySerializer(serializers.ModelSerializer):
    """Serializer for penalty data."""
    
    loan_number = serializers.CharField(source='loan.loan_number', read_only=True)
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    customer_number = serializers.CharField(source='customer.customer_number', read_only=True)
    applied_by_name = serializers.CharField(source='applied_by.get_full_name', read_only=True)
    waived_by_name = serializers.CharField(source='waived_by.get_full_name', read_only=True)
    
    # Calculated fields
    is_paid = serializers.BooleanField(read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    days_until_due = serializers.IntegerField(read_only=True)
    
    # Repayment details if linked
    repayment_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Penalty
        fields = [
            'id',
            'penalty_number',
            'loan', 'loan_number',
            'customer', 'customer_name', 'customer_number',
            'repayment', 'repayment_details',
            'penalty_type',
            'amount',
            'reason',
            'status',
            'calculation_method',
            'calculation_rate',
            'days_overdue',
            'base_amount',
            'applied_date',
            'due_date',
            'paid_date',
            'amount_paid',
            'amount_outstanding',
            'waived_by', 'waived_by_name',
            'waiver_reason',
            'waiver_date',
            'applied_by', 'applied_by_name',
            'is_paid',
            'is_overdue',
            'days_until_due',
            'notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'penalty_number', 'amount_outstanding', 'is_paid', 'is_overdue',
            'days_until_due', 'created_at', 'updated_at'
        ]
    
    def get_repayment_details(self, obj):
        """Get repayment details if linked."""
        from .repayment import RepaymentSerializer
        
        if obj.repayment:
            return RepaymentSerializer(obj.repayment).data
        return None


class PenaltyCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating penalties."""
    
    class Meta:
        model = Penalty
        fields = [
            'loan',
            'repayment',
            'penalty_type',
            'amount',
            'reason',
            'calculation_method',
            'calculation_rate',
            'days_overdue',
            'base_amount',
            'due_date',
            'notes',
        ]
    
    def validate(self, data):
        """Validate penalty data."""
        # Validate amount is positive
        amount = data.get('amount', 0)
        if amount <= 0:
            raise serializers.ValidationError({
                'amount': 'Penalty amount must be greater than 0.'
            })
        
        # Validate calculation rate for percentage/daily rate methods
        calculation_method = data.get('calculation_method')
        calculation_rate = data.get('calculation_rate', 0)
        
        if calculation_method in ['PERCENTAGE', 'DAILY_RATE']:
            if calculation_rate <= 0:
                raise serializers.ValidationError({
                    'calculation_rate': 'Calculation rate must be greater than 0 for percentage/daily rate methods.'
                })
        
        # Validate days overdue is non-negative
        days_overdue = data.get('days_overdue', 0)
        if days_overdue < 0:
            raise serializers.ValidationError({
                'days_overdue': 'Days overdue cannot be negative.'
            })
        
        # Set default due date if not provided
        if not data.get('due_date'):
            data['due_date'] = timezone.now().date() + timezone.timedelta(days=30)
        
        return data
    
    def create(self, validated_data):
        """Create penalty instance."""
        # Set customer from loan
        loan = validated_data['loan']
        validated_data['customer'] = loan.customer
        
        # Set applied by user
        validated_data['applied_by'] = self.context['request'].user
        
        return super().create(validated_data)


class PenaltyUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating penalties."""
    
    class Meta:
        model = Penalty
        fields = [
            'amount_paid',
            'paid_date',
            'status',
            'waiver_reason',
            'waiver_date',
            'notes',
        ]
        read_only_fields = ['waiver_date']
    
    def validate(self, data):
        """Validate update data."""
        # If updating amount_paid, ensure it doesn't exceed amount
        if 'amount_paid' in data:
            instance = self.instance
            new_amount_paid = data['amount_paid']
            
            if new_amount_paid < 0:
                raise serializers.ValidationError({
                    'amount_paid': 'Amount paid cannot be negative.'
                })
            
            if new_amount_paid > instance.amount:
                raise serializers.ValidationError({
                    'amount_paid': 'Amount paid cannot exceed penalty amount.'
                })
        
        # If updating status to WAIVED, require waiver reason
        if data.get('status') == 'WAIVED' and not data.get('waiver_reason'):
            raise serializers.ValidationError({
                'waiver_reason': 'Waiver reason is required when waiving a penalty.'
            })
        
        return data