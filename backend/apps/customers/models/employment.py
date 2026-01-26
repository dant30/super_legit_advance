# backend/apps/customers/models/customer.py
from django.db import models
from django.core.validators import RegexValidator, MinValueValidator
from django.core.exceptions import ValidationError  # ✓ CORRECT import
from django.utils import timezone
from apps.core.models.base import BaseModel


class Employment(BaseModel):
    """
    Employment information model for customers.
    """
    
    # ===== CONSTANTS =====
    EMPLOYMENT_TYPE_EMPLOYED = 'EMPLOYED'
    EMPLOYMENT_TYPE_SELF_EMPLOYED = 'SELF_EMPLOYED'
    EMPLOYMENT_TYPE_UNEMPLOYED = 'UNEMPLOYED'
    EMPLOYMENT_TYPE_STUDENT = 'STUDENT'
    EMPLOYMENT_TYPE_RETIRED = 'RETIRED'
    
    EMPLOYMENT_TYPE_CHOICES = [
        (EMPLOYMENT_TYPE_EMPLOYED, 'Employed'),
        (EMPLOYMENT_TYPE_SELF_EMPLOYED, 'Self-Employed'),
        (EMPLOYMENT_TYPE_UNEMPLOYED, 'Unemployed'),
        (EMPLOYMENT_TYPE_STUDENT, 'Student'),
        (EMPLOYMENT_TYPE_RETIRED, 'Retired'),
    ]
    
    SECTOR_CHOICES = [
        ('GOVERNMENT', 'Government'),
        ('PRIVATE', 'Private Sector'),
        ('NGO', 'Non-Governmental Organization'),
        ('INFORMAL', 'Informal Sector'),
        ('AGRICULTURE', 'Agriculture'),
        ('MANUFACTURING', 'Manufacturing'),
        ('SERVICES', 'Services'),
        ('CONSTRUCTION', 'Construction'),
        ('HEALTH', 'Health'),
        ('EDUCATION', 'Education'),
        ('OTHER', 'Other'),
    ]
    
    PAYMENT_FREQUENCY_CHOICES = [
        ('MONTHLY', 'Monthly'),
        ('WEEKLY', 'Weekly'),
        ('BIWEEKLY', 'Bi-Weekly'),
        ('DAILY', 'Daily'),
        ('QUARTERLY', 'Quarterly'),
        ('ANNUALLY', 'Annually'),
        ('IRREGULAR', 'Irregular'),
    ]
    
    VERIFICATION_METHOD_CHOICES = [
        ('PHONE', 'Phone Call'),
        ('EMAIL', 'Email'),
        ('VISIT', 'Site Visit'),
        ('DOCUMENT', 'Document Review'),
        ('OTHER', 'Other'),
    ]
    
    # ===== FIELDS =====
    customer = models.OneToOneField(
        'Customer',
        on_delete=models.CASCADE,
        related_name='employment',
        verbose_name="Customer"
    )
    
    employment_type = models.CharField(
        max_length=20,
        choices=EMPLOYMENT_TYPE_CHOICES,
        verbose_name="Employment Type"
    )
    
    sector = models.CharField(
        max_length=20,
        choices=SECTOR_CHOICES,
        verbose_name="Sector"
    )
    
    occupation = models.CharField(max_length=100, verbose_name="Occupation")
    
    # Employer/Business Information
    employer_name = models.CharField(
        max_length=200,
        blank=True,
        verbose_name="Employer/Business Name"
    )
    
    employer_address = models.TextField(
        blank=True,
        verbose_name="Employer/Business Address"
    )
    
    employer_phone = models.CharField(
        max_length=17,
        blank=True,
        validators=[RegexValidator(
            regex=r'^\+254\d{9}$',
            message="Phone must be in format: +254XXXXXXXXX"
        )],
        verbose_name="Employer Phone"
    )
    
    employer_email = models.EmailField(
        blank=True,
        verbose_name="Employer Email"
    )
    
    # Employment Details
    job_title = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Job Title"
    )
    
    department = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Department"
    )
    
    employee_number = models.CharField(
        max_length=50,
        blank=True,
        verbose_name="Employee Number"
    )
    
    date_employed = models.DateField(
        null=True,
        blank=True,
        verbose_name="Date Employed/Started Business"
    )
    
    years_of_service = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        editable=False,
        verbose_name="Years of Service"
    )
    
    # Income Information
    monthly_income = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0)],
        verbose_name="Monthly Income (KES)"
    )
    
    other_income = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0)],
        verbose_name="Other Monthly Income (KES)"
    )
    
    total_monthly_income = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0.00,
        editable=False,
        verbose_name="Total Monthly Income (KES)"
    )
    
    payment_frequency = models.CharField(
        max_length=20,
        choices=PAYMENT_FREQUENCY_CHOICES,
        default='MONTHLY',
        verbose_name="Payment Frequency"
    )
    
    next_pay_date = models.DateField(
        null=True,
        blank=True,
        verbose_name="Next Pay Date"
    )
    
    # Business Information (for self-employed)
    business_name = models.CharField(
        max_length=200,
        blank=True,
        verbose_name="Business Name"
    )
    
    business_type = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Business Type"
    )
    
    business_registration = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Business Registration Number"
    )
    
    business_start_date = models.DateField(
        null=True,
        blank=True,
        verbose_name="Business Start Date"
    )
    
    number_of_employees = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name="Number of Employees"
    )
    
    # Verification
    is_verified = models.BooleanField(
        default=False,
        verbose_name="Verified"
    )
    
    verification_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Verification Date"
    )
    
    verification_method = models.CharField(
        max_length=50,
        blank=True,
        choices=VERIFICATION_METHOD_CHOICES,
        verbose_name="Verification Method"
    )
    
    verification_notes = models.TextField(
        blank=True,
        verbose_name="Verification Notes"
    )
    
    # Documents
    employment_letter = models.FileField(
        upload_to='employment_docs/%Y/%m/%d/',
        null=True,
        blank=True,
        verbose_name="Employment Letter"
    )
    
    pay_slips = models.FileField(
        upload_to='payslips/%Y/%m/%d/',
        null=True,
        blank=True,
        verbose_name="Recent Pay Slips"
    )
    
    business_permit = models.FileField(
        upload_to='business_docs/%Y/%m/%d/',
        null=True,
        blank=True,
        verbose_name="Business Permit"
    )
    
    # Metadata
    notes = models.TextField(blank=True, verbose_name="Notes")
    
    class Meta:
        verbose_name = "Employment Information"
        verbose_name_plural = "Employment Information"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Employment - {self.customer.full_name}"
    
    def save(self, *args, **kwargs):
        """
        ✓ FIXED: Calculate fields before saving
        """
        # Calculate total monthly income
        self.total_monthly_income = self.monthly_income + self.other_income
        
        # Calculate years of service
        if self.date_employed:
            today = timezone.now().date()
            self.years_of_service = today.year - self.date_employed.year - (
                (today.month, today.day) < (self.date_employed.month, self.date_employed.day)
            )
        
        # Normalize employer phone number
        if self.employer_phone and not self.employer_phone.startswith('+254'):
            phone = self.employer_phone.lstrip('0').lstrip('+')
            self.employer_phone = '+254' + phone[-9:]
        
        super().save(*args, **kwargs)
    
    def clean(self):
        """
        ✓ FIXED: Comprehensive validation
        """
        super().clean()
        
        # Validate employment type consistency
        if self.employment_type == self.EMPLOYMENT_TYPE_EMPLOYED:
            if not self.employer_name:
                raise ValidationError({
                    'employer_name': 'Employer name is required for employed individuals.'
                })
        
        elif self.employment_type == self.EMPLOYMENT_TYPE_SELF_EMPLOYED:
            if not self.business_name:
                raise ValidationError({
                    'business_name': 'Business name is required for self-employed individuals.'
                })
        
        # Validate dates not in future
        if self.date_employed and self.date_employed > timezone.now().date():
            raise ValidationError({
                'date_employed': 'Date employed cannot be in the future.'
            })
        
        if self.business_start_date and self.business_start_date > timezone.now().date():
            raise ValidationError({
                'business_start_date': 'Business start date cannot be in the future.'
            })
        
        # Validate income
        if self.monthly_income < 0 or self.other_income < 0:
            raise ValidationError("Income values cannot be negative.")
    
    @property
    def employment_status(self):
        """Get employment status description."""
        if self.employment_type == self.EMPLOYMENT_TYPE_EMPLOYED:
            return f"Employed at {self.employer_name or 'Unknown'}"
        elif self.employment_type == self.EMPLOYMENT_TYPE_SELF_EMPLOYED:
            return f"Self-Employed: {self.business_name or 'Business'}"
        elif self.employment_type == self.EMPLOYMENT_TYPE_UNEMPLOYED:
            return "Unemployed"
        elif self.employment_type == self.EMPLOYMENT_TYPE_STUDENT:
            return "Student"
        elif self.employment_type == self.EMPLOYMENT_TYPE_RETIRED:
            return "Retired"
        return "Unknown"
    
    def verify_employment(self, method='PHONE', notes=""):
        """
        Verify employment information.
        
        Args:
            method (str): Verification method
            notes (str): Verification notes
        """
        self.is_verified = True
        self.verification_date = timezone.now()
        self.verification_method = method
        if notes:
            self.verification_notes = notes
        self.save()
    
    def update_income(self, monthly_income=None, other_income=None):
        """
        Update income information.
        
        Args:
            monthly_income (Decimal): New monthly income
            other_income (Decimal): New other income
        """
        if monthly_income is not None:
            self.monthly_income = monthly_income
        if other_income is not None:
            self.other_income = other_income
        self.save()
    
    def calculate_affordability_score(self, total_monthly_debt=0):
        """
        ✓ FIXED: Calculate affordability score
        
        Args:
            total_monthly_debt (Decimal): Total monthly debt obligations
            
        Returns:
            float: Affordability score (0-100)
        """
        if self.total_monthly_income == 0:
            return 0
        
        # Recommended max debt-to-income ratio: 40%
        debt_to_income_ratio = (float(total_monthly_debt) / float(self.total_monthly_income)) * 100
        
        if debt_to_income_ratio <= 20:
            score = 100
        elif debt_to_income_ratio <= 40:
            score = 75
        elif debt_to_income_ratio <= 60:
            score = 50
        elif debt_to_income_ratio <= 80:
            score = 25
        else:
            score = 0
        
        return score