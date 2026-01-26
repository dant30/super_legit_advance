# backend/apps/loans/models/loan.py
# backend/apps/loans/models/loan.py
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from django.core.exceptions import ValidationError
from decimal import Decimal
import uuid

from apps.core.models.base import BaseModel
from apps.customers.models import Customer
from apps.loans.calculators.loan_calculator import LoanCalculator

User = get_user_model()


class Loan(BaseModel):
    """
    Loan model for storing loan information.
    """
    
    # Loan ID prefix
    LOAN_ID_PREFIX = "LN"
    
    # Loan types
    LOAN_TYPE_CHOICES = [
        ('PERSONAL', 'Personal Loan'),
        ('BUSINESS', 'Business Loan'),
        ('SALARY', 'Salary Advance'),
        ('EMERGENCY', 'Emergency Loan'),
        ('ASSET_FINANCING', 'Asset Financing'),
        ('EDUCATION', 'Education Loan'),
        ('AGRICULTURE', 'Agricultural Loan'),
    ]
    
    # Loan purposes
    PURPOSE_CHOICES = [
        ('MEDICAL', 'Medical Expenses'),
        ('EDUCATION', 'Education Fees'),
        ('BUSINESS_CAPITAL', 'Business Capital'),
        ('HOME_IMPROVEMENT', 'Home Improvement'),
        ('DEBT_CONSOLIDATION', 'Debt Consolidation'),
        ('VEHICLE_PURCHASE', 'Vehicle Purchase'),
        ('RENT', 'Rent Payment'),
        ('UTILITIES', 'Utilities'),
        ('TRAVEL', 'Travel'),
        ('WEDDING', 'Wedding'),
        ('OTHER', 'Other'),
    ]
    
    # Loan statuses
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('PENDING', 'Pending Approval'),
        ('UNDER_REVIEW', 'Under Review'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('ACTIVE', 'Active'),
        ('COMPLETED', 'Completed'),
        ('DEFAULTED', 'Defaulted'),
        ('OVERDUE', 'Overdue'),
        ('WRITTEN_OFF', 'Written Off'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    # Interest types
    INTEREST_TYPE_CHOICES = [
        ('FIXED', 'Fixed Interest'),
        ('REDUCING_BALANCE', 'Reducing Balance'),
        ('FLAT_RATE', 'Flat Rate'),
    ]
    
    # Repayment frequencies
    REPAYMENT_FREQUENCY_CHOICES = [
        ('DAILY', 'Daily'),
        ('WEEKLY', 'Weekly'),
        ('BIWEEKLY', 'Bi-Weekly'),
        ('MONTHLY', 'Monthly'),
        ('QUARTERLY', 'Quarterly'),
        ('BIANNUAL', 'Bi-Annual'),
        ('ANNUAL', 'Annual'),
        ('BULLET', 'Bullet Payment'),
    ]
    
    # Fields
    loan_number = models.CharField(
        max_length=20,
        unique=True,
        editable=False,
        verbose_name="Loan Number"
    )
    
    customer = models.ForeignKey(
        Customer,
        on_delete=models.PROTECT,
        related_name='loans',
        verbose_name="Customer"
    )
    
    loan_type = models.CharField(
        max_length=20,
        choices=LOAN_TYPE_CHOICES,
        verbose_name="Loan Type"
    )
    
    purpose = models.CharField(
        max_length=50,
        choices=PURPOSE_CHOICES,
        verbose_name="Loan Purpose"
    )
    
    purpose_description = models.TextField(
        blank=True,
        verbose_name="Purpose Description"
    )
    
    # Amount fields
    amount_requested = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('1000.00'))],
        verbose_name="Amount Requested (KES)"
    )
    
    amount_approved = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal('0.00'))],
        verbose_name="Amount Approved (KES)"
    )
    
    amount_disbursed = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        default=Decimal('0.00'),
        verbose_name="Amount Disbursed (KES)"
    )
    
    # Terms
    term_months = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(120)],
        verbose_name="Loan Term (Months)"
    )
    
    interest_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00')), MaxValueValidator(Decimal('100.00'))],
        verbose_name="Interest Rate (%)"
    )
    
    interest_type = models.CharField(
        max_length=20,
        choices=INTEREST_TYPE_CHOICES,
        default='REDUCING_BALANCE',
        verbose_name="Interest Type"
    )
    
    repayment_frequency = models.CharField(
        max_length=20,
        choices=REPAYMENT_FREQUENCY_CHOICES,
        default='MONTHLY',
        verbose_name="Repayment Frequency"
    )
    
    # Dates
    application_date = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Application Date"
    )
    
    approval_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Approval Date"
    )
    
    disbursement_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Disbursement Date"
    )
    
    start_date = models.DateField(
        null=True,
        blank=True,
        verbose_name="Loan Start Date"
    )
    
    maturity_date = models.DateField(
        null=True,
        blank=True,
        verbose_name="Maturity Date"
    )
    
    completion_date = models.DateField(
        null=True,
        blank=True,
        verbose_name="Completion Date"
    )
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='DRAFT',
        verbose_name="Loan Status"
    )
    
    # Calculations
    total_interest = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name="Total Interest (KES)"
    )
    
    total_amount_due = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name="Total Amount Due (KES)"
    )
    
    amount_paid = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name="Amount Paid (KES)"
    )
    
    outstanding_balance = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name="Outstanding Balance (KES)"
    )
    
    # Installment calculation
    installment_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Installment Amount (KES)"
    )
    
    # Penalties and fees
    processing_fee = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name="Processing Fee (KES)"
    )
    
    processing_fee_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('1.00'),
        validators=[MinValueValidator(Decimal('0.00')), MaxValueValidator(Decimal('10.00'))],
        verbose_name="Processing Fee Percentage (%)"
    )
    
    late_payment_penalty_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('5.00'),
        validators=[MinValueValidator(Decimal('0.00')), MaxValueValidator(Decimal('20.00'))],
        verbose_name="Late Payment Penalty Rate (%)"
    )
    
    total_penalties = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name="Total Penalties (KES)"
    )
    
    # Credit information
    credit_score_at_application = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Credit Score at Application"
    )
    
    risk_level = models.CharField(
        max_length=20,
        choices=[
            ('LOW', 'Low Risk'),
            ('MEDIUM', 'Medium Risk'),
            ('HIGH', 'High Risk'),
        ],
        default='MEDIUM',
        verbose_name="Risk Level"
    )
    
    # Approval information
    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_loans',
        verbose_name="Approved By"
    )
    
    disbursed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='disbursed_loans',
        verbose_name="Disbursed By"
    )
    
    # Documents
    loan_agreement = models.FileField(
        upload_to='loan_agreements/%Y/%m/%d/',
        null=True,
        blank=True,
        verbose_name="Loan Agreement"
    )
    
    # Notes and metadata
    rejection_reason = models.TextField(
        blank=True,
        verbose_name="Rejection Reason"
    )
    
    notes = models.TextField(
        blank=True,
        verbose_name="Notes"
    )
    
    # Audit fields
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_loans',
        verbose_name="Created By"
    )
    
    updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='updated_loans',
        verbose_name="Updated By"
    )
    
    class Meta:
        verbose_name = "Loan"
        verbose_name_plural = "Loans"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['loan_number']),
            models.Index(fields=['customer', 'status']),
            models.Index(fields=['status', 'maturity_date']),
            models.Index(fields=['application_date']),
            models.Index(fields=['maturity_date']),
            models.Index(fields=['status', 'completion_date']),
        ]
    
    def __str__(self):
        return f"{self.loan_number} - {self.customer.full_name} - KES {self.amount_approved or self.amount_requested:,.2f}"
    
    def save(self, *args, **kwargs):
        """
        Override save method to generate loan number and calculate values.
        """
        if not self.loan_number:
            self.loan_number = self.generate_loan_number()
        
        # Calculate processing fee if not set
        if not self.processing_fee and self.amount_approved:
            self.processing_fee = (self.amount_approved * self.processing_fee_percentage) / Decimal('100')
        
        # Calculate loan amounts if approved
        if self.status == 'APPROVED' and self.amount_approved and not self.total_amount_due:
            self.calculate_loan_terms()
        
        # Update outstanding balance
        if self.amount_paid and self.total_amount_due:
            self.outstanding_balance = self.total_amount_due - self.amount_paid
        
        # Update status based on outstanding balance
        if self.outstanding_balance <= Decimal('0.00') and self.status == 'ACTIVE':
            self.status = 'COMPLETED'
            self.completion_date = timezone.now().date()
        
        # Set maturity date if start date is set
        if self.start_date and not self.maturity_date:
            from dateutil.relativedelta import relativedelta
            self.maturity_date = self.start_date + relativedelta(months=self.term_months)
        
        super().save(*args, **kwargs)
    
    def generate_loan_number(self):
        """
        Generate unique loan number in format: LN-YYYY-MM-XXXXX
        """
        year_month = timezone.now().strftime('%Y%m')
        last_loan = Loan.objects.filter(
            loan_number__startswith=f"{self.LOAN_ID_PREFIX}-{year_month}"
        ).order_by('-loan_number').first()
        
        if last_loan:
            last_number = int(last_loan.loan_number.split('-')[-1])
            new_number = last_number + 1
        else:
            new_number = 1
        
        return f"{self.LOAN_ID_PREFIX}-{year_month}-{new_number:05d}"
    
    def calculate_loan_terms(self):
        """
        Calculate loan terms using the loan calculator.
        """
        calculator = LoanCalculator(
            principal=self.amount_approved,
            interest_rate=self.interest_rate,
            term_months=self.term_months,
            interest_type=self.interest_type,
            repayment_frequency=self.repayment_frequency,
            processing_fee=self.processing_fee
        )
        
        calculations = calculator.calculate()
        
        self.total_interest = calculations['total_interest']
        self.total_amount_due = calculations['total_amount_due']
        self.installment_amount = calculations['installment_amount']
        
        # Set outstanding balance to total amount due initially
        self.outstanding_balance = self.total_amount_due
    
    def _get_payments_per_year(self):
        """Get number of payments per year based on frequency."""
        frequencies = {
            'DAILY': 365,
            'WEEKLY': 52,
            'BIWEEKLY': 26,
            'MONTHLY': 12,
            'QUARTERLY': 4,
            'BIANNUAL': 2,
            'ANNUAL': 1,
            'BULLET': 1,
        }
        return frequencies.get(self.repayment_frequency, 12)
    
    @property
    def is_active(self):
        """Check if loan is active."""
        return self.status == 'ACTIVE'
    
    @property
    def is_overdue(self):
        """Check if loan is overdue."""
        return self.status == 'OVERDUE'
    
    @property
    def is_completed(self):
        """Check if loan is completed."""
        return self.status == 'COMPLETED'
    
    @property
    def days_overdue(self):
        """Calculate days overdue."""
        if self.status != 'OVERDUE' or not self.maturity_date:
            return 0
        
        today = timezone.now().date()
        if today > self.maturity_date:
            return (today - self.maturity_date).days
        return 0
    
    @property
    def loan_age_days(self):
        """Calculate loan age in days."""
        if not self.start_date:
            return 0
        
        today = timezone.now().date()
        return (today - self.start_date).days
    
    @property
    def repayment_progress(self):
        """Calculate repayment progress percentage."""
        if not self.total_amount_due or self.total_amount_due == 0:
            return 0
        
        return (self.amount_paid / self.total_amount_due) * 100
    
    @property
    def next_payment_date(self):
        """Calculate next payment date."""
        from apps.repayments.models import RepaymentSchedule
        try:
            next_schedule = RepaymentSchedule.objects.filter(
                loan=self,
                status='PENDING'
            ).order_by('due_date').first()
            
            if next_schedule:
                return next_schedule.due_date
        except:
            pass
        
        return None
    
    @property
    def total_payments_made(self):
        """Get total number of payments made."""
        from apps.repayments.models import Repayment
        return Repayment.objects.filter(loan=self, status='COMPLETED').count()
    
    @property
    def total_payments_due(self):
        """Get total number of payments due."""
        from apps.repayments.models import RepaymentSchedule
        return RepaymentSchedule.objects.filter(loan=self).count()
    
    @property
    def payment_performance(self):
        """Calculate payment performance percentage."""
        if self.total_payments_due == 0:
            return 100.0
        
        return (self.total_payments_made / self.total_payments_due) * 100
    
    def approve(self, approved_by, approved_amount=None):
        """Approve the loan."""
        if self.status != 'PENDING' and self.status != 'UNDER_REVIEW':
            raise ValidationError("Loan can only be approved from PENDING or UNDER_REVIEW status.")
        
        self.status = 'APPROVED'
        self.approval_date = timezone.now()
        self.approved_by = approved_by
        
        if approved_amount:
            self.amount_approved = approved_amount
        else:
            self.amount_approved = self.amount_requested
        
        # Calculate loan terms
        self.calculate_loan_terms()
        
        self.save()
    
    def reject(self, rejected_by, reason=""):
        """Reject the loan."""
        if self.status != 'PENDING' and self.status != 'UNDER_REVIEW':
            raise ValidationError("Loan can only be rejected from PENDING or UNDER_REVIEW status.")
        
        self.status = 'REJECTED'
        self.rejection_reason = reason
        self.save()
    
    def disburse(self, disbursed_by, disbursement_amount=None):
        """Disburse the loan."""
        if self.status != 'APPROVED':
            raise ValidationError("Loan must be approved before disbursement.")
        
        self.status = 'ACTIVE'
        self.disbursement_date = timezone.now()
        self.disbursed_by = disbursed_by
        
        if disbursement_amount:
            self.amount_disbursed = disbursement_amount
        else:
            # Subtract processing fee from approved amount
            self.amount_disbursed = self.amount_approved - self.processing_fee
        
        # Set start date to disbursement date if not set
        if not self.start_date:
            self.start_date = self.disbursement_date.date()
        
        # Generate repayment schedule
        self.generate_repayment_schedule()
        
        self.save()
    
    def generate_repayment_schedule(self):
        """Generate repayment schedule for the loan."""
        from apps.repayments.models import RepaymentSchedule
        from dateutil.relativedelta import relativedelta
        
        if not self.start_date or not self.installment_amount:
            raise ValidationError("Loan start date and installment amount must be set.")
        
        # Clear existing schedule
        RepaymentSchedule.objects.filter(loan=self).delete()
        
        # Calculate number of payments based on frequency
        payments_per_year = self._get_payments_per_year()
        total_payments = (self.term_months * payments_per_year) // 12
        
        # For bullet payment, only one payment at the end
        if self.repayment_frequency == 'BULLET':
            total_payments = 1
        
        schedule = []
        due_date = self.start_date
        
        for i in range(total_payments):
            # Adjust due date based on frequency
            if self.repayment_frequency == 'DAILY':
                due_date = self.start_date + relativedelta(days=i+1)
            elif self.repayment_frequency == 'WEEKLY':
                due_date = self.start_date + relativedelta(weeks=i+1)
            elif self.repayment_frequency == 'BIWEEKLY':
                due_date = self.start_date + relativedelta(weeks=(i+1)*2)
            elif self.repayment_frequency == 'MONTHLY':
                due_date = self.start_date + relativedelta(months=i+1)
            elif self.repayment_frequency == 'QUARTERLY':
                due_date = self.start_date + relativedelta(months=(i+1)*3)
            elif self.repayment_frequency == 'BIANNUAL':
                due_date = self.start_date + relativedelta(months=(i+1)*6)
            elif self.repayment_frequency == 'ANNUAL':
                due_date = self.start_date + relativedelta(years=i+1)
            else:  # BULLET
                due_date = self.maturity_date
            
            schedule.append(
                RepaymentSchedule(
                    loan=self,
                    installment_number=i+1,
                    due_date=due_date,
                    amount_due=self.installment_amount,
                    status='PENDING'
                )
            )
        
        # Create all schedule entries
        RepaymentSchedule.objects.bulk_create(schedule)
    
    def make_payment(self, amount, payment_date=None, payment_method='CASH', reference=''):
        """Make a payment towards the loan."""
        from apps.repayments.models import Repayment
        
        if self.status != 'ACTIVE':
            raise ValidationError("Payments can only be made on active loans.")
        
        if amount <= Decimal('0.00'):
            raise ValidationError("Payment amount must be greater than 0.")
        
        if amount > self.outstanding_balance:
            raise ValidationError(f"Payment amount exceeds outstanding balance of KES {self.outstanding_balance:,.2f}")
        
        # Create repayment record
        payment = Repayment.objects.create(
            loan=self,
            amount=amount,
            payment_date=payment_date or timezone.now(),
            payment_method=payment_method,
            reference_number=reference,
            status='COMPLETED',
            recorded_by=self.updated_by or self.created_by
        )
        
        # Update loan amounts
        self.amount_paid += amount
        self.outstanding_balance -= amount
        
        # Check if loan is completed
        if self.outstanding_balance <= Decimal('0.00'):
            self.status = 'COMPLETED'
            self.completion_date = timezone.now().date()
        
        self.save()
        
        return payment
    
    def check_overdue_status(self):
        """Check and update overdue status."""
        if self.status != 'ACTIVE':
            return False
        
        today = timezone.now().date()
        if self.maturity_date and today > self.maturity_date:
            if self.outstanding_balance > Decimal('0.00'):
                self.status = 'OVERDUE'
                self.save()
                return True
        
        return False
    
    def calculate_late_penalties(self):
        """Calculate late payment penalties."""
        if not self.is_overdue or self.days_overdue <= 0:
            return Decimal('0.00')
        
        # Calculate penalty as percentage of overdue amount per day
        penalty_per_day = (self.outstanding_balance * self.late_payment_penalty_rate) / (Decimal('100.00') * Decimal('30.00'))
        total_penalty = penalty_per_day * Decimal(str(self.days_overdue))
        
        self.total_penalties += total_penalty
        self.total_amount_due += total_penalty
        self.outstanding_balance += total_penalty
        
        self.save()
        
        return total_penalty
    
    def get_collateral(self):
        """Get collateral for this loan."""
        return self.collateral.all()
    
    def get_repayment_schedule(self):
        """Get repayment schedule for this loan."""
        from apps.repayments.models import RepaymentSchedule
        return RepaymentSchedule.objects.filter(loan=self).order_by('due_date')
    
    def get_repayment_history(self):
        """Get repayment history for this loan."""
        from apps.repayments.models import Repayment
        return Repayment.objects.filter(loan=self).order_by('-payment_date')
    
    def clean(self):
        """Custom validation."""
        # Validate amount approved is not greater than amount requested
        if self.amount_approved and self.amount_requested and self.amount_approved > self.amount_requested:
            raise ValidationError({
                'amount_approved': 'Approved amount cannot exceed requested amount.'
            })
        
        # Validate disbursed amount is not greater than approved amount
        if self.amount_disbursed and self.amount_approved and self.amount_disbursed > self.amount_approved:
            raise ValidationError({
                'amount_disbursed': 'Disbursed amount cannot exceed approved amount.'
            })
        
        # Validate dates
        if self.start_date and self.maturity_date and self.start_date >= self.maturity_date:
            raise ValidationError({
                'maturity_date': 'Maturity date must be after start date.'
            })
        
        if self.disbursement_date and self.approval_date and self.disbursement_date < self.approval_date:
            raise ValidationError({
                'disbursement_date': 'Disbursement date cannot be before approval date.'
            })
        
        # Validate completion date
        if self.completion_date:
            if self.start_date and self.completion_date < self.start_date:
                raise ValidationError({
                    'completion_date': 'Completion date cannot be before start date.'
                })
            
            if self.status != 'COMPLETED':
                raise ValidationError({
                    'completion_date': 'Completion date can only be set for completed loans.'
                })
        
        super().clean()