# backend/apps/notifications/admin.py
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.db.models import Count, Sum, Avg
from django.utils import timezone
from datetime import timedelta
from .models import Notification, Template, SMSLog


class SMSLogInline(admin.TabularInline):
    """Inline for SMS logs."""
    model = SMSLog
    extra = 0
    readonly_fields = ['provider', 'status', 'cost', 'sent_at']
    fields = ['phone_number', 'message', 'provider', 'status', 'cost', 'sent_at']
    can_delete = False


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    """Admin interface for Notification model."""
    
    list_display = [
        'id',
        'notification_type_display',
        'channel_display',
        'recipient_name',
        'recipient_phone',
        'status_display',
        'priority_display',
        'cost_display',
        'created_at',
    ]
    
    list_filter = [
        'notification_type',
        'channel',
        'status',
        'priority',
        'created_at',
    ]
    
    search_fields = [
        'recipient_name',
        'recipient_phone',
        'recipient_email',
        'title',
        'message',
        'external_id',
    ]
    
    readonly_fields = [
        'status_display',
        'created_at',
        'updated_at',
        'sent_at',
        'delivered_at',
        'read_at',
        'delivery_attempts',
        'cost',
        'external_id',
        'recipient_link',
        'sender_link',
        'template_link',
        'related_object_link',
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'notification_type',
                'channel',
                'priority',
                'status_display',
            )
        }),
        ('Content', {
            'fields': (
                'title',
                'message',
            )
        }),
        ('Recipient Information', {
            'fields': (
                'recipient_link',
                'recipient_name',
                'recipient_phone',
                'recipient_email',
            )
        }),
        ('Sender Information', {
            'fields': (
                'sender_link',
                'sender_name',
            )
        }),
        ('Delivery Information', {
            'fields': (
                'scheduled_for',
                'sent_at',
                'delivered_at',
                'read_at',
                'delivery_attempts',
                'delivery_error',
                'external_id',
                'cost',
            )
        }),
        ('Relationships', {
            'fields': (
                'template_link',
                'related_object_link',
            ),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': (
                'metadata',
                'created_at',
                'updated_at',
            ),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [SMSLogInline]
    
    actions = [
        'send_notifications',
        'mark_as_delivered',
        'mark_as_read',
        'retry_failed_notifications',
        'calculate_costs',
    ]
    
    def get_queryset(self, request):
        """Optimize queryset with related data."""
        queryset = super().get_queryset(request)
        queryset = queryset.select_related('recipient', 'sender', 'template')
        return queryset
    
    def notification_type_display(self, obj):
        """Display notification type."""
        return obj.get_notification_type_display()
    notification_type_display.short_description = 'Type'
    notification_type_display.admin_order_field = 'notification_type'
    
    def channel_display(self, obj):
        """Display channel."""
        return obj.get_channel_display()
    channel_display.short_description = 'Channel'
    channel_display.admin_order_field = 'channel'
    
    def status_display(self, obj):
        """Display status with color coding."""
        status_colors = {
            'PENDING': 'orange',
            'SENT': 'blue',
            'DELIVERED': 'green',
            'READ': 'darkgreen',
            'FAILED': 'red',
            'ARCHIVED': 'gray',
        }
        
        color = status_colors.get(obj.status, 'black')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_display.short_description = 'Status'
    
    def priority_display(self, obj):
        """Display priority with color coding."""
        priority_colors = {
            'LOW': 'green',
            'MEDIUM': 'orange',
            'HIGH': 'red',
            'URGENT': 'darkred',
        }
        
        color = priority_colors.get(obj.priority, 'black')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_priority_display()
        )
    priority_display.short_description = 'Priority'
    
    def cost_display(self, obj):
        """Display cost formatted."""
        if obj.cost > 0:
            return f"KES {obj.cost:,.2f}"
        return "-"
    cost_display.short_description = 'Cost'
    
    def recipient_link(self, obj):
        """Link to recipient user."""
        if obj.recipient:
            url = reverse('admin:users_user_change', args=[obj.recipient.id])
            return format_html('<a href="{}">{}</a>', url, obj.recipient.get_full_name())
        return "-"
    recipient_link.short_description = 'Recipient User'
    
    def sender_link(self, obj):
        """Link to sender user."""
        if obj.sender:
            url = reverse('admin:users_user_change', args=[obj.sender.id])
            return format_html('<a href="{}">{}</a>', url, obj.sender.get_full_name())
        return "-"
    sender_link.short_description = 'Sender'
    
    def template_link(self, obj):
        """Link to template."""
        if obj.template:
            url = reverse('admin:notifications_template_change', args=[obj.template.id])
            return format_html('<a href="{}">{}</a>', url, obj.template.name)
        return "-"
    template_link.short_description = 'Template'
    
    def related_object_link(self, obj):
        """Link to related object."""
        if obj.related_object_type and obj.related_object_id:
            try:
                related_obj = obj.get_related_object()
                if related_obj:
                    if obj.related_object_type == 'LOAN':
                        url = reverse('admin:loans_loan_change', args=[obj.related_object_id])
                    elif obj.related_object_type == 'CUSTOMER':
                        url = reverse('admin:customers_customer_change', args=[obj.related_object_id])
                    elif obj.related_object_type == 'REPAYMENT':
                        url = reverse('admin:repayments_repayment_change', args=[obj.related_object_id])
                    elif obj.related_object_type == 'PAYMENT':
                        url = reverse('admin:mpesa_payment_change', args=[obj.related_object_id])
                    elif obj.related_object_type == 'USER':
                        url = reverse('admin:users_user_change', args=[obj.related_object_id])
                    else:
                        return str(related_obj)
                    
                    return format_html('<a href="{}">{}</a>', url, str(related_obj))
            except Exception:
                pass
        return "-"
    related_object_link.short_description = 'Related Object'
    
    def send_notifications(self, request, queryset):
        """Admin action to send pending notifications."""
        from .services.notification_service import NotificationService
        
        notification_service = NotificationService()
        sent_count = 0
        failed_count = 0
        
        for notification in queryset.filter(status='PENDING'):
            try:
                success, result = notification_service.send_notification(notification)
                if success:
                    sent_count += 1
                else:
                    failed_count += 1
            except Exception:
                failed_count += 1
        
        self.message_user(
            request,
            f"Sent {sent_count} notifications. Failed: {failed_count}"
        )
    send_notifications.short_description = "Send selected notifications"
    
    def mark_as_delivered(self, request, queryset):
        """Admin action to mark notifications as delivered."""
        count = queryset.count()
        for notification in queryset:
            notification.mark_as_delivered()
        
        self.message_user(
            request,
            f"Marked {count} notifications as delivered."
        )
    mark_as_delivered.short_description = "Mark as delivered"
    
    def mark_as_read(self, request, queryset):
        """Admin action to mark notifications as read."""
        count = queryset.count()
        for notification in queryset:
            notification.mark_as_read()
        
        self.message_user(
            request,
            f"Marked {count} notifications as read."
        )
    mark_as_read.short_description = "Mark as read"
    
    def retry_failed_notifications(self, request, queryset):
        """Admin action to retry failed notifications."""
        retried_count = 0
        for notification in queryset.filter(status='FAILED'):
            if notification.retry():
                retried_count += 1
        
        self.message_user(
            request,
            f"Retried {retried_count} failed notifications."
        )
    retry_failed_notifications.short_description = "Retry failed notifications"
    
    def calculate_costs(self, request, queryset):
        """Admin action to calculate and update costs."""
        from .services.sms_service import SMSService
        
        sms_service = SMSService()
        updated_count = 0
        
        for notification in queryset.filter(channel='SMS', cost=0):
            try:
                cost = sms_service.calculate_sms_cost(notification.message)
                notification.cost = cost
                notification.save()
                updated_count += 1
            except Exception:
                pass
        
        self.message_user(
            request,
            f"Updated costs for {updated_count} notifications."
        )
    calculate_costs.short_description = "Calculate SMS costs"


@admin.register(Template)
class TemplateAdmin(admin.ModelAdmin):
    """Admin interface for Template model."""
    
    list_display = [
        'name',
        'template_type_display',
        'category_display',
        'language_display',
        'is_active',
        'usage_count',
        'last_used',
        'character_limit',
    ]
    
    list_filter = [
        'template_type',
        'category',
        'language',
        'is_active',
    ]
    
    search_fields = [
        'name',
        'description',
        'content',
        'subject',
    ]
    
    readonly_fields = [
        'variables',
        'usage_count',
        'last_used',
        'sample_render_display',
        'stats_display',
        'created_at',
        'updated_at',
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'name',
                'template_type',
                'category',
                'language',
                'is_active',
            )
        }),
        ('Content', {
            'fields': (
                'subject',
                'content',
                'character_limit',
            )
        }),
        ('Variables', {
            'fields': (
                'variables',
                'description',
                'sample_data',
            ),
            'classes': ('collapse',)
        }),
        ('Preview', {
            'fields': ('sample_render_display',),
            'classes': ('collapse',)
        }),
        ('Statistics', {
            'fields': (
                'usage_count',
                'last_used',
                'stats_display',
            ),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': (
                'created_at',
                'updated_at',
            ),
            'classes': ('collapse',)
        }),
    )
    
    actions = [
        'activate_templates',
        'deactivate_templates',
        'duplicate_templates',
        'reset_usage_count',
    ]
    
    def template_type_display(self, obj):
        """Display template type."""
        return obj.get_template_type_display()
    template_type_display.short_description = 'Type'
    template_type_display.admin_order_field = 'template_type'
    
    def category_display(self, obj):
        """Display category."""
        return obj.get_category_display()
    category_display.short_description = 'Category'
    category_display.admin_order_field = 'category'
    
    def language_display(self, obj):
        """Display language."""
        return obj.get_language_display()
    language_display.short_description = 'Language'
    language_display.admin_order_field = 'language'
    
    def sample_render_display(self, obj):
        """Display sample rendering."""
        sample_render = obj.get_sample_render()
        return format_html(
            '<div style="background-color: #f5f5f5; padding: 10px; border-radius: 5px;'
            'white-space: pre-wrap; font-family: monospace;">{}</div>',
            sample_render
        )
    sample_render_display.short_description = 'Sample Rendering'
    
    def stats_display(self, obj):
        """Display template statistics."""
        stats = obj.get_stats()
        return format_html(
            '<div>'
            '<strong>Total Used:</strong> {}<br>'
            '<strong>Notifications:</strong> {}<br>'
            '<strong>Success Rate:</strong> {:.1f}%<br>'
            '<strong>Last Used:</strong> {}'
            '</div>',
            stats['total_used'],
            stats['notifications_count'],
            stats['success_rate'],
            stats['last_used'] or 'Never'
        )
    stats_display.short_description = 'Statistics'
    
    def activate_templates(self, request, queryset):
        """Admin action to activate templates."""
        count = queryset.update(is_active=True)
        self.message_user(request, f"Activated {count} templates.")
    activate_templates.short_description = "Activate selected templates"
    
    def deactivate_templates(self, request, queryset):
        """Admin action to deactivate templates."""
        count = queryset.update(is_active=False)
        self.message_user(request, f"Deactivated {count} templates.")
    deactivate_templates.short_description = "Deactivate selected templates"
    
    def duplicate_templates(self, request, queryset):
        """Admin action to duplicate templates."""
        count = 0
        for template in queryset:
            new_name = f"{template.name} (Copy {count+1})"
            template.duplicate(new_name)
            count += 1
        
        self.message_user(request, f"Duplicated {count} templates.")
    duplicate_templates.short_description = "Duplicate selected templates"
    
    def reset_usage_count(self, request, queryset):
        """Admin action to reset usage count."""
        count = queryset.update(usage_count=0, last_used=None)
        self.message_user(request, f"Reset usage count for {count} templates.")
    reset_usage_count.short_description = "Reset usage count"


@admin.register(SMSLog)
class SMSLogAdmin(admin.ModelAdmin):
    """Admin interface for SMSLog model."""
    
    list_display = [
        'phone_number',
        'provider_display',
        'status_display',
        'cost_display',
        'units',
        'sent_at',
        'delivered_at',
        'delivery_time_display',
        'created_at',
    ]
    
    list_filter = [
        'provider',
        'status',
        'sent_at',
        'created_at',
    ]
    
    search_fields = [
        'phone_number',
        'message',
        'message_id',
        'notification__recipient_name',
    ]
    
    readonly_fields = [
        'status_display',
        'delivery_time_display',
        'notification_link',
        'network_info',
        'stats_display',
        'created_at',
        'updated_at',
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'notification_link',
                'phone_number',
                'provider',
                'status_display',
            )
        }),
        ('Message Content', {
            'fields': (
                'message',
                'message_id',
            )
        }),
        ('Cost & Units', {
            'fields': (
                'units',
                'cost',
            )
        }),
        ('Timing Information', {
            'fields': (
                'sent_at',
                'delivered_at',
                'delivery_time_display',
            )
        }),
        ('Network Information', {
            'fields': (
                'network_code',
                'network_name',
                'network_info',
            ),
            'classes': ('collapse',)
        }),
        ('Status & Metadata', {
            'fields': (
                'status_message',
                'metadata',
                'stats_display',
            ),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': (
                'created_at',
                'updated_at',
            ),
            'classes': ('collapse',)
        }),
    )
    
    actions = [
        'retry_failed_sms',
        'update_delivery_status',
        'export_sms_logs',
    ]
    
    def get_queryset(self, request):
        """Optimize queryset with related data."""
        queryset = super().get_queryset(request)
        queryset = queryset.select_related('notification')
        return queryset
    
    def provider_display(self, obj):
        """Display provider."""
        return obj.get_provider_display()
    provider_display.short_description = 'Provider'
    provider_display.admin_order_field = 'provider'
    
    def status_display(self, obj):
        """Display status with color coding."""
        status_colors = {
            'PENDING': 'orange',
            'SENT': 'blue',
            'DELIVERED': 'green',
            'FAILED': 'red',
            'REJECTED': 'darkred',
            'UNDELIVERED': 'brown',
        }
        
        color = status_colors.get(obj.status, 'black')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_display.short_description = 'Status'
    
    def cost_display(self, obj):
        """Display cost formatted."""
        if obj.cost > 0:
            return f"KES {obj.cost:,.2f}"
        return "-"
    cost_display.short_description = 'Cost'
    
    def delivery_time_display(self, obj):
        """Display delivery time."""
        delivery_time = obj.delivery_time
        if delivery_time:
            if delivery_time < 60:
                return f"{delivery_time:.1f}s"
            elif delivery_time < 3600:
                return f"{delivery_time/60:.1f}m"
            else:
                return f"{delivery_time/3600:.1f}h"
        return "-"
    delivery_time_display.short_description = 'Delivery Time'
    
    def notification_link(self, obj):
        """Link to notification."""
        if obj.notification:
            url = reverse('admin:notifications_notification_change', args=[obj.notification.id])
            return format_html('<a href="{}">{}</a>', url, obj.notification.title)
        return "-"
    notification_link.short_description = 'Notification'
    
    def network_info(self, obj):
        """Display network information."""
        if obj.network_code or obj.network_name:
            return f"{obj.network_name or 'Unknown'} ({obj.network_code or 'N/A'})"
        return "Not available"
    network_info.short_description = 'Network'
    
    def stats_display(self, obj):
        """Display SMS statistics."""
        stats = obj.get_stats()
        return format_html(
            '<div>'
            '<strong>Message Length:</strong> {} chars<br>'
            '<strong>Units Used:</strong> {}<br>'
            '<strong>Cost:</strong> KES {:.2f}<br>'
            '<strong>Provider:</strong> {}<br>'
            '<strong>Network:</strong> {}'
            '</div>',
            stats['message_length'],
            stats['units_used'],
            stats['cost'],
            stats['provider'],
            stats['network']
        )
    stats_display.short_description = 'SMS Statistics'
    
    def retry_failed_sms(self, request, queryset):
        """Admin action to retry failed SMS."""
        from .services.sms_service import SMSService
        
        sms_service = SMSService()
        retried_count = 0
        
        for sms_log in queryset.filter(status='FAILED'):
            new_sms = sms_log.resend()
            if new_sms:
                try:
                    success, result = sms_service.send_sms(
                        phone_number=new_sms.phone_number,
                        message=new_sms.message,
                        sender_id="SUPERLEGIT"
                    )
                    if success:
                        retried_count += 1
                except Exception:
                    pass
        
        self.message_user(
            request,
            f"Retried {retried_count} failed SMS messages."
        )
    retry_failed_sms.short_description = "Retry failed SMS"
    
    def update_delivery_status(self, request, queryset):
        """Admin action to update delivery status."""
        from .services.sms_service import SMSService
        
        sms_service = SMSService()
        updated_count = 0
        
        for sms_log in queryset.filter(status='SENT', message_id__isnull=False):
            try:
                status_info = sms_service.check_delivery_status(sms_log.message_id)
                if status_info:
                    sms_log.update_status(status_info['status'], status_info.get('message'))
                    updated_count += 1
            except Exception:
                pass
        
        self.message_user(
            request,
            f"Updated delivery status for {updated_count} SMS messages."
        )
    update_delivery_status.short_description = "Update delivery status"
    
    def export_sms_logs(self, request, queryset):
        """Admin action to export SMS logs to CSV."""
        import csv
        from django.http import HttpResponse
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="sms_logs_export.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'ID', 'Phone Number', 'Message', 'Provider', 'Status',
            'Cost', 'Units', 'Sent At', 'Delivered At', 'Network'
        ])
        
        for sms_log in queryset:
            writer.writerow([
                sms_log.id,
                sms_log.phone_number,
                sms_log.message[:100] + '...' if len(sms_log.message) > 100 else sms_log.message,
                sms_log.get_provider_display(),
                sms_log.get_status_display(),
                float(sms_log.cost),
                sms_log.units,
                sms_log.sent_at.strftime('%Y-%m-%d %H:%M:%S') if sms_log.sent_at else '',
                sms_log.delivered_at.strftime('%Y-%m-%d %H:%M:%S') if sms_log.delivered_at else '',
                f"{sms_log.network_name} ({sms_log.network_code})" if sms_log.network_code else ''
            ])
        
        self.message_user(request, f"Exported {queryset.count()} SMS logs to CSV.")
        return response
    export_sms_logs.short_description = "Export selected SMS logs to CSV"