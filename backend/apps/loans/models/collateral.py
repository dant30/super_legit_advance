# backend/apps/loans/models/collateral.py
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
from django.forms import ValidationError
from django.utils import timezone
from decimal import Decimal

from apps.core.models.base import BaseModel

User = get_user_model()


class Collateral(BaseModel):
    """
    Collateral model for loan security.
    """
    
    # Collateral types
    COLLATERAL_TYPE_CHOICES = [
        ('LAND', 'Land'),
        ('BUILDING', 'Building'),
        ('VEHICLE', 'Vehicle'),
        ('EQUIPMENT', 'Equipment'),
        ('INVENTORY', 'Inventory'),
        ('RECEIVABLES', 'Accounts Receivable'),
        ('SAVINGS', 'Savings Account'),
        ('INSURANCE', 'Insurance Policy'),
        ('SHARES', 'Shares/Stocks'),
        ('BONDS', 'Bonds'),
        ('GOLD', 'Gold/Jewelry'),
        ('OTHER', 'Other'),
    ]
    
    # Ownership types
    OWNERSHIP_TYPE_CHOICES = [
        ('SOLE', 'Sole Ownership'),
        ('JOINT', 'Joint Ownership'),
        ('COMPANY', 'Company Owned'),
        ('FAMILY', 'Family Owned'),
        ('OTHER', 'Other'),
    ]
    
    # Status choices
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('RELEASED', 'Released'),
        ('FORECLOSED', 'Foreclosed'),
        ('SOLD', 'Sold'),
        ('DAMAGED', 'Damaged'),
        ('LOST', 'Lost'),
        ('OTHER', 'Other'),
    ]
    
    # Fields
    loan = models.ForeignKey(
        'Loan',
        on_delete=models.CASCADE,
        related_name='collateral',
        verbose_name="Loan"
    )
    
    collateral_type = models.CharField(
        max_length=20,
        choices=COLLATERAL_TYPE_CHOICES,
        verbose_name="Collateral Type"
    )
    
    description = models.TextField(
        verbose_name="Description"
    )
    
    # Ownership
    owner_name = models.CharField(
        max_length=200,
        verbose_name="Owner Name"
    )
    
    owner_id_number = models.CharField(
        max_length=50,
        verbose_name="Owner ID Number"
    )
    
    ownership_type = models.CharField(
        max_length=20,
        choices=OWNERSHIP_TYPE_CHOICES,
        verbose_name="Ownership Type"
    )
    
    # Value and details
    estimated_value = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        verbose_name="Estimated Value (KES)"
    )
    
    insured_value = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Insured Value (KES)"
    )
    
    insurance_company = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Insurance Company"
    )
    
    insurance_policy_number = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Insurance Policy Number"
    )
    
    insurance_expiry = models.DateField(
        null=True,
        blank=True,
        verbose_name="Insurance Expiry Date"
    )
    
    # Location
    location = models.TextField(
        verbose_name="Location"
    )
    
    # Registration details
    registration_number = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Registration Number"
    )
    
    registration_date = models.DateField(
        null=True,
        blank=True,
        verbose_name="Registration Date"
    )
    
    registration_authority = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Registration Authority"
    )
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='ACTIVE',
        verbose_name="Status"
    )
    
    # Dates
    pledged_date = models.DateField(
        default=timezone.now,
        verbose_name="Pledged Date"
    )
    
    release_date = models.DateField(
        null=True,
        blank=True,
        verbose_name="Release Date"
    )
    
    # Documents
    ownership_document = models.FileField(
        upload_to='collateral_docs/ownership/%Y/%m/%d/',
        null=True,
        blank=True,
        verbose_name="Ownership Document"
    )
    
    valuation_report = models.FileField(
        upload_to='collateral_docs/valuation/%Y/%m/%d/',
        null=True,
        blank=True,
        verbose_name="Valuation Report"
    )
    
    insurance_certificate = models.FileField(
        upload_to='collateral_docs/insurance/%Y/%m/%d/',
        null=True,
        blank=True,
        verbose_name="Insurance Certificate"
    )
    
    photos = models.FileField(
        upload_to='collateral_docs/photos/%Y/%m/%d/',
        null=True,
        blank=True,
        verbose_name="Photos"
    )
    
    other_documents = models.FileField(
        upload_to='collateral_docs/other/%Y/%m/%d/',
        null=True,
        blank=True,
        verbose_name="Other Documents"
    )
    
    # Notes
    notes = models.TextField(
        blank=True,
        verbose_name="Notes"
    )
    
    # Audit fields
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_collateral',
        verbose_name="Created By"
    )
    
    updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='updated_collateral',
        verbose_name="Updated By"
    )
    
    class Meta:
        verbose_name = "Collateral"
        verbose_name_plural = "Collateral"
        ordering = ['-pledged_date']
        indexes = [
            models.Index(fields=['loan', 'status']),
            models.Index(fields=['collateral_type', 'status']),
        ]
    
    def __str__(self):
        return f"{self.get_collateral_type_display()} - {self.description[:50]}..."
    
    @property
    def loan_to_value_ratio(self):
        """Calculate loan-to-value ratio."""
        if self.estimated_value == 0 or not self.loan.amount_approved:
            return 0
        
        return (self.loan.amount_approved / self.estimated_value) * 100
    
    @property
    def coverage_ratio(self):
        """Calculate coverage ratio (collateral value to loan amount)."""
        if not self.loan.amount_approved or self.loan.amount_approved == 0:
            return float('inf')
        
        return float(self.estimated_value / self.loan.amount_approved)
    
    @property
    def is_active(self):
        """Check if collateral is active."""
        return self.status == 'ACTIVE'
    
    @property
    def is_released(self):
        """Check if collateral is released."""
        return self.status == 'RELEASED'
    
    @property
    def is_insured(self):
        """Check if collateral is insured."""
        return bool(self.insured_value and self.insurance_company)
    
    @property
    def insurance_status(self):
        """Get insurance status."""
        if not self.is_insured:
            return "Not Insured"
        
        if self.insurance_expiry and self.insurance_expiry < timezone.now().date():
            return "Insurance Expired"
        
        return "Insured"
    
    def release(self, released_by, release_date=None):
        """Release the collateral."""
        if self.status != 'ACTIVE':
            raise ValidationError("Only active collateral can be released.")
        
        self.status = 'RELEASED'
        self.release_date = release_date or timezone.now().date()
        self.updated_by = released_by
        
        if not self.notes:
            self.notes = f"Released by {released_by.get_full_name()} on {self.release_date}"
        else:
            self.notes += f"\n\nReleased by {released_by.get_full_name()} on {self.release_date}"
        
        self.save()
    
    def foreclose(self, foreclosed_by, notes=""):
        """Foreclose the collateral."""
        if self.status != 'ACTIVE':
            raise ValidationError("Only active collateral can be foreclosed.")
        
        self.status = 'FORECLOSED'
        self.updated_by = foreclosed_by
        
        if notes:
            self.notes = f"Foreclosed by {foreclosed_by.get_full_name()}: {notes}"
        else:
            self.notes = f"Foreclosed by {foreclosed_by.get_full_name()}"
        
        self.save()
    
    def sell(self, sold_by, sale_amount, notes=""):
        """Sell the collateral."""
        if self.status not in ['ACTIVE', 'FORECLOSED']:
            raise ValidationError("Collateral must be active or foreclosed to be sold.")
        
        self.status = 'SOLD'
        self.updated_by = sold_by
        
        if notes:
            self.notes = f"Sold by {sold_by.get_full_name()} for KES {sale_amount:,.2f}: {notes}"
        else:
            self.notes = f"Sold by {sold_by.get_full_name()} for KES {sale_amount:,.2f}"
        
        self.save()
    
    def update_valuation(self, new_value, updated_by, valuation_date=None):
        """Update collateral valuation."""
        self.estimated_value = new_value
        self.updated_by = updated_by
        
        if valuation_date:
            valuation_note = f"Valuation updated on {valuation_date}: KES {new_value:,.2f}"
        else:
            valuation_note = f"Valuation updated: KES {new_value:,.2f}"
        
        if not self.notes:
            self.notes = valuation_note
        else:
            self.notes += f"\n\n{valuation_note}"
        
        self.save()
    
    def check_insurance_expiry(self):
        """Check if insurance has expired."""
        if self.insurance_expiry and self.insurance_expiry < timezone.now().date():
            return {
                'expired': True,
                'days_expired': (timezone.now().date() - self.insurance_expiry).days,
                'message': f"Insurance expired on {self.insurance_expiry}"
            }
        
        if self.insurance_expiry:
            days_remaining = (self.insurance_expiry - timezone.now().date()).days
            return {
                'expired': False,
                'days_remaining': days_remaining,
                'message': f"Insurance expires in {days_remaining} days"
            }
        
        return {
            'expired': None,
            'message': "No insurance information"
        }
    
    def clean(self):
        """Custom validation."""
        # Validate release date is after pledge date
        if self.release_date and self.release_date < self.pledged_date:
            raise ValidationError({
                'release_date': 'Release date cannot be before pledged date.'
            })
        
        # Validate insurance expiry is not in the past for new records
        if self.insurance_expiry and self.insurance_expiry < timezone.now().date() and not self.pk:
            raise ValidationError({
                'insurance_expiry': 'Insurance expiry date cannot be in the past for new collateral.'
            })
        
        super().clean()