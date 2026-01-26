# backend/apps/notifications/serializers/test.py
from rest_framework import serializers
from django.core.validators import validate_email
from apps.core.utils.validators import validate_phone_number
from django.core.exceptions import ValidationError as DjangoValidationError


class TestNotificationSerializer(serializers.Serializer):
    """Serializer for test notifications."""
    
    channel = serializers.ChoiceField(
        choices=['SMS', 'EMAIL'],
        required=True
    )
    recipient_phone = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Required for SMS channel"
    )
    recipient_email = serializers.EmailField(
        required=False,
        allow_blank=True,
        help_text="Required for EMAIL channel"
    )
    message = serializers.CharField(
        required=True,
        max_length=500
    )
    
    def validate(self, data):
        """Validate test notification data."""
        channel = data.get('channel')
        recipient_phone = data.get('recipient_phone')
        recipient_email = data.get('recipient_email')
        
        if channel == 'SMS':
            if not recipient_phone:
                raise serializers.ValidationError({
                    'recipient_phone': 'Phone number is required for SMS test.'
                })
            
            # Validate phone number
            try:
                validate_phone_number(recipient_phone)
            except DjangoValidationError as e:
                raise serializers.ValidationError({'recipient_phone': e.messages})
        
        elif channel == 'EMAIL':
            if not recipient_email:
                raise serializers.ValidationError({
                    'recipient_email': 'Email address is required for email test.'
                })
            
            # Validate email
            try:
                validate_email(recipient_email)
            except DjangoValidationError as e:
                raise serializers.ValidationError({'recipient_email': e.messages})
        
        return data