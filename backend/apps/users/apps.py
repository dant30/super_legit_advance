# backend/apps/users/apps.py
from django.apps import AppConfig
from django.db.models.signals import post_migrate
from django.dispatch import receiver


class UsersConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.users"
    verbose_name = "Users & Authentication"

    def ready(self):
        """
        Import signals and connect signals.
        """
        from . import signals
        
        # Import here to avoid circular imports
        from django.db.models.signals import post_save
        from .models import User
        
        # Connect user signals with CORRECT function names
        post_save.connect(signals.handle_user_role_change, sender=User)
        post_save.connect(signals.assign_default_group, sender=User)
        
        # Remove the pre_save connection - it doesn't exist
        # If you need pre_save functionality, add it to signals.py first
        
        print(f"{self.verbose_name} app initialized successfully")


@receiver(post_migrate)
def create_default_groups(sender, **kwargs):
    """
    Create default user groups and permissions after migrations.
    """
    from django.contrib.auth.models import Group, Permission
    from django.contrib.contenttypes.models import ContentType
    from ..core.constants import ROLE_ADMIN, ROLE_STAFF, ROLE_OFFICER, ROLE_CUSTOMER
    
    # Only run for this app
    if sender.name != 'apps.users':
        return
    
    print("Creating default user groups...")
    
    # Define group permissions mapping
    group_permissions = {
        ROLE_ADMIN: [
            'add_user', 'change_user', 'delete_user', 'view_user',
            'add_staffprofile', 'change_staffprofile', 'delete_staffprofile', 'view_staffprofile',
            'add_loan', 'change_loan', 'delete_loan', 'view_loan',
            'add_customer', 'change_customer', 'delete_customer', 'view_customer',
        ],
        ROLE_STAFF: [
            'add_user', 'change_user', 'view_user',
            'view_staffprofile',
            'add_loan', 'change_loan', 'view_loan',
            'add_customer', 'change_customer', 'view_customer',
        ],
        ROLE_OFFICER: [
            'view_user',
            'add_loan', 'change_loan', 'view_loan',
            'add_customer', 'change_customer', 'view_customer',
        ],
        ROLE_CUSTOMER: [
            'view_user',  # Only their own profile
        ]
    }
    
    for group_name, permission_codenames in group_permissions.items():
        group, created = Group.objects.get_or_create(name=group_name)
        
        if created:
            print(f"  Created group: {group_name}")
            
            # Add permissions to group
            permissions = []
            for codename in permission_codenames:
                try:
                    # Split permission codename
                    parts = codename.split('_', 1)
                    if len(parts) == 2:
                        action, model_name = parts
                        
                        # Map model names
                        if model_name == 'user':
                            app_label = 'users'
                            model_name = 'user'
                        elif model_name == 'staffprofile':
                            app_label = 'users'
                            model_name = 'staffprofile'
                        elif model_name == 'loan':
                            app_label = 'loans'
                            model_name = 'loan'
                        elif model_name == 'customer':
                            app_label = 'customers'
                            model_name = 'customer'
                        else:
                            continue
                        
                        # Get content type
                        try:
                            content_type = ContentType.objects.get(
                                app_label=app_label,
                                model=model_name
                            )
                        except ContentType.DoesNotExist:
                            # Try with 'apps.' prefix
                            content_type = ContentType.objects.get(
                                app_label=f"apps.{app_label}",
                                model=model_name
                            )
                        
                        # Get permission
                        permission = Permission.objects.get(
                            content_type=content_type,
                            codename=codename
                        )
                        permissions.append(permission)
                except (Permission.DoesNotExist, ContentType.DoesNotExist, ValueError) as e:
                    print(f"    Warning: Permission {codename} not found: {e}")
                    continue
            
            if permissions:
                group.permissions.set(permissions)
                print(f"    Added {len(permissions)} permissions")
    
    print("Default groups setup complete!")