# backend/apps/customers/serializers/customer.py
from rest_framework import serializers
from django.core.exceptions import ValidationError as DjangoValidationError
from apps.customers.models import Customer, Guarantor, Employment
from apps.users.models import User
from apps.core.utils.validators import validate_phone_number, validate_id_number


# ✓ FIXED: Base serializer with common validation
class BaseCustomerSerializer(serializers.ModelSerializer):
    """
    Base customer serializer with common validation logic.
    Avoids code duplication between create and update serializers.
    """
    
    def validate_phone_number(self, value):
        """Validate phone number format."""
        try:
            validate_phone_number(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.messages)
        return value
    
    def validate_id_number(self, value):
        """Validate ID number format."""
        try:
            id_type = self.initial_data.get('id_type')
            if id_type:
                validate_id_number(value, id_type)
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.messages)
        return value
    
    def validate_date_of_birth(self, value):
        """Validate date of birth."""
        from datetime import date
        from django.utils import timezone
        
        today = date.today()
        
        # Check not in future
        if value > today:
            raise serializers.ValidationError("Date of birth cannot be in the future.")
        
        # Check age >= 18
        age = today.year - value.year - (
            (today.month, today.day) < (value.month, value.day)
        )
        if age < 18:
            raise serializers.ValidationError("Customer must be at least 18 years old.")
        
        return value


class CustomerSerializer(BaseCustomerSerializer):
    """
    Basic customer serializer for list views.
    """
    full_name = serializers.CharField(read_only=True)
    age = serializers.IntegerField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    is_blacklisted = serializers.BooleanField(read_only=True)
    total_loans = serializers.IntegerField(read_only=True)
    active_loans = serializers.IntegerField(read_only=True)
    outstanding_balance = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True
    )
    created_by_name = serializers.CharField(
        source='created_by.get_full_name',
        read_only=True
    )
    
    class Meta:
        model = Customer
        fields = [
            'id', 'customer_number', 'full_name', 'first_name', 'middle_name',
            'last_name', 'phone_number', 'email', 'id_number', 'id_type',
            'gender', 'age', 'marital_status', 'county', 'status', 'risk_level',
            'credit_score', 'is_active', 'is_blacklisted', 'total_loans',
            'active_loans', 'outstanding_balance', 'registration_date',
            'created_by_name', 'created_at'
        ]
        read_only_fields = ['customer_number', 'registration_date', 'created_at']


class CustomerCreateSerializer(BaseCustomerSerializer):
    """
    Serializer for creating customers with comprehensive validation.
    """
    confirm_phone_number = serializers.CharField(write_only=True)
    confirm_email = serializers.EmailField(
        write_only=True,
        required=False,
        allow_blank=True
    )
    create_user_account = serializers.BooleanField(write_only=True, default=False)
    user_password = serializers.CharField(
        write_only=True,
        required=False,
        style={'input_type': 'password'},
        min_length=8
    )
    
    class Meta:
        model = Customer
        fields = [
            'first_name', 'middle_name', 'last_name', 'date_of_birth',
            'gender', 'marital_status', 'id_type', 'id_number',
            'id_expiry_date', 'nationality', 'phone_number',
            'confirm_phone_number', 'email', 'confirm_email',
            'postal_address', 'physical_address', 'county', 'sub_county',
            'ward', 'bank_name', 'bank_account_number', 'bank_branch',
            'id_document', 'passport_photo', 'signature', 'notes',
            'referred_by', 'create_user_account', 'user_password'
        ]
    
    def validate(self, data):
        """✓ FIXED: Comprehensive validation"""
        # Phone number confirmation
        if data.get('phone_number') != data.get('confirm_phone_number'):
            raise serializers.ValidationError({
                'phone_number': 'Phone numbers do not match.'
            })
        
        # Email confirmation if provided
        email = data.get('email')
        confirm_email = data.get('confirm_email')
        if email and confirm_email and email != confirm_email:
            raise serializers.ValidationError({
                'email': 'Email addresses do not match.'
            })
        
        # Remove confirmation fields
        data.pop('confirm_phone_number', None)
        data.pop('confirm_email', None)
        
        return data
    
    def create(self, validated_data):
        """✓ FIXED: Create customer with proper user account"""
        create_user_account = validated_data.pop('create_user_account', False)
        user_password = validated_data.pop('user_password', None)
        
        # Create customer
        customer = Customer.objects.create(**validated_data)
        
        # Create user account if requested
        if create_user_account and user_password:
            try:
                user = User.objects.create_user(
                    email=customer.email or f"{customer.phone_number}@superlegitadvance.local",
                    phone_number=customer.phone_number,
                    password=user_password,
                    first_name=customer.first_name,
                    last_name=customer.last_name,
                    role='customer'
                )
                customer.user = user
                customer.save()
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Failed to create user for customer {customer.id}: {e}")
        
        return customer


class CustomerUpdateSerializer(BaseCustomerSerializer):
    """
    Serializer for updating customers.
    """
    current_password = serializers.CharField(
        write_only=True,
        required=False,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = Customer
        fields = [
            'first_name', 'middle_name', 'last_name', 'date_of_birth',
            'gender', 'marital_status', 'id_type', 'id_expiry_date',
            'nationality', 'phone_number', 'email', 'postal_address',
            'physical_address', 'county', 'sub_county', 'ward',
            'bank_name', 'bank_account_number', 'bank_branch', 'status',
            'credit_score', 'risk_level', 'id_document', 'passport_photo',
            'signature', 'notes', 'referred_by', 'current_password'
        ]
        read_only_fields = ['customer_number', 'id_number', 'phone_number']
    
    def validate(self, data):
        """✓ FIXED: Require password for sensitive updates"""
        sensitive_fields = ['phone_number', 'email', 'id_number']
        request = self.context.get('request')
        
        if request and any(field in data for field in sensitive_fields):
            current_password = data.get('current_password')
            if not current_password or not request.user.check_password(current_password):
                raise serializers.ValidationError({
                    'current_password': 'Current password required for sensitive updates.'
                })
        
        data.pop('current_password', None)
        return data


class CustomerDetailSerializer(BaseCustomerSerializer):
    """
    Detailed customer serializer with related data and statistics.
    """
    full_name = serializers.CharField(read_only=True)
    age = serializers.IntegerField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    is_blacklisted = serializers.BooleanField(read_only=True)
    
    # Related data
    guarantors = serializers.SerializerMethodField()
    employment = serializers.SerializerMethodField()
    
    # Audit info
    created_by_name = serializers.CharField(
        source='created_by.get_full_name',
        read_only=True
    )
    updated_by_name = serializers.CharField(
        source='updated_by.get_full_name',
        read_only=True
    )
    
    # Statistics
    total_loans = serializers.IntegerField(read_only=True)
    active_loans = serializers.IntegerField(read_only=True)
    total_loan_amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True
    )
    outstanding_balance = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True
    )
    loan_performance = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        read_only=True
    )
    
    class Meta:
        model = Customer
        fields = [
            'id', 'customer_number', 'full_name', 'first_name', 'middle_name',
            'last_name', 'date_of_birth', 'age', 'gender', 'marital_status',
            'id_type', 'id_number', 'id_expiry_date', 'nationality',
            'phone_number', 'email', 'postal_address', 'physical_address',
            'county', 'sub_county', 'ward', 'bank_name', 'bank_account_number',
            'bank_branch', 'status', 'credit_score', 'risk_level',
            'is_active', 'is_blacklisted', 'total_loans', 'active_loans',
            'total_loan_amount', 'outstanding_balance', 'loan_performance',
            'id_document', 'passport_photo', 'signature', 'guarantors',
            'employment', 'referred_by', 'registration_date', 'last_updated',
            'created_by', 'created_by_name', 'updated_by', 'updated_by_name',
            'created_at', 'updated_at', 'notes'
        ]
        read_only_fields = [
            'customer_number', 'registration_date', 'last_updated',
            'created_by', 'updated_by', 'created_at', 'updated_at'
        ]
    
    def get_guarantors(self, obj):
        """Get active guarantors."""
        from apps.customers.serializers.guarantor import GuarantorSerializer
        guarantors = obj.guarantors.filter(is_active=True)
        return GuarantorSerializer(guarantors, many=True).data
    
    def get_employment(self, obj):
        """Get employment information."""
        from apps.customers.serializers.employement import EmploymentSerializer
        try:
            employment = obj.employment
            return EmploymentSerializer(employment).data
        except Employment.DoesNotExist:
            return None
