# backend/apps/customers/admin.py
from django.contrib import admin
from django.contrib.auth import get_user_model
from django.utils.html import format_html
from django.urls import reverse
from django.db.models import Count, Sum, Q
from .models import Customer, Guarantor, Employment
from .validators.customer_validator import CustomerValidator

User = get_user_model()


class GuarantorInline(admin.TabularInline):
    """Inline for guarantors."""
    model = Guarantor
    extra = 0
    readonly_fields = ['verification_status', 'verification_date']
    fields = [
        'first_name', 'last_name', 'phone_number',
        'id_number', 'relationship', 'monthly_income',
        'verification_status', 'verification_date', 'is_active'
    ]


class EmploymentInline(admin.StackedInline):
    """Inline for employment information."""
    model = Employment
    extra = 0
    readonly_fields = ['total_monthly_income', 'years_of_service']
    fieldsets = (
        ('Employment Details', {
            'fields': (
                'employment_type', 'sector', 'occupation',
                'employer_name', 'employer_address',
                'job_title', 'department', 'employee_number',
                'date_employed', 'years_of_service',
            )
        }),
        ('Income Information', {
            'fields': (
                'monthly_income', 'other_income', 'total_monthly_income',
                'payment_frequency', 'next_pay_date',
            )
        }),
        ('Business Information', {
            'fields': (
                'business_name', 'business_type',
                'business_registration', 'business_start_date',
                'number_of_employees',
            ),
            'classes': ('collapse',)
        }),
        ('Verification', {
            'fields': (
                'is_verified', 'verification_date',
                'verification_method', 'verification_notes',
            ),
            'classes': ('collapse',)
        }),
        ('Documents', {
            'fields': ('employment_letter', 'pay_slips', 'business_permit'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    """Admin interface for Customer model."""
    
    list_display = [
        'customer_number',
        'full_name',
        'phone_number',
        'id_number',
        'county',
        'status',
        'risk_level',
        'credit_score',
        'total_loans_display',
        'active_loans_display',
        'outstanding_balance_display',
        'created_at',
    ]
    
    list_filter = [
        'status',
        'gender',
        'marital_status',
        'county',
        'risk_level',
        'created_at',
    ]
    
    search_fields = [
        'customer_number',
        'first_name',
        'last_name',
        'middle_name',
        'id_number',
        'phone_number',
        'email',
    ]
    
    readonly_fields = [
        'customer_number',
        'registration_date',
        'last_updated',
        'age_display',
        'total_loans_display',
        'active_loans_display',
        'outstanding_balance_display',
        'loan_performance_display',
        'created_by_link',
        'updated_by_link',
        'referred_by_link',
        'user_account_link',
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'customer_number',
                ('first_name', 'middle_name', 'last_name'),
                ('date_of_birth', 'age_display'),
                ('gender', 'marital_status'),
            )
        }),
        ('Identification', {
            'fields': (
                'id_type',
                'id_number',
                'id_expiry_date',
                'nationality',
            )
        }),
        ('Contact Information', {
            'fields': (
                'phone_number',
                'email',
            )
        }),
        ('Address Information', {
            'fields': (
                'postal_address',
                'physical_address',
                ('county', 'sub_county', 'ward'),
            )
        }),
        ('Bank Information', {
            'fields': (
                'bank_name',
                'bank_account_number',
                'bank_branch',
            ),
            'classes': ('collapse',)
        }),
        ('Customer Details', {
            'fields': (
                'status',
                ('credit_score', 'risk_level'),
                'registration_date',
                'last_updated',
            )
        }),
        ('Loan Information', {
            'fields': (
                'total_loans_display',
                'active_loans_display',
                'outstanding_balance_display',
                'loan_performance_display',
            )
        }),
        ('Documents', {
            'fields': (
                'id_document',
                'passport_photo',
                'signature',
            ),
            'classes': ('collapse',)
        }),
        ('Relationships', {
            'fields': (
                'user_account_link',
                'referred_by_link',
                'created_by_link',
                'updated_by_link',
            ),
            'classes': ('collapse',)
        }),
        ('Notes', {
            'fields': ('notes',),
            'classes': ('wide',)
        }),
    )
    
    inlines = [GuarantorInline, EmploymentInline]
    
    actions = [
        'blacklist_customers',
        'activate_customers',
        'export_to_excel',
        'calculate_credit_scores',
    ]
    
    def get_queryset(self, request):
        """Optimize queryset with related data."""
        queryset = super().get_queryset(request)
        queryset = queryset.select_related(
            'user', 'referred_by', 'created_by', 'updated_by'
        ).prefetch_related('guarantors', 'loans')
        
        # Add annotations for loan statistics
        from apps.loans.models import Loan
        from django.db.models import Count, Sum, Q
        
        queryset = queryset.annotate(
            total_loans_count=Count('loans'),
            active_loans_count=Count('loans', filter=Q(loans__status__in=['ACTIVE', 'APPROVED'])),
            total_outstanding=Sum('loans__outstanding_balance', filter=Q(loans__status__in=['ACTIVE', 'APPROVED', 'OVERDUE'])),
        )
        
        return queryset
    
    def full_name(self, obj):
        """Display full name."""
        return obj.full_name
    full_name.short_description = 'Full Name'
    full_name.admin_order_field = 'last_name'
    
    def age_display(self, obj):
        """Display age."""
        return f"{obj.age} years"
    age_display.short_description = 'Age'
    
    def total_loans_display(self, obj):
        """Display total loans count."""
        if hasattr(obj, 'total_loans_count'):
            count = obj.total_loans_count
        else:
            count = obj.total_loans
        
        if count > 0:
            url = reverse('admin:loans_loan_changelist') + f'?customer__id__exact={obj.id}'
            return format_html('<a href="{}">{}</a>', url, count)
        return count
    total_loans_display.short_description = 'Total Loans'
    total_loans_display.admin_order_field = 'total_loans_count'
    
    def active_loans_display(self, obj):
        """Display active loans count."""
        if hasattr(obj, 'active_loans_count'):
            count = obj.active_loans_count
        else:
            count = obj.active_loans
        
        if count > 0:
            url = reverse('admin:loans_loan_changelist') + f'?customer__id__exact={obj.id}&status__exact=ACTIVE'
            return format_html('<a href="{}">{}</a>', url, count)
        return count
    active_loans_display.short_description = 'Active Loans'
    active_loans_display.admin_order_field = 'active_loans_count'
    
    def outstanding_balance_display(self, obj):
        """Display outstanding balance."""
        if hasattr(obj, 'total_outstanding'):
            amount = obj.total_outstanding or 0
        else:
            amount = obj.outstanding_balance
        
        if amount > 0:
            return f"KES {amount:,.2f}"
        return "KES 0.00"
    outstanding_balance_display.short_description = 'Outstanding Balance'
    outstanding_balance_display.admin_order_field = 'total_outstanding'
    
    def loan_performance_display(self, obj):
        """Display loan performance percentage."""
        performance = obj.loan_performance
        
        if performance >= 90:
            color = 'green'
        elif performance >= 70:
            color = 'orange'
        else:
            color = 'red'
        
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}%</span>',
            color,
            f"{performance:.1f}"
        )
    loan_performance_display.short_description = 'Loan Performance'
    
    def created_by_link(self, obj):
        """Link to user who created the customer."""
        if obj.created_by:
            url = reverse('admin:users_user_change', args=[obj.created_by.id])
            return format_html('<a href="{}">{}</a>', url, obj.created_by.get_full_name())
        return "-"
    created_by_link.short_description = 'Created By'
    
    def updated_by_link(self, obj):
        """Link to user who last updated the customer."""
        if obj.updated_by:
            url = reverse('admin:users_user_change', args=[obj.updated_by.id])
            return format_html('<a href="{}">{}</a>', url, obj.updated_by.get_full_name())
        return "-"
    updated_by_link.short_description = 'Updated By'
    
    def referred_by_link(self, obj):
        """Link to referring customer."""
        if obj.referred_by:
            url = reverse('admin:customers_customer_change', args=[obj.referred_by.id])
            return format_html('<a href="{}">{}</a>', url, obj.referred_by.full_name)
        return "-"
    referred_by_link.short_description = 'Referred By'
    
    def user_account_link(self, obj):
        """Link to user account."""
        if obj.user:
            url = reverse('admin:users_user_change', args=[obj.user.id])
            return format_html('<a href="{}">{}</a>', url, obj.user.username)
        return "No user account"
    user_account_link.short_description = 'User Account'
    
    def save_model(self, request, obj, form, change):
        """Save model with audit trail."""
        if not change:  # Creating new customer
            obj.created_by = request.user
        else:  # Updating existing customer
            obj.updated_by = request.user
        
        # Validate customer data
        validator = CustomerValidator(form.cleaned_data)
        if not validator.validate():
            from django.core.exceptions import ValidationError
            raise ValidationError(validator.errors)
        
        super().save_model(request, obj, form, change)
    
    def blacklist_customers(self, request, queryset):
        """Admin action to blacklist customers."""
        count = queryset.count()
        for customer in queryset:
            customer.blacklist(f"Blacklisted by admin {request.user.get_full_name()}")
        
        self.message_user(
            request,
            f"Successfully blacklisted {count} customer(s)."
        )
    blacklist_customers.short_description = "Blacklist selected customers"
    
    def activate_customers(self, request, queryset):
        """Admin action to activate customers."""
        count = 0
        for customer in queryset:
            if customer.status != 'ACTIVE':
                customer.activate()
                count += 1
        
        self.message_user(
            request,
            f"Successfully activated {count} customer(s)."
        )
    activate_customers.short_description = "Activate selected customers"
    
    def export_to_excel(self, request, queryset):
        """Admin action to export customers to Excel."""
        import pandas as pd
        import io
        
        data = []
        for customer in queryset:
            data.append({
                'Customer Number': customer.customer_number,
                'Full Name': customer.full_name,
                'ID Number': customer.id_number,
                'Phone Number': customer.phone_number,
                'Email': customer.email,
                'Gender': customer.get_gender_display(),
                'Status': customer.get_status_display(),
                'County': customer.county,
                'Registration Date': customer.registration_date.strftime('%Y-%m-%d'),
            })
        
        df = pd.DataFrame(data)
        output = io.BytesIO()
        
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Customers', index=False)
        
        response = HttpResponse(
            output.getvalue(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename="customers_export.xlsx"'
        
        self.message_user(request, f"Exported {len(data)} customers to Excel.")
        return response
    export_to_excel.short_description = "Export selected customers to Excel"
    
    def calculate_credit_scores(self, request, queryset):
        """Admin action to calculate credit scores."""
        from apps.core.utils.credit_scoring import calculate_credit_score
        
        updated = 0
        for customer in queryset:
            try:
                score = calculate_credit_score(customer)
                customer.update_credit_score(score)
                updated += 1
            except Exception as e:
                self.message_user(
                    request,
                    f"Error calculating score for {customer.customer_number}: {str(e)}",
                    level='error'
                )
        
        self.message_user(
            request,
            f"Successfully calculated credit scores for {updated} customer(s)."
        )
    calculate_credit_scores.short_description = "Calculate credit scores"


@admin.register(Guarantor)
class GuarantorAdmin(admin.ModelAdmin):
    """Admin interface for Guarantor model."""
    
    list_display = [
        'full_name',
        'customer_link',
        'phone_number',
        'id_number',
        'relationship',
        'monthly_income_display',
        'verification_status',
        'is_active',
        'created_at',
    ]
    
    list_filter = [
        'verification_status',
        'is_active',
        'guarantor_type',
        'relationship',
        'created_at',
    ]
    
    search_fields = [
        'first_name',
        'last_name',
        'id_number',
        'phone_number',
        'customer__customer_number',
        'customer__first_name',
        'customer__last_name',
    ]
    
    readonly_fields = [
        'verification_date',
        'is_verified_display',
        'customer_link',
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'customer_link',
                ('first_name', 'middle_name', 'last_name'),
                'phone_number',
                'email',
            )
        }),
        ('Address Information', {
            'fields': (
                'physical_address',
                'county',
            )
        }),
        ('Identification', {
            'fields': (
                'id_type',
                'id_number',
            )
        }),
        ('Guarantor Details', {
            'fields': (
                'guarantor_type',
                'relationship',
                'occupation',
                'employer',
                'monthly_income',
            )
        }),
        ('Verification Status', {
            'fields': (
                'verification_status',
                'is_verified_display',
                'verification_date',
                'verification_notes',
            )
        }),
        ('Documents', {
            'fields': (
                'id_document',
                'passport_photo',
            ),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': (
                'is_active',
                'notes',
            )
        }),
    )
    
    actions = [
        'verify_guarantors',
        'reject_guarantors',
        'deactivate_guarantors',
    ]
    
    def customer_link(self, obj):
        """Link to customer."""
        url = reverse('admin:customers_customer_change', args=[obj.customer.id])
        return format_html('<a href="{}">{}</a>', url, obj.customer.full_name)
    customer_link.short_description = 'Customer'
    
    def full_name(self, obj):
        """Display full name."""
        return obj.full_name
    full_name.short_description = 'Full Name'
    full_name.admin_order_field = 'last_name'
    
    def monthly_income_display(self, obj):
        """Display monthly income formatted."""
        return f"KES {obj.monthly_income:,.2f}"
    monthly_income_display.short_description = 'Monthly Income'
    monthly_income_display.admin_order_field = 'monthly_income'
    
    def is_verified_display(self, obj):
        """Display verification status with color."""
        if obj.is_verified:
            return format_html(
                '<span style="color: green; font-weight: bold;">✓ Verified</span>'
            )
        elif obj.verification_status == 'REJECTED':
            return format_html(
                '<span style="color: red; font-weight: bold;">✗ Rejected</span>'
            )
        else:
            return format_html(
                '<span style="color: orange; font-weight: bold;">● Pending</span>'
            )
    is_verified_display.short_description = 'Verification Status'
    
    def verify_guarantors(self, request, queryset):
        """Admin action to verify guarantors."""
        count = queryset.count()
        for guarantor in queryset:
            guarantor.verify(f"Verified by admin {request.user.get_full_name()}")
        
        self.message_user(
            request,
            f"Successfully verified {count} guarantor(s)."
        )
    verify_guarantors.short_description = "Verify selected guarantors"
    
    def reject_guarantors(self, request, queryset):
        """Admin action to reject guarantors."""
        count = queryset.count()
        for guarantor in queryset:
            guarantor.reject(f"Rejected by admin {request.user.get_full_name()}")
        
        self.message_user(
            request,
            f"Successfully rejected {count} guarantor(s)."
        )
    reject_guarantors.short_description = "Reject selected guarantors"
    
    def deactivate_guarantors(self, request, queryset):
        """Admin action to deactivate guarantors."""
        count = queryset.count()
        for guarantor in queryset:
            guarantor.deactivate()
        
        self.message_user(
            request,
            f"Successfully deactivated {count} guarantor(s)."
        )
    deactivate_guarantors.short_description = "Deactivate selected guarantors"


@admin.register(Employment)
class EmploymentAdmin(admin.ModelAdmin):
    """Admin interface for Employment model."""
    
    list_display = [
        'customer_link',
        'employment_type',
        'employer_name',
        'occupation',
        'total_monthly_income_display',
        'is_verified',
        'created_at',
    ]
    
    list_filter = [
        'employment_type',
        'sector',
        'is_verified',
        'created_at',
    ]
    
    search_fields = [
        'customer__customer_number',
        'customer__first_name',
        'customer__last_name',
        'employer_name',
        'occupation',
        'business_name',
    ]
    
    readonly_fields = [
        'customer_link',
        'total_monthly_income',
        'years_of_service',
        'employment_status_display',
        'verification_date',
    ]
    
    fieldsets = (
        ('Customer Information', {
            'fields': (
                'customer_link',
                'employment_status_display',
            )
        }),
        ('Employment Details', {
            'fields': (
                'employment_type',
                'sector',
                'occupation',
                'employer_name',
                'employer_address',
                'job_title',
                'department',
                'employee_number',
                'date_employed',
                'years_of_service',
            )
        }),
        ('Income Information', {
            'fields': (
                'monthly_income',
                'other_income',
                'total_monthly_income',
                'payment_frequency',
                'next_pay_date',
            )
        }),
        ('Business Information', {
            'fields': (
                'business_name',
                'business_type',
                'business_registration',
                'business_start_date',
                'number_of_employees',
            ),
            'classes': ('collapse',)
        }),
        ('Verification', {
            'fields': (
                'is_verified',
                'verification_date',
                'verification_method',
                'verification_notes',
            )
        }),
        ('Documents', {
            'fields': (
                'employment_letter',
                'pay_slips',
                'business_permit',
            ),
            'classes': ('collapse',)
        }),
        ('Notes', {
            'fields': ('notes',),
            'classes': ('wide',)
        }),
    )
    
    actions = [
        'verify_employment',
        'calculate_years_of_service',
    ]
    
    def customer_link(self, obj):
        """Link to customer."""
        url = reverse('admin:customers_customer_change', args=[obj.customer.id])
        return format_html('<a href="{}">{}</a>', url, obj.customer.full_name)
    customer_link.short_description = 'Customer'
    
    def employment_status_display(self, obj):
        """Display employment status."""
        return obj.employment_status
    employment_status_display.short_description = 'Employment Status'
    
    def total_monthly_income_display(self, obj):
        """Display total monthly income formatted."""
        return f"KES {obj.total_monthly_income:,.2f}"
    total_monthly_income_display.short_description = 'Total Income'
    total_monthly_income_display.admin_order_field = 'total_monthly_income'
    
    def verify_employment(self, request, queryset):
        """Admin action to verify employment."""
        count = queryset.count()
        for employment in queryset:
            employment.verify_employment(
                method='ADMIN',
                notes=f"Verified by admin {request.user.get_full_name()}"
            )
        
        self.message_user(
            request,
            f"Successfully verified {count} employment record(s)."
        )
    verify_employment.short_description = "Verify selected employment records"
    
    def calculate_years_of_service(self, request, queryset):
        """Admin action to calculate years of service."""
        count = 0
        for employment in queryset:
            if employment.date_employed:
                employment.save()  # This triggers years_of_service calculation
                count += 1
        
        self.message_user(
            request,
            f"Successfully calculated years of service for {count} record(s)."
        )
    calculate_years_of_service.short_description = "Calculate years of service"