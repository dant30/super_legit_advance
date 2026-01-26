# backend/apps/users/serializers/user.py
# backend/apps/users/serializers/user.py - FIXED VERSION
import re
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils import timezone
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from phonenumber_field.serializerfields import PhoneNumberField

from apps.core.utils.validators import validate_phone_number, validate_email
from apps.core.constants import ROLE_CHOICES, STATUS_CHOICES, GENDER_CHOICES, MARITAL_STATUS_CHOICES
from ..models import User  # REMOVED StaffProfile import - not needed in user serializers


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model (read operations).
    """
    full_name = serializers.SerializerMethodField()
    role_display = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    profile_picture_url = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'phone_number',
            'first_name',
            'last_name',
            'full_name',
            'id_number',
            'date_of_birth',
            'gender',
            'marital_status',
            'role',
            'role_display',
            'status',
            'status_display',
            'is_verified',
            'is_active',
            'email_verified',
            'phone_verified',
            'kyc_completed',
            'profile_picture',
            'profile_picture_url',
            'language',
            'notifications_enabled',
            'marketing_emails',
            'last_login_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id', 'is_verified', 'email_verified', 'phone_verified',
            'last_login_at', 'created_at', 'updated_at'
        ]
    
    def get_full_name(self, obj):
        return obj.get_full_name()
    
    def get_role_display(self, obj):
        return obj.get_role_display_name()
    
    def get_status_display(self, obj):
        return dict(STATUS_CHOICES).get(obj.status, obj.status)
    
    def get_profile_picture_url(self, obj):
        if obj.profile_picture:
            return obj.profile_picture.url
        return None


class UserCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new users.
    """
    email = serializers.EmailField(
        required=True,
        validators=[
            UniqueValidator(
                queryset=User.objects.filter(is_deleted=False),
                message="A user with this email already exists."
            )
        ]
    )
    phone_number = PhoneNumberField(
        required=True,
        validators=[
            UniqueValidator(
                queryset=User.objects.filter(is_deleted=False),
                message="A user with this phone number already exists."
            )
        ]
    )
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        min_length=8,
        max_length=128,
        help_text="Password must be at least 8 characters long."
    )
    confirm_password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        fields = [
            'email',
            'phone_number',
            'first_name',
            'last_name',
            'id_number',
            'date_of_birth',
            'gender',
            'marital_status',
            'role',
            'password',
            'confirm_password',
            'terms_accepted',
            'privacy_policy_accepted',
        ]
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'terms_accepted': {'required': True},
            'privacy_policy_accepted': {'required': True},
        }
    
    def validate(self, attrs):
        # Check passwords match
        if attrs.get('password') != attrs.get('confirm_password'):
            raise serializers.ValidationError({
                "confirm_password": "Passwords do not match."
            })
        
        # Validate password strength
        password = attrs.get('password')
        try:
            validate_password(password)
        except DjangoValidationError as e:
            raise serializers.ValidationError({"password": list(e.messages)})
        
        # Validate email format
        email = attrs.get('email')
        try:
            validate_email(email)
        except DjangoValidationError as e:
            raise serializers.ValidationError({"email": list(e.messages)})
        
        # Validate phone number
        phone_number = attrs.get('phone_number')
        try:
            validate_phone_number(str(phone_number))
        except DjangoValidationError as e:
            raise serializers.ValidationError({"phone_number": list(e.messages)})
        
        # Check terms acceptance
        if not attrs.get('terms_accepted'):
            raise serializers.ValidationError({
                "terms_accepted": "You must accept the terms and conditions."
            })
        
        if not attrs.get('privacy_policy_accepted'):
            raise serializers.ValidationError({
                "privacy_policy_accepted": "You must accept the privacy policy."
            })
        
        # Remove confirm_password from validated data
        attrs.pop('confirm_password', None)
        
        return attrs
    
    def create(self, validated_data):
        """Create a new user with the validated data."""
        from django.db import transaction
        
        with transaction.atomic():
            # Extract password
            password = validated_data.pop('password')
            
            # Create user
            user = User.objects.create_user(
                **validated_data,
                password=password
            )
            
            # Set default role if not provided
            if not user.role:
                user.role = 'customer'
                user.save(update_fields=['role'])
            
            # Send welcome email
            try:
                user.send_welcome_email()
            except Exception:
                # Don't fail user creation if email fails
                pass
            
            # Send verification email
            try:
                user.send_verification_email()
            except Exception:
                # Don't fail user creation if email fails
                pass
            
            return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user profiles.
    """
    current_password = serializers.CharField(
        write_only=True,
        required=False,
        style={'input_type': 'password'},
        help_text="Required when changing sensitive information."
    )
    
    class Meta:
        model = User
        fields = [
            'first_name',
            'last_name',
            'id_number',
            'date_of_birth',
            'gender',
            'marital_status',
            'profile_picture',
            'language',
            'notifications_enabled',
            'marketing_emails',
            'current_password',
        ]
        extra_kwargs = {
            'profile_picture': {'required': False},
        }
    
    def validate(self, attrs):
        user = self.context['request'].user
        current_password = attrs.get('current_password')
        
        # Check if sensitive fields are being updated
        sensitive_fields = ['email', 'phone_number', 'id_number', 'date_of_birth']
        updating_sensitive = any(field in attrs for field in sensitive_fields)
        
        if updating_sensitive and not current_password:
            raise serializers.ValidationError({
                "current_password": "Current password is required to update sensitive information."
            })
        
        if current_password and not user.check_password(current_password):
            raise serializers.ValidationError({
                "current_password": "Current password is incorrect."
            })
        
        # Validate date of birth
        if 'date_of_birth' in attrs:
            from datetime import date
            age = (date.today() - attrs['date_of_birth']).days // 365
            if age < 18:
                raise serializers.ValidationError({
                    "date_of_birth": "User must be at least 18 years old."
                })
        
        # Remove current_password from validated data
        attrs.pop('current_password', None)
        
        return attrs
    
    def update(self, instance, validated_data):
        """Update user instance."""
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.full_clean()
        instance.save()
        
        return instance


class UserPasswordChangeSerializer(serializers.Serializer):
    """
    Serializer for changing user password.
    """
    current_password = serializers.CharField(
        required=True,
        style={'input_type': 'password'}
    )
    new_password = serializers.CharField(
        required=True,
        style={'input_type': 'password'},
        min_length=8,
        max_length=128
    )
    confirm_new_password = serializers.CharField(
        required=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        user = self.context.get('user')
        
        # Check current password
        if not user.check_password(attrs.get('current_password')):
            raise serializers.ValidationError({
                "current_password": "Current password is incorrect."
            })
        
        # Check new passwords match
        if attrs.get('new_password') != attrs.get('confirm_new_password'):
            raise serializers.ValidationError({
                "confirm_new_password": "Passwords do not match."
            })
        
        # Check new password is different from current
        if attrs.get('current_password') == attrs.get('new_password'):
            raise serializers.ValidationError({
                "new_password": "New password must be different from current password."
            })
        
        # Validate new password strength
        try:
            validate_password(attrs.get('new_password'), user)
        except DjangoValidationError as e:
            raise serializers.ValidationError({"new_password": list(e.messages)})
        
        # Remove confirm_new_password from validated data
        attrs.pop('confirm_new_password', None)
        
        return attrs


class UserPasswordResetSerializer(serializers.Serializer):
    """
    Serializer for requesting password reset.
    """
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        """Validate email exists and user is active."""
        try:
            user = User.objects.get(email=value, is_active=True, is_deleted=False)
            return value
        except User.DoesNotExist:
            # Don't reveal if user exists
            return value


class UserPasswordResetConfirmSerializer(serializers.Serializer):
    """
    Serializer for confirming password reset.
    """
    uid = serializers.CharField(required=True)
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(
        required=True,
        style={'input_type': 'password'},
        min_length=8,
        max_length=128
    )
    confirm_new_password = serializers.CharField(
        required=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        from django.utils.encoding import force_str
        from django.utils.http import urlsafe_base64_decode
        from django.contrib.auth.tokens import PasswordResetTokenGenerator
        
        uid = attrs.get('uid')
        token = attrs.get('token')
        new_password = attrs.get('new_password')
        confirm_new_password = attrs.get('confirm_new_password')
        
        # Check passwords match
        if new_password != confirm_new_password:
            raise serializers.ValidationError({
                "confirm_new_password": "Passwords do not match."
            })
        
        try:
            # Decode uid
            uid = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=uid, is_active=True, is_deleted=False)
            
            # Check token
            token_generator = PasswordResetTokenGenerator()
            if not token_generator.check_token(user, token):
                raise serializers.ValidationError({
                    "token": "Invalid or expired token."
                })
            
            # Validate new password
            try:
                validate_password(new_password, user)
            except DjangoValidationError as e:
                raise serializers.ValidationError({"new_password": list(e.messages)})
            
            # Add user to validated data
            attrs['user'] = user
            
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError({
                "uid": "Invalid user ID."
            })
        
        # Remove confirm_new_password from validated data
        attrs.pop('confirm_new_password', None)
        
        return attrs
    
    def save(self):
        """Reset user password."""
        user = self.validated_data['user']
        new_password = self.validated_data['new_password']
        
        user.set_password(new_password)
        user.last_password_change = timezone.now()
        user.save()
        
        # Send password reset confirmation
        try:
            from apps.notifications.services.email_service import EmailService
            EmailService.send_password_reset_confirmation(user.email)
        except Exception:
            # Don't fail if email sending fails
            pass


class UserVerificationSerializer(serializers.Serializer):
    """
    Serializer for email verification.
    """
    uid = serializers.CharField(required=True)
    token = serializers.CharField(required=True)
    
    def validate(self, attrs):
        from django.utils.encoding import force_str
        from django.utils.http import urlsafe_base64_decode
        from ..tokens import email_verification_token
        
        uid = attrs.get('uid')
        token = attrs.get('token')
        
        try:
            # Decode uid
            uid = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=uid, is_active=True, is_deleted=False)
            
            # Check token
            if not email_verification_token.check_token(user, token):
                raise serializers.ValidationError({
                    "token": "Invalid or expired token."
                })
            
            # Add user to validated data
            attrs['user'] = user
            
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError({
                "uid": "Invalid user ID."
            })
        
        return attrs


class LoginSerializer(TokenObtainPairSerializer):
    """
    Custom login serializer with additional validation.
    """
    email = serializers.EmailField(required=False)
    phone_number = PhoneNumberField(required=False)
    username = serializers.CharField(required=False)
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields[self.username_field].required = False
    
    def validate(self, attrs):
        # Get login identifier (email, phone, or username)
        email = attrs.get('email')
        phone_number = attrs.get('phone_number')
        username = attrs.get('username')
        password = attrs.get('password')
        
        # Determine which identifier to use
        identifier = None
        if email:
            identifier = email
            identifier_field = 'email'
        elif phone_number:
            identifier = str(phone_number)
            identifier_field = 'phone_number'
        elif username:
            identifier = username
            identifier_field = 'email'  # Try email first, then username
        else:
            raise serializers.ValidationError({
                "non_field_errors": "Email, phone number, or username is required."
            })
        
        # Find user
        try:
            if identifier_field == 'email':
                user = User.objects.get(email=identifier, is_deleted=False)
            elif identifier_field == 'phone_number':
                user = User.objects.get(phone_number=identifier, is_deleted=False)
        except User.DoesNotExist:
            # Try username as email
            try:
                user = User.objects.get(email=identifier, is_deleted=False)
            except User.DoesNotExist:
                raise serializers.ValidationError({
                    "non_field_errors": "Invalid login credentials."
                })
        
        # Check if user is active
        if not user.is_active:
            raise serializers.ValidationError({
                "non_field_errors": "Account is deactivated. Please contact support."
            })
        
        # Check if account is locked
        if user.is_locked():
            raise serializers.ValidationError({
                "non_field_errors": "Account is locked due to too many failed login attempts. Try again later."
            })
        
        # Authenticate user
        auth_user = authenticate(
            request=self.context.get('request'),
            username=user.email,  # Use email for authentication
            password=password
        )
        
        if not auth_user:
            # Record failed login attempt
            user.record_failed_login()
            raise serializers.ValidationError({
                "non_field_errors": "Invalid login credentials."
            })
        
        # Add user to validated data
        attrs['user'] = user
        
        # Generate token data
        data = super().validate({
            'email': user.email,
            'password': password
        })
        
        data['user'] = user
        
        return data


class TokenObtainPairResponseSerializer(serializers.Serializer):
    """
    Serializer for login response.
    """
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = UserSerializer()


class TokenRefreshResponseSerializer(serializers.Serializer):
    """
    Serializer for token refresh response.
    """
    access = serializers.CharField()


class UserBasicSerializer(serializers.ModelSerializer):
    """
    Basic user serializer for minimal user information (used in audit logs and other modules).
    """
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'phone_number',
            'first_name',
            'last_name',
            'full_name',
            'role',
            'is_active',
            'is_verified',
        ]
        read_only_fields = [
            'id',
            'email',
            'phone_number',
            'first_name',
            'last_name',
            'full_name',
            'role',
            'is_active',
            'is_verified',
        ]
    
    def get_full_name(self, obj):
        return obj.get_full_name()