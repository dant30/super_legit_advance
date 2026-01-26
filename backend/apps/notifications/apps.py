# backend/apps/notifications/apps.py
from django.apps import AppConfig


class NotificationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.notifications'
    verbose_name = 'Notifications'
    
    def ready(self):
        """
        Import signals and connect Celery tasks.
        """
        try:
            import apps.notifications.signals  # noqa: F401
            import apps.notifications.tasks  # noqa: F401
            
            # Setup periodic tasks if not already done
            self.setup_periodic_tasks()
        except ImportError:
            pass
    
    def setup_periodic_tasks(self):
        """Setup periodic tasks for notifications."""
        try:
            from django_celery_beat.models import PeriodicTask, CrontabSchedule
            from datetime import datetime, time
            
            # Schedule daily payment reminders at 9 AM
            schedule, _ = CrontabSchedule.objects.get_or_create(
                minute='0',
                hour='9',
                day_of_week='*',
                day_of_month='*',
                month_of_year='*',
            )
            
            task_name = 'Send Daily Payment Reminders'
            PeriodicTask.objects.get_or_create(
                crontab=schedule,
                name=task_name,
                task='apps.notifications.tasks.send_payment_reminders',
                defaults={
                    'description': 'Send daily payment reminders to customers with due payments',
                    'enabled': True,
                    'one_off': False,
                }
            )
            
            # Schedule overdue notifications at 10 AM
            schedule, _ = CrontabSchedule.objects.get_or_create(
                minute='0',
                hour='10',
                day_of_week='*',
                day_of_month='*',
                month_of_year='*',
            )
            
            task_name = 'Send Overdue Notifications'
            PeriodicTask.objects.get_or_create(
                crontab=schedule,
                name=task_name,
                task='apps.notifications.tasks.send_overdue_notifications',
                defaults={
                    'description': 'Send notifications for overdue loans',
                    'enabled': True,
                    'one_off': False,
                }
            )
            
        except Exception as e:
            # Database might not be ready yet
            pass