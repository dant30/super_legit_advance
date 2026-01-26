# backend/apps/customers/models/customer.py
from django.db import models
from django.core.validators import RegexValidator
from django.forms import ValidationError
from django.utils import timezone
from apps.core.models.base import BaseModel


class Guarantor(BaseModel):
    """
    Guarantor model for loan guarantors.
    """
    
    # Guarantor types
    GUARANTOR_TYPE_CHOICES = [
        ('PERSONAL', 'Personal'),
        ('CORPORATE', 'Corporate'),
        ('INSTITUTIONAL', 'Institutional'),
    ]
    
    # Relationship choices
    RELATIONSHIP_CHOICES = [
        ('SPOUSE', 'Spouse'),
        ('PARENT', 'Parent'),
        ('SIBLING', 'Sibling'),
        ('FRIEND', 'Friend'),
        ('COLLEAGUE', 'Colleague'),
        ('RELATIVE', 'Relative'),
        ('OTHER', 'Other'),
    ]
    
    # Fields
    customer = models.ForeignKey(
        'Customer',
        on_delete=models.CASCADE,
        related_name='guarantors',
        verbose_name="Customer"
    )
    
    first_name = models.CharField(
        max_length=100,
        verbose_name="First Name"
    )
    
    middle_name = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Middle Name"
    )
    
    last_name = models.CharField(
        max_length=100,
        verbose_name="Last Name"
    )
    
    # Contact Information
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in the format: '+254712345678'. Up to 15 digits allowed."
    )
    
    phone_number = models.CharField(
        validators=[phone_regex],
        max_length=17,
        verbose_name="Phone Number"
    )
    
    email = models.EmailField(
        blank=True,
        verbose_name="Email Address"
    )
    
    # Address
    physical_address = models.TextField(
        verbose_name="Physical Address"
    )
    
    county = models.CharField(
        max_length=100,
        verbose_name="County"
    )
    
    # Identification
    id_type = models.CharField(
        max_length=20,
        choices=[
            ('NATIONAL_ID', 'National ID'),
            ('PASSPORT', 'Passport'),
            ('DRIVING_LICENSE', 'Driving License'),
        ],
        verbose_name="ID Type"
    )
    
    id_number = models.CharField(
        max_length=50,
        verbose_name="ID Number"
    )
    
    # Guarantor details
    guarantor_type = models.CharField(
        max_length=20,
        choices=GUARANTOR_TYPE_CHOICES,
        default='PERSONAL',
        verbose_name="Guarantor Type"
    )
    
    relationship = models.CharField(
        max_length=20,
        choices=RELATIONSHIP_CHOICES,
        verbose_name="Relationship"
    )
    
    occupation = models.CharField(
        max_length=100,
        verbose_name="Occupation"
    )
    
    employer = models.CharField(
        max_length=200,
        blank=True,
        verbose_name="Employer"
    )
    
    monthly_income = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name="Monthly Income (KES)"
    )
    
    # Documents
    id_document = models.FileField(
        upload_to='guarantor_docs/%Y/%m/%d/',
        null=True,
        blank=True,
        verbose_name="ID Document"
    )
    
    passport_photo = models.ImageField(
        upload_to='guarantor_photos/%Y/%m/%d/',
        null=True,
        blank=True,
        verbose_name="Passport Photo"
    )
    
    # Status
    is_active = models.BooleanField(
        default=True,
        verbose_name="Active"
    )
    
    verification_status = models.CharField(
        max_length=20,
        choices=[
            ('PENDING', 'Pending'),
            ('VERIFIED', 'Verified'),
            ('REJECTED', 'Rejected'),
        ],
        default='PENDING',
        verbose_name="Verification Status"
    )
    
    verification_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Verification Date"
    )
    
    verification_notes = models.TextField(
        blank=True,
        verbose_name="Verification Notes"
    )
    
    # Metadata
    notes = models.TextField(
        blank=True,
        verbose_name="Notes"
    )
    
    class Meta:
        verbose_name = "Guarantor"
        verbose_name_plural = "Guarantors"
        ordering = ['-created_at']
        unique_together = ['customer', 'id_number']
        indexes = [
            models.Index(fields=['customer', 'is_active']),
            models.Index(fields=['verification_status']),
        ]
    
    def __str__(self):
        return f"{self.full_name} - Guarantor for {self.customer.full_name}"
    
    @property
    def full_name(self):
        """Return full name of guarantor."""
        names = [self.first_name]
        if self.middle_name:
            names.append(self.middle_name)
        names.append(self.last_name)
        return ' '.join(names)
    
    @property
    def is_verified(self):
        """Check if guarantor is verified."""
        return self.verification_status == 'VERIFIED'
    
    def verify(self, notes=""):
        """Verify guarantor."""
        self.verification_status = 'VERIFIED'
        self.verification_date = timezone.now()
        if notes:
            self.verification_notes = notes
        self.save()
    
    def reject(self, reason=""):
        """Reject guarantor."""
        self.verification_status = 'REJECTED'
        self.verification_date = timezone.now()
        if reason:
            self.verification_notes = reason
        self.save()
    
    def deactivate(self):
        """Deactivate guarantor."""
        self.is_active = False
        self.save()
    
    def activate(self):
        """Activate guarantor."""
        self.is_active = True
        self.save()
    
    def save(self, *args, **kwargs):
        """Override save to validate phone number format."""
        # Validate phone number format
        if not self.phone_number.startswith('+254'):
            if self.phone_number.startswith('0'):
                self.phone_number = '+254' + self.phone_number[1:]
            elif self.phone_number.startswith('254'):
                self.phone_number = '+' + self.phone_number
            else:
                self.phone_number = '+254' + self.phone_number
        
        super().save(*args, **kwargs)
    
    def clean(self):
        """Custom validation."""
        # Validate ID number based on ID type
        if self.id_type == 'NATIONAL_ID' and len(self.id_number) != 8:
            raise ValidationError("National ID must be 8 digits for Kenyan citizens.")
        
        # Validate monthly income
        if self.monthly_income <= 0:
            raise ValidationError("Monthly income must be greater than 0.")
        
        super().clean()