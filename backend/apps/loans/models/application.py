# backend/apps/loans/models/application.py
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.forms import ValidationError
from django.utils import timezone
from decimal import Decimal

from apps.core.models.base import BaseModel
from apps.customers.models import Customer

User = get_user_model()


class LoanApplication(BaseModel):
    """
    Loan application model for tracking loan application process.
    """
    
    # Application statuses
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('SUBMITTED', 'Submitted'),
        ('UNDER_REVIEW', 'Under Review'),
        ('DOCUMENTS_REQUESTED', 'Documents Requested'),
        ('DOCUMENTS_RECEIVED', 'Documents Received'),
        ('CREDIT_CHECK', 'Credit Check'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    # Fields
    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name='loan_applications',
        verbose_name="Customer"
    )
    
    # Loan details
    loan_type = models.CharField(
        max_length=20,
        choices=[
            ('PERSONAL', 'Personal Loan'),
            ('BUSINESS', 'Business Loan'),
            ('SALARY', 'Salary Advance'),
            ('EMERGENCY', 'Emergency Loan'),
            ('ASSET_FINANCING', 'Asset Financing'),
        ],
        verbose_name="Loan Type"
    )
    
    amount_requested = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('1000.00'))],
        verbose_name="Amount Requested (KES)"
    )
    
    term_months = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(120)],
        verbose_name="Loan Term (Months)"
    )
    
    purpose = models.CharField(
        max_length=100,
        verbose_name="Loan Purpose"
    )
    
    purpose_description = models.TextField(
        verbose_name="Purpose Description"
    )
    
    # Employment and income
    monthly_income = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        verbose_name="Monthly Income (KES)"
    )
    
    other_income = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        verbose_name="Other Monthly Income (KES)"
    )
    
    total_monthly_expenses = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        verbose_name="Total Monthly Expenses (KES)"
    )
    
    # Existing debts
    existing_loans = models.BooleanField(
        default=False,
        verbose_name="Has Existing Loans"
    )
    
    existing_loan_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name="Existing Loan Amount (KES)"
    )
    
    existing_loan_monthly = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name="Existing Loan Monthly Payment (KES)"
    )
    
    # Guarantors
    has_guarantors = models.BooleanField(
        default=False,
        verbose_name="Has Guarantors"
    )
    
    guarantor_count = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name="Number of Guarantors"
    )
    
    # Collateral
    has_collateral = models.BooleanField(
        default=False,
        verbose_name="Has Collateral"
    )
    
    collateral_description = models.TextField(
        blank=True,
        verbose_name="Collateral Description"
    )
    
    collateral_value = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name="Collateral Value (KES)"
    )
    
    # Application status
    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default='DRAFT',
        verbose_name="Application Status"
    )
    
    application_date = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Application Date"
    )
    
    # Review information
    reviewer = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_applications',
        verbose_name="Reviewer"
    )
    
    review_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Review Date"
    )
    
    review_notes = models.TextField(
        blank=True,
        verbose_name="Review Notes"
    )
    
    # Credit information
    credit_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Credit Score"
    )
    
    credit_check_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Credit Check Date"
    )
    
    credit_check_notes = models.TextField(
        blank=True,
        verbose_name="Credit Check Notes"
    )
    
    # Risk assessment
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
    
    risk_score = models.IntegerField(
        default=50,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="Risk Score"
    )
    
    # Approval information
    approved_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Approved Amount (KES)"
    )
    
    approved_interest_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Approved Interest Rate (%)"
    )
    
    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_applications',
        verbose_name="Approved By"
    )
    
    approval_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Approval Date"
    )
    
    approval_notes = models.TextField(
        blank=True,
        verbose_name="Approval Notes"
    )
    
    # Rejection information
    rejection_reason = models.TextField(
        blank=True,
        verbose_name="Rejection Reason"
    )
    
    rejected_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='rejected_applications',
        verbose_name="Rejected By"
    )
    
    rejection_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Rejection Date"
    )
    
    # Documents
    id_document = models.FileField(
        upload_to='application_docs/id/%Y/%m/%d/',
        null=True,
        blank=True,
        verbose_name="ID Document"
    )
    
    pay_slips = models.FileField(
        upload_to='application_docs/payslips/%Y/%m/%d/',
        null=True,
        blank=True,
        verbose_name="Pay Slips"
    )
    
    bank_statements = models.FileField(
        upload_to='application_docs/statements/%Y/%m/%d/',
        null=True,
        blank=True,
        verbose_name="Bank Statements"
    )
    
    business_documents = models.FileField(
        upload_to='application_docs/business/%Y/%m/%d/',
        null=True,
        blank=True,
        verbose_name="Business Documents"
    )
    
    collateral_documents = models.FileField(
        upload_to='application_docs/collateral/%Y/%m/%d/',
        null=True,
        blank=True,
        verbose_name="Collateral Documents"
    )
    
    other_documents = models.FileField(
        upload_to='application_docs/other/%Y/%m/%d/',
        null=True,
        blank=True,
        verbose_name="Other Documents"
    )
    
    # Loan reference (if application is converted to loan)
    loan = models.OneToOneField(
        'Loan',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='application',
        verbose_name="Associated Loan"
    )
    
    # Metadata
    notes = models.TextField(
        blank=True,
        verbose_name="Notes"
    )
    
    # Audit fields
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_applications',
        verbose_name="Created By"
    )
    
    updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='updated_applications',
        verbose_name="Updated By"
    )
    
    class Meta:
        verbose_name = "Loan Application"
        verbose_name_plural = "Loan Applications"
        ordering = ['-application_date']
        indexes = [
            models.Index(fields=['customer', 'status']),
            models.Index(fields=['status', 'application_date']),
            models.Index(fields=['application_date']),
            models.Index(fields=['reviewer', 'status']),
        ]
    
    def __str__(self):
        return f"Application #{self.id} - {self.customer.full_name} - KES {self.amount_requested:,.2f}"
    
    @property
    def total_monthly_income(self):
        """Calculate total monthly income."""
        return self.monthly_income + self.other_income
    
    @property
    def disposable_income(self):
        """Calculate disposable income."""
        return self.total_monthly_income - self.total_monthly_expenses - self.existing_loan_monthly
    
    @property
    def debt_to_income_ratio(self):
        """Calculate debt-to-income ratio."""
        if self.total_monthly_income == 0:
            return 0
        
        total_debt_payments = self.total_monthly_expenses + self.existing_loan_monthly
        return (total_debt_payments / self.total_monthly_income) * 100
    
    @property
    def is_approved(self):
        """Check if application is approved."""
        return self.status == 'APPROVED'
    
    @property
    def is_rejected(self):
        """Check if application is rejected."""
        return self.status == 'REJECTED'
    
    @property
    def is_pending(self):
        """Check if application is pending."""
        return self.status in ['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_REQUESTED', 'DOCUMENTS_RECEIVED', 'CREDIT_CHECK']
    
    @property
    def application_age_days(self):
        """Calculate application age in days."""
        today = timezone.now().date()
        app_date = self.application_date.date()
        return (today - app_date).days
    
    def submit(self):
        """Submit the application for review."""
        if self.status != 'DRAFT':
            raise ValidationError("Only draft applications can be submitted.")
        
        # Basic validation before submission
        self.clean()
        
        self.status = 'SUBMITTED'
        self.save()
    
    def assign_reviewer(self, reviewer):
        """Assign a reviewer to the application."""
        self.reviewer = reviewer
        self.status = 'UNDER_REVIEW'
        self.review_date = timezone.now()
        self.save()
    
    def request_documents(self, notes=""):
        """Request additional documents."""
        self.status = 'DOCUMENTS_REQUESTED'
        if notes:
            self.review_notes = notes
        self.save()
    
    def receive_documents(self):
        """Mark documents as received."""
        self.status = 'DOCUMENTS_RECEIVED'
        self.save()
    
    def perform_credit_check(self, score, notes=""):
        """Perform credit check."""
        if score < 0 or score > 900:
            raise ValidationError("Credit score must be between 0 and 900.")
        
        self.status = 'CREDIT_CHECK'
        self.credit_score = Decimal(str(score))
        self.credit_check_date = timezone.now()
        if notes:
            self.credit_check_notes = notes
        
        # Update risk level based on credit score
        if score >= 700:
            self.risk_level = 'LOW'
            self.risk_score = 20
        elif score >= 500:
            self.risk_level = 'MEDIUM'
            self.risk_score = 50
        else:
            self.risk_level = 'HIGH'
            self.risk_score = 80
        
        self.save()
    
    def approve(self, approved_by, approved_amount=None, interest_rate=None, notes=""):
        """Approve the application."""
        if self.status not in ['UNDER_REVIEW', 'DOCUMENTS_RECEIVED', 'CREDIT_CHECK']:
            raise ValidationError("Application must be under review to be approved.")
        
        # Validate approved amount
        if approved_amount:
            approved_amount_decimal = Decimal(str(approved_amount))
            if approved_amount_decimal > self.amount_requested:
                raise ValidationError(f"Approved amount (KES {approved_amount_decimal:,.2f}) cannot exceed requested amount (KES {self.amount_requested:,.2f}).")
            if approved_amount_decimal <= 0:
                raise ValidationError("Approved amount must be greater than 0.")
        else:
            approved_amount_decimal = self.amount_requested
        
        # Validate interest rate
        if interest_rate:
            interest_rate_decimal = Decimal(str(interest_rate))
            if interest_rate_decimal < 0 or interest_rate_decimal > 100:
                raise ValidationError("Interest rate must be between 0 and 100%.")
        else:
            interest_rate_decimal = Decimal('12.5')  # Default
        
        self.status = 'APPROVED'
        self.approved_by = approved_by
        self.approval_date = timezone.now()
        self.approved_amount = approved_amount_decimal
        self.approved_interest_rate = interest_rate_decimal
        
        if notes:
            self.approval_notes = notes
        
        self.save()
        
        # Create loan from approved application
        return self.create_loan()
    
    def reject(self, rejected_by, reason=""):
        """Reject the application."""
        if self.status not in ['UNDER_REVIEW', 'DOCUMENTS_RECEIVED', 'CREDIT_CHECK']:
            raise ValidationError("Application must be under review to be rejected.")
        
        if not reason.strip():
            raise ValidationError("Rejection reason is required.")
        
        self.status = 'REJECTED'
        self.rejected_by = rejected_by
        self.rejection_date = timezone.now()
        self.rejection_reason = reason
        self.save()
    
    def cancel(self, cancelled_by, reason=""):
        """Cancel the application."""
        if self.status == 'APPROVED':
            raise ValidationError("Approved applications cannot be cancelled.")
        
        self.status = 'CANCELLED'
        if reason:
            self.notes = f"{self.notes}\n\nCancelled by {cancelled_by.get_full_name()}: {reason}"
        self.save()
    
    def create_loan(self):
        """Create a loan from the approved application."""
        if self.status != 'APPROVED' or not self.approved_amount:
            raise ValidationError("Only approved applications with approved amount can be converted to loans.")
        
        # Import here to avoid circular import
        from apps.loans.models.loan import Loan
        
        # Create loan
        loan = Loan.objects.create(
            customer=self.customer,
            loan_type=self.loan_type,
            purpose=self.purpose,
            purpose_description=self.purpose_description,
            amount_requested=self.amount_requested,
            amount_approved=self.approved_amount,
            term_months=self.term_months,
            interest_rate=self.approved_interest_rate or Decimal('12.5'),
            status='APPROVED',
            approval_date=self.approval_date,
            approved_by=self.approved_by,
            credit_score_at_application=self.credit_score,
            risk_level=self.risk_level,
            created_by=self.created_by,
        )
        
        # Link loan to application
        self.loan = loan
        self.save()
        
        return loan
    
    def calculate_affordability(self):
        """
        Calculate affordability score for the application.
        
        Returns:
            dict: Affordability analysis
        """
        from apps.loans.calculators.loan_calculator import LoanCalculator
        
        # Calculate proposed loan installment
        calculator = LoanCalculator(
            principal=self.amount_requested,
            interest_rate=Decimal('12.5'),  # Default interest rate
            term_months=self.term_months,
            interest_type='REDUCING_BALANCE'
        )
        
        calculations = calculator.calculate()
        proposed_installment = calculations['installment_amount']
        
        # Calculate total monthly obligations
        total_monthly_obligations = self.total_monthly_expenses + self.existing_loan_monthly + proposed_installment
        
        # Calculate ratios
        installment_to_income = (proposed_installment / self.total_monthly_income) * 100 if self.total_monthly_income > 0 else 100
        obligations_to_income = (total_monthly_obligations / self.total_monthly_income) * 100 if self.total_monthly_income > 0 else 100
        
        # Calculate affordability score (0-100)
        score = 100
        
        # Penalize high ratios
        if installment_to_income > 40:
            score -= 30
        elif installment_to_income > 30:
            score -= 20
        elif installment_to_income > 20:
            score -= 10
        
        if obligations_to_income > 60:
            score -= 30
        elif obligations_to_income > 50:
            score -= 20
        elif obligations_to_income > 40:
            score -= 10
        
        # Adjust based on collateral
        if self.has_collateral and self.collateral_value >= self.amount_requested:
            score += 10
        
        # Adjust based on guarantors
        if self.has_guarantors and self.guarantor_count >= 2:
            score += 5
        
        # Adjust based on credit score
        if self.credit_score:
            if self.credit_score >= 700:
                score += 15
            elif self.credit_score >= 600:
                score += 10
            elif self.credit_score >= 500:
                score += 5
        
        # Ensure score is within 0-100
        score = max(0, min(100, score))
        
        # Determine recommendation
        if score >= 70:
            recommendation = 'Approve'
            recommendation_details = 'Strong affordability indicators'
        elif score >= 40:
            recommendation = 'Review'
            recommendation_details = 'Moderate affordability, requires careful review'
        else:
            recommendation = 'Reject'
            recommendation_details = 'Poor affordability indicators'
        
        return {
            'proposed_installment': proposed_installment,
            'installment_to_income_ratio': installment_to_income,
            'obligations_to_income_ratio': obligations_to_income,
            'affordability_score': score,
            'affordability_level': 'GOOD' if score >= 70 else 'MODERATE' if score >= 40 else 'POOR',
            'recommendation': recommendation,
            'recommendation_details': recommendation_details,
            'factors_considered': {
                'income_ratio': True,
                'existing_debts': self.existing_loans,
                'collateral': self.has_collateral,
                'guarantors': self.has_guarantors,
                'credit_score': bool(self.credit_score),
            }
        }
    
    def clean(self):
        """Custom validation."""
        super().clean()
        
        # Validate income and expenses
        if self.monthly_income is not None and self.monthly_income < 0:
            raise ValidationError({'monthly_income': 'Monthly income cannot be negative.'})
        
        if self.other_income is not None and self.other_income < 0:
            raise ValidationError({'other_income': 'Other income cannot be negative.'})
        
        if self.total_monthly_expenses is not None and self.total_monthly_expenses < 0:
            raise ValidationError({'total_monthly_expenses': 'Monthly expenses cannot be negative.'})
        
        # Validate debt information
        if self.existing_loans:
            if self.existing_loan_amount <= 0:
                raise ValidationError({
                    'existing_loan_amount': 'Existing loan amount must be greater than 0 if customer has existing loans.'
                })
            if self.existing_loan_monthly <= 0:
                raise ValidationError({
                    'existing_loan_monthly': 'Existing loan monthly payment must be greater than 0 if customer has existing loans.'
                })
        
        # Validate guarantors
        if self.has_guarantors and self.guarantor_count <= 0:
            raise ValidationError({
                'guarantor_count': 'Guarantor count must be greater than 0 if customer has guarantors.'
            })
        
        # Validate collateral
        if self.has_collateral and self.collateral_value <= 0:
            raise ValidationError({
                'collateral_value': 'Collateral value must be greater than 0 if customer has collateral.'
            })
        
        # Validate credit score
        if self.credit_score is not None:
            if self.credit_score < 0 or self.credit_score > 900:
                raise ValidationError({
                    'credit_score': 'Credit score must be between 0 and 900.'
                })
        
        # Validate risk score
        if self.risk_score < 0 or self.risk_score > 100:
            raise ValidationError({
                'risk_score': 'Risk score must be between 0 and 100.'
            })
        
        # Validate amount approved
        if self.approved_amount is not None:
            if self.approved_amount <= 0:
                raise ValidationError({
                    'approved_amount': 'Approved amount must be greater than 0.'
                })
            if self.amount_requested and self.approved_amount > self.amount_requested:
                raise ValidationError({
                    'approved_amount': f'Approved amount (KES {self.approved_amount:,.2f}) cannot exceed requested amount (KES {self.amount_requested:,.2f}).'
                })
        
        # Validate interest rate
        if self.approved_interest_rate is not None:
            if self.approved_interest_rate < 0 or self.approved_interest_rate > 100:
                raise ValidationError({
                    'approved_interest_rate': 'Interest rate must be between 0 and 100%.'
                })
        
        # Validate dates
        if self.review_date and self.application_date and self.review_date < self.application_date:
            raise ValidationError({
                'review_date': 'Review date cannot be before application date.'
            })
        
        if self.approval_date and self.application_date and self.approval_date < self.application_date:
            raise ValidationError({
                'approval_date': 'Approval date cannot be before application date.'
            })
        
        if self.rejection_date and self.application_date and self.rejection_date < self.application_date:
            raise ValidationError({
                'rejection_date': 'Rejection date cannot be before application date.'
            })