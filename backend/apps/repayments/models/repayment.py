# backend/apps/repayments/models/repayment.py
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.exceptions import ValidationError
from decimal import Decimal
import uuid

from apps.core.models.base import BaseModel
from apps.loans.models import Loan
from apps.customers.models import Customer

User = get_user_model()


class Repayment(BaseModel):
    """
    Repayment model for tracking loan repayments.
    """
    
    # Repayment statuses
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
        ('CANCELLED', 'Cancelled'),
        ('OVERDUE', 'Overdue'),
        ('PARTIAL', 'Partial'),
        ('WAIVED', 'Waived'),
    ]
    
    # Payment methods
    PAYMENT_METHOD_CHOICES = [
        ('MPESA', 'M-Pesa'),
        ('CASH', 'Cash'),
        ('BANK_TRANSFER', 'Bank Transfer'),
        ('CHEQUE', 'Cheque'),
        ('CREDIT_CARD', 'Credit Card'),
        ('OTHER', 'Other'),
    ]
    
    # Repayment types
    REPAYMENT_TYPE_CHOICES = [
        ('PRINCIPAL', 'Principal'),
        ('INTEREST', 'Interest'),
        ('PENALTY', 'Penalty'),
        ('FEE', 'Fee'),
        ('FULL', 'Full Payment'),
        ('PARTIAL', 'Partial Payment'),
    ]
    
    # Fields
    repayment_number = models.CharField(
        max_length=50,
        unique=True,
        editable=False,
        verbose_name="Repayment Number"
    )
    
    loan = models.ForeignKey(
        Loan,
        on_delete=models.CASCADE,
        related_name='repayments',
        verbose_name="Loan"
    )
    
    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name='repayments',
        verbose_name="Customer"
    )
    
    # Amount Information
    amount_due = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name="Amount Due (KES)"
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
    
    # Breakdown of payment
    principal_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0.00,
        verbose_name="Principal Amount (KES)"
    )
    
    interest_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0.00,
        verbose_name="Interest Amount (KES)"
    )
    
    penalty_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0.00,
        verbose_name="Penalty Amount (KES)"
    )
    
    fee_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0.00,
        verbose_name="Fee Amount (KES)"
    )
    
    # Payment Details
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        default='MPESA',
        verbose_name="Payment Method"
    )
    
    repayment_type = models.CharField(
        max_length=20,
        choices=REPAYMENT_TYPE_CHOICES,
        default='FULL',
        verbose_name="Repayment Type"
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING',
        verbose_name="Status"
    )
    
    # Dates
    due_date = models.DateField(
        verbose_name="Due Date"
    )
    
    payment_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Payment Date"
    )
    
    scheduled_date = models.DateField(
        null=True,
        blank=True,
        verbose_name="Scheduled Date"
    )
    
    # Payment Reference
    payment_reference = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Payment Reference"
    )
    
    transaction_id = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Transaction ID"
    )
    
    # M-Pesa Payment Link
    mpesa_payment = models.ForeignKey(
        'mpesa.MpesaPayment',  # Use string reference instead
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='repayments',
        verbose_name="M-Pesa Payment"
    )
    
    # Overdue Information
    days_overdue = models.IntegerField(
        default=0,
        verbose_name="Days Overdue"
    )
    
    late_fee_applied = models.BooleanField(
        default=False,
        verbose_name="Late Fee Applied"
    )
    
    # Notes
    notes = models.TextField(
        blank=True,
        verbose_name="Notes"
    )
    
    receipt_number = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Receipt Number"
    )
    
    # Receipt/Proof
    receipt_file = models.FileField(
        upload_to='repayment_receipts/%Y/%m/%d/',
        null=True,
        blank=True,
        verbose_name="Receipt File"
    )
    
    # Verification
    verified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_repayments',
        verbose_name="Verified By"
    )
    
    verification_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Verification Date"
    )
    
    # Audit
    collected_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='collected_repayments',
        verbose_name="Collected By"
    )
    
    class Meta:
        verbose_name = "Repayment"
        verbose_name_plural = "Repayments"
        ordering = ['-payment_date', '-created_at']
        indexes = [
            models.Index(fields=['repayment_number']),
            models.Index(fields=['status']),
            models.Index(fields=['due_date']),
            models.Index(fields=['payment_date']),
            models.Index(fields=['loan', 'status']),
            models.Index(fields=['customer', 'status']),
        ]
    
    def __str__(self):
        return f"{self.repayment_number} - {self.loan.loan_number} - KES {self.amount_paid}"
    
    def save(self, *args, **kwargs):
        """
        Override save method to:
        1. Generate repayment number
        2. Calculate outstanding amount
        3. Update loan status based on repayment
        4. Handle overdue calculations
        """
        # Generate repayment number
        if not self.repayment_number:
            self.repayment_number = self.generate_repayment_number()
        
        # Set customer from loan if not set
        if not self.customer_id and self.loan_id:
            self.customer = self.loan.customer
        
        # Calculate amount outstanding
        self.amount_outstanding = self.amount_due - self.amount_paid
        
        # Calculate days overdue
        if self.due_date and self.status in ['PENDING', 'OVERDUE']:
            today = timezone.now().date()
            if today > self.due_date:
                self.days_overdue = (today - self.due_date).days
                if self.status == 'PENDING':
                    self.status = 'OVERDUE'
            else:
                self.days_overdue = 0
        
        # Handle payment completion
        if self.amount_paid >= self.amount_due and self.status in ['PENDING', 'OVERDUE', 'PARTIAL']:
            self.status = 'COMPLETED'
            if not self.payment_date:
                self.payment_date = timezone.now()
        
        # Handle partial payment
        elif self.amount_paid > 0 and self.amount_paid < self.amount_due:
            self.status = 'PARTIAL'
            if not self.payment_date:
                self.payment_date = timezone.now()
        
        # Call super save
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        # Update loan after save (to ensure loan exists)
        if not is_new:
            self.update_loan_status()
    
    def generate_repayment_number(self):
        """
        Generate unique repayment number in format: REP-YYYYMM-XXXXXX
        """
        year_month = timezone.now().strftime('%Y%m')
        last_repayment = Repayment.objects.filter(
            repayment_number__startswith=f"REP-{year_month}"
        ).order_by('-repayment_number').first()
        
        if last_repayment:
            last_number = int(last_repayment.repayment_number.split('-')[-1])
            new_number = last_number + 1
        else:
            new_number = 1
        
        return f"REP-{year_month}-{new_number:06d}"
    
    @property
    def is_paid(self):
        """Check if repayment is fully paid."""
        return self.status == 'COMPLETED' and self.amount_paid >= self.amount_due
    
    @property
    def is_overdue(self):
        """Check if repayment is overdue."""
        return self.status == 'OVERDUE' or (self.due_date and timezone.now().date() > self.due_date)
    
    @property
    def is_partial(self):
        """Check if repayment is partial."""
        return self.status == 'PARTIAL'
    
    @property
    def payment_status(self):
        """Get payment status with color coding."""
        status_map = {
            'COMPLETED': ('Paid', 'success'),
            'PENDING': ('Pending', 'warning'),
            'OVERDUE': ('Overdue', 'danger'),
            'PARTIAL': ('Partial', 'info'),
            'PROCESSING': ('Processing', 'primary'),
            'FAILED': ('Failed', 'danger'),
            'CANCELLED': ('Cancelled', 'secondary'),
            'WAIVED': ('Waived', 'success'),
        }
        return status_map.get(self.status, ('Unknown', 'secondary'))
    
    @property
    def payment_percentage(self):
        """Calculate payment percentage."""
        if self.amount_due == 0:
            return 100
        return (self.amount_paid / self.amount_due) * 100
    
    def make_payment(self, amount, payment_method='MPESA', reference='', collected_by=None):
        """
        Process a payment for this repayment.
        
        Args:
            amount (Decimal): Amount to pay
            payment_method (str): Payment method
            reference (str): Payment reference
            collected_by (User): User who collected payment
        """
        if self.status == 'COMPLETED':
            raise ValidationError("This repayment is already completed.")
        
        if amount <= 0:
            raise ValidationError("Payment amount must be greater than 0.")
        
        # Update payment details
        self.amount_paid += amount
        self.payment_method = payment_method
        self.payment_reference = reference
        
        if collected_by:
            self.collected_by = collected_by
        
        # Set payment date if not set
        if not self.payment_date:
            self.payment_date = timezone.now()
        
        # Update status based on payment
        if self.amount_paid >= self.amount_due:
            self.status = 'COMPLETED'
        elif self.amount_paid > 0:
            self.status = 'PARTIAL'
        
        self.save()
        
        # Log payment
        from apps.audit.models import AuditLog
        AuditLog.objects.create(
            user=collected_by,
            action='PAYMENT',
            model_name='Repayment',
            object_id=self.id,
            changes=f"Payment of KES {amount} made for repayment {self.repayment_number}"
        )
        
        return self
    
    def apply_penalty(self, penalty_amount, reason=""):
        """
        Apply penalty to repayment.
        
        Args:
            penalty_amount (Decimal): Penalty amount
            reason (str): Reason for penalty
        """
        if penalty_amount <= 0:
            raise ValidationError("Penalty amount must be greater than 0.")
        
        self.penalty_amount += penalty_amount
        self.amount_due += penalty_amount
        
        if reason:
            self.notes = f"{self.notes}\nPenalty applied: {reason} - KES {penalty_amount}"
        
        self.save()
        
        # Create penalty record
        Penalty.objects.create(
            repayment=self,
            amount=penalty_amount,
            reason=reason or "Late payment penalty",
            applied_by=self.collected_by or self.verified_by,
        )
        
        return self
    
    def waive_amount(self, amount, reason, waived_by):
        """
        Waive part of the repayment amount.
        
        Args:
            amount (Decimal): Amount to waive
            reason (str): Reason for waiver
            waived_by (User): User approving waiver
        """
        if amount <= 0:
            raise ValidationError("Waiver amount must be greater than 0.")
        
        if amount > self.amount_outstanding:
            raise ValidationError("Waiver amount cannot exceed outstanding amount.")
        
        # Reduce amount due
        self.amount_due -= amount
        self.amount_outstanding = self.amount_due - self.amount_paid
        
        # Update notes
        self.notes = f"{self.notes}\nAmount waived: {reason} - KES {amount} by {waived_by.get_full_name()}"
        
        # If amount due is now 0, mark as completed
        if self.amount_due <= self.amount_paid:
            self.status = 'WAIVED'
            self.amount_paid = self.amount_due
            self.amount_outstanding = 0
        
        self.save()
        
        # Log waiver
        from apps.audit.models import AuditLog
        AuditLog.objects.create(
            user=waived_by,
            action='WAIVER',
            model_name='Repayment',
            object_id=self.id,
            changes=f"Waived KES {amount} for repayment {self.repayment_number}. Reason: {reason}"
        )
        
        return self
    
    def cancel_payment(self, reason, cancelled_by):
        """
        Cancel a payment.
        
        Args:
            reason (str): Reason for cancellation
            cancelled_by (User): User cancelling payment
        """
        if self.status in ['COMPLETED', 'WAIVED']:
            raise ValidationError("Cannot cancel completed or waived repayments.")
        
        self.status = 'CANCELLED'
        self.notes = f"{self.notes}\nCancelled: {reason} by {cancelled_by.get_full_name()}"
        self.save()
        
        # Log cancellation
        from apps.audit.models import AuditLog
        AuditLog.objects.create(
            user=cancelled_by,
            action='CANCEL',
            model_name='Repayment',
            object_id=self.id,
            changes=f"Cancelled repayment {self.repayment_number}. Reason: {reason}"
        )
        
        return self
    
    def update_loan_status(self):
        """Update loan status based on repayment status."""
        if not self.loan:
            return
        
        loan = self.loan
        
        # Recalculate loan outstanding balance
        loan.outstanding_balance = loan.calculate_outstanding_balance()
        
        # Update loan status if all repayments are completed
        if loan.outstanding_balance <= 0:
            loan.status = 'PAID'
            loan.closed_date = timezone.now()
        
        # Update overdue status
        overdue_repayments = loan.repayments.filter(status='OVERDUE').exists()
        if overdue_repayments and loan.status != 'OVERDUE':
            loan.status = 'OVERDUE'
        
        loan.save()
    
    def get_breakdown(self):
        """Get payment breakdown as dictionary."""
        return {
            'principal': float(self.principal_amount),
            'interest': float(self.interest_amount),
            'penalty': float(self.penalty_amount),
            'fees': float(self.fee_amount),
            'total_due': float(self.amount_due),
            'total_paid': float(self.amount_paid),
            'outstanding': float(self.amount_outstanding),
        }
    
    def clean(self):
        """Custom validation."""
        # Validate amount paid doesn't exceed amount due (unless waived)
        if self.amount_paid > self.amount_due and self.status != 'WAIVED':
            raise ValidationError({
                'amount_paid': 'Amount paid cannot exceed amount due.'
            })
        
        # Validate breakdown adds up to amount due
        breakdown_total = (
            self.principal_amount +
            self.interest_amount +
            self.penalty_amount +
            self.fee_amount
        )
        
        if abs(breakdown_total - self.amount_due) > Decimal('0.01'):  # Allow small rounding differences
            raise ValidationError({
                'amount_due': 'Breakdown amounts must sum to amount due.'
            })
        
        # Validate dates
        if self.payment_date and self.due_date:
            if self.payment_date.date() < self.due_date:
                # Payment before due date is okay
                pass
        
        super().clean()