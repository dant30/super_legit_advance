# backend/apps/customers/serializers/employment.py
from rest_framework import serializers
from apps.customers.models import Employment
from django.core.validators import MinValueValidator


class EmploymentSerializer(serializers.ModelSerializer):
    """Serializer for employment data."""
    
    employment_status = serializers.CharField(read_only=True)
    customer_name = serializers.CharField(
        source='customer.full_name',
        read_only=True
    )
    customer_number = serializers.CharField(
        source='customer.customer_number',
        read_only=True
    )
    
    class Meta:
        model = Employment
        fields = [
            'id',
            'customer', 'customer_name', 'customer_number',
            'employment_type', 'sector', 'occupation',
            'employment_status',
            'employer_name', 'employer_address',
            'employer_phone', 'employer_email',
            'job_title', 'department', 'employee_number',
            'date_employed', 'years_of_service',
            'monthly_income', 'other_income', 'total_monthly_income',
            'payment_frequency', 'next_pay_date',
            'business_name', 'business_type',
            'business_registration', 'business_start_date',
            'number_of_employees',
            'is_verified', 'verification_date',
            'verification_method', 'verification_notes',
            'employment_letter', 'pay_slips', 'business_permit',
            'notes',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'total_monthly_income', 'years_of_service',
            'created_at', 'updated_at'
        ]


class EmploymentUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating employment data."""
    
    class Meta:
        model = Employment
        fields = [
            'employment_type', 'sector', 'occupation',
            'employer_name', 'employer_address',
            'employer_phone', 'employer_email',
            'job_title', 'department', 'employee_number',
            'date_employed',
            'monthly_income', 'other_income',
            'payment_frequency', 'next_pay_date',
            'business_name', 'business_type',
            'business_registration', 'business_start_date',
            'number_of_employees',
            'employment_letter', 'pay_slips', 'business_permit',
            'notes',
        ]
        extra_kwargs = {
            'monthly_income': {'validators': [MinValueValidator(0)]},
            'other_income': {'validators': [MinValueValidator(0)]},
        }
    
    def validate(self, data):
        """Validate employment data."""
        employment_type = data.get('employment_type', self.instance.employment_type)
        
        # Validate based on employment type
        if employment_type == 'EMPLOYED':
            if not data.get('employer_name') and not self.instance.employer_name:
                raise serializers.ValidationError({
                    'employer_name': 'Employer name is required for employed individuals.'
                })
        
        elif employment_type == 'SELF_EMPLOYED':
            if not data.get('business_name') and not self.instance.business_name:
                raise serializers.ValidationError({
                    'business_name': 'Business name is required for self-employed individuals.'
                })
        
        return data