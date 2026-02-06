# backend/apps/repayments/models/penalty.py
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.exceptions import ValidationError

from apps.core.models.base import BaseModel
from apps.loans.models import Loan
from apps.customers.models import Customer

User = get_user_model()


class Penalty(BaseModel):
    """
    Penalty model for tracking late payment penalties.
    """
    
    # Penalty types
    TYPE_LATE_PAYMENT = 'LATE_PAYMENT'
    TYPE_DEFAULT = 'DEFAULT'
    TYPE_EARLY_REPAYMENT = 'EARLY_REPAYMENT'
    TYPE_ADMINISTRATIVE = 'ADMINISTRATIVE'
    TYPE_OTHER = 'OTHER'

    PENALTY_TYPE_CHOICES = [
        (TYPE_LATE_PAYMENT, 'Late Payment'),
        (TYPE_DEFAULT, 'Default'),
        (TYPE_EARLY_REPAYMENT, 'Early Repayment'),
        (TYPE_ADMINISTRATIVE, 'Administrative'),
        (TYPE_OTHER, 'Other'),
    ]
    
    # Penalty statuses
    STATUS_PENDING = 'PENDING'
    STATUS_APPLIED = 'APPLIED'
    STATUS_WAIVED = 'WAIVED'
    STATUS_CANCELLED = 'CANCELLED'
    STATUS_PAID = 'PAID'

    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_APPLIED, 'Applied'),
        (STATUS_WAIVED, 'Waived'),
        (STATUS_CANCELLED, 'Cancelled'),
        (STATUS_PAID, 'Paid'),
    ]
    
    # Fields
    penalty_number = models.CharField(
        max_length=50,
        unique=True,
        editable=False,
        verbose_name="Penalty Number"
    )
    
    loan = models.ForeignKey(
        Loan,
        on_delete=models.CASCADE,
        related_name='penalties',
        verbose_name="Loan"
    )
    
    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name='penalties',
        verbose_name="Customer"
    )
    
    repayment = models.ForeignKey(
        'Repayment',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='penalties',
        verbose_name="Repayment"
    )
    
    # Penalty Details
    penalty_type = models.CharField(
        max_length=20,
        choices=PENALTY_TYPE_CHOICES,
        default=TYPE_LATE_PAYMENT,
        verbose_name="Penalty Type"
    )
    
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name="Penalty Amount (KES)"
    )
    
    reason = models.TextField(
        verbose_name="Reason"
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING,
        verbose_name="Status"
    )
    
    # Calculation Details
    calculation_method = models.CharField(
        max_length=50,
        choices=[
            ('FIXED_AMOUNT', 'Fixed Amount'),
            ('PERCENTAGE', 'Percentage'),
            ('DAILY_RATE', 'Daily Rate'),
            ('FLAT_FEE', 'Flat Fee'),
        ],
        default='PERCENTAGE',
        verbose_name="Calculation Method"
    )
    
    calculation_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.00,
        verbose_name="Calculation Rate (%)"
    )
    
    days_overdue = models.IntegerField(
        default=0,
        verbose_name="Days Overdue"
    )
    
    base_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Base Amount (KES)"
    )
    
    # Dates
    applied_date = models.DateField(
        default=timezone.now,
        verbose_name="Applied Date"
    )
    
    due_date = models.DateField(
        verbose_name="Due Date"
    )
    
    paid_date = models.DateField(
        null=True,
        blank=True,
        verbose_name="Paid Date"
    )
    
    # Payment Tracking
    amount_paid = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0.00,
        verbose_name="Amount Paid (KES)"
    )
    
    amount_outstanding = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0.00,
        verbose_name="Amount Outstanding (KES)"
    )
    
    # Waiver/Cancellation
    waived_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='waived_penalties',
        verbose_name="Waived By"
    )
    
    waiver_reason = models.TextField(
        blank=True,
        verbose_name="Waiver Reason"
    )
    
    waiver_date = models.DateField(
        null=True,
        blank=True,
        verbose_name="Waiver Date"
    )
    
    # Applied By
    applied_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='applied_penalties',
        verbose_name="Applied By"
    )
    
    # Notes
    notes = models.TextField(
        blank=True,
        verbose_name="Notes"
    )
    
    class Meta:
        verbose_name = "Penalty"
        verbose_name_plural = "Penalties"
        ordering = ['-applied_date', '-created_at']
        indexes = [
            models.Index(fields=['penalty_number']),
            models.Index(fields=['status']),
            models.Index(fields=['applied_date']),
            models.Index(fields=['loan', 'status']),
            models.Index(fields=['customer', 'status']),
        ]
    
    def __str__(self):
        return f"{self.penalty_number} - {self.loan.loan_number} - KES {self.amount}"
    
    def save(self, *args, **kwargs):
        """
        Override save method to:
        1. Generate penalty number
        2. Set customer from loan
        3. Calculate outstanding amount
        """
        # Generate penalty number
        if not self.penalty_number:
            self.penalty_number = self.generate_penalty_number()
        
        # Set customer from loan
        if not self.customer_id and self.loan_id:
            self.customer = self.loan.customer
        
        # Calculate outstanding amount
        self.amount_outstanding = self.amount - self.amount_paid
        
        # Update status based on payment
        if self.amount_paid >= self.amount:
            self.status = self.STATUS_PAID
            if not self.paid_date:
                self.paid_date = timezone.now().date()
        elif self.status == self.STATUS_PENDING and self.applied_date:
            self.status = self.STATUS_APPLIED
        
        super().save(*args, **kwargs)
    
    def generate_penalty_number(self):
        """
        Generate unique penalty number in format: PEN-YYYYMM-XXXXXX
        """
        year_month = timezone.now().strftime('%Y%m')
        last_penalty = Penalty.objects.filter(
            penalty_number__startswith=f"PEN-{year_month}"
        ).order_by('-penalty_number').first()
        
        if last_penalty:
            last_number = int(last_penalty.penalty_number.split('-')[-1])
            new_number = last_number + 1
        else:
            new_number = 1
        
        return f"PEN-{year_month}-{new_number:06d}"
    
    @property
    def is_paid(self):
        """Check if penalty is fully paid."""
        return self.status == self.STATUS_PAID and self.amount_paid >= self.amount
    
    @property
    def is_overdue(self):
        """Check if penalty is overdue."""
        return (
            self.status in [self.STATUS_APPLIED, self.STATUS_PENDING] and 
            self.due_date and 
            timezone.now().date() > self.due_date
        )
    
    @property
    def days_until_due(self):
        """Calculate days until due date."""
        if not self.due_date:
            return None
        
        today = timezone.now().date()
        return (self.due_date - today).days
    
    def apply_penalty(self, applied_by):
        """
        Apply the penalty.
        
        Args:
            applied_by (User): User applying the penalty
        """
        if self.status != 'PENDING':
            raise ValidationError("Penalty is already applied or processed.")
        
        self.status = self.STATUS_APPLIED
        self.applied_by = applied_by
        self.applied_date = timezone.now().date()
        
        # Set due date if not set (default: 30 days from application)
        if not self.due_date:
            self.due_date = self.applied_date + timezone.timedelta(days=30)
        
        self.save()
        
        # Log penalty application
        from apps.audit.models import AuditLog
        AuditLog.objects.create(
            user=applied_by,
            action='APPLY_PENALTY',
            model_name='Penalty',
            object_id=self.id,
            changes=f"Applied penalty {self.penalty_number} of KES {self.amount}"
        )
        
        return self
    
    def record_payment(self, amount, payment_date=None):
        """
        Record payment against penalty.
        
        Args:
            amount (Decimal): Amount paid
            payment_date (date): Date of payment
        """
        if amount <= 0:
            raise ValidationError("Payment amount must be greater than 0.")
        
        if amount > self.amount_outstanding:
            raise ValidationError("Payment amount cannot exceed outstanding amount.")
        
        self.amount_paid += amount
        
        if payment_date:
            self.paid_date = payment_date
        elif self.amount_paid >= self.amount and not self.paid_date:
            self.paid_date = timezone.now().date()
        
        self.save()
        return self
    
    def waive_penalty(self, waiver_reason, waived_by):
        """
        Waive the penalty.
        
        Args:
            waiver_reason (str): Reason for waiver
            waived_by (User): User authorizing waiver
        """
        if self.status in [self.STATUS_PAID, self.STATUS_CANCELLED]:
            raise ValidationError("Cannot waive already paid or cancelled penalty.")
        
        self.status = self.STATUS_WAIVED
        self.waived_by = waived_by
        self.waiver_reason = waiver_reason
        self.waiver_date = timezone.now().date()
        
        # Mark as fully paid (waived)
        self.amount_paid = self.amount
        self.amount_outstanding = 0
        
        self.save()
        
        # Log waiver
        from apps.audit.models import AuditLog
        AuditLog.objects.create(
            user=waived_by,
            action='WAIVE_PENALTY',
            model_name='Penalty',
            object_id=self.id,
            changes=f"Waived penalty {self.penalty_number} of KES {self.amount}. Reason: {waiver_reason}"
        )
        
        return self
    
    def cancel_penalty(self, cancellation_reason, cancelled_by):
        """
        Cancel the penalty.
        
        Args:
            cancellation_reason (str): Reason for cancellation
            cancelled_by (User): User authorizing cancellation
        """
        if self.status in [self.STATUS_PAID, self.STATUS_WAIVED]:
            raise ValidationError("Cannot cancel already paid or waived penalty.")
        
        self.status = self.STATUS_CANCELLED
        self.notes = f"{self.notes}\nCancelled: {cancellation_reason} by {cancelled_by.get_full_name()}"
        
        self.save()
        
        # Log cancellation
        from apps.audit.models import AuditLog
        AuditLog.objects.create(
            user=cancelled_by,
            action='CANCEL_PENALTY',
            model_name='Penalty',
            object_id=self.id,
            changes=f"Cancelled penalty {self.penalty_number}. Reason: {cancellation_reason}"
        )
        
        return self
    
    def calculate_penalty_amount(self, base_amount=None, days_overdue=None):
        """
        Calculate penalty amount based on calculation method.
        
        Args:
            base_amount (Decimal): Base amount for calculation
            days_overdue (int): Number of days overdue
        
        Returns:
            Decimal: Calculated penalty amount
        """
        from decimal import Decimal
        
        if base_amount is None:
            base_amount = self.base_amount or Decimal('0.00')
        
        if days_overdue is None:
            days_overdue = self.days_overdue
        
        calculation_map = {
            'FIXED_AMOUNT': lambda: self.amount,  # Use predefined amount
            'PERCENTAGE': lambda: base_amount * (self.calculation_rate / Decimal('100.00')),
            'DAILY_RATE': lambda: base_amount * (self.calculation_rate / Decimal('100.00')) * days_overdue,
            'FLAT_FEE': lambda: self.calculation_rate,  # Rate is actually the flat fee amount
        }
        
        calculator = calculation_map.get(self.calculation_method)
        if calculator:
            return calculator()
        
        return Decimal('0.00')
    
    def clean(self):
        """Custom validation."""
        # Validate amount is positive
        if self.amount <= 0:
            raise ValidationError({
                'amount': 'Penalty amount must be greater than 0.'
            })
        
        # Validate calculation rate for percentage/daily rate methods
        if self.calculation_method in ['PERCENTAGE', 'DAILY_RATE']:
            if self.calculation_rate <= 0:
                raise ValidationError({
                    'calculation_rate': 'Calculation rate must be greater than 0 for percentage/daily rate methods.'
                })
        
        # Validate days overdue is non-negative
        if self.days_overdue < 0:
            raise ValidationError({
                'days_overdue': 'Days overdue cannot be negative.'
            })
        
        # Validate due date is after applied date
        if self.due_date and self.applied_date and self.due_date < self.applied_date:
            raise ValidationError({
                'due_date': 'Due date cannot be before applied date.'
            })
        
        super().clean()
