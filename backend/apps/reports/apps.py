from django.apps import AppConfig


class ReportsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.reports'
    verbose_name = 'Reports & Analytics'
    
    def ready(self):
        """
        Import signals or other startup code.
        """
        try:
            import apps.reports.signals  # noqa: F401
        except ImportError:
            pass