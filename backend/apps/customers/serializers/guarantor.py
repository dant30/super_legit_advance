# backend/apps/customers/serializers/guarantor.py
from rest_framework import serializers
from apps.customers.models import Guarantor, Customer
from apps.core.utils.validators import validate_phone_number, validate_id_number
from django.core.exceptions import ValidationError as DjangoValidationError


class GuarantorSerializer(serializers.ModelSerializer):
    """Serializer for guarantor data."""
    
    full_name = serializers.CharField(read_only=True)
    customer_name = serializers.CharField(
        source='customer.full_name',
        read_only=True
    )
    customer_number = serializers.CharField(
        source='customer.customer_number',
        read_only=True
    )
    is_verified = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Guarantor
        fields = [
            'id',
            'customer', 'customer_name', 'customer_number',
            'first_name', 'middle_name', 'last_name', 'full_name',
            'phone_number', 'email',
            'physical_address', 'county',
            'id_type', 'id_number',
            'guarantor_type', 'relationship',
            'occupation', 'employer', 'monthly_income',
            'id_document', 'passport_photo',
            'is_active', 'verification_status', 'is_verified',
            'verification_date', 'verification_notes',
            'notes',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']


class GuarantorCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating guarantors."""
    
    confirm_phone_number = serializers.CharField(write_only=True)
    
    class Meta:
        model = Guarantor
        fields = [
            'first_name', 'middle_name', 'last_name',
            'phone_number', 'confirm_phone_number',
            'email',
            'physical_address', 'county',
            'id_type', 'id_number',
            'guarantor_type', 'relationship',
            'occupation', 'employer', 'monthly_income',
            'id_document', 'passport_photo',
            'notes',
        ]
    
    def validate(self, data):
        """Validate guarantor data."""
        # Check phone number confirmation
        if data.get('phone_number') != data.get('confirm_phone_number'):
            raise serializers.ValidationError({
                'phone_number': 'Phone numbers do not match.',
                'confirm_phone_number': 'Phone numbers do not match.'
            })
        
        # Validate phone number
        phone_number = data.get('phone_number')
        if phone_number:
            try:
                validate_phone_number(phone_number)
            except DjangoValidationError as e:
                raise serializers.ValidationError({'phone_number': e.messages})
        
        # Validate ID number
        id_type = data.get('id_type')
        id_number = data.get('id_number')
        if id_type and id_number:
            try:
                validate_id_number(id_number, id_type)
            except DjangoValidationError as e:
                raise serializers.ValidationError({'id_number': e.messages})
        
        # Remove confirmation field
        data.pop('confirm_phone_number', None)
        
        return data