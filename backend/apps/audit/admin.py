# backend/apps/audit/admin.py
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
import json

from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    """Admin interface for AuditLog model."""
    
    list_display = [
        'timestamp_display',
        'action_display',
        'user_display',
        'model_name_display',
        'object_display',
        'severity_display',
        'status_display',
        'ip_address',
        'duration_display',
    ]
    
    list_filter = [
        'action',
        'severity',
        'status',
        'model_name',
        'module',
        'is_compliance_event',
        'timestamp',
    ]
    
    search_fields = [
        'user__username',
        'user__first_name',
        'user__last_name',
        'object_repr',
        'model_name',
        'user_ip',
        'changes',
        'error_message',
        'notes',
    ]
    
    readonly_fields = [
        'id',
        'timestamp',
        'user_display',
        'model_name_display',
        'object_display',
        'changes_display',
        'previous_state_display',
        'new_state_display',
        'request_info_display',
        'error_info_display',
        'duration',
        'retention_info',
        'user_link',
        'object_link',
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'id',
                'timestamp',
                'action',
                'severity',
                'status',
            )
        }),
        ('User Information', {
            'fields': (
                'user_link',
                'user_ip',
                'user_agent',
            )
        }),
        ('Object Information', {
            'fields': (
                'model_name_display',
                'object_link',
                'object_repr',
            )
        }),
        ('Changes', {
            'fields': (
                'changes_display',
                'previous_state_display',
                'new_state_display',
            ),
            'classes': ('collapse',),
        }),
        ('Request Information', {
            'fields': (
                'request_info_display',
                'response_status',
                'duration',
            ),
            'classes': ('collapse',),
        }),
        ('Error Information', {
            'fields': (
                'error_info_display',
            ),
            'classes': ('collapse',),
        }),
        ('Metadata', {
            'fields': (
                'module',
                'feature',
                'tags_display',
                'notes',
            )
        }),
        ('Compliance', {
            'fields': (
                'is_compliance_event',
                'compliance_id',
            ),
            'classes': ('collapse',),
        }),
        ('Retention', {
            'fields': (
                'retention_info',
                'is_archived',
                'archive_date',
            ),
            'classes': ('collapse',),
        }),
    )
    
    actions = [
        'mark_as_compliance',
        'archive_selected',
        'export_selected',
        'cleanup_old_logs',
    ]
    
    def get_queryset(self, request):
        """Optimize queryset."""
        queryset = super().get_queryset(request)
        queryset = queryset.select_related('user')
        return queryset
    
    def timestamp_display(self, obj):
        """Display formatted timestamp."""
        return obj.timestamp.strftime('%Y-%m-%d %H:%M:%S')
    timestamp_display.short_description = 'Timestamp'
    timestamp_display.admin_order_field = 'timestamp'
    
    def action_display(self, obj):
        """Display action with color coding."""
        colors = {
            'CREATE': 'green',
            'UPDATE': 'blue',
            'DELETE': 'red',
            'LOGIN': 'orange',
            'LOGOUT': 'gray',
            'SECURITY': 'red',
        }
        color = colors.get(obj.action, 'black')
        
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_action_display()
        )
    action_display.short_description = 'Action'
    action_display.admin_order_field = 'action'
    
    def user_display(self, obj):
        """Display user information."""
        if obj.user:
            return obj.user.get_full_name() or obj.user.username
        return 'System'
    user_display.short_description = 'User'
    
    def user_link(self, obj):
        """Link to user admin."""
        if obj.user:
            url = reverse('admin:users_user_change', args=[obj.user.id])
            return format_html('<a href="{}">{}</a>', url, obj.user_display)
        return 'System'
    user_link.short_description = 'User'
    
    def model_name_display(self, obj):
        """Display model name."""
        return obj.model_name or 'System'
    model_name_display.short_description = 'Model'
    
    def object_display(self, obj):
        """Display object representation."""
        return obj.object_repr or f"{obj.model_name} #{obj.object_id}" if obj.model_name and obj.object_id else 'N/A'
    object_display.short_description = 'Object'
    
    def object_link(self, obj):
        """Create link to object if possible."""
        if not obj.model_name or not obj.object_id:
            return 'N/A'
        
        # Try to create link to object admin
        try:
            from django.contrib.contenttypes.models import ContentType
            content_type = ContentType.objects.get(model=obj.model_name.lower())
            model_admin_url = reverse(f'admin:{content_type.app_label}_{content_type.model}_change', args=[obj.object_id])
            return format_html('<a href="{}">{}</a>', model_admin_url, obj.object_display)
        except:
            return obj.object_display
    object_link.short_description = 'Object Link'
    
    def severity_display(self, obj):
        """Display severity with color coding."""
        colors = {
            'INFO': 'gray',
            'LOW': 'green',
            'MEDIUM': 'orange',
            'HIGH': 'red',
            'CRITICAL': 'darkred',
        }
        color = colors.get(obj.severity, 'black')
        
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_severity_display()
        )
    severity_display.short_description = 'Severity'
    severity_display.admin_order_field = 'severity'
    
    def status_display(self, obj):
        """Display status with color coding."""
        color = 'green' if obj.status == 'SUCCESS' else 'red' if obj.status == 'FAILURE' else 'orange'
        
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_display.short_description = 'Status'
    status_display.admin_order_field = 'status'
    
    def ip_address(self, obj):
        """Display IP address."""
        return obj.user_ip or 'N/A'
    ip_address.short_description = 'IP Address'
    
    def duration_display(self, obj):
        """Display duration."""
        if obj.duration:
            return f"{obj.duration:.2f}s"
        return 'N/A'
    duration_display.short_description = 'Duration'
    
    def changes_display(self, obj):
        """Display changes in formatted way."""
        if not obj.changes:
            return 'No changes'
        
        try:
            changes = obj.get_changes_dict()
            if isinstance(changes, dict):
                html = '<ul>'
                for key, value in changes.items():
                    html += f'<li><strong>{key}:</strong> {value}</li>'
                html += '</ul>'
                return format_html(html)
            return str(changes)
        except:
            return str(obj.changes)
    changes_display.short_description = 'Changes'
    
    def previous_state_display(self, obj):
        """Display previous state."""
        if not obj.previous_state:
            return 'No previous state'
        
        try:
            state = obj.get_previous_state_dict()
            return format_html('<pre>{}</pre>', json.dumps(state, indent=2))
        except:
            return str(obj.previous_state)
    previous_state_display.short_description = 'Previous State'
    
    def new_state_display(self, obj):
        """Display new state."""
        if not obj.new_state:
            return 'No new state'
        
        try:
            state = obj.get_new_state_dict()
            return format_html('<pre>{}</pre>', json.dumps(state, indent=2))
        except:
            return str(obj.new_state)
    new_state_display.short_description = 'New State'
    
    def request_info_display(self, obj):
        """Display request information."""
        info = []
        if obj.request_method:
            info.append(f"<strong>Method:</strong> {obj.request_method}")
        if obj.request_path:
            info.append(f"<strong>Path:</strong> {obj.request_path}")
        if obj.request_params:
            info.append(f"<strong>Params:</strong> {obj.request_params}")
        
        if info:
            return format_html('<br>'.join(info))
        return 'No request info'
    request_info_display.short_description = 'Request Information'
    
    def error_info_display(self, obj):
        """Display error information."""
        if not obj.error_message:
            return 'No errors'
        
        info = []
        if obj.error_message:
            info.append(f"<strong>Error:</strong> {obj.error_message}")
        if obj.error_traceback:
            info.append(f"<strong>Traceback:</strong><br><pre>{obj.error_traceback}</pre>")
        
        return format_html('<br>'.join(info))
    error_info_display.short_description = 'Error Information'
    
    def tags_display(self, obj):
        """Display tags."""
        if not obj.tags:
            return 'No tags'
        
        tags_html = []
        for tag in obj.tags:
            tags_html.append(f'<span style="background-color: #e0e0e0; padding: 2px 6px; border-radius: 3px; margin-right: 5px;">{tag}</span>')
        
        return format_html(''.join(tags_html))
    tags_display.short_description = 'Tags'
    
    def retention_info(self, obj):
        """Display retention information."""
        retention_date = obj.retention_date
        days_left = (retention_date - timezone.now()).days
        
        if days_left > 30:
            color = 'green'
            status = 'Active'
        elif days_left > 7:
            color = 'orange'
            status = 'Expiring soon'
        else:
            color = 'red'
            status = 'About to expire'
        
        return format_html(
            '<strong>Retention:</strong> {} days left (until {})<br>'
            '<span style="color: {};"><strong>Status:</strong> {}</span>',
            days_left,
            retention_date.strftime('%Y-%m-%d'),
            color,
            status
        )
    retention_info.short_description = 'Retention Information'
    
    def mark_as_compliance(self, request, queryset):
        """Mark selected logs as compliance events."""
        count = queryset.count()
        for log in queryset:
            log.mark_as_compliance_event()
        
        self.message_user(
            request,
            f"Successfully marked {count} audit log(s) as compliance events."
        )
    mark_as_compliance.short_description = "Mark as compliance events"
    
    def archive_selected(self, request, queryset):
        """Archive selected logs."""
        count = 0
        for log in queryset:
            if not log.is_archived:
                log.archive()
                count += 1
        
        self.message_user(
            request,
            f"Successfully archived {count} audit log(s)."
        )
    archive_selected.short_description = "Archive selected logs"
    
    def export_selected(self, request, queryset):
        """Export selected logs to Excel."""
        import pandas as pd
        import io
        
        data = []
        for log in queryset:
            data.append({
                'Timestamp': log.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                'Action': log.get_action_display(),
                'User': log.user_display,
                'Model': log.model_name or '',
                'Object': log.object_display,
                'Severity': log.get_severity_display(),
                'Status': log.get_status_display(),
                'IP Address': log.user_ip or '',
                'Changes': log.changes_summary,
            })
        
        df = pd.DataFrame(data)
        output = io.BytesIO()
        
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Audit Logs', index=False)
        
        from django.http import HttpResponse
        response = HttpResponse(
            output.getvalue(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename="audit_logs_export.xlsx"'
        
        self.message_user(request, f"Exported {len(data)} audit logs to Excel.")
        return response
    export_selected.short_description = "Export selected logs to Excel"
    
    def cleanup_old_logs(self, request, queryset):
        """Cleanup old logs (demo action)."""
        # This is just a demo - real cleanup should be done via management command
        days_old = 365  # Default to 1 year
        
        deleted_count = AuditLog.cleanup_old_logs(days_old)
        
        self.message_user(
            request,
            f"Cleanup scheduled for logs older than {days_old} days. "
            f"Note: Real cleanup should be done via management command."
        )
    cleanup_old_logs.short_description = "Schedule cleanup of old logs"
    
    def has_add_permission(self, request):
        """Prevent adding audit logs manually."""
        return False
    
    def has_change_permission(self, request, obj=None):
        """Prevent editing audit logs."""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Allow deletion only for superusers."""
        return request.user.is_superuser
    
    class Media:
        """Add custom CSS for admin."""
        css = {
            'all': ('admin/css/audit_admin.css',)
        }