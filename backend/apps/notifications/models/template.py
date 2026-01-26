# backend/apps/notifications/models/template.py
from django.db import models
from django.utils import timezone
from django.core.validators import MaxLengthValidator
from apps.core.models.base import BaseModel


class Template(BaseModel):
    """
    Notification template model for reusable message templates.
    """
    
    # Template types
    TEMPLATE_TYPES = [
        ('SMS', 'SMS Template'),
        ('EMAIL', 'Email Template'),
        ('PUSH', 'Push Notification Template'),
        ('WHATSAPP', 'WhatsApp Template'),
    ]
    
    # Template categories
    CATEGORY_CHOICES = [
        ('LOAN', 'Loan Notifications'),
        ('PAYMENT', 'Payment Notifications'),
        ('ACCOUNT', 'Account Notifications'),
        ('MARKETING', 'Marketing'),
        ('ALERT', 'System Alerts'),
        ('OTHER', 'Other'),
    ]
    
    # Template languages
    LANGUAGE_CHOICES = [
        ('EN', 'English'),
        ('SW', 'Swahili'),
    ]
    
    # Fields
    name = models.CharField(
        max_length=100,
        unique=True,
        verbose_name="Template Name"
    )
    
    template_type = models.CharField(
        max_length=20,
        choices=TEMPLATE_TYPES,
        default='SMS',
        verbose_name="Template Type"
    )
    
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default='LOAN',
        verbose_name="Category"
    )
    
    language = models.CharField(
        max_length=5,
        choices=LANGUAGE_CHOICES,
        default='EN',
        verbose_name="Language"
    )
    
    subject = models.CharField(
        max_length=200,
        blank=True,
        verbose_name="Subject (Email Only)"
    )
    
    content = models.TextField(
        verbose_name="Template Content",
        help_text="Use {{variable}} for dynamic content"
    )
    
    # Variables used in template
    variables = models.JSONField(
        default=list,
        blank=True,
        verbose_name="Available Variables",
        help_text="List of variables used in the template"
    )
    
    # Template configuration
    is_active = models.BooleanField(
        default=True,
        verbose_name="Active"
    )
    
    character_limit = models.IntegerField(
        default=160,
        verbose_name="Character Limit",
        help_text="Maximum characters for SMS templates"
    )
    
    # Usage tracking
    usage_count = models.IntegerField(
        default=0,
        verbose_name="Usage Count"
    )
    
    last_used = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Last Used"
    )
    
    # Metadata
    description = models.TextField(
        blank=True,
        verbose_name="Description"
    )
    
    sample_data = models.JSONField(
        default=dict,
        blank=True,
        verbose_name="Sample Data",
        help_text="Sample data for testing the template"
    )
    
    class Meta:
        verbose_name = "Template"
        verbose_name_plural = "Templates"
        ordering = ['name', 'category']
        indexes = [
            models.Index(fields=['template_type', 'is_active']),
            models.Index(fields=['category', 'is_active']),
            models.Index(fields=['language', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.get_template_type_display()})"
    
    def save(self, *args, **kwargs):
        """Override save to extract variables from content."""
        import re
        
        # Extract variables from content
        variables = re.findall(r'\{\{(\w+)\}\}', self.content)
        self.variables = list(set(variables))  # Remove duplicates
        
        super().save(*args, **kwargs)
    
    @property
    def is_sms_template(self):
        """Check if template is for SMS."""
        return self.template_type == 'SMS'
    
    @property
    def is_email_template(self):
        """Check if template is for email."""
        return self.template_type == 'EMAIL'
    
    def render(self, context=None):
        """Render template with context data."""
        if context is None:
            context = {}
        
        content = self.content
        for key, value in context.items():
            placeholder = f'{{{{{key}}}}}'
            content = content.replace(placeholder, str(value))
        
        # Check character limit for SMS
        if self.is_sms_template and len(content) > self.character_limit:
            content = content[:self.character_limit - 3] + '...'
        
        return content
    
    def render_subject(self, context=None):
        """Render email subject with context data."""
        if context is None:
            context = {}
        
        subject = self.subject
        for key, value in context.items():
            placeholder = f'{{{{{key}}}}}'
            subject = subject.replace(placeholder, str(value))
        
        return subject
    
    def validate_context(self, context):
        """Validate that all required variables are provided."""
        missing_vars = []
        for var in self.variables:
            if var not in context:
                missing_vars.append(var)
        
        if missing_vars:
            raise ValueError(f"Missing variables: {', '.join(missing_vars)}")
        
        return True
    
    def increment_usage(self):
        """Increment usage counter."""
        self.usage_count += 1
        self.last_used = timezone.now()
        self.save()
    
    def get_sample_render(self):
        """Get sample rendering with sample data."""
        try:
            return self.render(self.sample_data)
        except Exception:
            return self.render()
    
    def get_stats(self):
        """Get template usage statistics."""
        from .notification import Notification
        
        notifications = Notification.objects.filter(template=self)
        
        return {
            'total_used': self.usage_count,
            'notifications_count': notifications.count(),
            'success_rate': self.calculate_success_rate(notifications),
            'last_used': self.last_used,
        }
    
    def calculate_success_rate(self, notifications=None):
        """Calculate success rate of notifications using this template."""
        if notifications is None:
            from .notification import Notification
            notifications = Notification.objects.filter(template=self)
        
        total = notifications.count()
        if total == 0:
            return 0
        
        successful = notifications.filter(status__in=['SENT', 'DELIVERED', 'READ']).count()
        return (successful / total) * 100
    
    def duplicate(self, new_name):
        """Duplicate template with a new name."""
        duplicate = Template.objects.create(
            name=new_name,
            template_type=self.template_type,
            category=self.category,
            language=self.language,
            subject=self.subject,
            content=self.content,
            variables=self.variables,
            description=self.description,
            sample_data=self.sample_data,
            character_limit=self.character_limit,
        )
        return duplicate