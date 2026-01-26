# backend/apps/core/models/base.py
from django.db import models
from django.utils import timezone
import uuid


class UUIDModel(models.Model):
    """
    Abstract model that provides a UUID primary key.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    class Meta:
        abstract = True


class TimeStampedModel(models.Model):
    """
    Adds created_at and updated_at to models.
    Automatically managed timestamps.
    """
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)

    class Meta:
        abstract = True
        ordering = ['-created_at']
    
    def save(self, *args, **kwargs):
        """
        Override save to ensure timestamps are handled correctly.
        """
        if self.pk:  # If object already exists
            self.updated_at = timezone.now()
        super().save(*args, **kwargs)


class SoftDeleteModel(models.Model):
    """
    Soft delete instead of hard delete.
    Includes deletion tracking and manager for filtering deleted objects.
    """
    is_deleted = models.BooleanField(default=False, db_index=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    deleted_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='deleted_%(class)s_set'
    )
    
    class Meta:
        abstract = True
    
    def soft_delete(self, deleted_by=None):
        """
        Soft delete the instance.
        """
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.deleted_by = deleted_by
        self.save()
    
    def restore(self):
        """
        Restore a soft-deleted instance.
        """
        self.is_deleted = False
        self.deleted_at = None
        self.deleted_by = None
        self.save()


class StatusModel(models.Model):
    """
    Abstract model for objects with status tracking.
    """
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('archived', 'Archived'),
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft',
        db_index=True
    )
    status_changed_at = models.DateTimeField(null=True, blank=True)
    status_changed_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='%(class)s_status_changes'
    )
    
    class Meta:
        abstract = True
    
    def set_status(self, status, changed_by=None):
        """
        Set status with tracking.
        """
        old_status = self.status
        self.status = status
        self.status_changed_at = timezone.now()
        self.status_changed_by = changed_by
        self.save()
        
        # Signal or hook for status change
        self.on_status_change(old_status, status)
    
    def on_status_change(self, old_status, new_status):
        """
        Hook for status change events.
        Override in concrete models.
        """
        pass


class AuditableModel(models.Model):
    """
    Abstract model for objects that need audit trail.
    """
    created_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_%(class)s_set'
    )
    updated_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='updated_%(class)s_set'
    )
    
    class Meta:
        abstract = True


# ADD THIS NEW CLASS - BaseModel that combines all features
class BaseModel(UUIDModel, TimeStampedModel, AuditableModel):
    """
    Base model combining UUID, timestamps, and audit features.
    This should be used as the base for most models in the application.
    """
    
    class Meta:
        abstract = True
    
    def save(self, *args, **kwargs):
        """
        Override save to handle all base model functionality.
        """
        # Call parent save methods
        super().save(*args, **kwargs)


class SystemSetting(models.Model):
    """
    System-wide settings storage.
    """
    DATA_TYPE_CHOICES = (
        ('string', 'String'),
        ('integer', 'Integer'),
        ('float', 'Float'),
        ('boolean', 'Boolean'),
        ('json', 'JSON'),
        ('date', 'Date'),
    )
    
    key = models.CharField(max_length=100, unique=True, db_index=True)
    value = models.TextField()
    description = models.TextField(blank=True)
    data_type = models.CharField(max_length=20, choices=DATA_TYPE_CHOICES, default='string')
    is_public = models.BooleanField(default=False)
    is_encrypted = models.BooleanField(default=False)
    category = models.CharField(max_length=50, blank=True, db_index=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['category', 'key']
        verbose_name = 'System Setting'
        verbose_name_plural = 'System Settings'
    
    def __str__(self):
        return f"{self.key} ({self.data_type})"
    
    def get_value(self):
        """
        Get the typed value based on data_type.
        """
        from apps.core.utils.helpers import SettingHelper
        return SettingHelper.get_typed_value(self.value, self.data_type)