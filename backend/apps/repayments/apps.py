# backend/apps/repayments/apps.py
from django.apps import AppConfig


class RepaymentsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.repayments'
    verbose_name = 'Repayment Management'
    
    def ready(self):
        """
        Import signals and other startup code.
        """
        try:
            import apps.repayments.signals  # noqa: F401
        except ImportError:
            pass