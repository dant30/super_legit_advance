# backend/apps/audit/apps.py
from django.apps import AppConfig


class AuditConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.audit'
    verbose_name = 'Audit Logging'
    
    def ready(self):
        """
        Import signals when app is ready.
        """
        # Don't import signals during migrations
        import sys
        if 'migrate' in sys.argv or 'makemigrations' in sys.argv:
            return
        
        try:
            import apps.audit.signals  # noqa: F401
        except ImportError as e:
            print(f"Error importing audit signals: {e}")