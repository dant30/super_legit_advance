# backend/apps/notifications/models/sms_log.py
from django.db import models
from django.utils import timezone
from apps.core.models.base import BaseModel


class SMSLog(BaseModel):
    """
    SMS Log model for tracking all SMS messages sent.
    """
    
    # SMS statuses
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('SENT', 'Sent'),
        ('DELIVERED', 'Delivered'),
        ('FAILED', 'Failed'),
        ('REJECTED', 'Rejected'),
        ('UNDELIVERED', 'Undelivered'),
    ]
    
    # SMS providers
    PROVIDER_CHOICES = [
        ('AFRICASTALKING', 'Africa\'s Talking'),
        ('TWILIO', 'Twilio'),
        ('NEXMO', 'Nexmo'),
        ('INFOBIP', 'Infobip'),
        ('BULKSMS', 'BulkSMS'),
        ('OTHER', 'Other'),
    ]
    
    # Fields
    notification = models.OneToOneField(
        'Notification',
        on_delete=models.CASCADE,
        related_name='sms_log',
        verbose_name="Notification"
    )
    
    phone_number = models.CharField(
        max_length=20,
        verbose_name="Phone Number"
    )
    
    message = models.TextField(
        verbose_name="Message"
    )
    
    message_id = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Message ID"
    )
    
    provider = models.CharField(
        max_length=20,
        choices=PROVIDER_CHOICES,
        default='AFRICASTALKING',
        verbose_name="Provider"
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING',
        verbose_name="Status"
    )
    
    status_message = models.TextField(
        blank=True,
        verbose_name="Status Message"
    )
    
    units = models.IntegerField(
        default=1,
        verbose_name="Units Used"
    )
    
    cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
        verbose_name="Cost (KES)"
    )
    
    # Timing information
    sent_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Sent At"
    )
    
    delivered_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Delivered At"
    )
    
    # Network information
    network_code = models.CharField(
        max_length=20,
        blank=True,
        verbose_name="Network Code"
    )
    
    network_name = models.CharField(
        max_length=50,
        blank=True,
        verbose_name="Network Name"
    )
    
    # Metadata
    metadata = models.JSONField(
        default=dict,
        blank=True,
        verbose_name="Metadata"
    )
    
    class Meta:
        verbose_name = "SMS Log"
        verbose_name_plural = "SMS Logs"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['phone_number', 'status']),
            models.Index(fields=['status', 'sent_at']),
            models.Index(fields=['provider', 'status']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"SMS to {self.phone_number} - {self.get_status_display()}"
    
    @property
    def is_sent(self):
        """Check if SMS is sent."""
        return self.status == 'SENT'
    
    @property
    def is_delivered(self):
        """Check if SMS is delivered."""
        return self.status == 'DELIVERED'
    
    @property
    def is_failed(self):
        """Check if SMS failed."""
        return self.status == 'FAILED'
    
    @property
    def delivery_time(self):
        """Calculate delivery time if available."""
        if self.sent_at and self.delivered_at:
            return (self.delivered_at - self.sent_at).total_seconds()
        return None
    
    def mark_as_sent(self, message_id=None, units=1, cost=0.00):
        """Mark SMS as sent."""
        self.status = 'SENT'
        self.sent_at = timezone.now()
        if message_id:
            self.message_id = message_id
        self.units = units
        self.cost = cost
        self.save()
        
        # Update associated notification
        if self.notification:
            self.notification.mark_as_sent(message_id, cost)
    
    def mark_as_delivered(self, network_code=None, network_name=None):
        """Mark SMS as delivered."""
        self.status = 'DELIVERED'
        self.delivered_at = timezone.now()
        if network_code:
            self.network_code = network_code
        if network_name:
            self.network_name = network_name
        self.save()
        
        # Update associated notification
        if self.notification:
            self.notification.mark_as_delivered()
    
    def mark_as_failed(self, error_message):
        """Mark SMS as failed."""
        self.status = 'FAILED'
        self.status_message = error_message
        self.save()
        
        # Update associated notification
        if self.notification:
            self.notification.mark_as_failed(error_message)
    
    def mark_as_rejected(self, reason):
        """Mark SMS as rejected."""
        self.status = 'REJECTED'
        self.status_message = reason
        self.save()
    
    def update_status(self, status, status_message=None):
        """Update SMS status."""
        self.status = status
        if status_message:
            self.status_message = status_message
        
        if status == 'DELIVERED' and not self.delivered_at:
            self.delivered_at = timezone.now()
        
        self.save()
    
    def get_stats(self):
        """Get SMS statistics."""
        return {
            'message_length': len(self.message),
            'units_used': self.units,
            'cost': float(self.cost),
            'delivery_time': self.delivery_time,
            'provider': self.get_provider_display(),
            'network': self.network_name or 'Unknown',
        }
    
    def resend(self):
        """Resend failed SMS."""
        if self.status == 'FAILED':
            # Create a new SMS log entry
            new_sms = SMSLog.objects.create(
                notification=self.notification,
                phone_number=self.phone_number,
                message=self.message,
                provider=self.provider,
                metadata=self.metadata,
            )
            return new_sms
        return None
    
    @classmethod
    def get_daily_stats(cls, date=None):
        """Get daily SMS statistics."""
        if date is None:
            date = timezone.now().date()
        
        start_date = timezone.make_aware(timezone.datetime.combine(date, timezone.datetime.min.time()))
        end_date = timezone.make_aware(timezone.datetime.combine(date, timezone.datetime.max.time()))
        
        sms_logs = cls.objects.filter(created_at__range=[start_date, end_date])
        
        total_sms = sms_logs.count()
        sent_sms = sms_logs.filter(status='SENT').count()
        delivered_sms = sms_logs.filter(status='DELIVERED').count()
        failed_sms = sms_logs.filter(status='FAILED').count()
        
        total_cost = sms_logs.aggregate(models.Sum('cost'))['cost__sum'] or 0
        total_units = sms_logs.aggregate(models.Sum('units'))['units__sum'] or 0
        
        return {
            'date': date,
            'total_sms': total_sms,
            'sent_sms': sent_sms,
            'delivered_sms': delivered_sms,
            'failed_sms': failed_sms,
            'delivery_rate': (delivered_sms / sent_sms * 100) if sent_sms > 0 else 0,
            'total_cost': float(total_cost),
            'total_units': total_units,
            'avg_cost_per_sms': float(total_cost / total_sms) if total_sms > 0 else 0,
        }
    
    @classmethod
    def get_provider_stats(cls, days=30):
        """Get SMS statistics by provider."""
        from django.db.models import Count, Sum, Avg
        from django.utils import timezone
        
        date_threshold = timezone.now() - timezone.timedelta(days=days)
        
        stats = cls.objects.filter(
            created_at__gte=date_threshold
        ).values('provider').annotate(
            total=Count('id'),
            sent=Count('id', filter=models.Q(status='SENT')),
            delivered=Count('id', filter=models.Q(status='DELIVERED')),
            failed=Count('id', filter=models.Q(status='FAILED')),
            total_cost=Sum('cost'),
            total_units=Sum('units'),
            avg_delivery_time=Avg(
                models.F('delivered_at') - models.F('sent_at'),
                filter=models.Q(status='DELIVERED')
            ),
        ).order_by('-total')
        
        return list(stats)