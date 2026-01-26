# backend/apps/loans/serializers/loan.py
# backend/apps/loans/serializers/loan.py
from rest_framework import serializers
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal, InvalidOperation
import logging

from apps.loans.models import Loan
from apps.customers.serializers.customer import CustomerSerializer
from apps.loans.calculators.loan_calculator import LoanCalculator

logger = logging.getLogger(__name__)


class LoanSerializer(serializers.ModelSerializer):
    """Basic loan serializer for list views."""
    
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
    is_active = serializers.BooleanField(read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    is_completed = serializers.BooleanField(read_only=True)
    days_overdue = serializers.IntegerField(read_only=True)
    loan_age_days = serializers.IntegerField(read_only=True)
    repayment_progress = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        read_only=True
    )
    payment_performance = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        read_only=True
    )
    next_payment_date = serializers.DateField(read_only=True)
    approved_by_name = serializers.CharField(
        source='approved_by.get_full_name',
        read_only=True
    )
    disbursed_by_name = serializers.CharField(
        source='disbursed_by.get_full_name',
        read_only=True
    )
    
    class Meta:
        model = Loan
        fields = [
            'id',
            'loan_number',
            'customer', 'customer_name', 'customer_number', 'customer_phone',
            'loan_type',
            'purpose',
            'purpose_description',
            'amount_requested', 'amount_approved', 'amount_disbursed',
            'term_months',
            'interest_rate', 'interest_type',
            'repayment_frequency',
            'status',
            'application_date', 'approval_date', 'disbursement_date',
            'start_date', 'maturity_date', 'completion_date',
            'total_interest', 'total_amount_due',
            'amount_paid', 'outstanding_balance',
            'installment_amount',
            'processing_fee',
            'processing_fee_percentage',
            'late_payment_penalty_rate',
            'total_penalties',
            'credit_score_at_application', 'risk_level',
            'is_active', 'is_overdue', 'is_completed',
            'days_overdue', 'loan_age_days',
            'repayment_progress', 'payment_performance',
            'next_payment_date',
            'approved_by', 'approved_by_name',
            'disbursed_by', 'disbursed_by_name',
            'rejection_reason',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'loan_number', 'application_date', 'created_at', 'updated_at'
        ]


class LoanCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating loans."""
    
    class Meta:
        model = Loan
        fields = [
            'customer',
            'loan_type',
            'purpose',
            'purpose_description',
            'amount_requested',
            'term_months',
            'interest_rate',
            'interest_type',
            'repayment_frequency',
            'processing_fee_percentage',
            'late_payment_penalty_rate',
            'notes',
        ]
        extra_kwargs = {
            'amount_requested': {
                'validators': [MinValueValidator(Decimal('1000.00'))]
            },
            'term_months': {
                'validators': [MinValueValidator(1), MaxValueValidator(120)]
            },
            'interest_rate': {
                'validators': [MinValueValidator(Decimal('0.00')), MaxValueValidator(Decimal('100.00'))]
            },
            'processing_fee_percentage': {
                'validators': [MinValueValidator(Decimal('0.00')), MaxValueValidator(Decimal('10.00'))]
            },
            'late_payment_penalty_rate': {
                'validators': [MinValueValidator(Decimal('0.00')), MaxValueValidator(Decimal('20.00'))]
            },
        }
    
    def validate(self, data):
        """Validate loan data."""
        customer = data.get('customer')
        
        # Check if customer is active
        if customer.status == 'BLACKLISTED':
            raise serializers.ValidationError({
                'customer': 'Cannot create loan for blacklisted customer.'
            })
        
        if customer.status == 'INACTIVE':
            raise serializers.ValidationError({
                'customer': 'Cannot create loan for inactive customer.'
            })
        
        # Check if customer has too many active loans
        active_loans = customer.loans.filter(status__in=['ACTIVE', 'APPROVED', 'PENDING']).count()
        if active_loans >= 3:  # Maximum 3 active/processing loans per customer
            raise serializers.ValidationError({
                'customer': 'Customer has reached the maximum number of active/processing loans (3).'
            })
        
        # Validate amount based on customer's credit score
        if customer.credit_score < 500 and data.get('amount_requested', 0) > Decimal('50000.00'):
            raise serializers.ValidationError({
                'amount_requested': f'Maximum amount for customers with credit score below 500 is KES 50,000. Current score: {customer.credit_score}'
            })
        
        # Validate term based on loan type
        loan_type = data.get('loan_type')
        term_months = data.get('term_months')
        
        term_limits = {
            'SALARY': 3,
            'EMERGENCY': 6,
            'PERSONAL': 36,
            'BUSINESS': 60,
            'ASSET_FINANCING': 48,
            'EDUCATION': 24,
            'AGRICULTURE': 36,
        }
        
        max_term = term_limits.get(loan_type, 60)
        if term_months > max_term:
            raise serializers.ValidationError({
                'term_months': f'{loan_type.replace("_", " ").title()} loans cannot exceed {max_term} months.'
            })
        
        # Validate minimum term based on loan type
        min_limits = {
            'SALARY': 1,
            'EMERGENCY': 1,
            'PERSONAL': 3,
            'BUSINESS': 6,
            'ASSET_FINANCING': 12,
            'EDUCATION': 6,
            'AGRICULTURE': 6,
        }
        
        min_term = min_limits.get(loan_type, 1)
        if term_months < min_term:
            raise serializers.ValidationError({
                'term_months': f'{loan_type.replace("_", " ").title()} loans must be at least {min_term} months.'
            })
        
        # Validate interest rate based on loan type
        interest_rate = data.get('interest_rate')
        if interest_rate:
            max_rates = {
                'SALARY': 15.0,
                'EMERGENCY': 20.0,
                'PERSONAL': 18.0,
                'BUSINESS': 16.0,
                'ASSET_FINANCING': 14.0,
                'EDUCATION': 12.0,
                'AGRICULTURE': 10.0,
            }
            
            max_rate = max_rates.get(loan_type, 20.0)
            if interest_rate > Decimal(str(max_rate)):
                raise serializers.ValidationError({
                    'interest_rate': f'Interest rate for {loan_type.replace("_", " ").title()} loans cannot exceed {max_rate}%.'
                })
            
            # Validate minimum interest rate
            min_rate = 5.0  # Minimum 5% interest rate
            if interest_rate < Decimal(str(min_rate)):
                raise serializers.ValidationError({
                    'interest_rate': f'Interest rate must be at least {min_rate}%.'
                })
        
        # Validate processing fee percentage
        processing_fee_percentage = data.get('processing_fee_percentage', Decimal('1.00'))
        if processing_fee_percentage > Decimal('5.00'):
            raise serializers.ValidationError({
                'processing_fee_percentage': 'Processing fee percentage cannot exceed 5%.'
            })
        
        # Validate repayment frequency for loan type
        repayment_frequency = data.get('repayment_frequency', 'MONTHLY')
        if loan_type in ['SALARY', 'EMERGENCY'] and repayment_frequency not in ['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY']:
            raise serializers.ValidationError({
                'repayment_frequency': f'{loan_type.replace("_", " ").title()} loans can only have daily, weekly, bi-weekly, or monthly repayments.'
            })
        
        return data
    
    def create(self, validated_data):
        """Create loan with initial calculations."""
        try:
            loan = Loan.objects.create(**validated_data)
            
            # Calculate initial values
            if loan.amount_requested and loan.interest_rate and loan.term_months:
                calculator = LoanCalculator(
                    principal=loan.amount_requested,
                    interest_rate=loan.interest_rate,
                    term_months=loan.term_months,
                    interest_type=loan.interest_type,
                    repayment_frequency=loan.repayment_frequency,
                    processing_fee_percentage=loan.processing_fee_percentage
                )
                
                calculations = calculator.calculate()
                loan.total_interest = calculations['total_interest']
                loan.total_amount_due = calculations['total_amount_due']
                loan.installment_amount = calculations['installment_amount']
                loan.processing_fee = calculations.get('processing_fee', Decimal('0.00'))
                loan.save()
            
            logger.info(f"Created loan {loan.loan_number} for customer {loan.customer.full_name}")
            return loan
            
        except Exception as e:
            logger.error(f"Error creating loan: {str(e)}", exc_info=True)
            raise serializers.ValidationError({
                'non_field_errors': f'Failed to create loan: {str(e)}'
            })


class LoanUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating loans."""
    
    class Meta:
        model = Loan
        fields = [
            'loan_type',
            'purpose',
            'purpose_description',
            'amount_requested',
            'term_months',
            'interest_rate',
            'interest_type',
            'repayment_frequency',
            'processing_fee_percentage',
            'late_payment_penalty_rate',
            'rejection_reason',
            'notes',
        ]
        read_only_fields = ['loan_number', 'customer']
    
    def validate(self, data):
        """Validate update data."""
        instance = self.instance
        
        # Cannot update certain fields if loan is approved or active
        if instance.status in ['APPROVED', 'ACTIVE', 'OVERDUE', 'COMPLETED']:
            restricted_fields = [
                'amount_requested', 'term_months', 'interest_rate',
                'interest_type', 'repayment_frequency'
            ]
            for field in restricted_fields:
                if field in data and data[field] != getattr(instance, field):
                    raise serializers.ValidationError({
                        field: f'Cannot update {field} for loans in {instance.status} status.'
                    })
        
        # Only allow updating rejection reason if loan is rejected
        if 'rejection_reason' in data and instance.status != 'REJECTED':
            raise serializers.ValidationError({
                'rejection_reason': 'Can only update rejection reason for rejected loans.'
            })
        
        # Validate new values
        if 'processing_fee_percentage' in data:
            if data['processing_fee_percentage'] > Decimal('5.00'):
                raise serializers.ValidationError({
                    'processing_fee_percentage': 'Processing fee percentage cannot exceed 5%.'
                })
        
        if 'late_payment_penalty_rate' in data:
            if data['late_payment_penalty_rate'] > Decimal('20.00'):
                raise serializers.ValidationError({
                    'late_payment_penalty_rate': 'Late payment penalty rate cannot exceed 20%.'
                })
        
        return data


class LoanDetailSerializer(serializers.ModelSerializer):
    """Detailed loan serializer with related data."""
    
    customer_details = CustomerSerializer(source='customer', read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    is_completed = serializers.BooleanField(read_only=True)
    days_overdue = serializers.IntegerField(read_only=True)
    loan_age_days = serializers.IntegerField(read_only=True)
    repayment_progress = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        read_only=True
    )
    payment_performance = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        read_only=True
    )
    next_payment_date = serializers.DateField(read_only=True)
    approved_by_name = serializers.CharField(
        source='approved_by.get_full_name',
        read_only=True
    )
    disbursed_by_name = serializers.CharField(
        source='disbursed_by.get_full_name',
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
    
    # Related data
    collateral = serializers.SerializerMethodField()
    
    class Meta:
        model = Loan
        fields = [
            'id',
            'loan_number',
            
            # Customer information
            'customer', 'customer_details',
            
            # Loan details
            'loan_type',
            'purpose', 'purpose_description',
            'amount_requested', 'amount_approved', 'amount_disbursed',
            'term_months',
            'interest_rate', 'interest_type',
            'repayment_frequency',
            
            # Status
            'status',
            'is_active', 'is_overdue', 'is_completed',
            
            # Dates
            'application_date', 'approval_date', 'disbursement_date',
            'start_date', 'maturity_date', 'completion_date',
            
            # Calculations
            'total_interest', 'total_amount_due',
            'amount_paid', 'outstanding_balance',
            'installment_amount',
            'processing_fee', 'processing_fee_percentage',
            'late_payment_penalty_rate', 'total_penalties',
            
            # Performance metrics
            'days_overdue', 'loan_age_days',
            'repayment_progress', 'payment_performance',
            'next_payment_date',
            
            # Credit information
            'credit_score_at_application', 'risk_level',
            
            # Approval information
            'approved_by', 'approved_by_name',
            'disbursed_by', 'disbursed_by_name',
            
            # Related data
            'collateral',
            
            # Rejection information
            'rejection_reason',
            
            # Documents
            'loan_agreement',
            
            # Audit information
            'created_by', 'created_by_name',
            'updated_by', 'updated_by_name',
            'created_at', 'updated_at',
            
            # Metadata
            'notes',
        ]
        read_only_fields = [
            'loan_number', 'application_date', 'approval_date', 'disbursement_date',
            'start_date', 'maturity_date', 'completion_date',
            'created_by', 'updated_by', 'created_at', 'updated_at'
        ]
    
    def get_collateral(self, obj):
        """Get collateral for loan."""
        from apps.loans.serializers.collateral import CollateralSerializer
        
        collateral = obj.collateral.all()
        return CollateralSerializer(collateral, many=True).data