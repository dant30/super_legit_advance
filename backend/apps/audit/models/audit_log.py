# backend/apps/audit/models/audit_log.py

from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
import uuid
import json

User = get_user_model()


class AuditLog(models.Model):
    """
    Comprehensive audit log for tracking all user actions and system events.
    """
    
    # Action types
    ACTION_CHOICES = [
        ('CREATE', 'Create'),
        ('UPDATE', 'Update'),
        ('DELETE', 'Delete'),
        ('VIEW', 'View'),
        ('LOGIN', 'Login'),
        ('LOGOUT', 'Logout'),
        ('EXPORT', 'Export'),
        ('IMPORT', 'Import'),
        ('APPROVE', 'Approve'),
        ('REJECT', 'Reject'),
        ('VERIFY', 'Verify'),
        ('BLACKLIST', 'Blacklist'),
        ('ACTIVATE', 'Activate'),
        ('DEACTIVATE', 'Deactivate'),
        ('PAYMENT', 'Payment'),
        ('REFUND', 'Refund'),
        ('NOTIFICATION', 'Notification'),
        ('REPORT', 'Report'),
        ('BACKUP', 'Backup'),
        ('RESTORE', 'Restore'),
        ('SECURITY', 'Security Event'),
        ('SYSTEM', 'System Event'),
        ('OTHER', 'Other'),
    ]
    
    # Severity levels
    SEVERITY_CHOICES = [
        ('INFO', 'Information'),
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('CRITICAL', 'Critical'),
    ]
    
    # Status
    STATUS_CHOICES = [
        ('SUCCESS', 'Success'),
        ('FAILURE', 'Failure'),
        ('PENDING', 'Pending'),
        ('PARTIAL', 'Partial'),
    ]
    
    # Unique identifier
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        verbose_name="Audit Log ID"
    )
    
    # Action details
    action = models.CharField(
        max_length=50,
        choices=ACTION_CHOICES,
        verbose_name="Action"
    )
    
    severity = models.CharField(
        max_length=20,
        choices=SEVERITY_CHOICES,
        default='INFO',
        verbose_name="Severity Level"
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='SUCCESS',
        verbose_name="Status"
    )
    
    # User information
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs',
        verbose_name="User"
    )
    
    user_ip = models.GenericIPAddressField(
        null=True,
        blank=True,
        verbose_name="User IP Address"
    )
    
    user_agent = models.TextField(
        blank=True,
        verbose_name="User Agent"
    )
    
    # Object information (generic foreign key)
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Content Type"
    )
    
    object_id = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        verbose_name="Object ID"
    )
    
    content_object = GenericForeignKey('content_type', 'object_id')
    
    # Object details
    model_name = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Model Name"
    )
    
    object_repr = models.CharField(
        max_length=255,
        blank=True,
        verbose_name="Object Representation"
    )
    
    # Changes and data
    changes = models.JSONField(
        null=True,
        blank=True,
        verbose_name="Changes Made"
    )
    
    previous_state = models.JSONField(
        null=True,
        blank=True,
        verbose_name="Previous State"
    )
    
    new_state = models.JSONField(
        null=True,
        blank=True,
        verbose_name="New State"
    )
    
    # Request/Response data
    request_method = models.CharField(
        max_length=10,
        blank=True,
        verbose_name="HTTP Method"
    )
    
    request_path = models.CharField(
        max_length=500,
        blank=True,
        verbose_name="Request Path"
    )
    
    request_params = models.JSONField(
        null=True,
        blank=True,
        verbose_name="Request Parameters"
    )
    
    response_status = models.IntegerField(
        null=True,
        blank=True,
        verbose_name="Response Status Code"
    )
    
    # Session and authentication
    session_key = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Session Key"
    )
    
    # Error information
    error_message = models.TextField(
        blank=True,
        verbose_name="Error Message"
    )
    
    error_traceback = models.TextField(
        blank=True,
        verbose_name="Error Traceback"
    )
    
    # Timestamps
    timestamp = models.DateTimeField(
        default=timezone.now,
        verbose_name="Timestamp"
    )
    
    duration = models.FloatField(
        null=True,
        blank=True,
        verbose_name="Duration (seconds)"
    )
    
    # Metadata
    module = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Module/App"
    )
    
    feature = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Feature"
    )
    
    tags = models.JSONField(
        null=True,
        blank=True,
        default=list,
        verbose_name="Tags"
    )
    
    # Compliance fields
    compliance_id = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Compliance ID"
    )
    
    is_compliance_event = models.BooleanField(
        default=False,
        verbose_name="Compliance Event"
    )
    
    # Retention and archiving
    retention_days = models.IntegerField(
        default=365,  # Keep logs for 1 year by default
        verbose_name="Retention Period (days)"
    )
    
    is_archived = models.BooleanField(
        default=False,
        verbose_name="Archived"
    )
    
    archive_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Archive Date"
    )
    
    # Additional fields
    notes = models.TextField(
        blank=True,
        verbose_name="Additional Notes"
    )
    
    class Meta:
        verbose_name = "Audit Log"
        verbose_name_plural = "Audit Logs"
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['timestamp']),
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['action', 'timestamp']),
            models.Index(fields=['model_name', 'timestamp']),
            models.Index(fields=['severity', 'timestamp']),
            models.Index(fields=['status', 'timestamp']),
            models.Index(fields=['user_ip', 'timestamp']),
            models.Index(fields=['module', 'timestamp']),
            models.Index(fields=['is_compliance_event', 'timestamp']),
        ]
    
    def __str__(self):
        return f"{self.timestamp.strftime('%Y-%m-%d %H:%M:%S')} - {self.get_action_display()} - {self.model_name or 'System'} - {self.user or 'System'}"
    
    @property
    def user_display(self):
        """Get user display name."""
        if self.user:
            return self.user.get_full_name() or self.user.username
        return "System"
    
    @property
    def object_display(self):
        """Get object display."""
        if self.object_repr:
            return self.object_repr
        if self.content_object:
            return str(self.content_object)
        return f"{self.model_name} #{self.object_id}" if self.model_name and self.object_id else "Unknown"
    
    @property
    def is_successful(self):
        """Check if action was successful."""
        return self.status == 'SUCCESS'
    
    @property
    def is_failed(self):
        """Check if action failed."""
        return self.status == 'FAILURE'
    
    @property
    def is_high_severity(self):
        """Check if high severity."""
        return self.severity in ['HIGH', 'CRITICAL']
    
    @property
    def changes_summary(self):
        """Get summary of changes."""
        if not self.changes:
            return "No changes recorded"
        
        try:
            changes = json.loads(self.changes) if isinstance(self.changes, str) else self.changes
            if isinstance(changes, dict):
                return ", ".join([f"{k}: {v}" for k, v in changes.items()])
            return str(changes)
        except:
            return "Changes recorded"
    
    @property
    def retention_date(self):
        """Get date when this log should be deleted."""
        return self.timestamp + timezone.timedelta(days=self.retention_days)
    
    @property
    def should_archive(self):
        """Check if log should be archived."""
        return not self.is_archived and self.timestamp < timezone.now() - timezone.timedelta(days=30)
    
    @property
    def should_delete(self):
        """Check if log should be deleted."""
        return self.timestamp < timezone.now() - timezone.timedelta(days=self.retention_days)
    
    def archive(self):
        """Archive the log entry."""
        self.is_archived = True
        self.archive_date = timezone.now()
        self.save()
    
    def mark_as_compliance_event(self, compliance_id=""):
        """Mark as compliance event."""
        self.is_compliance_event = True
        if compliance_id:
            self.compliance_id = compliance_id
        self.save()
    
    def add_tag(self, tag):
        """Add a tag to the log."""
        if not self.tags:
            self.tags = []
        
        if tag not in self.tags:
            self.tags.append(tag)
            self.save()
    
    def remove_tag(self, tag):
        """Remove a tag from the log."""
        if self.tags and tag in self.tags:
            self.tags.remove(tag)
            self.save()
    
    def get_changes_dict(self):
        """Get changes as dictionary."""
        if not self.changes:
            return {}
        
        try:
            return json.loads(self.changes) if isinstance(self.changes, str) else self.changes
        except:
            return {"raw": str(self.changes)}
    
    def get_previous_state_dict(self):
        """Get previous state as dictionary."""
        if not self.previous_state:
            return {}
        
        try:
            return json.loads(self.previous_state) if isinstance(self.previous_state, str) else self.previous_state
        except:
            return {"raw": str(self.previous_state)}
    
    def get_new_state_dict(self):
        """Get new state as dictionary."""
        if not self.new_state:
            return {}
        
        try:
            return json.loads(self.new_state) if isinstance(self.new_state, str) else self.new_state
        except:
            return {"raw": str(self.new_state)}
    
    def to_dict(self):
        """Convert audit log to dictionary."""
        return {
            'id': str(self.id),
            'action': self.action,
            'severity': self.severity,
            'status': self.status,
            'user': {
                'id': self.user.id if self.user else None,
                'name': self.user_display,
                'username': self.user.username if self.user else None,
            },
            'user_ip': self.user_ip,
            'model_name': self.model_name,
            'object_id': self.object_id,
            'object_repr': self.object_repr,
            'changes': self.get_changes_dict(),
            'timestamp': self.timestamp.isoformat(),
            'duration': self.duration,
            'module': self.module,
            'feature': self.feature,
            'request_method': self.request_method,
            'request_path': self.request_path,
            'response_status': self.response_status,
            'error_message': self.error_message,
            'is_compliance_event': self.is_compliance_event,
            'tags': self.tags or [],
            'notes': self.notes,
        }
    
    @classmethod
    def log_action(cls, **kwargs):
        """
        Create an audit log entry.
        
        Usage:
            AuditLog.log_action(
                user=request.user,
                action='CREATE',
                model_name='Customer',
                object_id=customer.id,
                object_repr=str(customer),
                changes={'field': 'value'},
                request=request,
                severity='INFO',
                module='customers',
                feature='customer_creation',
            )
        """
        # Extract request if provided
        request = kwargs.pop('request', None)
        if request:
            kwargs.setdefault('user', request.user if request.user.is_authenticated else None)
            kwargs.setdefault('user_ip', cls._get_client_ip(request))
            kwargs.setdefault('user_agent', request.META.get('HTTP_USER_AGENT', ''))
            kwargs.setdefault('request_method', request.method)
            kwargs.setdefault('request_path', request.path)
            kwargs.setdefault('session_key', request.session.session_key if hasattr(request, 'session') else '')
            
            # Get query params
            if request.method == 'GET':
                kwargs.setdefault('request_params', dict(request.GET))
            elif request.method in ['POST', 'PUT', 'PATCH']:
                # Be careful with sensitive data
                params = dict(request.POST)
                # Remove sensitive fields
                sensitive_fields = ['password', 'token', 'secret', 'key']
                for field in sensitive_fields:
                    if field in params:
                        params[field] = '***REDACTED***'
                kwargs.setdefault('request_params', params)
        
        # Set defaults
        kwargs.setdefault('timestamp', timezone.now())
        
        # Create the audit log
        return cls.objects.create(**kwargs)
    
    @staticmethod
    def _get_client_ip(request):
        """Get client IP address from request."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    @classmethod
    def get_recent_actions(cls, user=None, model_name=None, hours=24, limit=100):
        """Get recent audit actions."""
        queryset = cls.objects.filter(
            timestamp__gte=timezone.now() - timezone.timedelta(hours=hours)
        )
        
        if user:
            queryset = queryset.filter(user=user)
        
        if model_name:
            queryset = queryset.filter(model_name=model_name)
        
        return queryset.order_by('-timestamp')[:limit]
    
    @classmethod
    def get_user_activity(cls, user, days=7):
        """Get user activity for specified days."""
        start_date = timezone.now() - timezone.timedelta(days=days)
        
        return cls.objects.filter(
            user=user,
            timestamp__gte=start_date
        ).order_by('-timestamp')
    
    @classmethod
    def get_security_events(cls, days=30):
        """Get security-related events."""
        start_date = timezone.now() - timezone.timedelta(days=days)
        
        return cls.objects.filter(
            timestamp__gte=start_date,
            severity__in=['HIGH', 'CRITICAL'],
            status='FAILURE'
        ).order_by('-timestamp')
    
    @classmethod
    def cleanup_old_logs(cls, days=None):
        """Delete logs older than retention period."""
        if days is None:
            # Use retention_days from each log
            logs_to_delete = cls.objects.filter(
                timestamp__lt=timezone.now() - timezone.timedelta(days=365)  # Default max
            )
            
            # Filter logs that have exceeded their retention period
            deleted_count = 0
            for log in logs_to_delete:
                if log.should_delete:
                    log.delete()
                    deleted_count += 1
            
            return deleted_count
        else:
            # Delete logs older than specified days
            cutoff_date = timezone.now() - timezone.timedelta(days=days)
            deleted_count, _ = cls.objects.filter(timestamp__lt=cutoff_date).delete()
            return deleted_count
    
    @classmethod
    def archive_old_logs(cls, days=30):
        """Archive logs older than specified days."""
        cutoff_date = timezone.now() - timezone.timedelta(days=days)
        logs_to_archive = cls.objects.filter(
            timestamp__lt=cutoff_date,
            is_archived=False
        )
        
        archived_count = 0
        for log in logs_to_archive:
            log.archive()
            archived_count += 1
        
        return archived_count