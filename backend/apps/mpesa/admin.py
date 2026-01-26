# backend/apps/mpesa/admin.py
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.db.models import Count, Sum, Q
from .models import MpesaPayment, MpesaTransaction, MpesaCallback


class MpesaCallbackInline(admin.TabularInline):
    """Inline for callbacks."""
    model = MpesaCallback
    extra = 0
    readonly_fields = ['callback_type', 'result_code', 'is_processed', 'created_at']
    fields = ['callback_type', 'result_code', 'is_processed', 'has_error', 'created_at']
    can_delete = False


@admin.register(MpesaPayment)
class MpesaPaymentAdmin(admin.ModelAdmin):
    """Admin interface for MpesaPayment model."""
    
    list_display = [
        'payment_reference',
        'customer_link',
        'phone_number',
        'amount_display',
        'status_display',
        'payment_type_display',
        'initiated_at_display',
        'processing_time_display',
        'actions_column',
    ]
    
    list_filter = [
        'status',
        'payment_type',
        'transaction_type',
        'initiated_at',
    ]
    
    search_fields = [
        'payment_reference',
        'phone_number',
        'customer__customer_number',
        'customer__first_name',
        'customer__last_name',
        'loan__loan_number',
        'merchant_request_id',
        'checkout_request_id',
    ]
    
    readonly_fields = [
        'payment_reference',
        'merchant_request_id',
        'checkout_request_id',
        'result_code',
        'result_description',
        'callback_metadata_display',
        'initiated_at',
        'processed_at',
        'completed_at',
        'processing_time',
        'retry_count',
        'last_retry_at',
        'ip_address',
        'user_agent',
        'customer_link',
        'loan_link',
        'repayment_link',
        'transaction_link',
        'status_display',
        'is_successful_display',
        'formatted_amount_display',
    ]
    
    fieldsets = (
        ('Payment Information', {
            'fields': (
                'payment_reference',
                'status_display',
                'is_successful_display',
                ('customer_link', 'loan_link', 'repayment_link'),
            )
        }),
        ('Payment Details', {
            'fields': (
                'phone_number',
                'amount',
                'formatted_amount_display',
                'description',
                'payment_type',
                'transaction_type',
            )
        }),
        ('M-Pesa Details', {
            'fields': (
                'merchant_request_id',
                'checkout_request_id',
                'result_code',
                'result_description',
                'callback_metadata_display',
            )
        }),
        ('Timestamps', {
            'fields': (
                'initiated_at',
                'processed_at',
                'completed_at',
                'processing_time',
            )
        }),
        ('Error & Retry Information', {
            'fields': (
                'error_code',
                'error_message',
                'retry_count',
                'last_retry_at',
            ),
            'classes': ('collapse',)
        }),
        ('Audit Information', {
            'fields': (
                'ip_address',
                'user_agent',
            ),
            'classes': ('collapse',)
        }),
        ('Related Data', {
            'fields': (
                'transaction_link',
            ),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [MpesaCallbackInline]
    
    actions = [
        'query_payment_status',
        'retry_failed_payments',
        'export_to_excel',
    ]
    
    def get_queryset(self, request):
        """Optimize queryset."""
        queryset = super().get_queryset(request)
        queryset = queryset.select_related(
            'customer', 'loan', 'repayment'
        ).prefetch_related('callbacks')
        return queryset
    
    def customer_link(self, obj):
        """Link to customer."""
        if obj.customer:
            url = reverse('admin:customers_customer_change', args=[obj.customer.id])
            return format_html('<a href="{}">{}</a>', url, obj.customer.full_name)
        return "-"
    customer_link.short_description = 'Customer'
    
    def loan_link(self, obj):
        """Link to loan."""
        if obj.loan:
            url = reverse('admin:loans_loan_change', args=[obj.loan.id])
            return format_html('<a href="{}">{}</a>', url, obj.loan.loan_number)
        return "-"
    loan_link.short_description = 'Loan'
    
    def repayment_link(self, obj):
        """Link to repayment."""
        if obj.repayment:
            url = reverse('admin:repayments_repayment_change', args=[obj.repayment.id])
            return format_html('<a href="{}">{}</a>', url, obj.repayment.repayment_number)
        return "-"
    repayment_link.short_description = 'Repayment'
    
    def transaction_link(self, obj):
        """Link to transaction."""
        try:
            transaction = obj.transaction
            url = reverse('admin:mpesa_mpesatransaction_change', args=[transaction.id])
            return format_html('<a href="{}">{}</a>', url, transaction.mpesa_receipt_number)
        except MpesaTransaction.DoesNotExist:
            return "No transaction"
    transaction_link.short_description = 'Transaction'
    
    def amount_display(self, obj):
        """Display amount with currency."""
        return f"KES {obj.amount:,.2f}"
    amount_display.short_description = 'Amount'
    amount_display.admin_order_field = 'amount'
    
    def formatted_amount_display(self, obj):
        """Display formatted amount."""
        return obj.formatted_amount
    formatted_amount_display.short_description = 'Formatted Amount'
    
    def status_display(self, obj):
        """Display status with color coding."""
        colors = {
            'PENDING': 'orange',
            'PROCESSING': 'blue',
            'SUCCESSFUL': 'green',
            'FAILED': 'red',
            'CANCELLED': 'gray',
            'TIMEOUT': 'brown',
        }
        color = colors.get(obj.status, 'black')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_display.short_description = 'Status'
    
    def is_successful_display(self, obj):
        """Display success status."""
        if obj.is_successful:
            return format_html(
                '<span style="color: green; font-weight: bold;">✓ Successful</span>'
            )
        elif obj.is_failed:
            return format_html(
                '<span style="color: red; font-weight: bold;">✗ Failed</span>'
            )
        else:
            return format_html(
                '<span style="color: orange; font-weight: bold;">● {}</span>',
                obj.get_status_display()
            )
    is_successful_display.short_description = 'Success Status'
    
    def payment_type_display(self, obj):
        """Display payment type."""
        return obj.get_payment_type_display()
    payment_type_display.short_description = 'Payment Type'
    
    def initiated_at_display(self, obj):
        """Display initiated at in readable format."""
        return obj.initiated_at.strftime('%Y-%m-%d %H:%M')
    initiated_at_display.short_description = 'Initiated'
    initiated_at_display.admin_order_field = 'initiated_at'
    
    def processing_time_display(self, obj):
        """Display processing time."""
        time = obj.processing_time
        if time:
            if time < 60:
                return f"{time:.1f}s"
            else:
                minutes = time / 60
                return f"{minutes:.1f}m"
        return "-"
    processing_time_display.short_description = 'Processing Time'
    
    def callback_metadata_display(self, obj):
        """Display callback metadata in readable format."""
        import json
        return format_html('<pre>{}</pre>', json.dumps(obj.callback_metadata, indent=2, default=str))
    callback_metadata_display.short_description = 'Callback Metadata'
    
    def actions_column(self, obj):
        """Display action buttons."""
        buttons = []
        
        # Query status button for pending payments
        if obj.status in ['PENDING', 'PROCESSING']:
            url = reverse('admin:mpesa_query_payment_status', args=[obj.id])
            buttons.append(
                f'<a href="{url}" class="button" title="Query Status">🔄</a>'
            )
        
        # Retry button for failed payments
        if obj.can_retry():
            url = reverse('admin:mpesa_retry_payment', args=[obj.id])
            buttons.append(
                f'<a href="{url}" class="button" title="Retry Payment">↺</a>'
            )
        
        # View transaction button
        try:
            transaction = obj.transaction
            url = reverse('admin:mpesa_mpesatransaction_change', args=[transaction.id])
            buttons.append(
                f'<a href="{url}" class="button" title="View Transaction">👁️</a>'
            )
        except MpesaTransaction.DoesNotExist:
            pass
        
        return format_html(' '.join(buttons)) if buttons else "-"
    actions_column.short_description = 'Actions'
    
    def query_payment_status(self, request, queryset):
        """Admin action to query payment status from M-Pesa."""
        from apps.mpesa.services.mpesa_service import MpesaService
        
        updated = 0
        for payment in queryset.filter(status__in=['PENDING', 'PROCESSING']):
            try:
                mpesa_service = MpesaService()
                status_response = mpesa_service.query_transaction_status(
                    checkout_request_id=payment.checkout_request_id
                )
                
                if status_response.get('success', False):
                    result_code = status_response.get('result_code')
                    
                    if result_code == 0:
                        payment.mark_as_successful(
                            result_code=result_code,
                            result_description=status_response.get('result_description', '')
                        )
                    else:
                        payment.mark_as_failed(
                            error_code=str(result_code),
                            error_message=status_response.get('result_description', '')
                        )
                    
                    updated += 1
                    
            except Exception as e:
                self.message_user(
                    request,
                    f"Error querying status for {payment.payment_reference}: {str(e)}",
                    level='error'
                )
        
        self.message_user(
            request,
            f"Successfully queried status for {updated} payment(s)."
        )
    query_payment_status.short_description = "Query status from M-Pesa"
    
    def retry_failed_payments(self, request, queryset):
        """Admin action to retry failed payments."""
        from apps.mpesa.services.stk_push import STKPushService
        
        retried = 0
        for payment in queryset.filter(status='FAILED'):
            if payment.can_retry():
                try:
                    stk_service = STKPushService()
                    response = stk_service.initiate_stk_push(
                        phone_number=payment.phone_number,
                        amount=payment.amount,
                        account_reference=payment.payment_reference,
                        transaction_description=f"Retry: {payment.description}",
                        customer=payment.customer,
                        loan=payment.loan,
                        repayment=payment.repayment,
                        payment_type=payment.payment_type,
                        request=request
                    )
                    
                    if response.get('success', False):
                        payment.increment_retry()
                        retried += 1
                        
                except Exception as e:
                    self.message_user(
                        request,
                        f"Error retrying payment {payment.payment_reference}: {str(e)}",
                        level='error'
                    )
        
        self.message_user(
            request,
            f"Successfully initiated retry for {retried} payment(s)."
        )
    retry_failed_payments.short_description = "Retry failed payments"
    
    def export_to_excel(self, request, queryset):
        """Admin action to export payments to Excel."""
        import pandas as pd
        import io
        
        data = []
        for payment in queryset:
            data.append({
                'Payment Reference': payment.payment_reference,
                'Customer': payment.customer.full_name if payment.customer else '',
                'Phone Number': payment.phone_number,
                'Amount (KES)': float(payment.amount),
                'Description': payment.description,
                'Payment Type': payment.get_payment_type_display(),
                'Status': payment.get_status_display(),
                'Result Code': payment.result_code or '',
                'Result Description': payment.result_description or '',
                'Initiated At': payment.initiated_at.strftime('%Y-%m-%d %H:%M:%S'),
                'Completed At': payment.completed_at.strftime('%Y-%m-%d %H:%M:%S') if payment.completed_at else '',
                'Processing Time (s)': payment.processing_time or '',
            })
        
        df = pd.DataFrame(data)
        output = io.BytesIO()
        
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Payments', index=False)
        
        from django.http import HttpResponse
        response = HttpResponse(
            output.getvalue(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename="mpesa_payments_export.xlsx"'
        
        self.message_user(request, f"Exported {len(data)} payments to Excel.")
        return response
    export_to_excel.short_description = "Export selected payments to Excel"


@admin.register(MpesaTransaction)
class MpesaTransactionAdmin(admin.ModelAdmin):
    """Admin interface for MpesaTransaction model."""
    
    list_display = [
        'mpesa_receipt_number',
        'payment_link',
        'phone_number',
        'amount_display',
        'transaction_date_display',
        'status_display',
        'balance_display',
        'is_reversed_display',
    ]
    
    list_filter = [
        'status',
        'transaction_type',
        'transaction_date',
    ]
    
    search_fields = [
        'mpesa_receipt_number',
        'transaction_id',
        'payment__payment_reference',
        'phone_number',
        'account_reference',
    ]
    
    readonly_fields = [
        'transaction_id',
        'mpesa_receipt_number',
        'payment_link',
        'amount',
        'phone_number',
        'transaction_date',
        'status',
        'conversation_id',
        'originator_conversation_id',
        'account_reference',
        'transaction_description',
        'balance',
        'original_transaction_id',
        'reversal_reason',
        'reversed_at',
        'raw_response_display',
        'formatted_amount_display',
        'formatted_balance_display',
        'formatted_transaction_date_display',
        'is_reversed_display',
    ]
    
    fieldsets = (
        ('Transaction Information', {
            'fields': (
                'transaction_id',
                'mpesa_receipt_number',
                'payment_link',
                'status_display',
                'is_reversed_display',
            )
        }),
        ('Transaction Details', {
            'fields': (
                'amount',
                'formatted_amount_display',
                'phone_number',
                'transaction_date',
                'formatted_transaction_date_display',
                'transaction_type',
                'account_reference',
                'transaction_description',
            )
        }),
        ('Balance Information', {
            'fields': (
                'balance',
                'formatted_balance_display',
            )
        }),
        ('M-Pesa Details', {
            'fields': (
                'conversation_id',
                'originator_conversation_id',
            )
        }),
        ('Reversal Information', {
            'fields': (
                'original_transaction_id',
                'reversal_reason',
                'reversed_at',
            ),
            'classes': ('collapse',)
        }),
        ('Raw Response', {
            'fields': ('raw_response_display',),
            'classes': ('collapse',)
        }),
    )
    
    actions = [
        'validate_transactions',
        'reverse_transactions',
        'export_to_excel',
    ]
    
    def payment_link(self, obj):
        """Link to payment."""
        url = reverse('admin:mpesa_mpesapayment_change', args=[obj.payment.id])
        return format_html('<a href="{}">{}</a>', url, obj.payment.payment_reference)
    payment_link.short_description = 'Payment'
    
    def amount_display(self, obj):
        """Display amount with currency."""
        return f"KES {obj.amount:,.2f}"
    amount_display.short_description = 'Amount'
    amount_display.admin_order_field = 'amount'
    
    def formatted_amount_display(self, obj):
        """Display formatted amount."""
        return obj.formatted_amount
    formatted_amount_display.short_description = 'Formatted Amount'
    
    def balance_display(self, obj):
        """Display balance."""
        if obj.balance:
            return f"KES {obj.balance:,.2f}"
        return "N/A"
    balance_display.short_description = 'Balance'
    
    def formatted_balance_display(self, obj):
        """Display formatted balance."""
        return obj.formatted_balance
    formatted_balance_display.short_description = 'Formatted Balance'
    
    def transaction_date_display(self, obj):
        """Display transaction date."""
        return obj.transaction_date.strftime('%Y-%m-%d %H:%M')
    transaction_date_display.short_description = 'Date'
    transaction_date_display.admin_order_field = 'transaction_date'
    
    def formatted_transaction_date_display(self, obj):
        """Display formatted transaction date."""
        return obj.formatted_transaction_date
    formatted_transaction_date_display.short_description = 'Formatted Date'
    
    def status_display(self, obj):
        """Display status with color coding."""
        colors = {
            'COMPLETED': 'green',
            'REVERSED': 'red',
            'FAILED': 'gray',
        }
        color = colors.get(obj.status, 'black')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_display.short_description = 'Status'
    
    def is_reversed_display(self, obj):
        """Display reversal status."""
        if obj.is_reversed:
            return format_html(
                '<span style="color: red; font-weight: bold;">✓ REVERSED</span>'
            )
        return format_html(
            '<span style="color: green; font-weight: bold;">✓ ACTIVE</span>'
        )
    is_reversed_display.short_description = 'Reversal Status'
    
    def raw_response_display(self, obj):
        """Display raw response in readable format."""
        import json
        return format_html('<pre>{}</pre>', json.dumps(obj.raw_response, indent=2, default=str))
    raw_response_display.short_description = 'Raw Response'
    
    def validate_transactions(self, request, queryset):
        """Admin action to validate transactions with M-Pesa."""
        validated = 0
        for transaction in queryset:
            result = transaction.validate_transaction()
            
            if result.get('valid', False):
                validated += 1
            else:
                self.message_user(
                    request,
                    f"Transaction {transaction.mpesa_receipt_number} validation failed: {result.get('error', 'Unknown error')}",
                    level='warning'
                )
        
        self.message_user(
            request,
            f"Successfully validated {validated} transaction(s)."
        )
    validate_transactions.short_description = "Validate with M-Pesa"
    
    def reverse_transactions(self, request, queryset):
        """Admin action to reverse transactions."""
        reversed_count = 0
        for transaction in queryset.filter(status='COMPLETED'):
            if transaction.reverse_transaction("Admin reversal"):
                reversed_count += 1
        
        self.message_user(
            request,
            f"Successfully reversed {reversed_count} transaction(s)."
        )
    reverse_transactions.short_description = "Reverse transactions"
    
    def export_to_excel(self, request, queryset):
        """Admin action to export transactions to Excel."""
        import pandas as pd
        import io
        
        data = []
        for transaction in queryset:
            data.append({
                'Receipt Number': transaction.mpesa_receipt_number,
                'Payment Reference': transaction.payment.payment_reference,
                'Phone Number': transaction.phone_number,
                'Amount (KES)': float(transaction.amount),
                'Transaction Date': transaction.transaction_date.strftime('%Y-%m-%d %H:%M:%S'),
                'Transaction Type': transaction.get_transaction_type_display(),
                'Status': transaction.get_status_display(),
                'Balance (KES)': float(transaction.balance) if transaction.balance else '',
                'Account Reference': transaction.account_reference,
                'Description': transaction.transaction_description,
            })
        
        df = pd.DataFrame(data)
        output = io.BytesIO()
        
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Transactions', index=False)
        
        from django.http import HttpResponse
        response = HttpResponse(
            output.getvalue(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename="mpesa_transactions_export.xlsx"'
        
        self.message_user(request, f"Exported {len(data)} transactions to Excel.")
        return response
    export_to_excel.short_description = "Export selected transactions to Excel"


@admin.register(MpesaCallback)
class MpesaCallbackAdmin(admin.ModelAdmin):
    """Admin interface for MpesaCallback model."""
    
    list_display = [
        'callback_type_display',
        'payment_link',
        'result_code_display',
        'is_processed_display',
        'has_error_display',
        'created_at_display',
        'ip_address',
    ]
    
    list_filter = [
        'callback_type',
        'is_processed',
        'has_error',
        'created_at',
    ]
    
    search_fields = [
        'payment__payment_reference',
        'callback_data',
        'ip_address',
    ]
    
    readonly_fields = [
        'callback_type',
        'payment_link',
        'callback_data_display',
        'result_code',
        'result_description',
        'merchant_request_id',
        'checkout_request_id',
        'is_processed',
        'processed_at',
        'processing_notes',
        'has_error',
        'error_message',
        'ip_address',
        'user_agent',
        'headers_display',
        'created_at',
        'updated_at',
    ]
    
    fieldsets = (
        ('Callback Information', {
            'fields': (
                'callback_type',
                'payment_link',
                'is_processed_display',
                'has_error_display',
            )
        }),
        ('Callback Data', {
            'fields': ('callback_data_display',),
            'classes': ('wide',)
        }),
        ('Processing Status', {
            'fields': (
                'is_processed',
                'processed_at',
                'processing_notes',
                'has_error',
                'error_message',
            )
        }),
        ('Request Information', {
            'fields': (
                'ip_address',
                'user_agent',
                'headers_display',
            ),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': (
                'created_at',
                'updated_at',
            )
        }),
    )
    
    actions = [
        'reprocess_callbacks',
        'export_to_json',
    ]
    
    def callback_type_display(self, obj):
        """Display callback type."""
        return obj.get_callback_type_display()
    callback_type_display.short_description = 'Callback Type'
    
    def payment_link(self, obj):
        """Link to payment."""
        if obj.payment:
            url = reverse('admin:mpesa_mpesapayment_change', args=[obj.payment.id])
            return format_html('<a href="{}">{}</a>', url, obj.payment.payment_reference)
        return "-"
    payment_link.short_description = 'Payment'
    
    def result_code_display(self, obj):
        """Display result code with color."""
        result_code = obj.result_code
        
        if result_code == 0:
            color = 'green'
            symbol = '✓'
        elif result_code is None:
            color = 'gray'
            symbol = '○'
        else:
            color = 'red'
            symbol = '✗'
        
        return format_html(
            '<span style="color: {}; font-weight: bold;">{} {}</span>',
            color,
            symbol,
            result_code if result_code is not None else 'N/A'
        )
    result_code_display.short_description = 'Result Code'
    
    def is_processed_display(self, obj):
        """Display processed status."""
        if obj.is_processed:
            return format_html(
                '<span style="color: green; font-weight: bold;">✓ Processed</span>'
            )
        return format_html(
            '<span style="color: orange; font-weight: bold;">● Pending</span>'
        )
    is_processed_display.short_description = 'Processed'
    
    def has_error_display(self, obj):
        """Display error status."""
        if obj.has_error:
            return format_html(
                '<span style="color: red; font-weight: bold;">✗ Error</span>'
            )
        return format_html(
            '<span style="color: green; font-weight: bold;">✓ OK</span>'
        )
    has_error_display.short_description = 'Error'
    
    def created_at_display(self, obj):
        """Display created at."""
        return obj.created_at.strftime('%Y-%m-%d %H:%M:%S')
    created_at_display.short_description = 'Created'
    created_at_display.admin_order_field = 'created_at'
    
    def callback_data_display(self, obj):
        """Display callback data in readable format."""
        return format_html('<pre>{}</pre>', obj.get_formatted_data())
    callback_data_display.short_description = 'Callback Data'
    
    def headers_display(self, obj):
        """Display headers in readable format."""
        import json
        return format_html('<pre>{}</pre>', json.dumps(obj.headers, indent=2, default=str))
    headers_display.short_description = 'Request Headers'
    
    def reprocess_callbacks(self, request, queryset):
        """Admin action to reprocess callbacks."""
        reprocessed = 0
        for callback in queryset.filter(is_processed=False):
            try:
                if callback.process_callback():
                    reprocessed += 1
            except Exception as e:
                self.message_user(
                    request,
                    f"Error reprocessing callback {callback.id}: {str(e)}",
                    level='error'
                )
        
        self.message_user(
            request,
            f"Successfully reprocessed {reprocessed} callback(s)."
        )
    reprocess_callbacks.short_description = "Reprocess callbacks"
    
    def export_to_json(self, request, queryset):
        """Admin action to export callbacks to JSON."""
        import json
        from django.http import HttpResponse
        
        data = []
        for callback in queryset:
            data.append({
                'id': callback.id,
                'callback_type': callback.callback_type,
                'payment_reference': callback.payment.payment_reference if callback.payment else None,
                'callback_data': callback.callback_data,
                'result_code': callback.result_code,
                'result_description': callback.result_description,
                'is_processed': callback.is_processed,
                'has_error': callback.has_error,
                'error_message': callback.error_message,
                'created_at': callback.created_at.isoformat(),
            })
        
        response = HttpResponse(
            json.dumps(data, indent=2, default=str),
            content_type='application/json'
        )
        response['Content-Disposition'] = 'attachment; filename="mpesa_callbacks_export.json"'
        
        self.message_user(request, f"Exported {len(data)} callbacks to JSON.")
        return response
    export_to_json.short_description = "Export callbacks to JSON"