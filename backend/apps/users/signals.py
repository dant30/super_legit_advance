# backend/apps/users/signals.py
"""
Signals for the users app.
Handles automatic StaffProfile creation/deletion based on user role changes.
"""
import logging
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.contrib.auth.models import Group
from django.db import transaction

logger = logging.getLogger(__name__)


def handle_user_role_change(sender, instance, created, **kwargs):
    """
    Handle user role changes and create/delete staff profiles.
    Note: This is NOT decorated to avoid circular imports.
    Called directly from User.save() method instead.
    """
    # Import here to avoid circular imports
    from apps.users.models import StaffProfile
    from apps.core.constants import ROLE_ADMIN, ROLE_STAFF, ROLE_OFFICER
    
    is_staff_member = instance.role in [ROLE_ADMIN, ROLE_STAFF, ROLE_OFFICER]
    
    with transaction.atomic():
        if is_staff_member:
            staff_profile, created_profile = StaffProfile.objects.get_or_create(
                user=instance,
                defaults={
                    'employee_id': f"EMP{instance.id.hex[:8].upper()}",
                    'department': 'operations' if instance.role == ROLE_OFFICER else 'administration',
                    'position': 'Loan Officer' if instance.role == ROLE_OFFICER else 'Staff Member',
                    'approval_tier': 'junior',
                }
            )
            
            if created_profile:
                logger.info(f"StaffProfile created for user {instance.email}")
        else:
            deleted_count, _ = StaffProfile.objects.filter(user=instance).delete()
            if deleted_count > 0:
                logger.info(f"StaffProfile deleted for user {instance.email}")


def assign_default_group(sender, instance, created, **kwargs):
    """
    Assign user to appropriate group based on role.
    Note: This is NOT decorated to avoid circular imports.
    Called directly from User.save() method instead.
    """
    from apps.core.constants import ROLE_ADMIN, ROLE_STAFF, ROLE_OFFICER
    
    try:
        instance.groups.clear()
        
        group, _ = Group.objects.get_or_create(name=instance.role)
        instance.groups.add(group)
        
        if instance.role in [ROLE_ADMIN, ROLE_STAFF, ROLE_OFFICER]:
            staff_group, _ = Group.objects.get_or_create(name='staff')
            instance.groups.add(staff_group)
        
        logger.debug(f"Groups assigned to user {instance.email}")
        
    except Exception as e:
        logger.error(f"Error assigning group to user {instance.id}: {e}", exc_info=True)


# Register signals in ready() instead
def ready_handler():
    """Called from AppConfig.ready()"""
    from django.db.models.signals import post_save
    from apps.users.models import User
    
    post_save.connect(
        lambda sender, **kwargs: assign_default_group(sender, **kwargs),
        sender=User,
        dispatch_uid='users_assign_groups'
    )