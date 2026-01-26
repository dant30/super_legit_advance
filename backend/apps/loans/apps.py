from django.apps import AppConfig


class LoansConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.loans'
    verbose_name = 'Loan Management'
    
    def ready(self):
        """
        Import signals and other startup code.
        """
        try:
            import apps.loans.signals  # noqa: F401
        except ImportError:
            pass