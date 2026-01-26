# backend/apps/core/management/commands/setup_default_data.py
from django.core.management.base import BaseCommand
from django.db import transaction
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Setup core default data (SystemSettings, etc.)'

    def handle(self, *args, **options):
        from apps.core.models import SystemSetting
        
        defaults = [
            {
                "key": "SYSTEM_NAME",
                "value": "Super Legit Advance",
                "description": "Name of the loan management system",
                "data_type": "string",
                "is_public": True,
                "category": "general",
            },
            {
                "key": "MAX_LOAN_AMOUNT",
                "value": "500000",
                "description": "Maximum loan amount allowed",
                "data_type": "float",
                "is_public": True,
                "category": "loans",
            },
            {
                "key": "MIN_LOAN_AMOUNT",
                "value": "1000",
                "description": "Minimum loan amount allowed",
                "data_type": "float",
                "is_public": True,
                "category": "loans",
            },
            {
                "key": "DEFAULT_INTEREST_RATE",
                "value": "12.5",
                "description": "Default annual interest rate (%)",
                "data_type": "float",
                "is_public": True,
                "category": "loans",
            },
            {
                "key": "LATE_PAYMENT_GRACE_DAYS",
                "value": "3",
                "description": "Grace period for late payments (days)",
                "data_type": "integer",
                "is_public": True,
                "category": "repayments",
            },
            {
                "key": "LATE_PAYMENT_PENALTY_RATE",
                "value": "5.0",
                "description": "Late payment penalty rate (%)",
                "data_type": "float",
                "is_public": True,
                "category": "repayments",
            },
            {
                "key": "COMPANY_ADDRESS",
                "value": "Nairobi, Kenya",
                "description": "Company physical address",
                "data_type": "string",
                "is_public": True,
                "category": "company",
            },
            {
                "key": "SUPPORT_EMAIL",
                "value": "support@superlegitadvance.com",
                "description": "Support email address",
                "data_type": "string",
                "is_public": True,
                "category": "company",
            },
            {
                "key": "SUPPORT_PHONE",
                "value": "+254700000000",
                "description": "Support phone number",
                "data_type": "string",
                "is_public": True,
                "category": "company",
            },
            {
                "key": "WORKING_HOURS",
                "value": "Mon-Fri: 8:00 AM - 5:00 PM",
                "description": "Working hours",
                "data_type": "string",
                "is_public": True,
                "category": "company",
            },
        ]

        created_count = 0
        updated_count = 0
        
        with transaction.atomic():
            for setting_data in defaults:
                obj, created = SystemSetting.objects.update_or_create(
                    key=setting_data["key"],
                    defaults=setting_data,
                )
                if created:
                    created_count += 1
                    self.stdout.write(self.style.SUCCESS(f'Created setting: {setting_data["key"]}'))
                else:
                    updated_count += 1
                    self.stdout.write(self.style.WARNING(f'Updated setting: {setting_data["key"]}'))
        
        self.stdout.write(self.style.SUCCESS(
            f'Successfully setup {created_count} new settings and updated {updated_count} existing settings.'
        ))