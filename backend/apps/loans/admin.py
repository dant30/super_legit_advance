# backend/apps/loans/admin.py
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.db.models import Count, Sum, Q, F
from django.utils import timezone
from django.http import HttpResponse
from decimal import Decimal
import pandas as pd
import io
import logging

logger = logging.getLogger(__name__)

from .models import Loan, LoanApplication, Collateral


class CollateralInline(admin.TabularInline):
    """Inline for collateral."""
    model = Collateral
    extra = 0
    readonly_fields = ['loan_to_value_ratio', 'coverage_ratio', 'insurance_status']
    fields = [
        'collateral_type',
        'description',
        'owner_name',
        'estimated_value',
        'insured_value',
        'insurance_status',
        'status',
    ]


@admin.register(Loan)
class LoanAdmin(admin.ModelAdmin):
    """Admin interface for Loan model."""
    
    list_display = [
        'loan_number',
        'customer_link',
        'loan_type_display',
        'amount_approved_display',
        'term_months',
        'interest_rate_display',
        'status_display',
        'outstanding_balance_display',
        'days_overdue_display',
        'repayment_progress_display',
        'created_at',
    ]
    
    list_filter = [
        'status',
        'loan_type',
        'risk_level',
        'repayment_frequency',
        'application_date',
        'created_at',
    ]
    
    search_fields = [
        'loan_number',
        'customer__first_name',
        'customer__last_name',
        'customer__customer_number',
        'customer__phone_number',
        'customer__id_number',
    ]
    
    readonly_fields = [
        'loan_number',
        'application_date',
        'total_interest',
        'total_amount_due',
        'amount_paid',
        'outstanding_balance',
        'installment_amount',
        'days_overdue_display',
        'repayment_progress_display',
        'next_payment_date_display',
        'customer_link',
        'approved_by_link',
        'disbursed_by_link',
        'created_by_link',
        'updated_by_link',
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'loan_number',
                'customer_link',
                'loan_type',
                'purpose',
                'purpose_description',
            )
        }),
        ('Amount and Terms', {
            'fields': (
                ('amount_requested', 'amount_approved', 'amount_disbursed'),
                ('term_months', 'interest_rate', 'interest_type'),
                'repayment_frequency',
            )
        }),
        ('Dates', {
            'fields': (
                'application_date',
                ('approval_date', 'approved_by_link'),
                ('disbursement_date', 'disbursed_by_link'),
                ('start_date', 'maturity_date'),
            )
        }),
        ('Calculations', {
            'fields': (
                ('total_interest', 'total_amount_due'),
                ('amount_paid', 'outstanding_balance'),
                'installment_amount',
                ('processing_fee', 'total_penalties'),
            )
        }),
        ('Status and Performance', {
            'fields': (
                'status',
                ('risk_level', 'credit_score_at_application'),
                'days_overdue_display',
                'repayment_progress_display',
                'next_payment_date_display',
            )
        }),
        ('Documents', {
            'fields': (
                'loan_agreement',
            ),
            'classes': ('collapse',)
        }),
        ('Rejection Information', {
            'fields': (
                'rejection_reason',
            ),
            'classes': ('collapse',)
        }),
        ('Audit Information', {
            'fields': (
                'created_by_link',
                'updated_by_link',
                'created_at',
                'updated_at',
            ),
            'classes': ('collapse',)
        }),
        ('Notes', {
            'fields': ('notes',),
            'classes': ('wide',)
        }),
    )
    
    inlines = [CollateralInline]
    
    actions = [
        'approve_loans',
        'reject_loans',
        'disburse_loans',
        'mark_as_completed',
        'check_overdue_status',
        'calculate_late_penalties',
        'export_selected_loans',
    ]
    
    def get_queryset(self, request):
        """Optimize queryset with related data."""
        queryset = super().get_queryset(request)
        queryset = queryset.select_related(
            'customer', 'approved_by', 'disbursed_by',
            'created_by', 'updated_by'
        ).prefetch_related('collateral')
        
        # Add annotations for performance metrics
        today = timezone.now().date()
        queryset = queryset.annotate(
            days_overdue_calc=(
                Q(status='OVERDUE', maturity_date__lt=today) * 
                (today - F('maturity_date')).days
            )
        )
        
        return queryset
    
    def customer_link(self, obj):
        """Link to customer."""
        url = reverse('admin:customers_customer_change', args=[obj.customer.id])
        return format_html('<a href="{}">{}</a>', url, obj.customer.full_name)
    customer_link.short_description = 'Customer'
    
    def loan_type_display(self, obj):
        """Display loan type."""
        return obj.get_loan_type_display()
    loan_type_display.short_description = 'Type'
    
    def amount_approved_display(self, obj):
        """Display amount approved formatted."""
        if obj.amount_approved:
            return f"KES {obj.amount_approved:,.2f}"
        return "-"
    amount_approved_display.short_description = 'Amount'
    amount_approved_display.admin_order_field = 'amount_approved'
    
    def interest_rate_display(self, obj):
        """Display interest rate."""
        return f"{obj.interest_rate}%"
    interest_rate_display.short_description = 'Interest'
    
    def status_display(self, obj):
        """Display status with color."""
        colors = {
            'DRAFT': 'gray',
            'PENDING': 'orange',
            'APPROVED': 'blue',
            'ACTIVE': 'green',
            'OVERDUE': 'red',
            'COMPLETED': 'darkgreen',
            'REJECTED': 'darkred',
            'DEFAULTED': 'black',
        }
        
        color = colors.get(obj.status, 'black')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_display.short_description = 'Status'
    
    def outstanding_balance_display(self, obj):
        """Display outstanding balance formatted."""
        if obj.outstanding_balance > 0:
            return f"KES {obj.outstanding_balance:,.2f}"
        return "KES 0.00"
    outstanding_balance_display.short_description = 'Outstanding'
    outstanding_balance_display.admin_order_field = 'outstanding_balance'
    
    def days_overdue_display(self, obj):
        """Display days overdue."""
        days = obj.days_overdue
        if days > 0:
            return format_html(
                '<span style="color: red; font-weight: bold;">{} days</span>',
                days
            )
        return "0 days"
    days_overdue_display.short_description = 'Days Overdue'
    
    def repayment_progress_display(self, obj):
        """Display repayment progress percentage."""
        progress = obj.repayment_progress
        
        if progress >= 100:
            color = 'green'
        elif progress >= 70:
            color = 'lightgreen'
        elif progress >= 40:
            color = 'orange'
        else:
            color = 'red'
        
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}%</span>',
            color,
            f"{progress:.1f}"
        )
    repayment_progress_display.short_description = 'Progress'
    
    def next_payment_date_display(self, obj):
        """Display next payment date."""
        next_date = obj.next_payment_date
        if next_date:
            today = timezone.now().date()
            if next_date < today:
                return format_html(
                    '<span style="color: red; font-weight: bold;">{}</span>',
                    next_date
                )
            elif next_date <= today + timezone.timedelta(days=7):
                return format_html(
                    '<span style="color: orange; font-weight: bold;">{}</span>',
                    next_date
                )
            else:
                return format_html(
                    '<span style="color: green; font-weight: bold;">{}</span>',
                    next_date
                )
        return "-"
    next_payment_date_display.short_description = 'Next Payment'
    
    def approved_by_link(self, obj):
        """Link to user who approved the loan."""
        if obj.approved_by:
            url = reverse('admin:users_user_change', args=[obj.approved_by.id])
            return format_html('<a href="{}">{}</a>', url, obj.approved_by.get_full_name())
        return "-"
    approved_by_link.short_description = 'Approved By'
    
    def disbursed_by_link(self, obj):
        """Link to user who disbursed the loan."""
        if obj.disbursed_by:
            url = reverse('admin:users_user_change', args=[obj.disbursed_by.id])
            return format_html('<a href="{}">{}</a>', url, obj.disbursed_by.get_full_name())
        return "-"
    disbursed_by_link.short_description = 'Disbursed By'
    
    def created_by_link(self, obj):
        """Link to user who created the loan."""
        if obj.created_by:
            url = reverse('admin:users_user_change', args=[obj.created_by.id])
            return format_html('<a href="{}">{}</a>', url, obj.created_by.get_full_name())
        return "-"
    created_by_link.short_description = 'Created By'
    
    def updated_by_link(self, obj):
        """Link to user who last updated the loan."""
        if obj.updated_by:
            url = reverse('admin:users_user_change', args=[obj.updated_by.id])
            return format_html('<a href="{}">{}</a>', url, obj.updated_by.get_full_name())
        return "-"
    updated_by_link.short_description = 'Updated By'
    
    def approve_loans(self, request, queryset):
        """Admin action to approve loans."""
        count = 0
        failed = 0
        for loan in queryset:
            if loan.status in ['PENDING', 'UNDER_REVIEW']:
                try:
                    loan.approve(request.user)
                    count += 1
                except Exception as e:
                    failed += 1
                    logger.error(f"Error approving loan {loan.id}: {str(e)}")
        
        if failed > 0:
            self.message_user(
                request,
                f"Successfully approved {count} loan(s). Failed to approve {failed} loan(s).",
                level='warning'
            )
        else:
            self.message_user(
                request,
                f"Successfully approved {count} loan(s)."
            )
    approve_loans.short_description = "Approve selected loans"
    
    def reject_loans(self, request, queryset):
        """Admin action to reject loans."""
        count = 0
        for loan in queryset:
            if loan.status in ['PENDING', 'UNDER_REVIEW']:
                try:
                    loan.reject(request.user, "Rejected via admin action")
                    count += 1
                except:
                    pass
        
        self.message_user(
            request,
            f"Successfully rejected {count} loan(s)."
        )
    reject_loans.short_description = "Reject selected loans"
    
    def disburse_loans(self, request, queryset):
        """Admin action to disburse loans."""
        count = 0
        for loan in queryset:
            if loan.status == 'APPROVED':
                try:
                    loan.disburse(request.user)
                    count += 1
                except:
                    pass
        
        self.message_user(
            request,
            f"Successfully disbursed {count} loan(s)."
        )
    disburse_loans.short_description = "Disburse selected loans"
    
    def mark_as_completed(self, request, queryset):
        """Admin action to mark loans as completed."""
        count = 0
        for loan in queryset:
            if loan.status == 'ACTIVE' and loan.outstanding_balance <= 0:
                loan.status = 'COMPLETED'
                loan.save()
                count += 1
        
        self.message_user(
            request,
            f"Successfully marked {count} loan(s) as completed."
        )
    mark_as_completed.short_description = "Mark as completed"
    
    def check_overdue_status(self, request, queryset):
        """Admin action to check and update overdue status."""
        count = 0
        for loan in queryset:
            if loan.check_overdue_status():
                count += 1
        
        self.message_user(
            request,
            f"Found {count} overdue loan(s)."
        )
    check_overdue_status.short_description = "Check overdue status"
    
    def calculate_late_penalties(self, request, queryset):
        """Admin action to calculate late payment penalties."""
        from decimal import Decimal
        
        total_penalty = Decimal('0.00')
        count = 0
        
        for loan in queryset:
            if loan.is_overdue:
                penalty = loan.calculate_late_penalties()
                if penalty > 0:
                    total_penalty += penalty
                    count += 1
        
        self.message_user(
            request,
            f"Calculated penalties for {count} loan(s). Total: KES {total_penalty:,.2f}"
        )
    calculate_late_penalties.short_description = "Calculate late penalties"
    
    def export_selected_loans(self, request, queryset):
        """Admin action to export selected loans to Excel."""
        import pandas as pd
        import io
        
        data = []
        for loan in queryset:
            data.append({
                'Loan Number': loan.loan_number,
                'Customer Name': loan.customer.full_name,
                'Customer ID': loan.customer.id_number,
                'Loan Type': loan.get_loan_type_display(),
                'Amount Approved': loan.amount_approved,
                'Term (Months)': loan.term_months,
                'Interest Rate': loan.interest_rate,
                'Status': loan.get_status_display(),
                'Application Date': loan.application_date.strftime('%Y-%m-%d'),
                'Outstanding Balance': loan.outstanding_balance,
                'Next Payment Date': loan.next_payment_date,
            })
        
        df = pd.DataFrame(data)
        output = io.BytesIO()
        
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Loans', index=False)
        
        response = HttpResponse(
            output.getvalue(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename="loans_export.xlsx"'
        
        self.message_user(request, f"Exported {len(data)} loans to Excel.")
        return response
    export_selected_loans.short_description = "Export selected loans to Excel"


@admin.register(LoanApplication)
class LoanApplicationAdmin(admin.ModelAdmin):
    """Admin interface for LoanApplication model."""
    
    list_display = [
        'id',
        'customer_link',
        'loan_type_display',
        'amount_requested_display',
        'term_months',
        'status_display',
        'risk_level_display',
        'application_date',
        'reviewer_link',
    ]
    
    list_filter = [
        'status',
        'loan_type',
        'risk_level',
        'application_date',
        'review_date',
        'created_at',
    ]
    
    search_fields = [
        'customer__first_name',
        'customer__last_name',
        'customer__customer_number',
        'customer__phone_number',
        'customer__id_number',
        'purpose',
    ]
    
    readonly_fields = [
        'application_date',
        'total_monthly_income_display',
        'disposable_income_display',
        'debt_to_income_ratio_display',
        'is_approved_display',
        'is_rejected_display',
        'is_pending_display',
        'application_age_days_display',
        'customer_link',
        'reviewer_link',
        'approved_by_link',
        'rejected_by_link',
        'created_by_link',
        'updated_by_link',
        'loan_link',
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'customer_link',
                'loan_type',
                ('amount_requested', 'term_months'),
                'purpose',
                'purpose_description',
            )
        }),
        ('Income and Expenses', {
            'fields': (
                ('monthly_income', 'other_income', 'total_monthly_income_display'),
                'total_monthly_expenses',
                'disposable_income_display',
                'debt_to_income_ratio_display',
            )
        }),
        ('Existing Debts', {
            'fields': (
                'existing_loans',
                ('existing_loan_amount', 'existing_loan_monthly'),
            ),
            'classes': ('collapse',)
        }),
        ('Guarantors and Collateral', {
            'fields': (
                ('has_guarantors', 'guarantor_count'),
                ('has_collateral', 'collateral_value'),
                'collateral_description',
            ),
            'classes': ('collapse',)
        }),
        ('Application Status', {
            'fields': (
                'status',
                'application_date',
                'application_age_days_display',
                'is_approved_display',
                'is_rejected_display',
                'is_pending_display',
            )
        }),
        ('Review Information', {
            'fields': (
                'reviewer_link',
                'review_date',
                'review_notes',
            )
        }),
        ('Credit Information', {
            'fields': (
                'credit_score',
                'credit_check_date',
                'credit_check_notes',
                ('risk_level', 'risk_score'),
            )
        }),
        ('Approval Information', {
            'fields': (
                'approved_amount',
                'approved_interest_rate',
                'approved_by_link',
                'approval_date',
                'approval_notes',
            )
        }),
        ('Rejection Information', {
            'fields': (
                'rejection_reason',
                'rejected_by_link',
                'rejection_date',
            )
        }),
        ('Documents', {
            'fields': (
                'id_document',
                'pay_slips',
                'bank_statements',
                'business_documents',
                'collateral_documents',
                'other_documents',
            ),
            'classes': ('collapse',)
        }),
        ('Associated Loan', {
            'fields': (
                'loan_link',
            ),
            'classes': ('collapse',)
        }),
        ('Audit Information', {
            'fields': (
                'created_by_link',
                'updated_by_link',
                'created_at',
                'updated_at',
            ),
            'classes': ('collapse',)
        }),
        ('Notes', {
            'fields': ('notes',),
            'classes': ('wide',)
        }),
    )
    
    actions = [
        'assign_reviewer',
        'request_documents',
        'perform_credit_check',
        'approve_applications',
        'reject_applications',
        'create_loans_from_applications',
    ]
    
    def customer_link(self, obj):
        """Link to customer."""
        url = reverse('admin:customers_customer_change', args=[obj.customer.id])
        return format_html('<a href="{}">{}</a>', url, obj.customer.full_name)
    customer_link.short_description = 'Customer'
    
    def loan_type_display(self, obj):
        """Display loan type."""
        return obj.get_loan_type_display()
    loan_type_display.short_description = 'Type'
    
    def amount_requested_display(self, obj):
        """Display amount requested formatted."""
        return f"KES {obj.amount_requested:,.2f}"
    amount_requested_display.short_description = 'Amount'
    amount_requested_display.admin_order_field = 'amount_requested'
    
    def status_display(self, obj):
        """Display status with color."""
        colors = {
            'DRAFT': 'gray',
            'SUBMITTED': 'blue',
            'UNDER_REVIEW': 'orange',
            'APPROVED': 'green',
            'REJECTED': 'red',
            'CANCELLED': 'darkgray',
        }
        
        color = colors.get(obj.status, 'black')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_display.short_description = 'Status'
    
    def risk_level_display(self, obj):
        """Display risk level with color."""
        colors = {
            'LOW': 'green',
            'MEDIUM': 'orange',
            'HIGH': 'red',
        }
        
        color = colors.get(obj.risk_level, 'black')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_risk_level_display()
        )
    risk_level_display.short_description = 'Risk'
    
    def total_monthly_income_display(self, obj):
        """Display total monthly income."""
        return f"KES {obj.total_monthly_income:,.2f}"
    total_monthly_income_display.short_description = 'Total Income'
    
    def disposable_income_display(self, obj):
        """Display disposable income."""
        income = obj.disposable_income
        if income < 0:
            color = 'red'
        elif income < 5000:
            color = 'orange'
        else:
            color = 'green'
        
        return format_html(
            '<span style="color: {}; font-weight: bold;">KES {:,}</span>',
            color,
            f"{income:,.2f}"
        )
    disposable_income_display.short_description = 'Disposable Income'
    
    def debt_to_income_ratio_display(self, obj):
        """Display debt-to-income ratio."""
        ratio = obj.debt_to_income_ratio
        if ratio > 60:
            color = 'red'
        elif ratio > 40:
            color = 'orange'
        else:
            color = 'green'
        
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}%</span>',
            color,
            f"{ratio:.1f}"
        )
    debt_to_income_ratio_display.short_description = 'DTI Ratio'
    
    def is_approved_display(self, obj):
        """Display if application is approved."""
        if obj.is_approved:
            return format_html(
                '<span style="color: green; font-weight: bold;">✓ Approved</span>'
            )
        return format_html(
            '<span style="color: gray;">Not Approved</span>'
        )
    is_approved_display.short_description = 'Approved'
    
    def is_rejected_display(self, obj):
        """Display if application is rejected."""
        if obj.is_rejected:
            return format_html(
                '<span style="color: red; font-weight: bold;">✗ Rejected</span>'
            )
        return format_html(
            '<span style="color: gray;">Not Rejected</span>'
        )
    is_rejected_display.short_description = 'Rejected'
    
    def is_pending_display(self, obj):
        """Display if application is pending."""
        if obj.is_pending:
            return format_html(
                '<span style="color: orange; font-weight: bold;">● Pending</span>'
            )
        return format_html(
            '<span style="color: gray;">Not Pending</span>'
        )
    is_pending_display.short_description = 'Pending'
    
    def application_age_days_display(self, obj):
        """Display application age in days."""
        days = obj.application_age_days
        if days > 30:
            color = 'red'
        elif days > 14:
            color = 'orange'
        else:
            color = 'green'
        
        return format_html(
            '<span style="color: {}; font-weight: bold;">{} days</span>',
            color,
            days
        )
    application_age_days_display.short_description = 'Age'
    
    def reviewer_link(self, obj):
        """Link to reviewer."""
        if obj.reviewer:
            url = reverse('admin:users_user_change', args=[obj.reviewer.id])
            return format_html('<a href="{}">{}</a>', url, obj.reviewer.get_full_name())
        return "-"
    reviewer_link.short_description = 'Reviewer'
    
    def approved_by_link(self, obj):
        """Link to user who approved the application."""
        if obj.approved_by:
            url = reverse('admin:users_user_change', args=[obj.approved_by.id])
            return format_html('<a href="{}">{}</a>', url, obj.approved_by.get_full_name())
        return "-"
    approved_by_link.short_description = 'Approved By'
    
    def rejected_by_link(self, obj):
        """Link to user who rejected the application."""
        if obj.rejected_by:
            url = reverse('admin:users_user_change', args=[obj.rejected_by.id])
            return format_html('<a href="{}">{}</a>', url, obj.rejected_by.get_full_name())
        return "-"
    rejected_by_link.short_description = 'Rejected By'
    
    def created_by_link(self, obj):
        """Link to user who created the application."""
        if obj.created_by:
            url = reverse('admin:users_user_change', args=[obj.created_by.id])
            return format_html('<a href="{}">{}</a>', url, obj.created_by.get_full_name())
        return "-"
    created_by_link.short_description = 'Created By'
    
    def updated_by_link(self, obj):
        """Link to user who last updated the application."""
        if obj.updated_by:
            url = reverse('admin:users_user_change', args=[obj.updated_by.id])
            return format_html('<a href="{}">{}</a>', url, obj.updated_by.get_full_name())
        return "-"
    updated_by_link.short_description = 'Updated By'
    
    def loan_link(self, obj):
        """Link to associated loan."""
        if obj.loan:
            url = reverse('admin:loans_loan_change', args=[obj.loan.id])
            return format_html('<a href="{}">{}</a>', url, obj.loan.loan_number)
        return "-"
    loan_link.short_description = 'Associated Loan'
    
    def assign_reviewer(self, request, queryset):
        """Admin action to assign reviewer."""
        count = 0
        for application in queryset:
            if application.status in ['SUBMITTED', 'DOCUMENTS_RECEIVED']:
                try:
                    application.assign_reviewer(request.user)
                    count += 1
                except:
                    pass
        
        self.message_user(
            request,
            f"Successfully assigned reviewer to {count} application(s)."
        )
    assign_reviewer.short_description = "Assign reviewer"
    
    def request_documents(self, request, queryset):
        """Admin action to request documents."""
        count = 0
        for application in queryset:
            if application.status in ['UNDER_REVIEW', 'DOCUMENTS_REQUESTED']:
                try:
                    application.request_documents("Additional documents requested via admin action")
                    count += 1
                except:
                    pass
        
        self.message_user(
            request,
            f"Successfully requested documents for {count} application(s)."
        )
    request_documents.short_description = "Request documents"
    
    def perform_credit_check(self, request, queryset):
        """Admin action to perform credit check."""
        count = 0
        for application in queryset:
            if application.status in ['UNDER_REVIEW', 'DOCUMENTS_RECEIVED']:
                try:
                    # Simulate credit score calculation
                    from apps.core.utils.credit_scoring import calculate_credit_score
                    score = calculate_credit_score(application.customer)
                    application.perform_credit_check(score, "Credit check performed via admin action")
                    count += 1
                except:
                    pass
        
        self.message_user(
            request,
            f"Successfully performed credit check for {count} application(s)."
        )
    perform_credit_check.short_description = "Perform credit check"
    
    def approve_applications(self, request, queryset):
        """Admin action to approve applications."""
        count = 0
        for application in queryset:
            if application.status in ['UNDER_REVIEW', 'DOCUMENTS_RECEIVED', 'CREDIT_CHECK']:
                try:
                    application.approve(request.user)
                    count += 1
                except:
                    pass
        
        self.message_user(
            request,
            f"Successfully approved {count} application(s)."
        )
    approve_applications.short_description = "Approve applications"
    
    def reject_applications(self, request, queryset):
        """Admin action to reject applications."""
        count = 0
        for application in queryset:
            if application.status in ['UNDER_REVIEW', 'DOCUMENTS_RECEIVED', 'CREDIT_CHECK']:
                try:
                    application.reject(request.user, "Rejected via admin action")
                    count += 1
                except:
                    pass
        
        self.message_user(
            request,
            f"Successfully rejected {count} application(s)."
        )
    reject_applications.short_description = "Reject applications"
    
    def create_loans_from_applications(self, request, queryset):
        """Admin action to create loans from approved applications."""
        count = 0
        for application in queryset:
            if application.is_approved and not application.loan:
                try:
                    application.create_loan()
                    count += 1
                except:
                    pass
        
        self.message_user(
            request,
            f"Successfully created {count} loan(s) from applications."
        )
    create_loans_from_applications.short_description = "Create loans from applications"


@admin.register(Collateral)
class CollateralAdmin(admin.ModelAdmin):
    """Admin interface for Collateral model."""
    
    list_display = [
        'id',
        'loan_link',
        'collateral_type_display',
        'owner_name',
        'estimated_value_display',
        'status_display',
        'loan_to_value_ratio_display',
        'coverage_ratio_display',
        'insurance_status_display',
        'pledged_date',
    ]
    
    list_filter = [
        'collateral_type',
        'status',
        'ownership_type',
        'pledged_date',
        'created_at',
    ]
    
    search_fields = [
        'loan__loan_number',
        'owner_name',
        'owner_id_number',
        'description',
        'registration_number',
    ]
    
    readonly_fields = [
        'loan_to_value_ratio',
        'coverage_ratio',
        'insurance_status',
        'is_active_display',
        'is_released_display',
        'is_insured_display',
        'loan_link',
        'created_by_link',
        'updated_by_link',
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'loan_link',
                'collateral_type',
                'description',
            )
        }),
        ('Ownership', {
            'fields': (
                'owner_name',
                'owner_id_number',
                'ownership_type',
            )
        }),
        ('Valuation and Insurance', {
            'fields': (
                ('estimated_value', 'insured_value'),
                ('insurance_company', 'insurance_policy_number', 'insurance_expiry'),
                ('loan_to_value_ratio', 'coverage_ratio'),
            )
        }),
        ('Location and Registration', {
            'fields': (
                'location',
                ('registration_number', 'registration_date', 'registration_authority'),
            )
        }),
        ('Status', {
            'fields': (
                'status',
                ('pledged_date', 'release_date'),
                'insurance_status',
                'is_active_display',
                'is_released_display',
                'is_insured_display',
            )
        }),
        ('Documents', {
            'fields': (
                'ownership_document',
                'valuation_report',
                'insurance_certificate',
                'photos',
                'other_documents',
            ),
            'classes': ('collapse',)
        }),
        ('Audit Information', {
            'fields': (
                'created_by_link',
                'updated_by_link',
                'created_at',
                'updated_at',
            ),
            'classes': ('collapse',)
        }),
        ('Notes', {
            'fields': ('notes',),
            'classes': ('wide',)
        }),
    )
    
    actions = [
        'release_collateral',
        'foreclose_collateral',
        'check_insurance_expiry',
        'update_valuations',
    ]
    
    def loan_link(self, obj):
        """Link to loan."""
        url = reverse('admin:loans_loan_change', args=[obj.loan.id])
        return format_html('<a href="{}">{}</a>', url, obj.loan.loan_number)
    loan_link.short_description = 'Loan'
    
    def collateral_type_display(self, obj):
        """Display collateral type."""
        return obj.get_collateral_type_display()
    collateral_type_display.short_description = 'Type'
    
    def estimated_value_display(self, obj):
        """Display estimated value formatted."""
        return f"KES {obj.estimated_value:,.2f}"
    estimated_value_display.short_description = 'Value'
    estimated_value_display.admin_order_field = 'estimated_value'
    
    def status_display(self, obj):
        """Display status with color."""
        colors = {
            'ACTIVE': 'green',
            'RELEASED': 'blue',
            'FORECLOSED': 'red',
            'SOLD': 'orange',
            'DAMAGED': 'darkorange',
            'LOST': 'darkred',
        }
        
        color = colors.get(obj.status, 'black')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_display.short_description = 'Status'
    
    def loan_to_value_ratio_display(self, obj):
        """Display loan-to-value ratio."""
        ratio = obj.loan_to_value_ratio
        if ratio > 80:
            color = 'red'
        elif ratio > 60:
            color = 'orange'
        else:
            color = 'green'
        
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}%</span>',
            color,
            f"{ratio:.1f}"
        )
    loan_to_value_ratio_display.short_description = 'LTV Ratio'
    
    def coverage_ratio_display(self, obj):
        """Display coverage ratio."""
        ratio = obj.coverage_ratio
        if ratio < 1.2:
            color = 'red'
        elif ratio < 1.5:
            color = 'orange'
        else:
            color = 'green'
        
        return format_html(
            '<span style="color: {}; font-weight: bold;">{:.2f}x</span>',
            color,
            ratio
        )
    coverage_ratio_display.short_description = 'Coverage'
    
    def insurance_status_display(self, obj):
        """Display insurance status."""
        status = obj.insurance_status
        if status == "Not Insured":
            color = 'red'
        elif status == "Insurance Expired":
            color = 'orange'
        elif status == "Insured":
            color = 'green'
        else:
            color = 'gray'
        
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            status
        )
    insurance_status_display.short_description = 'Insurance'
    
    def is_active_display(self, obj):
        """Display if collateral is active."""
        if obj.is_active:
            return format_html(
                '<span style="color: green; font-weight: bold;">✓ Active</span>'
            )
        return format_html(
            '<span style="color: gray;">Not Active</span>'
        )
    is_active_display.short_description = 'Active'
    
    def is_released_display(self, obj):
        """Display if collateral is released."""
        if obj.is_released:
            return format_html(
                '<span style="color: blue; font-weight: bold;">✓ Released</span>'
            )
        return format_html(
            '<span style="color: gray;">Not Released</span>'
        )
    is_released_display.short_description = 'Released'
    
    def is_insured_display(self, obj):
        """Display if collateral is insured."""
        if obj.is_insured:
            return format_html(
                '<span style="color: green; font-weight: bold;">✓ Insured</span>'
            )
        return format_html(
            '<span style="color: gray;">Not Insured</span>'
        )
    is_insured_display.short_description = 'Insured'
    
    def created_by_link(self, obj):
        """Link to user who created the collateral."""
        if obj.created_by:
            url = reverse('admin:users_user_change', args=[obj.created_by.id])
            return format_html('<a href="{}">{}</a>', url, obj.created_by.get_full_name())
        return "-"
    created_by_link.short_description = 'Created By'
    
    def updated_by_link(self, obj):
        """Link to user who last updated the collateral."""
        if obj.updated_by:
            url = reverse('admin:users_user_change', args=[obj.updated_by.id])
            return format_html('<a href="{}">{}</a>', url, obj.updated_by.get_full_name())
        return "-"
    updated_by_link.short_description = 'Updated By'
    
    def release_collateral(self, request, queryset):
        """Admin action to release collateral."""
        count = 0
        for collateral in queryset:
            if collateral.is_active:
                try:
                    collateral.release(request.user)
                    count += 1
                except:
                    pass
        
        self.message_user(
            request,
            f"Successfully released {count} collateral item(s)."
        )
    release_collateral.short_description = "Release collateral"
    
    def foreclose_collateral(self, request, queryset):
        """Admin action to foreclose collateral."""
        count = 0
        for collateral in queryset:
            if collateral.is_active:
                try:
                    collateral.foreclose(request.user, "Foreclosed via admin action")
                    count += 1
                except:
                    pass
        
        self.message_user(
            request,
            f"Successfully foreclosed {count} collateral item(s)."
        )
    foreclose_collateral.short_description = "Foreclose collateral"
    
    def check_insurance_expiry(self, request, queryset):
        """Admin action to check insurance expiry."""
        expired_count = 0
        expiring_soon = 0
        
        for collateral in queryset:
            if collateral.is_insured:
                check = collateral.check_insurance_expiry()
                if check.get('expired') == True:
                    expired_count += 1
                elif check.get('expired') == False and check.get('days_remaining', 0) < 30:
                    expiring_soon += 1
        
        messages = []
        if expired_count > 0:
            messages.append(f"{expired_count} insurance policies have expired.")
        if expiring_soon > 0:
            messages.append(f"{expiring_soon} insurance policies expire within 30 days.")
        
        if messages:
            self.message_user(request, " ".join(messages))
        else:
            self.message_user(request, "All insurance policies are valid.")
    check_insurance_expiry.short_description = "Check insurance expiry"
    
    def update_valuations(self, request, queryset):
        """Admin action to update valuations."""
        from decimal import Decimal
        
        count = 0
        for collateral in queryset:
            try:
                # Simulate valuation update (increase by 5%)
                new_value = collateral.estimated_value * Decimal('1.05')
                collateral.update_valuation(new_value, request.user, timezone.now().date())
                count += 1
            except:
                pass
        
        self.message_user(
            request,
            f"Successfully updated valuations for {count} collateral item(s)."
        )
    update_valuations.short_description = "Update valuations"