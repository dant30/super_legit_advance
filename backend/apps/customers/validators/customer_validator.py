# backend/apps/customers/validators/customer_validator.py
import re
from datetime import date
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.core.validators import validate_email


class CustomerValidator:
    """
    Comprehensive validator for customer data.
    """
    
    def __init__(self, data):
        self.data = data
        self.errors = {}
    
    def validate(self):
        """Validate all customer data."""
        self.errors.clear()
        
        # Validate required fields
        self._validate_required_fields()
        
        # Validate personal information
        self._validate_names()
        self._validate_date_of_birth()
        self._validate_gender()
        self._validate_marital_status()
        
        # Validate contact information
        self._validate_phone_number()
        self._validate_email()
        
        # Validate identification
        self._validate_id_type()
        self._validate_id_number()
        self._validate_id_expiry()
        
        # Validate address
        self._validate_address()
        
        # Validate bank information
        self._validate_bank_info()
        
        return len(self.errors) == 0
    
    def _validate_required_fields(self):
        """Validate required fields."""
        required_fields = [
            'first_name', 'last_name', 'date_of_birth',
            'gender', 'id_type', 'id_number',
            'phone_number', 'physical_address', 'county',
        ]
        
        for field in required_fields:
            if field not in self.data or not self.data.get(field):
                self.errors[field] = f'{field.replace("_", " ").title()} is required.'
    
    def _validate_names(self):
        """Validate name fields."""
        # First name validation
        first_name = self.data.get('first_name', '').strip()
        if first_name:
            if len(first_name) < 2:
                self.errors['first_name'] = 'First name must be at least 2 characters.'
            elif not re.match(r'^[A-Za-z\s\-]+$', first_name):
                self.errors['first_name'] = 'First name can only contain letters, spaces, and hyphens.'
        
        # Last name validation
        last_name = self.data.get('last_name', '').strip()
        if last_name:
            if len(last_name) < 2:
                self.errors['last_name'] = 'Last name must be at least 2 characters.'
            elif not re.match(r'^[A-Za-z\s\-]+$', last_name):
                self.errors['last_name'] = 'Last name can only contain letters, spaces, and hyphens.'
        
        # Middle name validation (optional)
        middle_name = self.data.get('middle_name', '').strip()
        if middle_name and not re.match(r'^[A-Za-z\s\-]*$', middle_name):
            self.errors['middle_name'] = 'Middle name can only contain letters, spaces, and hyphens.'
    
    def _validate_date_of_birth(self):
        """Validate date of birth."""
        date_of_birth = self.data.get('date_of_birth')
        if not date_of_birth:
            return
        
        if isinstance(date_of_birth, str):
            try:
                date_of_birth = date.fromisoformat(date_of_birth)
            except ValueError:
                self.errors['date_of_birth'] = 'Invalid date format. Use YYYY-MM-DD.'
                return
        
        # Check if date is in the future
        if date_of_birth > timezone.now().date():
            self.errors['date_of_birth'] = 'Date of birth cannot be in the future.'
            return
        
        # Calculate age
        today = timezone.now().date()
        age = today.year - date_of_birth.year - (
            (today.month, today.day) < (date_of_birth.month, date_of_birth.day)
        )
        
        # Must be at least 18 years old
        if age < 18:
            self.errors['date_of_birth'] = 'Customer must be at least 18 years old.'
        
        # Reasonable age limit (120 years)
        if age > 120:
            self.errors['date_of_birth'] = 'Please verify the date of birth.'
    
    def _validate_gender(self):
        """Validate gender."""
        gender = self.data.get('gender', '').upper()
        valid_genders = ['M', 'F', 'O']
        
        if gender not in valid_genders:
            self.errors['gender'] = f'Gender must be one of: {", ".join(valid_genders)}'
    
    def _validate_marital_status(self):
        """Validate marital status."""
        marital_status = self.data.get('marital_status', '').upper()
        valid_statuses = ['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED']
        
        if marital_status and marital_status not in valid_statuses:
            self.errors['marital_status'] = f'Marital status must be one of: {", ".join(valid_statuses)}'
    
    def _validate_phone_number(self):
        """Validate phone number."""
        phone_number = self.data.get('phone_number', '').strip()
        
        if not phone_number:
            return
        
        # Remove any spaces or special characters
        phone_number = re.sub(r'[^\d\+]', '', phone_number)
        
        # Check if it starts with +254 (Kenyan format)
        if not phone_number.startswith('+254'):
            if phone_number.startswith('0'):
                phone_number = '+254' + phone_number[1:]
            elif phone_number.startswith('254'):
                phone_number = '+' + phone_number
            else:
                phone_number = '+254' + phone_number
        
        # Validate length (should be 13 characters including +254)
        if len(phone_number) != 13:
            self.errors['phone_number'] = 'Phone number must be 10 digits (e.g., +254712345678).'
            return
        
        # Validate that all characters after + are digits
        if not phone_number[1:].isdigit():
            self.errors['phone_number'] = 'Phone number can only contain digits after the country code.'
            return
        
        # Update the phone number in data
        self.data['phone_number'] = phone_number
    
    def _validate_email(self):
        """Validate email address."""
        email = self.data.get('email', '').strip()
        
        if not email:
            return
        
        try:
            validate_email(email)
        except ValidationError:
            self.errors['email'] = 'Please enter a valid email address.'
    
    def _validate_id_type(self):
        """Validate ID type."""
        id_type = self.data.get('id_type', '').upper()
        valid_id_types = ['NATIONAL_ID', 'PASSPORT', 'DRIVING_LICENSE', 'ALIEN_CARD']
        
        if id_type not in valid_id_types:
            self.errors['id_type'] = f'ID type must be one of: {", ".join(valid_id_types)}'
    
    def _validate_id_number(self):
        """Validate ID number based on ID type."""
        id_type = self.data.get('id_type', '').upper()
        id_number = self.data.get('id_number', '').strip()
        
        if not id_type or not id_number:
            return
        
        # Remove any spaces or special characters
        id_number = re.sub(r'[^\w]', '', id_number).upper()
        
        if id_type == 'NATIONAL_ID':
            # Kenyan National ID: 8 digits
            if len(id_number) != 8 or not id_number.isdigit():
                self.errors['id_number'] = 'National ID must be 8 digits.'
            
            # Validate check digit (simple validation)
            if len(id_number) == 8 and id_number.isdigit():
                # Basic validation: first digit shouldn't be 0
                if id_number[0] == '0':
                    self.errors['id_number'] = 'Invalid National ID format.'
        
        elif id_type == 'PASSPORT':
            # Passport: Starts with letter followed by 7-8 digits
            if not re.match(r'^[A-Z]\d{7,8}$', id_number):
                self.errors['id_number'] = 'Passport must start with a letter followed by 7-8 digits.'
        
        elif id_type == 'DRIVING_LICENSE':
            # Driving License: Complex format, basic validation
            if len(id_number) < 5:
                self.errors['id_number'] = 'Driving license number is too short.'
        
        elif id_type == 'ALIEN_CARD':
            # Alien Card: Starts with letter followed by digits
            if not re.match(r'^[A-Z]\d+$', id_number):
                self.errors['id_number'] = 'Alien card must start with a letter followed by digits.'
        
        # Update the ID number in data
        self.data['id_number'] = id_number
    
    def _validate_id_expiry(self):
        """Validate ID expiry date."""
        id_expiry_date = self.data.get('id_expiry_date')
        if not id_expiry_date:
            return
        
        if isinstance(id_expiry_date, str):
            try:
                id_expiry_date = date.fromisoformat(id_expiry_date)
            except ValueError:
                self.errors['id_expiry_date'] = 'Invalid date format. Use YYYY-MM-DD.'
                return
        
        # Check if expiry date is in the past
        if id_expiry_date < timezone.now().date():
            self.errors['id_expiry_date'] = 'ID has expired. Please update ID information.'
    
    def _validate_address(self):
        """Validate address fields."""
        # Physical address validation
        physical_address = self.data.get('physical_address', '').strip()
        if not physical_address:
            self.errors['physical_address'] = 'Physical address is required.'
        elif len(physical_address) < 10:
            self.errors['physical_address'] = 'Please provide a complete physical address.'
        
        # County validation
        county = self.data.get('county', '').strip()
        if not county:
            self.errors['county'] = 'County is required.'
        elif len(county) < 3:
            self.errors['county'] = 'Please provide a valid county name.'
        
        # Sub-county validation (optional)
        sub_county = self.data.get('sub_county', '').strip()
        if sub_county and len(sub_county) < 3:
            self.errors['sub_county'] = 'Please provide a valid sub-county name.'
    
    def _validate_bank_info(self):
        """Validate bank information (optional)."""
        bank_name = self.data.get('bank_name', '').strip()
        bank_account_number = self.data.get('bank_account_number', '').strip()
        bank_branch = self.data.get('bank_branch', '').strip()
        
        # If any bank field is provided, all should be provided
        bank_fields = [bank_name, bank_account_number, bank_branch]
        provided_fields = [field for field in bank_fields if field]
        
        if provided_fields and len(provided_fields) != len(bank_fields):
            self.errors['bank_name'] = 'Please provide all bank information or leave all fields blank.'
            self.errors['bank_account_number'] = 'Please provide all bank information or leave all fields blank.'
            self.errors['bank_branch'] = 'Please provide all bank information or leave all fields blank.'
        
        # Validate bank account number if provided
        if bank_account_number:
            # Remove spaces and special characters
            bank_account_number = re.sub(r'[^\d]', '', bank_account_number)
            
            # Basic validation (account numbers typically 10-16 digits)
            if not 8 <= len(bank_account_number) <= 20:
                self.errors['bank_account_number'] = 'Bank account number should be 8-20 digits.'
            
            # Update the account number in data
            self.data['bank_account_number'] = bank_account_number
    
    def get_errors(self):
        """Return validation errors."""
        return self.errors
    
    def get_validated_data(self):
        """Return validated data."""
        return self.data