# backend/apps/core/apps.py
from django.apps import AppConfig
from django.db.models.signals import post_migrate
import logging

logger = logging.getLogger(__name__)


class CoreConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.core"
    verbose_name = "Core / Shared Logic"

    def ready(self):
        """
        App initialization hook.
        Used ONLY for registrations (signals, validators, hooks).
        """

        # -----------------------------
        # Register signals
        # -----------------------------
        try:
            import apps.core.signals  # noqa: F401
        except ImportError:
            logger.debug("No core signals to register")

        # -----------------------------
        # Register validators
        # -----------------------------
        try:
            from .utils.validators import ValidatorRegistry
            from .utils import validators

            ValidatorRegistry.register("phone", validators.validate_phone_number)
            ValidatorRegistry.register("email", validators.validate_email)
            ValidatorRegistry.register("id_number", validators.validate_id_number)

        except Exception as exc:
            logger.warning(
                "Validator registration failed in CoreConfig: %s", exc
            )

        # -----------------------------
        # Post-migrate default data hook
        # -----------------------------
        post_migrate.connect(
            setup_core_default_data,
            sender=self,
            dispatch_uid="core_setup_default_data",
        )

        logger.info("%s initialized", self.verbose_name)


def setup_core_default_data(sender, **kwargs):
    """
    Create default system settings after migrations.
    Runs safely via post_migrate.
    """
    from django.db import transaction
    from .models import SystemSetting

    defaults = [
        {
            "key": "SYSTEM_NAME",
            "value": "Super Legit Advance",
            "description": "Name of the loan management system",
            "data_type": "string",
        },
        {
            "key": "MAX_LOAN_AMOUNT",
            "value": "500000",
            "description": "Maximum loan amount allowed",
            "data_type": "float",
        },
        {
            "key": "DEFAULT_INTEREST_RATE",
            "value": "12.5",
            "description": "Default annual interest rate (%)",
            "data_type": "float",
        },
        {
            "key": "LATE_PAYMENT_GRACE_DAYS",
            "value": "3",
            "description": "Grace period for late payments (days)",
            "data_type": "integer",
        },
    ]

    with transaction.atomic():
        for setting in defaults:
            SystemSetting.objects.get_or_create(
                key=setting["key"],
                defaults=setting,
            )
