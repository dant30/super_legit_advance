# backend/apps/loans/serializers/application.py
from rest_framework import serializers
from django.core.validators import MinValueValidator
from decimal import Decimal

from apps.loans.models import LoanApplication
from apps.customers.serializers.customer import CustomerSerializer


class LoanApplicationSerializer(serializers.ModelSerializer):
    """Basic loan application serializer for list views."""
    
    customer_name = serializers.CharField(
        source='customer.full_name',
        read_only=True
    )
    customer_number = serializers.CharField(
        source='customer.customer_number',
        read_only=True
    )
    customer_phone = serializers.CharField(
        source='customer.phone_number',
        read_only=True
    )
    total_monthly_income = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True
    )
    disposable_income = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True
    )
    debt_to_income_ratio = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        read_only=True
    )
    is_approved = serializers.BooleanField(read_only=True)
    is_rejected = serializers.BooleanField(read_only=True)
    is_pending = serializers.BooleanField(read_only=True)
    application_age_days = serializers.IntegerField(read_only=True)
    reviewer_name = serializers.CharField(
        source='reviewer.get_full_name',
        read_only=True
    )
    approved_by_name = serializers.CharField(
        source='approved_by.get_full_name',
        read_only=True
    )
    rejected_by_name = serializers.CharField(
        source='rejected_by.get_full_name',
        read_only=True
    )
    
    class Meta:
        model = LoanApplication
        fields = [
            'id',
            'customer', 'customer_name', 'customer_number', 'customer_phone',
            'loan_type',
            'amount_requested',
            'term_months',
            'purpose', 'purpose_description',
            'monthly_income', 'other_income', 'total_monthly_income',
            'total_monthly_expenses',
            'disposable_income',
            'existing_loans', 'existing_loan_amount', 'existing_loan_monthly',
            'debt_to_income_ratio',
            'has_guarantors', 'guarantor_count',
            'has_collateral', 'collateral_description', 'collateral_value',
            'status',
            'application_date', 'review_date', 'approval_date', 'rejection_date',
            'reviewer', 'reviewer_name',
            'credit_score', 'credit_check_date',
            'risk_level', 'risk_score',
            'approved_amount', 'approved_interest_rate',
            'approved_by', 'approved_by_name',
            'rejected_by', 'rejected_by_name',
            'rejection_reason',
            'is_approved', 'is_rejected', 'is_pending',
            'application_age_days',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'application_date', 'created_at', 'updated_at'
        ]


class LoanApplicationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating loan applications."""
    
    class Meta:
        model = LoanApplication
        fields = [
            'customer',
            'loan_type',
            'amount_requested',
            'term_months',
            'purpose',
            'purpose_description',
            'monthly_income',
            'other_income',
            'total_monthly_expenses',
            'existing_loans',
            'existing_loan_amount',
            'existing_loan_monthly',
            'has_guarantors',
            'guarantor_count',
            'has_collateral',
            'collateral_description',
            'collateral_value',
            'id_document',
            'pay_slips',
            'bank_statements',
            'business_documents',
            'collateral_documents',
            'other_documents',
            'notes',
        ]
        extra_kwargs = {
            'amount_requested': {
                'validators': [MinValueValidator(Decimal('1000.00'))]
            },
            'monthly_income': {
                'validators': [MinValueValidator(Decimal('0.00'))]
            },
            'other_income': {
                'validators': [MinValueValidator(Decimal('0.00'))]
            },
            'total_monthly_expenses': {
                'validators': [MinValueValidator(Decimal('0.00'))]
            },
        }
    
    def validate(self, data):
        """Validate application data."""
        # Validate income and expenses
        monthly_income = data.get('monthly_income', Decimal('0.00'))
        other_income = data.get('other_income', Decimal('0.00'))
        total_income = monthly_income + other_income
        
        total_expenses = data.get('total_monthly_expenses', Decimal('0.00'))
        
        if total_income <= total_expenses:
            raise serializers.ValidationError({
                'total_monthly_expenses': 'Monthly expenses cannot exceed total monthly income.'
            })
        
        # Validate existing loans
        existing_loans = data.get('existing_loans', False)
        existing_loan_amount = data.get('existing_loan_amount', Decimal('0.00'))
        existing_loan_monthly = data.get('existing_loan_monthly', Decimal('0.00'))
        
        if existing_loans and existing_loan_amount <= Decimal('0.00'):
            raise serializers.ValidationError({
                'existing_loan_amount': 'Existing loan amount must be greater than 0 if customer has existing loans.'
            })
        
        if existing_loans and existing_loan_monthly <= Decimal('0.00'):
            raise serializers.ValidationError({
                'existing_loan_monthly': 'Existing loan monthly payment must be greater than 0 if customer has existing loans.'
            })
        
        # Validate guarantors
        has_guarantors = data.get('has_guarantors', False)
        guarantor_count = data.get('guarantor_count', 0)
        
        if has_guarantors and guarantor_count <= 0:
            raise serializers.ValidationError({
                'guarantor_count': 'Guarantor count must be greater than 0 if customer has guarantors.'
            })
        
        # Validate collateral
        has_collateral = data.get('has_collateral', False)
        collateral_value = data.get('collateral_value', Decimal('0.00'))
        
        if has_collateral and collateral_value <= Decimal('0.00'):
            raise serializers.ValidationError({
                'collateral_value': 'Collateral value must be greater than 0 if customer has collateral.'
            })
        
        return data


class LoanApplicationDetailSerializer(serializers.ModelSerializer):
    """Detailed loan application serializer."""
    
    customer_details = CustomerSerializer(source='customer', read_only=True)
    total_monthly_income = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True
    )
    disposable_income = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True
    )
    debt_to_income_ratio = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        read_only=True
    )
    is_approved = serializers.BooleanField(read_only=True)
    is_rejected = serializers.BooleanField(read_only=True)
    is_pending = serializers.BooleanField(read_only=True)
    application_age_days = serializers.IntegerField(read_only=True)
    reviewer_name = serializers.CharField(
        source='reviewer.get_full_name',
        read_only=True
    )
    approved_by_name = serializers.CharField(
        source='approved_by.get_full_name',
        read_only=True
    )
    rejected_by_name = serializers.CharField(
        source='rejected_by.get_full_name',
        read_only=True
    )
    created_by_name = serializers.CharField(
        source='created_by.get_full_name',
        read_only=True
    )
    updated_by_name = serializers.CharField(
        source='updated_by.get_full_name',
        read_only=True
    )
    
    # Associated loan
    loan_details = serializers.SerializerMethodField()
    
    class Meta:
        model = LoanApplication
        fields = [
            'id',
            
            # Customer information
            'customer', 'customer_details',
            
            # Loan details
            'loan_type',
            'amount_requested', 'term_months',
            'purpose', 'purpose_description',
            
            # Income and expenses
            'monthly_income', 'other_income', 'total_monthly_income',
            'total_monthly_expenses',
            'disposable_income',
            
            # Existing debts
            'existing_loans', 'existing_loan_amount', 'existing_loan_monthly',
            'debt_to_income_ratio',
            
            # Guarantors
            'has_guarantors', 'guarantor_count',
            
            # Collateral
            'has_collateral', 'collateral_description', 'collateral_value',
            
            # Application status
            'status',
            'is_approved', 'is_rejected', 'is_pending',
            'application_age_days',
            
            # Review information
            'reviewer', 'reviewer_name',
            'review_date', 'review_notes',
            
            # Credit information
            'credit_score', 'credit_check_date', 'credit_check_notes',
            
            # Risk assessment
            'risk_level', 'risk_score',
            
            # Approval information
            'approved_amount', 'approved_interest_rate',
            'approved_by', 'approved_by_name',
            'approval_date', 'approval_notes',
            
            # Rejection information
            'rejection_reason',
            'rejected_by', 'rejected_by_name',
            'rejection_date',
            
            # Documents
            'id_document', 'pay_slips', 'bank_statements',
            'business_documents', 'collateral_documents', 'other_documents',
            
            # Associated loan
            'loan', 'loan_details',
            
            # Audit information
            'created_by', 'created_by_name',
            'updated_by', 'updated_by_name',
            'created_at', 'updated_at',
            
            # Metadata
            'notes',
        ]
        read_only_fields = [
            'application_date', 'created_at', 'updated_at'
        ]
    
    def get_loan_details(self, obj):
        """Get associated loan details."""
        if obj.loan:
            from apps.loans.serializers.loan import LoanSerializer
            return LoanSerializer(obj.loan).data
        return None