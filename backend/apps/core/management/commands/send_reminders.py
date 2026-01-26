# backend/apps/core/management/commands/send_reminders.py
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.conf import settings
from apps.core.utils.helpers import DateHelper
from apps.notifications.tasks import send_payment_reminders
from apps.loans.models import Loan
from apps.repayments.models import Repayment
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Send system reminders for upcoming payments and overdue items"
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Simulate sending reminders without actually sending',
        )
        parser.add_argument(
            '--days-ahead',
            type=int,
            default=3,
            help='Number of days ahead to send reminders for upcoming payments',
        )
        parser.add_argument(
            '--overdue-only',
            action='store_true',
            help='Only process overdue items',
        )
    
    def handle(self, *args, **options):
        """
        Send reminders for:
        1. Upcoming payments (within specified days)
        2. Overdue payments
        3. Loan applications needing review
        """
        dry_run = options['dry_run']
        days_ahead = options['days_ahead']
        overdue_only = options['overdue_only']
        
        start_time = timezone.now()
        self.stdout.write(
            self.style.SUCCESS(f"Starting reminder processing at {start_time}")
        )
        
        stats = {
            'upcoming_reminders': 0,
            'overdue_reminders': 0,
            'review_reminders': 0,
            'errors': 0,
        }
        
        try:
            if not overdue_only:
                # 1. Process upcoming payment reminders
                stats['upcoming_reminders'] = self.process_upcoming_payments(days_ahead, dry_run)
            
            # 2. Process overdue payments
            stats['overdue_reminders'] = self.process_overdue_payments(dry_run)
            
            # 3. Process pending loan applications
            stats['review_reminders'] = self.process_pending_applications(dry_run)
            
            # 4. Send batch email reports to staff (optional)
            if not dry_run and stats['total'] > 0:
                self.send_daily_report(stats)
            
        except Exception as e:
            stats['errors'] += 1
            logger.error(f"Error in send_reminders command: {e}", exc_info=True)
            self.stdout.write(self.style.ERROR(f"Error: {e}"))
        
        end_time = timezone.now()
        duration = (end_time - start_time).total_seconds()
        
        self.stdout.write("\n" + "="*50)
        self.stdout.write("REMINDER PROCESSING COMPLETE")
        self.stdout.write("="*50)
        self.stdout.write(f"Start time: {start_time}")
        self.stdout.write(f"End time: {end_time}")
        self.stdout.write(f"Duration: {duration:.2f} seconds")
        self.stdout.write("-"*50)
        self.stdout.write(f"Upcoming reminders sent: {stats['upcoming_reminders']}")
        self.stdout.write(f"Overdue reminders sent: {stats['overdue_reminders']}")
        self.stdout.write(f"Review reminders sent: {stats['review_reminders']}")
        self.stdout.write(f"Errors encountered: {stats['errors']}")
        self.stdout.write("="*50)
        
        if dry_run:
            self.stdout.write(self.style.WARNING("DRY RUN - No actual reminders sent"))
        else:
            self.stdout.write(self.style.SUCCESS("Reminders processed successfully"))
    
    def process_upcoming_payments(self, days_ahead, dry_run):
        """
        Find payments due in the next X days and send reminders.
        """
        from apps.core.utils.date_utils import days_from_now
        
        today = DateHelper.today()
        due_date = days_from_now(days_ahead).date()
        
        # Find repayments due in the specified period
        upcoming_repayments = Repayment.objects.filter(
            due_date__range=[today, due_date],
            status__in=['pending', 'upcoming'],
            is_deleted=False,
        ).select_related('loan', 'loan__customer')
        
        count = 0
        
        for repayment in upcoming_repayments:
            try:
                if not dry_run:
                    # Use Celery task for async processing
                    send_payment_reminders.delay(repayment.id)
                
                count += 1
                
                self.stdout.write(
                    self.style.NOTICE(
                        f"Upcoming: {repayment.loan.customer.get_full_name()} - "
                        f"Amount: {repayment.amount} - Due: {repayment.due_date}"
                    )
                )
                
            except Exception as e:
                logger.error(f"Error processing repayment {repayment.id}: {e}")
        
        return count
    
    def process_overdue_payments(self, dry_run):
        """
        Find overdue payments and send reminders.
        """
        from apps.core.utils.date_utils import days_ago
        
        today = DateHelper.today()
        
        overdue_repayments = Repayment.objects.filter(
            due_date__lt=today,
            status__in=['pending', 'overdue'],
            is_deleted=False,
        ).select_related('loan', 'loan__customer')
        
        count = 0
        
        for repayment in overdue_repayments:
            try:
                # Calculate days overdue
                days_overdue = (today - repayment.due_date).days
                
                # Update status if not already marked as overdue
                if repayment.status != 'overdue' and not dry_run:
                    repayment.status = 'overdue'
                    repayment.save(update_fields=['status'])
                
                if not dry_run:
                    # Send overdue reminder
                    from apps.notifications.services.notification_service import NotificationService
                    NotificationService.send_overdue_notification(repayment, days_overdue)
                
                count += 1
                
                self.stdout.write(
                    self.style.WARNING(
                        f"Overdue: {repayment.loan.customer.get_full_name()} - "
                        f"Amount: {repayment.amount} - "
                        f"Due: {repayment.due_date} ({days_overdue} days overdue)"
                    )
                )
                
            except Exception as e:
                logger.error(f"Error processing overdue repayment {repayment.id}: {e}")
        
        return count
    
    def process_pending_applications(self, dry_run):
        """
        Find loan applications pending review for too long.
        """
        from apps.core.utils.date_utils import days_ago
        
        # Find applications pending for more than 2 days
        cutoff_date = days_ago(2).date()
        
        pending_loans = Loan.objects.filter(
            status='pending',
            created_at__date__lte=cutoff_date,
            is_deleted=False,
        ).select_related('customer')
        
        count = 0
        
        for loan in pending_loans:
            try:
                if not dry_run:
                    # Send reminder to loan officers
                    from apps.notifications.services.notification_service import NotificationService
                    NotificationService.send_application_review_reminder(loan)
                
                count += 1
                
                self.stdout.write(
                    self.style.NOTICE(
                        f"Pending review: {loan.customer.get_full_name()} - "
                        f"Amount: {loan.amount} - "
                        f"Applied: {loan.created_at.date()}"
                    )
                )
                
            except Exception as e:
                logger.error(f"Error processing pending loan {loan.id}: {e}")
        
        return count
    
    def send_daily_report(self, stats):
        """
        Send daily summary report to admin/staff.
        """
        try:
            from django.core.mail import send_mail
            from django.template.loader import render_to_string
            from django.conf import settings
            
            context = {
                'stats': stats,
                'date': DateHelper.today(),
                'total': sum(stats.values()) - stats['errors'],
            }
            
            subject = f"Daily Reminder Report - {DateHelper.today()}"
            html_message = render_to_string('notifications/email/daily_report.html', context)
            plain_message = render_to_string('notifications/email/daily_report.txt', context)
            
            # Send to admin users
            from apps.users.models import User
            admin_emails = User.objects.filter(
                role='admin',
                is_active=True
            ).values_list('email', flat=True)
            
            if admin_emails:
                send_mail(
                    subject=subject,
                    message=plain_message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=list(admin_emails),
                    html_message=html_message,
                    fail_silently=True,
                )
                
                self.stdout.write(
                    self.style.SUCCESS(f"Daily report sent to {len(admin_emails)} admins")
                )
                
        except Exception as e:
            logger.error(f"Error sending daily report: {e}")
            self.stdout.write(self.style.ERROR(f"Failed to send daily report: {e}"))