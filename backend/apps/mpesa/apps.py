# backend/apps/mpesa/apps.py
from django.apps import AppConfig


class MpesaConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.mpesa'
    verbose_name = 'M-Pesa Payment Integration'
    
    def ready(self):
        """
        Import signals and other startup code.
        """
        try:
            import apps.mpesa.signals  # noqa: F401
        except ImportError:
            pass