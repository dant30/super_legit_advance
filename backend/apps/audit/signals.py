# backend/apps/audit/signals.py
"""
Signals for automatic audit logging of model changes.
"""

from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db import connection
from django.core.exceptions import AppRegistryNotReady
import json

User = get_user_model()

# Models to exclude from automatic logging
EXCLUDED_MODELS = ['AuditLog', 'Session', 'ContentType', 'LogEntry', 'Migration']


def is_migrating():
    """Check if currently running migrations."""
    import sys
    return 'migrate' in sys.argv or 'makemigrations' in sys.argv


def is_table_exists(table_name):
    """Check if a table exists in the database."""
    try:
        with connection.cursor() as cursor:
            if connection.vendor == 'sqlite':
                cursor.execute(
                    "SELECT name FROM sqlite_master WHERE type='table' AND name=%s",
                    [table_name]
                )
            elif connection.vendor == 'postgresql':
                cursor.execute(
                    "SELECT tablename FROM pg_tables WHERE tablename = %s",
                    [table_name]
                )
            elif connection.vendor == 'mysql':
                cursor.execute(
                    "SHOW TABLES LIKE %s",
                    [table_name]
                )
            return cursor.fetchone() is not None
    except:
        return False


@receiver(pre_save)
def model_pre_save(sender, instance, **kwargs):
    """Store previous state of model before save."""
    # Skip during migrations
    if is_migrating():
        return
    
    # Skip excluded models
    if sender.__name__ in EXCLUDED_MODELS:
        return
    
    # Check if audit table exists
    if not is_table_exists('audit_auditlog'):
        return
    
    # Skip if instance doesn't have an ID (new object)
    if not instance.pk:
        return
    
    try:
        # Get the old instance from database
        old_instance = sender.objects.get(pk=instance.pk)
        
        # Store in thread local for post_save to access
        import threading
        thread_local = threading.local()
        if not hasattr(thread_local, 'audit_pre_save_data'):
            thread_local.audit_pre_save_data = {}
        
        thread_local.audit_pre_save_data[sender.__name__] = {
            'instance_id': instance.pk,
            'old_instance': old_instance,
        }
    except sender.DoesNotExist:
        pass
    except Exception as e:
        # Don't break the save operation
        import logging
        logger = logging.getLogger(__name__)
        logger.debug(f"Error in model_pre_save for {sender.__name__}: {e}")


@receiver(post_save)
def model_post_save(sender, instance, created, **kwargs):
    """Log model create/update events."""
    # Skip during migrations
    if is_migrating():
        return
    
    # Skip excluded models
    if sender.__name__ in EXCLUDED_MODELS:
        return
    
    # Check if audit table exists
    if not is_table_exists('audit_auditlog'):
        return
    
    # Determine action
    action = 'CREATE' if created else 'UPDATE'
    
    # Get changes if update
    changes = None
    if not created:
        try:
            import threading
            thread_local = threading.local()
            if hasattr(thread_local, 'audit_pre_save_data'):
                pre_save_data = thread_local.audit_pre_save_data.get(sender.__name__)
                
                if pre_save_data and pre_save_data['instance_id'] == instance.pk:
                    old_instance = pre_save_data['old_instance']
                    
                    # Compare fields and find changes
                    changes = {}
                    for field in instance._meta.fields:
                        field_name = field.name
                        old_value = getattr(old_instance, field_name, None)
                        new_value = getattr(instance, field_name, None)
                        
                        # Skip if values are the same
                        if old_value == new_value:
                            continue
                        
                        # Convert to string for JSON serialization
                        if hasattr(old_value, 'pk'):
                            old_value = str(old_value.pk)
                        if hasattr(new_value, 'pk'):
                            new_value = str(new_value.pk)
                        
                        changes[field_name] = {
                            'old': old_value,
                            'new': new_value,
                        }
                    
                    # Clean up thread local
                    del thread_local.audit_pre_save_data[sender.__name__]
        except:
            pass
    
    # Try to get request from thread local (set by middleware)
    request = None
    try:
        import threading
        thread_local = threading.local()
        if hasattr(thread_local, 'current_request'):
            request = thread_local.current_request
    except:
        pass
    
    # Create audit log
    try:
        from apps.audit.models import AuditLog
        AuditLog.log_action(
            action=action,
            model_name=sender.__name__,
            object_id=instance.pk,
            object_repr=str(instance),
            changes=changes,
            request=request,
            module=sender._meta.app_label,
            feature=f'{sender.__name__.lower()}_{"create" if created else "update"}',
            tags=['model', 'save', 'create' if created else 'update'],
        )
    except Exception as e:
        # Don't let audit logging break the save operation
        import logging
        logger = logging.getLogger(__name__)
        logger.debug(f"Failed to create audit log for {sender.__name__}: {str(e)}")


@receiver(post_delete)
def model_post_delete(sender, instance, **kwargs):
    """Log model delete events."""
    # Skip during migrations
    if is_migrating():
        return
    
    # Skip excluded models
    if sender.__name__ in EXCLUDED_MODELS:
        return
    
    # Check if audit table exists
    if not is_table_exists('audit_auditlog'):
        return
    
    # Try to get request from thread local
    request = None
    try:
        import threading
        thread_local = threading.local()
        if hasattr(thread_local, 'current_request'):
            request = thread_local.current_request
    except:
        pass
    
    # Create audit log
    try:
        from apps.audit.models import AuditLog
        AuditLog.log_action(
            action='DELETE',
            model_name=sender.__name__,
            object_id=instance.pk,
            object_repr=str(instance),
            request=request,
            module=sender._meta.app_label,
            feature=f'{sender.__name__.lower()}_delete',
            tags=['model', 'delete'],
        )
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.debug(f"Failed to create audit log for delete: {str(e)}")