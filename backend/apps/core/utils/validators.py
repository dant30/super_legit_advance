# backend/apps/core/utils/validators.py
import re
import phonenumbers
from datetime import datetime, date
from decimal import Decimal
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


def validate_phone_number(value: str):
    """
    Enhanced phone number validation using phonenumbers library.
    """
    if not value:
        raise ValidationError(_("Phone number is required."))
    
    try:
        # Try to parse the phone number
        parsed = phonenumbers.parse(value, "KE")  # Default to Kenya
        if not phonenumbers.is_valid_number(parsed):
            raise ValidationError(_("Invalid phone number."))
        
        # Format to international format
        formatted = phonenumbers.format_number(
            parsed, 
            phonenumbers.PhoneNumberFormat.E164
        )
        return formatted
    except phonenumbers.phonenumberutil.NumberParseException:
        # Fallback to regex for basic validation
        pattern = r'^\+?[1-9]\d{9,14}$'
        if not re.match(pattern, value):
            raise ValidationError(
                _("Invalid phone number format. Use international format: +254712345678")
            )
    
    return value


def validate_email(value: str):
    """
    Email validation with regex.
    """
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, value):
        raise ValidationError(_("Invalid email address."))
    return value


def validate_positive_amount(value):
    """
    Validate that amount is positive and reasonable.
    """
    if value <= 0:
        raise ValidationError(_("Amount must be greater than zero."))
    
    # Optional: Maximum amount check
    MAX_AMOUNT = 10000000  # 10 million
    if value > MAX_AMOUNT:
        raise ValidationError(_(f"Amount cannot exceed {MAX_AMOUNT:,}."))
    
    return value


def validate_payment_amount(value: Decimal):
    """
    Validate payment amount for repayments.
    """
    # Ensure it's positive
    if value <= 0:
        raise ValidationError(_("Payment amount must be greater than zero."))
    
    # Optional: Check for minimum payment
    MIN_PAYMENT = Decimal('100.00')  # Minimum payment of KES 100
    if value < MIN_PAYMENT:
        raise ValidationError(_(f"Minimum payment amount is {MIN_PAYMENT}."))
    
    # Optional: Check for reasonable maximum (1 million)
    MAX_PAYMENT = Decimal('1000000.00')
    if value > MAX_PAYMENT:
        raise ValidationError(_(f"Payment amount cannot exceed {MAX_PAYMENT:,}."))
    
    return value


def validate_percentage(value):
    """
    Validate percentage value (0-100).
    """
    if value < 0 or value > 100:
        raise ValidationError(_("Percentage must be between 0 and 100."))
    return value


def validate_id_number(value: str):
    """
    Validate Kenyan National ID number.
    """
    # Basic format validation for Kenyan ID
    pattern = r'^[0-9]{8,10}$'
    if not re.match(pattern, value):
        raise ValidationError(_("Invalid ID number format."))
    
    # Add Luhn algorithm check or other validation if needed
    return value


def validate_kra_pin(value: str):
    """
    Validate Kenyan KRA PIN.
    """
    pattern = r'^[A-Z]{1}[0-9]{9}[A-Z]{1}$'
    if not re.match(pattern, value):
        raise ValidationError(_("Invalid KRA PIN format."))
    return value


def validate_date_not_in_past(value: date):
    """
    Validate that date is not in the past.
    """
    if value < date.today():
        raise ValidationError(_("Date cannot be in the past."))
    return value


def validate_date_not_in_future(value: date):
    """
    Validate that date is not in the future.
    """
    if value > date.today():
        raise ValidationError(_("Date cannot be in the future."))
    return value


def validate_min_age(value: date, min_age=18):
    """
    Validate minimum age requirement.
    """
    today = date.today()
    age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
    
    if age < min_age:
        raise ValidationError(_(f"Must be at least {min_age} years old."))
    return value


def validate_file_size(value):
    """
    Validate uploaded file size.
    """
    limit = 5 * 1024 * 1024  # 5MB
    if value.size > limit:
        raise ValidationError(_("File too large. Size should not exceed 5MB."))
    return value


def validate_file_extension(value):
    """
    Validate file extension.
    """
    allowed_extensions = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx']
    ext = value.name.lower().split('.')[-1]
    
    if f'.{ext}' not in allowed_extensions:
        raise ValidationError(_(
            f"Unsupported file extension. Allowed: {', '.join(allowed_extensions)}"
        ))
    return value


def validate_loan_term(value: int):
    """
    Validate loan term in months.
    """
    MIN_TERM = 1
    MAX_TERM = 60  # 5 years
    
    if value < MIN_TERM or value > MAX_TERM:
        raise ValidationError(_(f"Loan term must be between {MIN_TERM} and {MAX_TERM} months."))
    return value


class ValidatorRegistry:
    """
    Registry for custom validators.
    """
    _validators = {}
    
    @classmethod
    def register(cls, name, validator):
        cls._validators[name] = validator
    
    @classmethod
    def get(cls, name):
        return cls._validators.get(name)
    
    @classmethod
    def validate(cls, name, value):
        validator = cls.get(name)
        if validator:
            return validator(value)
        raise ValueError(f"Validator '{name}' not found.")


# Register the validators for easy access
ValidatorRegistry.register('phone_number', validate_phone_number)
ValidatorRegistry.register('email', validate_email)
ValidatorRegistry.register('positive_amount', validate_positive_amount)
ValidatorRegistry.register('payment_amount', validate_payment_amount)
ValidatorRegistry.register('percentage', validate_percentage)
ValidatorRegistry.register('id_number', validate_id_number)
ValidatorRegistry.register('kra_pin', validate_kra_pin)
ValidatorRegistry.register('date_not_in_past', validate_date_not_in_past)
ValidatorRegistry.register('date_not_in_future', validate_date_not_in_future)
ValidatorRegistry.register('min_age', validate_min_age)
ValidatorRegistry.register('file_size', validate_file_size)
ValidatorRegistry.register('file_extension', validate_file_extension)
ValidatorRegistry.register('loan_term', validate_loan_term)