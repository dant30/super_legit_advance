# backend/apps/customers/models/customer.py
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import (
    RegexValidator, MinValueValidator, MaxValueValidator,
    FileExtensionValidator
)
from django.utils import timezone
from django.core.exceptions import ValidationError  # ✓ CORRECT import
from apps.core.models.base import BaseModel
import uuid

User = get_user_model()


class Customer(BaseModel):
    """
    Customer model for storing customer information.
    """
    
    # ===== STATUS CONSTANTS (DRY Principle) =====
    STATUS_ACTIVE = 'ACTIVE'
    STATUS_INACTIVE = 'INACTIVE'
    STATUS_BLACKLISTED = 'BLACKLISTED'
    STATUS_DECEASED = 'DECEASED'
    
    RISK_LOW = 'LOW'
    RISK_MEDIUM = 'MEDIUM'
    RISK_HIGH = 'HIGH'
    
    # Identification
    CUSTOMER_ID_PREFIX = "CUS"
    
    # Choice definitions using constants
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]
    
    MARITAL_STATUS_CHOICES = [
        ('SINGLE', 'Single'),
        ('MARRIED', 'Married'),
        ('DIVORCED', 'Divorced'),
        ('WIDOWED', 'Widowed'),
        ('SEPARATED', 'Separated'),
    ]
    
    STATUS_CHOICES = [
        (STATUS_ACTIVE, 'Active'),
        (STATUS_INACTIVE, 'Inactive'),
        (STATUS_BLACKLISTED, 'Blacklisted'),
        (STATUS_DECEASED, 'Deceased'),
    ]
    
    ID_TYPE_CHOICES = [
        ('NATIONAL_ID', 'National ID'),
        ('PASSPORT', 'Passport'),
        ('DRIVING_LICENSE', 'Driving License'),
        ('ALIEN_CARD', 'Alien Card'),
    ]
    
    RISK_LEVEL_CHOICES = [
        (RISK_LOW, 'Low Risk'),
        (RISK_MEDIUM, 'Medium Risk'),
        (RISK_HIGH, 'High Risk'),
    ]
    
    # ===== FIELDS =====
    customer_number = models.CharField(
        max_length=20,
        unique=True,
        editable=False,
        verbose_name="Customer Number",
        db_index=True
    )
    
    user = models.OneToOneField(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='customer_profile',
        verbose_name="User Account"
    )
    
    # Personal Information
    first_name = models.CharField(max_length=100, verbose_name="First Name")
    middle_name = models.CharField(max_length=100, blank=True, verbose_name="Middle Name")
    last_name = models.CharField(max_length=100, verbose_name="Last Name")
    
    date_of_birth = models.DateField(verbose_name="Date of Birth")
    
    # ✓ FIXED: Add age as stored field instead of just property
    age = models.IntegerField(
        editable=False,
        null=True,
        blank=True,
        verbose_name="Age (Calculated)",
        help_text="Automatically calculated from date_of_birth"
    )
    
    gender = models.CharField(
        max_length=1,
        choices=GENDER_CHOICES,
        verbose_name="Gender"
    )
    
    marital_status = models.CharField(
        max_length=10,
        choices=MARITAL_STATUS_CHOICES,
        verbose_name="Marital Status"
    )
    
    # Identification
    id_type = models.CharField(
        max_length=20,
        choices=ID_TYPE_CHOICES,
        verbose_name="ID Type"
    )
    
    id_number = models.CharField(
        max_length=50,
        unique=True,
        verbose_name="ID Number",
        db_index=True
    )
    
    id_expiry_date = models.DateField(
        null=True,
        blank=True,
        verbose_name="ID Expiry Date"
    )
    
    nationality = models.CharField(
        max_length=100,
        default="Kenyan",
        verbose_name="Nationality"
    )
    
    # Contact Information
    phone_regex = RegexValidator(
        regex=r'^\+254\d{9}$',
        message="Phone must be in format: +254XXXXXXXXX"
    )
    
    phone_number = models.CharField(
        validators=[phone_regex],
        max_length=17,
        unique=True,
        verbose_name="Phone Number",
        db_index=True
    )
    
    email = models.EmailField(
        blank=True,
        verbose_name="Email Address"
    )
    
    # Address Information
    postal_address = models.CharField(
        max_length=255,
        blank=True,
        verbose_name="Postal Address"
    )
    
    physical_address = models.TextField(verbose_name="Physical Address")
    county = models.CharField(max_length=100, verbose_name="County")
    sub_county = models.CharField(max_length=100, verbose_name="Sub-County")
    ward = models.CharField(max_length=100, blank=True, verbose_name="Ward")
    
    # Bank Information
    bank_name = models.CharField(max_length=100, blank=True, verbose_name="Bank Name")
    bank_account_number = models.CharField(max_length=50, blank=True, verbose_name="Bank Account Number")
    bank_branch = models.CharField(max_length=100, blank=True, verbose_name="Bank Branch")
    
    # Customer Details
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_ACTIVE,
        verbose_name="Customer Status",
        db_index=True
    )
    
    credit_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0), MaxValueValidator(1000)],
        verbose_name="Credit Score"
    )
    
    risk_level = models.CharField(
        max_length=20,
        choices=RISK_LEVEL_CHOICES,
        default=RISK_MEDIUM,
        verbose_name="Risk Level"
    )
    
    registration_date = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Registration Date"
    )
    
    last_updated = models.DateTimeField(
        auto_now=True,
        verbose_name="Last Updated"
    )
    
    # Documents with file validation
    id_document = models.FileField(
        upload_to='identity_docs/%Y/%m/%d/',
        null=True,
        blank=True,
        verbose_name="ID Document",
        help_text="PDF, JPG, or PNG (Max 5MB)"
    )
    
    passport_photo = models.ImageField(
        upload_to='customer_photos/%Y/%m/%d/',
        null=True,
        blank=True,
        verbose_name="Passport Photo",
        help_text="JPG or PNG (Max 3MB)"
    )
    
    signature = models.ImageField(
        upload_to='signatures/%Y/%m/%d/',
        null=True,
        blank=True,
        verbose_name="Signature"
    )
    
    # Metadata
    notes = models.TextField(blank=True, verbose_name="Notes")
    
    referred_by = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='referrals',
        verbose_name="Referred By"
    )
    
    # Audit fields inherited from BaseModel but explicitly documented
    # created_by, updated_by, created_at, updated_at
    
    class Meta:
        verbose_name = "Customer"
        verbose_name_plural = "Customers"
        ordering = ['-created_at']
        indexes = [
            # ✓ FIXED: Added performance indexes
            models.Index(fields=['customer_number']),
            models.Index(fields=['id_number']),
            models.Index(fields=['phone_number']),
            models.Index(fields=['status']),
            models.Index(fields=['last_name', 'first_name']),
            models.Index(fields=['created_at', 'status']),  # For filtering
            models.Index(fields=['county', 'status']),       # For regional queries
            models.Index(fields=['date_of_birth']),          # For age queries
        ]
    
    def __str__(self):
        return f"{self.customer_number} - {self.full_name}"
    
    def save(self, *args, **kwargs):
        """
        Override save method with proper validation.
        
        ✓ FIXED:
        - Removed circular imports
        - Generate customer number once
        - Calculate and store age
        - Normalize phone number
        """
        # Generate customer number if not exists
        if not self.customer_number:
            self.customer_number = self.generate_customer_number()
        
        # ✓ FIXED: Calculate and store age
        self.age = self.calculate_age()
        
        # Normalize phone number to +254 format
        if self.phone_number and not self.phone_number.startswith('+254'):
            phone = self.phone_number.lstrip('0').lstrip('+')
            self.phone_number = '+254' + phone[-9:]
        
        super().save(*args, **kwargs)
    
    def clean(self):
        """
        ✓ FIXED: Comprehensive validation in clean() method.
        """
        super().clean()
        
        # Validate date of birth not in future
        if self.date_of_birth > timezone.now().date():
            raise ValidationError({
                'date_of_birth': 'Date of birth cannot be in the future.'
            })
        
        # Validate age >= 18
        if self.calculate_age() < 18:
            raise ValidationError({
                'date_of_birth': 'Customer must be at least 18 years old.'
            })
        
        # Validate ID expiry
        if self.id_expiry_date and self.id_expiry_date < timezone.now().date():
            raise ValidationError({
                'id_expiry_date': 'ID has expired. Please update ID information.'
            })
        
        # Validate ID number format based on type
        if self.id_type == 'NATIONAL_ID' and len(self.id_number) != 8:
            raise ValidationError({
                'id_number': 'National ID must be 8 digits.'
            })
        
        # Validate phone number format
        if self.phone_number and not self.phone_number.startswith('+254'):
            raise ValidationError({
                'phone_number': 'Phone must be in format +254XXXXXXXXX'
            })
    
    def generate_customer_number(self):
        """
        Generate unique customer number: CUS-YYYYMM-XXXXX
        """
        year_month = timezone.now().strftime('%Y%m')
        prefix = f"{self.CUSTOMER_ID_PREFIX}-{year_month}"
        
        last_customer = Customer.objects.filter(
            customer_number__startswith=prefix
        ).order_by('-customer_number').first()
        
        if last_customer:
            last_number = int(last_customer.customer_number.split('-')[-1])
            new_number = last_number + 1
        else:
            new_number = 1
        
        return f"{prefix}-{new_number:05d}"
    
    def calculate_age(self):
        """
        Calculate age from date of birth.
        
        Returns:
            int: Customer's age
        """
        today = timezone.now().date()
        return today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )
    
    @property
    def full_name(self):
        """Return full name of customer."""
        names = [self.first_name]
        if self.middle_name:
            names.append(self.middle_name)
        names.append(self.last_name)
        return ' '.join(names)
    
    @property
    def is_active(self):
        """Check if customer is active."""
        return self.status == self.STATUS_ACTIVE
    
    @property
    def is_blacklisted(self):
        """Check if customer is blacklisted."""
        return self.status == self.STATUS_BLACKLISTED
    
    # ✓ FIXED: Circular imports - Use lazy imports in properties
    @property
    def total_loans(self):
        """Get total number of loans for this customer."""
        from apps.loans.models import Loan
        return Loan.objects.filter(customer=self).count()
    
    @property
    def active_loans(self):
        """Get active loans for this customer."""
        from apps.loans.models import Loan
        return Loan.objects.filter(
            customer=self,
            status__in=['ACTIVE', 'APPROVED']
        ).count()
    
    @property
    def total_loan_amount(self):
        """Get total loan amount for this customer."""
        from apps.loans.models import Loan
        return Loan.objects.filter(customer=self).aggregate(
            total=models.Sum('amount_approved')
        )['total'] or 0
    
    @property
    def outstanding_balance(self):
        """
        ✓ FIXED: Circular import - Use lazy import
        Get total outstanding balance for this customer.
        
        Returns:
            Decimal: Outstanding balance
        """
        try:
            from apps.loans.models import Loan
            
            total_outstanding = Loan.objects.filter(
                customer=self,
                status__in=['ACTIVE', 'APPROVED', 'OVERDUE']
            ).aggregate(
                total=models.Sum('outstanding_balance')
            )['total'] or 0
            
            return total_outstanding
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error calculating outstanding balance for {self.id}: {e}")
            return 0
    
    @property
    def loan_performance(self):
        """
        ✓ FIXED: Circular import - Use lazy import
        Calculate loan performance percentage.
        
        Returns:
            float: Performance percentage (0-100)
        """
        try:
            from apps.loans.models import Loan
            from apps.repayments.models import Repayment
            
            total_repayments = Repayment.objects.filter(
                loan__customer=self,
                status='COMPLETED'
            ).count()
            
            total_loans = self.total_loans
            
            if total_loans == 0:
                return 100.0
            
            performance = (total_repayments / (total_loans * 12)) * 100
            return min(performance, 100.0)
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error calculating loan performance for {self.id}: {e}")
            return 0.0
    
    def get_guarantors(self):
        """Get all active guarantors for this customer."""
        return self.guarantors.filter(is_active=True)
    
    def get_employment_info(self):
        """
        Get employment information for this customer.
        
        Returns:
            Employment: Employment record or None
        """
        try:
            return self.employment
        except Exception:
            return None
    
    def blacklist(self, reason=""):
        """
        Blacklist customer with audit trail.
        
        Args:
            reason (str): Reason for blacklisting
        """
        self.status = self.STATUS_BLACKLISTED
        timestamp = timezone.now().strftime('%Y-%m-%d %H:%M:%S')
        self.notes = f"{self.notes}\n\nBlacklisted on {timestamp}: {reason}".strip()
        self.save()
    
    def activate(self):
        """Activate customer."""
        self.status = self.STATUS_ACTIVE
        self.save()
    
    def deactivate(self, reason=""):
        """
        Deactivate customer.
        
        Args:
            reason (str): Reason for deactivation
        """
        self.status = self.STATUS_INACTIVE
        if reason:
            timestamp = timezone.now().strftime('%Y-%m-%d %H:%M:%S')
            self.notes = f"{self.notes}\n\nDeactivated on {timestamp}: {reason}".strip()
        self.save()
    
    def update_credit_score(self, score):
        """
        Update customer credit score and adjust risk level.
        
        Args:
            score (Decimal): New credit score (0-1000)
        """
        self.credit_score = score
        
        # Update risk level based on credit score
        if score >= 800:
            self.risk_level = self.RISK_LOW
        elif score >= 600:
            self.risk_level = self.RISK_MEDIUM
        else:
            self.risk_level = self.RISK_HIGH
        
        self.save()