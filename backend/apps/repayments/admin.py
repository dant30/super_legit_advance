# backend/apps/repayments/admin.py
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.db.models import Count, Sum, Q
from django.utils import timezone
from .models import Repayment, RepaymentSchedule, Penalty
from apps.repayments.calculators.repayment_calculator import RepaymentCalculator


class RepaymentScheduleInline(admin.TabularInline):
    """Inline for repayment schedules."""
    model = RepaymentSchedule
    extra = 0
    readonly_fields = ['amount_outstanding', 'days_overdue', 'payment_percentage']
    fields = [
        'installment_number',
        'due_date',
        'principal_amount',
        'interest_amount',
        'total_amount',
        'amount_paid',
        'amount_outstanding',
        'status',
        'days_overdue',
        'payment_percentage',
    ]
    ordering = ['installment_number']


class PenaltyInline(admin.TabularInline):
    """Inline for penalties."""
    model = Penalty
    extra = 0
    readonly_fields = ['amount_outstanding', 'days_until_due']
    fields = [
        'penalty_number',
        'penalty_type',
        'amount',
        'amount_paid',
        'amount_outstanding',
        'status',
        'applied_date',
        'due_date',
        'days_until_due',
    ]
    ordering = ['-applied_date']


@admin.register(Repayment)
class RepaymentAdmin(admin.ModelAdmin):
    """Admin interface for Repayment model."""
    
    list_display = [
        'repayment_number',
        'loan_link',
        'customer_link',
        'amount_due_display',
        'amount_paid_display',
        'amount_outstanding_display',
        'payment_status_display',
        'due_date',
        'payment_date',
        'days_overdue',
        'payment_method_display',
        'collected_by_display',
        'created_at',
    ]
    
    list_filter = [
        'status',
        'payment_method',
        'repayment_type',
        'due_date',
        'payment_date',
        'collected_by',
        'created_at',
    ]
    
    search_fields = [
        'repayment_number',
        'loan__loan_number',
        'customer__customer_number',
        'customer__first_name',
        'customer__last_name',
        'payment_reference',
        'transaction_id',
    ]
    
    readonly_fields = [
        'repayment_number',
        'amount_outstanding',
        'days_overdue',
        'is_paid_display',
        'is_overdue_display',
        'payment_percentage_display',
        'loan_link',
        'customer_link',
        'collected_by_display',
        'verified_by_display',
        'mpesa_payment_link',
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'repayment_number',
                'loan_link',
                'customer_link',
            )
        }),
        ('Amount Information', {
            'fields': (
                ('amount_due', 'amount_paid', 'amount_outstanding'),
                ('principal_amount', 'interest_amount'),
                ('penalty_amount', 'fee_amount'),
            )
        }),
        ('Payment Details', {
            'fields': (
                'payment_method',
                'repayment_type',
                'status',
                ('due_date', 'payment_date', 'days_overdue'),
                ('payment_reference', 'transaction_id', 'receipt_number'),
            )
        }),
        ('Payment Status', {
            'fields': (
                'is_paid_display',
                'is_overdue_display',
                'payment_percentage_display',
            )
        }),
        ('Verification & Collection', {
            'fields': (
                'collected_by_display',
                'verified_by_display',
                'verification_date',
            )
        }),
        ('M-Pesa Integration', {
            'fields': ('mpesa_payment_link',),
            'classes': ('collapse',)
        }),
        ('Documents', {
            'fields': ('receipt_file',),
            'classes': ('collapse',)
        }),
        ('Notes', {
            'fields': ('notes',),
            'classes': ('wide',)
        }),
    )
    
    inlines = [PenaltyInline]
    
    actions = [
        'mark_as_completed',
        'apply_late_fee',
        'send_payment_reminders',
        'export_to_excel',
    ]
    
    def get_queryset(self, request):
        """Optimize queryset with related data."""
        queryset = super().get_queryset(request)
        queryset = queryset.select_related(
            'loan', 'customer', 'collected_by', 'verified_by', 'mpesa_payment'
        )
        return queryset
    
    def loan_link(self, obj):
        """Link to loan."""
        if obj.loan:
            url = reverse('admin:loans_loan_change', args=[obj.loan.id])
            return format_html('<a href="{}">{}</a>', url, obj.loan.loan_number)
        return "-"
    loan_link.short_description = 'Loan'
    
    def customer_link(self, obj):
        """Link to customer."""
        if obj.customer:
            url = reverse('admin:customers_customer_change', args=[obj.customer.id])
            return format_html('<a href="{}">{}</a>', url, obj.customer.full_name)
        return "-"
    customer_link.short_description = 'Customer'
    
    def amount_due_display(self, obj):
        """Display amount due formatted."""
        return f"KES {obj.amount_due:,.2f}"
    amount_due_display.short_description = 'Amount Due'
    amount_due_display.admin_order_field = 'amount_due'
    
    def amount_paid_display(self, obj):
        """Display amount paid formatted."""
        return f"KES {obj.amount_paid:,.2f}"
    amount_paid_display.short_description = 'Amount Paid'
    amount_paid_display.admin_order_field = 'amount_paid'
    
    def amount_outstanding_display(self, obj):
        """Display amount outstanding formatted."""
        amount = obj.amount_outstanding
        if amount > 0:
            return format_html(
                '<span style="color: red; font-weight: bold;">KES {:,}</span>',
                amount
            )
        return f"KES {amount:,.2f}"
    amount_outstanding_display.short_description = 'Outstanding'
    amount_outstanding_display.admin_order_field = 'amount_outstanding'
    
    def payment_status_display(self, obj):
        """Display payment status with color coding."""
        status, color = obj.payment_status
        
        color_map = {
            'success': 'green',
            'warning': 'orange',
            'danger': 'red',
            'info': 'blue',
            'primary': 'purple',
            'secondary': 'gray',
        }
        
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color_map.get(color, 'black'),
            status
        )
    payment_status_display.short_description = 'Status'
    
    def payment_method_display(self, obj):
        """Display payment method."""
        return obj.get_payment_method_display()
    payment_method_display.short_description = 'Payment Method'
    
    def collected_by_display(self, obj):
        """Display collected by user."""
        if obj.collected_by:
            url = reverse('admin:users_user_change', args=[obj.collected_by.id])
            return format_html('<a href="{}">{}</a>', url, obj.collected_by.get_full_name())
        return "-"
    collected_by_display.short_description = 'Collected By'
    
    def verified_by_display(self, obj):
        """Display verified by user."""
        if obj.verified_by:
            url = reverse('admin:users_user_change', args=[obj.verified_by.id])
            return format_html('<a href="{}">{}</a>', url, obj.verified_by.get_full_name())
        return "-"
    verified_by_display.short_description = 'Verified By'
    
    def mpesa_payment_link(self, obj):
        """Link to M-Pesa payment."""
        if obj.mpesa_payment:
            url = reverse('admin:mpesa_payment_change', args=[obj.mpesa_payment.id])
            return format_html('<a href="{}">{}</a>', url, obj.mpesa_payment.transaction_id)
        return "Not linked"
    mpesa_payment_link.short_description = 'M-Pesa Payment'
    
    def is_paid_display(self, obj):
        """Display if repayment is paid."""
        if obj.is_paid:
            return format_html(
                '<span style="color: green; font-weight: bold;">✓ Paid</span>'
            )
        return format_html(
            '<span style="color: orange; font-weight: bold;">● Not Paid</span>'
        )
    is_paid_display.short_description = 'Paid Status'
    
    def is_overdue_display(self, obj):
        """Display if repayment is overdue."""
        if obj.is_overdue:
            return format_html(
                '<span style="color: red; font-weight: bold;">⚠ Overdue</span>'
            )
        return format_html(
            '<span style="color: green; font-weight: bold;">✓ Not Overdue</span>'
        )
    is_overdue_display.short_description = 'Overdue Status'
    
    def payment_percentage_display(self, obj):
        """Display payment percentage with progress bar."""
        percentage = obj.payment_percentage
        
        if percentage >= 100:
            color = 'green'
            width = 100
        elif percentage >= 50:
            color = 'orange'
            width = percentage
        else:
            color = 'red'
            width = percentage
        
        return format_html(
            '''
            <div style="width: 100px; background-color: #f0f0f0; border-radius: 3px;">
                <div style="width: {}px; height: 20px; background-color: {}; border-radius: 3px; text-align: center; color: white; font-weight: bold; line-height: 20px;">
                    {}%
                </div>
            </div>
            ''',
            width, color, f"{percentage:.1f}"
        )
    payment_percentage_display.short_description = 'Payment Progress'
    
    def mark_as_completed(self, request, queryset):
        """Mark selected repayments as completed."""
        count = queryset.count()
        for repayment in queryset:
            if repayment.status != 'COMPLETED':
                repayment.amount_paid = repayment.amount_due
                repayment.status = 'COMPLETED'
                repayment.payment_date = timezone.now()
                repayment.collected_by = request.user
                repayment.save()
        
        self.message_user(
            request,
            f"Successfully marked {count} repayment(s) as completed."
        )
    mark_as_completed.short_description = "Mark as completed"
    
    def apply_late_fee(self, request, queryset):
        """Apply late fee to selected repayments."""
        count = 0
        for repayment in queryset:
            if repayment.status == 'OVERDUE' and not repayment.late_fee_applied:
                # Calculate late fee (5% of amount due)
                late_fee = repayment.amount_due * 0.05
                repayment.apply_penalty(late_fee, "Late payment fee")
                count += 1
        
        self.message_user(
            request,
            f"Successfully applied late fees to {count} repayment(s)."
        )
    apply_late_fee.short_description = "Apply late fee"
    
    def send_payment_reminders(self, request, queryset):
        """Send payment reminders for selected repayments."""
        count = 0
        for repayment in queryset:
            if repayment.status in ['PENDING', 'OVERDUE', 'PARTIAL']:
                # Here you would integrate with your SMS service
                # For now, just log the action
                import logging
                logger = logging.getLogger(__name__)
                logger.info(f"Reminder sent for repayment {repayment.repayment_number}")
                count += 1
        
        self.message_user(
            request,
            f"Payment reminders sent for {count} repayment(s)."
        )
    send_payment_reminders.short_description = "Send payment reminders"
    
    def export_to_excel(self, request, queryset):
        """Export selected repayments to Excel."""
        import pandas as pd
        import io
        
        data = []
        for repayment in queryset:
            data.append({
                'Repayment Number': repayment.repayment_number,
                'Loan Number': repayment.loan.loan_number if repayment.loan else '',
                'Customer': repayment.customer.full_name if repayment.customer else '',
                'Amount Due': float(repayment.amount_due),
                'Amount Paid': float(repayment.amount_paid),
                'Status': repayment.get_status_display(),
                'Due Date': repayment.due_date.strftime('%Y-%m-%d') if repayment.due_date else '',
                'Payment Date': repayment.payment_date.strftime('%Y-%m-%d %H:%M') if repayment.payment_date else '',
                'Payment Method': repayment.get_payment_method_display(),
                'Collected By': repayment.collected_by.get_full_name() if repayment.collected_by else '',
            })
        
        df = pd.DataFrame(data)
        output = io.BytesIO()
        
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Repayments', index=False)
        
        response = HttpResponse(
            output.getvalue(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename="repayments_export.xlsx"'
        
        self.message_user(request, f"Exported {len(data)} repayments to Excel.")
        return response
    export_to_excel.short_description = "Export to Excel"


@admin.register(RepaymentSchedule)
class RepaymentScheduleAdmin(admin.ModelAdmin):
    """Admin interface for RepaymentSchedule model."""
    
    list_display = [
        'loan_link',
        'installment_number',
        'due_date',
        'total_amount_display',
        'amount_paid_display',
        'amount_outstanding_display',
        'status_display',
        'days_overdue',
        'payment_percentage_display',
        'is_adjusted_display',
    ]
    
    list_filter = [
        'status',
        'is_adjusted',
        'due_date',
        'loan',
        'created_at',
    ]
    
    search_fields = [
        'loan__loan_number',
        'customer__customer_number',
        'customer__first_name',
        'customer__last_name',
    ]
    
    readonly_fields = [
        'amount_outstanding',
        'days_overdue',
        'payment_percentage_display',
        'remaining_balance_display',
        'loan_link',
        'customer_link',
        'repayment_link',
        'is_paid_display',
        'is_overdue_display',
        'is_upcoming_display',
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'loan_link',
                'customer_link',
                'installment_number',
                'due_date',
                ('original_due_date', 'original_amount'),
            )
        }),
        ('Amount Information', {
            'fields': (
                ('principal_amount', 'interest_amount'),
                'total_amount',
                ('amount_paid', 'amount_outstanding', 'late_fee'),
            )
        }),
        ('Status Information', {
            'fields': (
                'status',
                'payment_date',
                'days_overdue',
                'is_paid_display',
                'is_overdue_display',
                'is_upcoming_display',
                'payment_percentage_display',
                'remaining_balance_display',
            )
        }),
        ('Adjustment Information', {
            'fields': (
                'is_adjusted',
                'adjustment_reason',
            ),
            'classes': ('collapse',)
        }),
        ('Linked Repayment', {
            'fields': ('repayment_link',),
            'classes': ('collapse',)
        }),
        ('Notes', {
            'fields': ('notes',),
            'classes': ('wide',)
        }),
    )
    
    actions = [
        'mark_as_paid',
        'apply_late_fee_to_schedule',
        'adjust_due_dates',
    ]
    
    def loan_link(self, obj):
        """Link to loan."""
        if obj.loan:
            url = reverse('admin:loans_loan_change', args=[obj.loan.id])
            return format_html('<a href="{}">{}</a>', url, obj.loan.loan_number)
        return "-"
    loan_link.short_description = 'Loan'
    
    def customer_link(self, obj):
        """Link to customer."""
        if obj.customer:
            url = reverse('admin:customers_customer_change', args=[obj.customer.id])
            return format_html('<a href="{}">{}</a>', url, obj.customer.full_name)
        return "-"
    customer_link.short_description = 'Customer'
    
    def repayment_link(self, obj):
        """Link to repayment."""
        if obj.repayment:
            url = reverse('admin:repayments_repayment_change', args=[obj.repayment.id])
            return format_html('<a href="{}">{}</a>', url, obj.repayment.repayment_number)
        return "Not linked"
    repayment_link.short_description = 'Repayment'
    
    def total_amount_display(self, obj):
        """Display total amount formatted."""
        return f"KES {obj.total_amount:,.2f}"
    total_amount_display.short_description = 'Total Amount'
    total_amount_display.admin_order_field = 'total_amount'
    
    def amount_paid_display(self, obj):
        """Display amount paid formatted."""
        return f"KES {obj.amount_paid:,.2f}"
    amount_paid_display.short_description = 'Amount Paid'
    amount_paid_display.admin_order_field = 'amount_paid'
    
    def amount_outstanding_display(self, obj):
        """Display amount outstanding formatted."""
        amount = obj.amount_outstanding
        if amount > 0:
            return format_html(
                '<span style="color: red; font-weight: bold;">KES {:,}</span>',
                amount
            )
        return f"KES {amount:,.2f}"
    amount_outstanding_display.short_description = 'Outstanding'
    amount_outstanding_display.admin_order_field = 'amount_outstanding'
    
    def status_display(self, obj):
        """Display status with color coding."""
        status_map = {
            'PAID': ('green', '✓ Paid'),
            'PENDING': ('orange', '● Pending'),
            'OVERDUE': ('red', '⚠ Overdue'),
            'SKIPPED': ('blue', '↷ Skipped'),
            'ADJUSTED': ('purple', '✎ Adjusted'),
            'CANCELLED': ('gray', '✗ Cancelled'),
        }
        
        color, display = status_map.get(obj.status, ('black', obj.status))
        
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, display
        )
    status_display.short_description = 'Status'
    
    def payment_percentage_display(self, obj):
        """Display payment percentage."""
        percentage = obj.payment_percentage
        
        if percentage >= 100:
            color = 'green'
            text = f"{percentage:.1f}%"
        elif percentage >= 50:
            color = 'orange'
            text = f"{percentage:.1f}%"
        else:
            color = 'red'
            text = f"{percentage:.1f}%"
        
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, text
        )
    payment_percentage_display.short_description = 'Paid %'
    
    def remaining_balance_display(self, obj):
        """Display remaining balance."""
        balance = obj.get_remaining_balance()
        return f"KES {balance:,.2f}"
    remaining_balance_display.short_description = 'Remaining Balance'
    
    def is_paid_display(self, obj):
        """Display if installment is paid."""
        if obj.is_paid:
            return format_html(
                '<span style="color: green; font-weight: bold;">✓ Paid</span>'
            )
        return format_html(
            '<span style="color: orange; font-weight: bold;">● Not Paid</span>'
        )
    is_paid_display.short_description = 'Paid Status'
    
    def is_overdue_display(self, obj):
        """Display if installment is overdue."""
        if obj.is_overdue:
            return format_html(
                '<span style="color: red; font-weight: bold;">⚠ Overdue</span>'
            )
        return format_html(
            '<span style="color: green; font-weight: bold;">✓ Not Overdue</span>'
        )
    is_overdue_display.short_description = 'Overdue Status'
    
    def is_upcoming_display(self, obj):
        """Display if installment is upcoming."""
        if obj.is_upcoming:
            return format_html(
                '<span style="color: blue; font-weight: bold;">↑ Upcoming</span>'
            )
        return format_html(
            '<span style="color: gray; font-weight: bold;">○ Not Upcoming</span>'
        )
    is_upcoming_display.short_description = 'Upcoming Status'
    
    def is_adjusted_display(self, obj):
        """Display if installment is adjusted."""
        if obj.is_adjusted:
            return format_html(
                '<span style="color: purple; font-weight: bold;">✎ Adjusted</span>'
            )
        return "-"
    is_adjusted_display.short_description = 'Adjusted'
    
    def mark_as_paid(self, request, queryset):
        """Mark selected schedule items as paid."""
        count = 0
        for schedule in queryset:
            if schedule.status != 'PAID':
                schedule.amount_paid = schedule.total_amount
                schedule.status = 'PAID'
                schedule.payment_date = timezone.now().date()
                schedule.save()
                count += 1
        
        self.message_user(
            request,
            f"Successfully marked {count} schedule item(s) as paid."
        )
    mark_as_paid.short_description = "Mark as paid"
    
    def apply_late_fee_to_schedule(self, request, queryset):
        """Apply late fee to selected schedule items."""
        count = 0
        for schedule in queryset:
            if schedule.status == 'OVERDUE' and schedule.days_overdue > 0:
                # Calculate late fee (1% per day overdue)
                late_fee = schedule.total_amount * 0.01 * schedule.days_overdue
                schedule.apply_late_fee(late_fee, "Late payment fee")
                count += 1
        
        self.message_user(
            request,
            f"Successfully applied late fees to {count} schedule item(s)."
        )
    apply_late_fee_to_schedule.short_description = "Apply late fee"
    
    def adjust_due_dates(self, request, queryset):
        """Adjust due dates for selected schedule items."""
        days_to_add = request.POST.get('days_to_add', 7)
        
        try:
            days_to_add = int(days_to_add)
        except ValueError:
            self.message_user(request, "Invalid number of days.", level='error')
            return
        
        count = 0
        for schedule in queryset:
            new_due_date = schedule.due_date + timezone.timedelta(days=days_to_add)
            schedule.adjust_schedule(
                new_due_date=new_due_date,
                reason=f"Bulk adjustment: +{days_to_add} days"
            )
            count += 1
        
        self.message_user(
            request,
            f"Successfully adjusted due dates for {count} schedule item(s)."
        )
    adjust_due_dates.short_description = "Adjust due dates"


@admin.register(Penalty)
class PenaltyAdmin(admin.ModelAdmin):
    """Admin interface for Penalty model."""
    
    list_display = [
        'penalty_number',
        'loan_link',
        'customer_link',
        'penalty_type_display',
        'amount_display',
        'amount_paid_display',
        'amount_outstanding_display',
        'status_display',
        'applied_date',
        'due_date',
        'days_until_due_display',
        'applied_by_display',
    ]
    
    list_filter = [
        'status',
        'penalty_type',
        'applied_date',
        'due_date',
        'applied_by',
        'created_at',
    ]
    
    search_fields = [
        'penalty_number',
        'loan__loan_number',
        'customer__customer_number',
        'customer__first_name',
        'customer__last_name',
        'reason',
    ]
    
    readonly_fields = [
        'penalty_number',
        'amount_outstanding',
        'days_until_due_display',
        'loan_link',
        'customer_link',
        'repayment_link',
        'applied_by_display',
        'waived_by_display',
        'is_paid_display',
        'is_overdue_display',
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'penalty_number',
                'loan_link',
                'customer_link',
                'repayment_link',
                'penalty_type',
                'reason',
            )
        }),
        ('Amount Information', {
            'fields': (
                'amount',
                ('amount_paid', 'amount_outstanding'),
                ('calculation_method', 'calculation_rate'),
                ('days_overdue', 'base_amount'),
            )
        }),
        ('Date Information', {
            'fields': (
                'applied_date',
                'due_date',
                'paid_date',
                'days_until_due_display',
            )
        }),
        ('Status Information', {
            'fields': (
                'status',
                'is_paid_display',
                'is_overdue_display',
            )
        }),
        ('Waiver Information', {
            'fields': (
                'waived_by_display',
                'waiver_reason',
                'waiver_date',
            ),
            'classes': ('collapse',)
        }),
        ('Applied By', {
            'fields': ('applied_by_display',),
            'classes': ('collapse',)
        }),
        ('Notes', {
            'fields': ('notes',),
            'classes': ('wide',)
        }),
    )
    
    actions = [
        'apply_penalties',
        'waive_penalties',
        'mark_as_paid',
    ]
    
    def loan_link(self, obj):
        """Link to loan."""
        if obj.loan:
            url = reverse('admin:loans_loan_change', args=[obj.loan.id])
            return format_html('<a href="{}">{}</a>', url, obj.loan.loan_number)
        return "-"
    loan_link.short_description = 'Loan'
    
    def customer_link(self, obj):
        """Link to customer."""
        if obj.customer:
            url = reverse('admin:customers_customer_change', args=[obj.customer.id])
            return format_html('<a href="{}">{}</a>', url, obj.customer.full_name)
        return "-"
    customer_link.short_description = 'Customer'
    
    def repayment_link(self, obj):
        """Link to repayment."""
        if obj.repayment:
            url = reverse('admin:repayments_repayment_change', args=[obj.repayment.id])
            return format_html('<a href="{}">{}</a>', url, obj.repayment.repayment_number)
        return "Not linked"
    repayment_link.short_description = 'Repayment'
    
    def penalty_type_display(self, obj):
        """Display penalty type."""
        return obj.get_penalty_type_display()
    penalty_type_display.short_description = 'Type'
    
    def amount_display(self, obj):
        """Display penalty amount formatted."""
        return f"KES {obj.amount:,.2f}"
    amount_display.short_description = 'Amount'
    amount_display.admin_order_field = 'amount'
    
    def amount_paid_display(self, obj):
        """Display amount paid formatted."""
        return f"KES {obj.amount_paid:,.2f}"
    amount_paid_display.short_description = 'Amount Paid'
    amount_paid_display.admin_order_field = 'amount_paid'
    
    def amount_outstanding_display(self, obj):
        """Display amount outstanding formatted."""
        amount = obj.amount_outstanding
        if amount > 0:
            return format_html(
                '<span style="color: red; font-weight: bold;">KES {:,}</span>',
                amount
            )
        return f"KES {amount:,.2f}"
    amount_outstanding_display.short_description = 'Outstanding'
    amount_outstanding_display.admin_order_field = 'amount_outstanding'
    
    def status_display(self, obj):
        """Display status with color coding."""
        status_map = {
            'PENDING': ('orange', '● Pending'),
            'APPLIED': ('blue', '✓ Applied'),
            'WAIVED': ('green', '✓ Waived'),
            'CANCELLED': ('gray', '✗ Cancelled'),
            'PAID': ('green', '✓ Paid'),
        }
        
        color, display = status_map.get(obj.status, ('black', obj.status))
        
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, display
        )
    status_display.short_description = 'Status'
    
    def days_until_due_display(self, obj):
        """Display days until due."""
        days = obj.days_until_due
        
        if days is None:
            return "-"
        elif days < 0:
            return format_html(
                '<span style="color: red; font-weight: bold;">Overdue by {} days</span>',
                abs(days)
            )
        elif days == 0:
            return format_html(
                '<span style="color: orange; font-weight: bold;">Due today</span>'
            )
        else:
            return f"In {days} days"
    days_until_due_display.short_description = 'Due In'
    
    def applied_by_display(self, obj):
        """Display applied by user."""
        if obj.applied_by:
            url = reverse('admin:users_user_change', args=[obj.applied_by.id])
            return format_html('<a href="{}">{}</a>', url, obj.applied_by.get_full_name())
        return "-"
    applied_by_display.short_description = 'Applied By'
    
    def waived_by_display(self, obj):
        """Display waived by user."""
        if obj.waived_by:
            url = reverse('admin:users_user_change', args=[obj.waived_by.id])
            return format_html('<a href="{}">{}</a>', url, obj.waived_by.get_full_name())
        return "-"
    waived_by_display.short_description = 'Waived By'
    
    def is_paid_display(self, obj):
        """Display if penalty is paid."""
        if obj.is_paid:
            return format_html(
                '<span style="color: green; font-weight: bold;">✓ Paid</span>'
            )
        return format_html(
            '<span style="color: orange; font-weight: bold;">● Not Paid</span>'
        )
    is_paid_display.short_description = 'Paid Status'
    
    def is_overdue_display(self, obj):
        """Display if penalty is overdue."""
        if obj.is_overdue:
            return format_html(
                '<span style="color: red; font-weight: bold;">⚠ Overdue</span>'
            )
        return format_html(
            '<span style="color: green; font-weight: bold;">✓ Not Overdue</span>'
        )
    is_overdue_display.short_description = 'Overdue Status'
    
    def apply_penalties(self, request, queryset):
        """Apply selected penalties."""
        count = 0
        for penalty in queryset:
            if penalty.status == 'PENDING':
                penalty.apply_penalty(applied_by=request.user)
                count += 1
        
        self.message_user(
            request,
            f"Successfully applied {count} penalty(ies)."
        )
    apply_penalties.short_description = "Apply penalties"
    
    def waive_penalties(self, request, queryset):
        """Waive selected penalties."""
        reason = request.POST.get('waiver_reason', 'Administrative waiver')
        
        count = 0
        for penalty in queryset:
            if penalty.status in ['PENDING', 'APPLIED']:
                penalty.waive_penalty(
                    waiver_reason=reason,
                    waived_by=request.user
                )
                count += 1
        
        self.message_user(
            request,
            f"Successfully waived {count} penalty(ies)."
        )
    waive_penalties.short_description = "Waive penalties"
    
    def mark_as_paid(self, request, queryset):
        """Mark selected penalties as paid."""
        count = 0
        for penalty in queryset:
            if penalty.status in ['PENDING', 'APPLIED']:
                penalty.amount_paid = penalty.amount
                penalty.status = 'PAID'
                penalty.paid_date = timezone.now().date()
                penalty.save()
                count += 1
        
        self.message_user(
            request,
            f"Successfully marked {count} penalty(ies) as paid."
        )
    mark_as_paid.short_description = "Mark as paid"