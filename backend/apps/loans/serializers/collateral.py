# backend/apps/loans/serializers/collateral.py
from rest_framework import serializers
from django.core.validators import MinValueValidator
from decimal import Decimal

from apps.loans.models import Collateral


class CollateralSerializer(serializers.ModelSerializer):
    """Serializer for collateral data."""
    
    loan_number = serializers.CharField(
        source='loan.loan_number',
        read_only=True
    )
    customer_name = serializers.CharField(
        source='loan.customer.full_name',
        read_only=True
    )
    loan_to_value_ratio = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        read_only=True
    )
    coverage_ratio = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True
    )
    is_active = serializers.BooleanField(read_only=True)
    is_released = serializers.BooleanField(read_only=True)
    is_insured = serializers.BooleanField(read_only=True)
    insurance_status = serializers.CharField(read_only=True)
    created_by_name = serializers.CharField(
        source='created_by.get_full_name',
        read_only=True
    )
    updated_by_name = serializers.CharField(
        source='updated_by.get_full_name',
        read_only=True
    )
    
    class Meta:
        model = Collateral
        fields = [
            'id',
            'loan', 'loan_number', 'customer_name',
            'collateral_type',
            'description',
            'owner_name', 'owner_id_number', 'ownership_type',
            'estimated_value', 'insured_value',
            'insurance_company', 'insurance_policy_number', 'insurance_expiry',
            'location',
            'registration_number', 'registration_date', 'registration_authority',
            'status',
            'pledged_date', 'release_date',
            'loan_to_value_ratio', 'coverage_ratio',
            'is_active', 'is_released', 'is_insured', 'insurance_status',
            'ownership_document', 'valuation_report',
            'insurance_certificate', 'photos', 'other_documents',
            'notes',
            'created_by', 'created_by_name',
            'updated_by', 'updated_by_name',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'pledged_date', 'created_at', 'updated_at'
        ]


class CollateralCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating collateral."""
    
    class Meta:
        model = Collateral
        fields = [
            'collateral_type',
            'description',
            'owner_name',
            'owner_id_number',
            'ownership_type',
            'estimated_value',
            'insured_value',
            'insurance_company',
            'insurance_policy_number',
            'insurance_expiry',
            'location',
            'registration_number',
            'registration_date',
            'registration_authority',
            'ownership_document',
            'valuation_report',
            'insurance_certificate',
            'photos',
            'other_documents',
            'notes',
        ]
        extra_kwargs = {
            'estimated_value': {
                'validators': [MinValueValidator(Decimal('0.00'))]
            },
        }
    
    def validate(self, data):
        """Validate collateral data."""
        # Validate insurance information
        insured_value = data.get('insured_value')
        insurance_company = data.get('insurance_company')
        
        if insured_value and not insurance_company:
            raise serializers.ValidationError({
                'insurance_company': 'Insurance company is required when insured value is provided.'
            })
        
        if insurance_company and not insured_value:
            raise serializers.ValidationError({
                'insured_value': 'Insured value is required when insurance company is provided.'
            })
        
        # Validate registration information
        registration_number = data.get('registration_number')
        registration_date = data.get('registration_date')
        
        if registration_number and not registration_date:
            raise serializers.ValidationError({
                'registration_date': 'Registration date is required when registration number is provided.'
            })
        
        # Validate owner information
        owner_name = data.get('owner_name')
        owner_id_number = data.get('owner_id_number')
        
        if not owner_name or not owner_id_number:
            raise serializers.ValidationError({
                'owner_name': 'Owner name and ID number are required.',
                'owner_id_number': 'Owner name and ID number are required.'
            })
        
        return data