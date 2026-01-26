# backend/apps/core/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import SystemSetting

@receiver(post_save, sender=SystemSetting)
def system_setting_saved(sender, instance, created, **kwargs):
    if created:
        print(f"SystemSetting created: {instance.key}")
