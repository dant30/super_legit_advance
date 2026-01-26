# backend/apps/customers/apps.py
from django.apps import AppConfig


class CustomersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.customers'
    verbose_name = 'Customer Management'
    
    def ready(self):
        """
        Import signals and other startup code.
        """
        try:
            import apps.customers.signals  # noqa: F401
        except ImportError:
            pass