# backend/apps/repayments/models/schedule.py
from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError
from decimal import Decimal

from apps.core.models.base import BaseModel
from apps.loans.models import Loan
from apps.customers.models import Customer


class RepaymentSchedule(BaseModel):
    """
    Repayment schedule model for planned loan repayments.
    """
    
    # Installment statuses
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('OVERDUE', 'Overdue'),
        ('SKIPPED', 'Skipped'),
        ('ADJUSTED', 'Adjusted'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    # Fields
    loan = models.ForeignKey(
        Loan,
        on_delete=models.CASCADE,
        related_name='repayment_schedule',
        verbose_name="Loan"
    )
    
    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name='repayment_schedules',
        verbose_name="Customer"
    )
    
    installment_number = models.IntegerField(
        verbose_name="Installment Number"
    )
    
    due_date = models.DateField(
        verbose_name="Due Date"
    )
    
    # Amount Information
    principal_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name="Principal Amount (KES)"
    )
    
    interest_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name="Interest Amount (KES)"
    )
    
    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name="Total Amount (KES)"
    )
    
    # Payment Status
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING',
        verbose_name="Status"
    )
    
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
    
    payment_date = models.DateField(
        null=True,
        blank=True,
        verbose_name="Payment Date"
    )
    
    # Overdue Information
    days_overdue = models.IntegerField(
        default=0,
        verbose_name="Days Overdue"
    )
    
    late_fee = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0.00,
        verbose_name="Late Fee (KES)"
    )
    
    # Linked Repayment
    repayment = models.ForeignKey(
        'Repayment',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='schedule_items',
        verbose_name="Repayment"
    )
    
    # Notes
    notes = models.TextField(
        blank=True,
        verbose_name="Notes"
    )
    
    # Adjustment tracking
    is_adjusted = models.BooleanField(
        default=False,
        verbose_name="Adjusted"
    )
    
    adjustment_reason = models.TextField(
        blank=True,
        verbose_name="Adjustment Reason"
    )
    
    original_due_date = models.DateField(
        null=True,
        blank=True,
        verbose_name="Original Due Date"
    )
    
    original_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Original Amount (KES)"
    )
    
    class Meta:
        verbose_name = "Repayment Schedule"
        verbose_name_plural = "Repayment Schedules"
        ordering = ['loan', 'installment_number']
        unique_together = ['loan', 'installment_number']
        indexes = [
            models.Index(fields=['loan', 'due_date']),
            models.Index(fields=['status']),
            models.Index(fields=['due_date']),
            models.Index(fields=['customer', 'status']),
        ]
    
    def __str__(self):
        return f"Schedule #{self.installment_number} - {self.loan.loan_number} - Due: {self.due_date}"
    
    def save(self, *args, **kwargs):
        """
        Override save method to:
        1. Set customer from loan
        2. Calculate outstanding amount
        3. Update days overdue
        4. Update status based on payment
        """
        # Set customer from loan
        if not self.customer_id and self.loan_id:
            self.customer = self.loan.customer
        
        # Calculate outstanding amount
        self.amount_outstanding = self.total_amount - self.amount_paid
        
        # Update status based on payment
        if self.amount_paid >= self.total_amount:
            self.status = 'PAID'
            if not self.payment_date:
                self.payment_date = timezone.now().date()
        elif self.amount_paid > 0:
            self.status = 'PENDING'  # Still pending if partial payment
        
        # Calculate days overdue for pending installments
        if self.status in ['PENDING', 'OVERDUE']:
            today = timezone.now().date()
            if today > self.due_date:
                self.days_overdue = (today - self.due_date).days
                if self.status == 'PENDING':
                    self.status = 'OVERDUE'
            else:
                self.days_overdue = 0
        
        # Store original values if this is an adjustment
        if self.is_adjusted and not self.original_due_date:
            self.original_due_date = self.due_date
            self.original_amount = self.total_amount
        
        super().save(*args, **kwargs)
    
    @property
    def is_paid(self):
        """Check if installment is fully paid."""
        return self.status == 'PAID' and self.amount_paid >= self.total_amount
    
    @property
    def is_overdue(self):
        """Check if installment is overdue."""
        return self.status == 'OVERDUE' or (
            self.status == 'PENDING' and 
            self.due_date and 
            timezone.now().date() > self.due_date
        )
    
    @property
    def payment_percentage(self):
        """Calculate payment percentage."""
        if self.total_amount == 0:
            return 100
        return (self.amount_paid / self.total_amount) * 100
    
    @property
    def is_upcoming(self):
        """Check if installment is upcoming (due in next 7 days)."""
        if self.is_paid or self.is_overdue:
            return False
        
        today = timezone.now().date()
        days_until_due = (self.due_date - today).days
        return 0 <= days_until_due <= 7
    
    def record_payment(self, amount, payment_date=None):
        """
        Record a payment against this schedule item.
        
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
            self.payment_date = payment_date
        elif not self.payment_date:
            self.payment_date = timezone.now().date()
        
        self.save()
        return self
    
    def apply_late_fee(self, fee_amount, reason=""):
        """
        Apply late fee to this installment.
        
        Args:
            fee_amount (Decimal): Late fee amount
            reason (str): Reason for late fee
        """
        if fee_amount <= 0:
            raise ValidationError("Late fee amount must be greater than 0.")
        
        self.late_fee += fee_amount
        self.total_amount += fee_amount
        
        if reason:
            self.notes = f"{self.notes}\nLate fee applied: {reason} - KES {fee_amount}"
        
        self.save()
        return self
    
    def adjust_schedule(self, new_due_date=None, new_amount=None, reason=""):
        """
        Adjust the schedule item (reschedule or modify amount).
        
        Args:
            new_due_date (date): New due date
            new_amount (Decimal): New total amount
            reason (str): Reason for adjustment
        """
        self.is_adjusted = True
        
        if new_due_date:
            if not self.original_due_date:
                self.original_due_date = self.due_date
            self.due_date = new_due_date
        
        if new_amount is not None:
            if not self.original_amount:
                self.original_amount = self.total_amount
            self.total_amount = new_amount
        
        if reason:
            self.adjustment_reason = reason
        
        self.save()
        return self
    
    def skip_installment(self, reason, skipped_by):
        """
        Skip this installment (e.g., for holidays or special circumstances).
        
        Args:
            reason (str): Reason for skipping
            skipped_by (User): User authorizing skip
        """
        if self.is_paid:
            raise ValidationError("Cannot skip already paid installment.")
        
        self.status = 'SKIPPED'
        self.notes = f"{self.notes}\nSkipped: {reason} by {skipped_by.get_full_name()}"
        self.save()
        
        # Log skip action
        from apps.audit.models import AuditLog
        AuditLog.objects.create(
            user=skipped_by,
            action='SKIP',
            model_name='RepaymentSchedule',
            object_id=self.id,
            changes=f"Skipped installment #{self.installment_number}. Reason: {reason}"
        )
        
        return self
    
    def get_remaining_balance(self):
        """Get remaining balance after payments."""
        return max(self.total_amount - self.amount_paid, Decimal('0.00'))
    
    def clean(self):
        """Custom validation."""
        # Validate installment number is positive
        if self.installment_number <= 0:
            raise ValidationError({
                'installment_number': 'Installment number must be positive.'
            })
        
        # Validate total amount matches sum of principal and interest
        if abs((self.principal_amount + self.interest_amount) - self.total_amount) > Decimal('0.01'):
            raise ValidationError({
                'total_amount': 'Total amount must equal principal + interest.'
            })
        
        # Validate amount paid doesn't exceed total amount
        if self.amount_paid > self.total_amount:
            raise ValidationError({
                'amount_paid': 'Amount paid cannot exceed total amount.'
            })
        
        # Validate due date is not in the past for new items
        if not self.pk and self.due_date < timezone.now().date():
            raise ValidationError({
                'due_date': 'Due date cannot be in the past for new schedule items.'
            })
        
        super().clean()