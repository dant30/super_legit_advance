# backend/apps/notifications/models/notification.py
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.validators import MaxLengthValidator
from apps.core.models.base import BaseModel
import json

User = get_user_model()


class Notification(BaseModel):
    """
    Notification model for storing all system notifications.
    """
    
    # Notification types
    NOTIFICATION_TYPES = [
        ('LOAN_APPROVED', 'Loan Approved'),
        ('LOAN_REJECTED', 'Loan Rejected'),
        ('LOAN_DISBURSED', 'Loan Disbursed'),
        ('PAYMENT_REMINDER', 'Payment Reminder'),
        ('PAYMENT_RECEIVED', 'Payment Received'),
        ('PAYMENT_OVERDUE', 'Payment Overdue'),
        ('ACCOUNT_UPDATE', 'Account Update'),
        ('SYSTEM_ALERT', 'System Alert'),
        ('MARKETING', 'Marketing'),
        ('OTHER', 'Other'),
    ]
    
    # Notification channels
    CHANNEL_CHOICES = [
        ('SMS', 'SMS'),
        ('EMAIL', 'Email'),
        ('PUSH', 'Push Notification'),
        ('IN_APP', 'In-App Notification'),
        ('WHATSAPP', 'WhatsApp'),
    ]
    
    # Notification priorities
    PRIORITY_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('URGENT', 'Urgent'),
    ]
    
    # Notification status
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('SENT', 'Sent'),
        ('FAILED', 'Failed'),
        ('DELIVERED', 'Delivered'),
        ('READ', 'Read'),
        ('ARCHIVED', 'Archived'),
    ]
    
    # Fields
    notification_type = models.CharField(
        max_length=50,
        choices=NOTIFICATION_TYPES,
        verbose_name="Notification Type"
    )
    
    channel = models.CharField(
        max_length=20,
        choices=CHANNEL_CHOICES,
        default='SMS',
        verbose_name="Channel"
    )
    
    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default='MEDIUM',
        verbose_name="Priority"
    )
    
    title = models.CharField(
        max_length=200,
        verbose_name="Title"
    )
    
    message = models.TextField(
        verbose_name="Message",
        validators=[MaxLengthValidator(1000)]
    )
    
    # Recipient information
    recipient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications',
        null=True,
        blank=True,
        verbose_name="Recipient User"
    )
    
    recipient_name = models.CharField(
        max_length=100,
        verbose_name="Recipient Name"
    )
    
    recipient_phone = models.CharField(
        max_length=20,
        verbose_name="Recipient Phone"
    )
    
    recipient_email = models.EmailField(
        blank=True,
        verbose_name="Recipient Email"
    )
    
    # Sender information
    sender = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sent_notifications',
        verbose_name="Sender"
    )
    
    sender_name = models.CharField(
        max_length=100,
        default='Super Legit Advance',
        verbose_name="Sender Name"
    )
    
    # Status tracking
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING',
        verbose_name="Status"
    )
    
    scheduled_for = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Scheduled For"
    )
    
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
    
    read_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Read At"
    )
    
    # Delivery tracking
    delivery_attempts = models.IntegerField(
        default=0,
        verbose_name="Delivery Attempts"
    )
    
    delivery_error = models.TextField(
        blank=True,
        verbose_name="Delivery Error"
    )
    
    external_id = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="External ID (Provider)"
    )
    
    # Related objects (optional)
    related_object_type = models.CharField(
        max_length=50,
        blank=True,
        choices=[
            ('LOAN', 'Loan'),
            ('CUSTOMER', 'Customer'),
            ('REPAYMENT', 'Repayment'),
            ('PAYMENT', 'Payment'),
            ('USER', 'User'),
        ],
        verbose_name="Related Object Type"
    )
    
    related_object_id = models.CharField(
        max_length=50,
        blank=True,
        verbose_name="Related Object ID"
    )
    
    # Metadata
    template = models.ForeignKey(
        'Template',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notifications',
        verbose_name="Template Used"
    )
    
    metadata = models.JSONField(
        default=dict,
        blank=True,
        verbose_name="Metadata"
    )
    
    cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
        verbose_name="Cost (KES)"
    )
    
    class Meta:
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
        ordering = ['-created_at', '-priority']
        indexes = [
            models.Index(fields=['notification_type', 'status']),
            models.Index(fields=['recipient', 'status']),
            models.Index(fields=['scheduled_for', 'status']),
            models.Index(fields=['channel', 'status']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.get_notification_type_display()} - {self.recipient_name}"
    
    def save(self, *args, **kwargs):
        """Override save to handle scheduled notifications."""
        # If scheduled for is in the past, send immediately
        if self.scheduled_for and self.scheduled_for <= timezone.now() and self.status == 'PENDING':
            self.scheduled_for = None
        
        super().save(*args, **kwargs)
    
    @property
    def is_scheduled(self):
        """Check if notification is scheduled."""
        return self.scheduled_for is not None and self.scheduled_for > timezone.now()
    
    @property
    def is_pending(self):
        """Check if notification is pending."""
        return self.status == 'PENDING'
    
    @property
    def is_sent(self):
        """Check if notification is sent."""
        return self.status == 'SENT'
    
    @property
    def is_delivered(self):
        """Check if notification is delivered."""
        return self.status == 'DELIVERED'
    
    @property
    def is_read(self):
        """Check if notification is read."""
        return self.status == 'READ'
    
    @property
    def is_failed(self):
        """Check if notification failed."""
        return self.status == 'FAILED'
    
    @property
    def recipient_info(self):
        """Get recipient information."""
        if self.recipient:
            return {
                'id': self.recipient.id,
                'name': self.recipient.get_full_name(),
                'phone': self.recipient.phone_number,
                'email': self.recipient.email,
            }
        return {
            'name': self.recipient_name,
            'phone': self.recipient_phone,
            'email': self.recipient_email,
        }
    
    def mark_as_sent(self, external_id=None, cost=0.00):
        """Mark notification as sent."""
        self.status = 'SENT'
        self.sent_at = timezone.now()
        if external_id:
            self.external_id = external_id
        if cost:
            self.cost = cost
        self.save()
    
    def mark_as_delivered(self):
        """Mark notification as delivered."""
        self.status = 'DELIVERED'
        self.delivered_at = timezone.now()
        self.save()
    
    def mark_as_read(self):
        """Mark notification as read."""
        self.status = 'READ'
        self.read_at = timezone.now()
        self.save()
    
    def mark_as_failed(self, error_message):
        """Mark notification as failed."""
        self.status = 'FAILED'
        self.delivery_error = error_message
        self.delivery_attempts += 1
        self.save()
    
    def retry(self):
        """Retry sending notification."""
        if self.status == 'FAILED' and self.delivery_attempts < 3:
            self.status = 'PENDING'
            self.save()
            return True
        return False
    
    def get_related_object(self):
        """Get related object if exists."""
        if not self.related_object_type or not self.related_object_id:
            return None
        
        try:
            if self.related_object_type == 'LOAN':
                from apps.loans.models import Loan
                return Loan.objects.get(id=self.related_object_id)
            elif self.related_object_type == 'CUSTOMER':
                from apps.customers.models import Customer
                return Customer.objects.get(id=self.related_object_id)
            elif self.related_object_type == 'REPAYMENT':
                from apps.repayments.models import Repayment
                return Repayment.objects.get(id=self.related_object_id)
            elif self.related_object_type == 'PAYMENT':
                from apps.mpesa.models import Payment
                return Payment.objects.get(id=self.related_object_id)
            elif self.related_object_type == 'USER':
                from apps.users.models import User
                return User.objects.get(id=self.related_object_id)
        except Exception:
            return None
    
    def to_dict(self):
        """Convert notification to dictionary."""
        return {
            'id': self.id,
            'type': self.notification_type,
            'type_display': self.get_notification_type_display(),
            'channel': self.channel,
            'priority': self.priority,
            'title': self.title,
            'message': self.message,
            'recipient': self.recipient_info,
            'sender': self.sender_name,
            'status': self.status,
            'status_display': self.get_status_display(),
            'scheduled_for': self.scheduled_for,
            'sent_at': self.sent_at,
            'delivered_at': self.delivered_at,
            'read_at': self.read_at,
            'delivery_attempts': self.delivery_attempts,
            'cost': float(self.cost),
            'created_at': self.created_at,
            'related_object': {
                'type': self.related_object_type,
                'id': self.related_object_id,
            } if self.related_object_type else None,
            'metadata': self.metadata,
        }