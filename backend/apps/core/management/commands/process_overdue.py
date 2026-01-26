# backend/apps/core/management/commands/process_overdue.py
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction
from django.conf import settings
from apps.core.utils.helpers import DateHelper, FinancialHelper
from apps.loans.models import Loan
from apps.repayments.models import Repayment, Penalty
from apps.notifications.services.notification_service import NotificationService
from apps.audit.models import AuditLog
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Process overdue loans and repayments, apply penalties, and update statuses"
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Simulate processing without making changes',
        )
        parser.add_argument(
            '--days-overdue',
            type=int,
            default=30,
            help='Number of days after which loan is considered defaulted',
        )
        parser.add_argument(
            '--apply-penalties',
            action='store_true',
            default=True,
            help='Apply penalties to overdue repayments',
        )
        parser.add_argument(
            '--send-notifications',
            action='store_true',
            default=True,
            help='Send notifications to customers',
        )
        parser.add_argument(
            '--update-status',
            action='store_true',
            default=True,
            help='Update loan statuses (active -> overdue -> defaulted)',
        )
    
    def handle(self, *args, **options):
        """
        Process overdue items with comprehensive handling.
        """
        dry_run = options['dry_run']
        days_for_default = options['days_overdue']
        apply_penalties = options['apply_penalties']
        send_notifications = options['send_notifications']
        update_status = options['update_status']
        
        start_time = timezone.now()
        today = DateHelper.today()
        
        self.stdout.write(
            self.style.SUCCESS(f"Starting overdue processing at {start_time}")
        )
        self.stdout.write(f"Today's date: {today}")
        
        if dry_run:
            self.stdout.write(self.style.WARNING("DRY RUN MODE - No changes will be made"))
        
        stats = {
            'loans_processed': 0,
            'repayments_processed': 0,
            'penalties_applied': 0,
            'notifications_sent': 0,
            'loans_defaulted': 0,
            'errors': 0,
        }
        
        try:
            # 1. Process overdue repayments
            if apply_penalties:
                stats['repayments_processed'], stats['penalties_applied'] = self.process_overdue_repayments(
                    today, dry_run, send_notifications
                )
            
            # 2. Update loan statuses
            if update_status:
                stats['loans_processed'], stats['loans_defaulted'] = self.update_loan_statuses(
                    today, days_for_default, dry_run, send_notifications
                )
            
            # 3. Generate report
            self.generate_overdue_report(stats, today, dry_run)
            
        except Exception as e:
            stats['errors'] += 1
            logger.error(f"Error in process_overdue command: {e}", exc_info=True)
            self.stdout.write(self.style.ERROR(f"Error: {e}"))
        
        end_time = timezone.now()
        duration = (end_time - start_time).total_seconds()
        
        self.stdout.write("\n" + "="*60)
        self.stdout.write("OVERDUE PROCESSING COMPLETE")
        self.stdout.write("="*60)
        self.stdout.write(f"Loans processed: {stats['loans_processed']}")
        self.stdout.write(f"Repayments processed: {stats['repayments_processed']}")
        self.stdout.write(f"Penalties applied: {stats['penalties_applied']}")
        self.stdout.write(f"Notifications sent: {stats['notifications_sent']}")
        self.stdout.write(f"Loans marked as defaulted: {stats['loans_defaulted']}")
        self.stdout.write(f"Errors encountered: {stats['errors']}")
        self.stdout.write(f"Duration: {duration:.2f} seconds")
        self.stdout.write("="*60)
        
        if dry_run:
            self.stdout.write(self.style.WARNING("DRY RUN - No actual changes made"))
        else:
            self.stdout.write(self.style.SUCCESS("Overdue processing completed successfully"))
    
    def process_overdue_repayments(self, today, dry_run, send_notifications):
        """
        Process overdue repayments and apply penalties.
        """
        repayments_processed = 0
        penalties_applied = 0
        
        # Find repayments that are overdue
        overdue_repayments = Repayment.objects.filter(
            due_date__lt=today,
            status__in=['pending', 'overdue'],
            is_deleted=False,
        ).select_related('loan', 'loan__customer')
        
        self.stdout.write(f"\nFound {overdue_repayments.count()} overdue repayments")
        
        for repayment in overdue_repayments:
            try:
                days_overdue = (today - repayment.due_date).days
                
                self.stdout.write(
                    f"\nProcessing repayment {repayment.id}: "
                    f"Customer: {repayment.loan.customer.get_full_name()}, "
                    f"Amount: {FinancialHelper.format_currency(repayment.amount)}, "
                    f"Due: {repayment.due_date}, "
                    f"Days overdue: {days_overdue}"
                )
                
                # Apply penalty if overdue more than grace period
                grace_period = 7  # 7-day grace period
                if days_overdue > grace_period and not dry_run:
                    penalty_applied = self.apply_penalty(repayment, days_overdue)
                    if penalty_applied:
                        penalties_applied += 1
                        self.stdout.write(
                            self.style.WARNING(f"  Applied penalty for {days_overdue} days overdue")
                        )
                
                # Update repayment status
                if repayment.status != 'overdue' and not dry_run:
                    repayment.status = 'overdue'
                    repayment.overdue_days = days_overdue
                    repayment.save(update_fields=['status', 'overdue_days'])
                    self.stdout.write("  Updated status to 'overdue'")
                
                # Send notification
                if send_notifications and not dry_run:
                    if days_overdue <= grace_period:
                        # Grace period notification
                        NotificationService.send_grace_period_notification(repayment, days_overdue)
                    else:
                        # Overdue notification
                        NotificationService.send_overdue_notification(repayment, days_overdue)
                    
                    self.stdout.write("  Sent notification")
                
                repayments_processed += 1
                
            except Exception as e:
                logger.error(f"Error processing repayment {repayment.id}: {e}")
                self.stdout.write(self.style.ERROR(f"  Error: {e}"))
        
        return repayments_processed, penalties_applied
    
    def apply_penalty(self, repayment, days_overdue):
        """
        Apply penalty to overdue repayment.
        """
        try:
            # Calculate penalty amount
            penalty_rate = 5.0  # 5% penalty rate (configurable)
            penalty_amount = FinancialHelper.calculate_penalty(
                repayment.amount, penalty_rate, days_overdue - 7  # Subtract grace period
            )
            
            # Create penalty record
            penalty = Penalty.objects.create(
                repayment=repayment,
                amount=penalty_amount,
                rate=penalty_rate,
                days_overdue=days_overdue,
                calculated_at=timezone.now(),
            )
            
            # Update repayment with penalty
            repayment.penalty_amount = penalty_amount
            repayment.total_due = repayment.amount + penalty_amount
            repayment.save(update_fields=['penalty_amount', 'total_due'])
            
            # Log penalty application
            AuditLog.objects.create(
                action='penalty_applied',
                model_name='Repayment',
                model_id=str(repayment.id),
                new_value=f"Penalty applied: {penalty_amount}",
                description=f"Penalty applied for {days_overdue} days overdue",
            )
            
            return True
            
        except Exception as e:
            logger.error(f"Error applying penalty to repayment {repayment.id}: {e}")
            return False
    
    def update_loan_statuses(self, today, days_for_default, dry_run, send_notifications):
        """
        Update loan statuses based on overdue repayments.
        """
        loans_processed = 0
        loans_defaulted = 0
        
        # Find active loans with overdue repayments
        active_loans = Loan.objects.filter(
            status='active',
            is_deleted=False,
        ).prefetch_related('repayments')
        
        self.stdout.write(f"\nChecking {active_loans.count()} active loans")
        
        for loan in active_loans:
            try:
                # Check for overdue repayments
                overdue_repayments = loan.repayments.filter(
                    status='overdue',
                    is_deleted=False,
                )
                
                if not overdue_repayments.exists():
                    continue
                
                # Find the oldest overdue repayment
                oldest_overdue = overdue_repayments.order_by('due_date').first()
                days_overdue = (today - oldest_overdue.due_date).days
                
                self.stdout.write(
                    f"\nProcessing loan {loan.id}: "
                    f"Customer: {loan.customer.get_full_name()}, "
                    f"Amount: {FinancialHelper.format_currency(loan.amount)}, "
                    f"Oldest overdue: {oldest_overdue.due_date}, "
                    f"Days overdue: {days_overdue}"
                )
                
                loans_processed += 1
                
                # Check if loan should be marked as defaulted
                if days_overdue >= days_for_default and loan.status != 'defaulted':
                    if not dry_run:
                        loan.status = 'defaulted'
                        loan.defaulted_date = today
                        loan.save(update_fields=['status', 'defaulted_date'])
                        
                        # Log default
                        AuditLog.objects.create(
                            action='loan_defaulted',
                            model_name='Loan',
                            model_id=str(loan.id),
                            new_value=f"Loan defaulted after {days_overdue} days overdue",
                            description=f"Loan marked as defaulted due to {days_overdue} days of non-payment",
                        )
                        
                        # Send default notification
                        if send_notifications:
                            NotificationService.send_loan_default_notification(loan, days_overdue)
                    
                    loans_defaulted += 1
                    self.stdout.write(
                        self.style.ERROR(f"  Loan marked as DEFAULTED ({days_overdue} days overdue)")
                    )
                
                elif loan.status != 'overdue' and days_overdue >= 15:
                    # Mark as overdue (but not yet defaulted)
                    if not dry_run:
                        loan.status = 'overdue'
                        loan.save(update_fields=['status'])
                        
                        # Send overdue loan notification
                        if send_notifications:
                            NotificationService.send_loan_overdue_notification(loan, days_overdue)
                    
                    self.stdout.write(
                        self.style.WARNING(f"  Loan marked as OVERDUE ({days_overdue} days overdue)")
                    )
                
                else:
                    self.stdout.write(f"  Loan remains active ({days_overdue} days overdue)")
                
            except Exception as e:
                logger.error(f"Error processing loan {loan.id}: {e}")
                self.stdout.write(self.style.ERROR(f"  Error: {e}"))
        
        return loans_processed, loans_defaulted
    
    def generate_overdue_report(self, stats, today, dry_run):
        """
        Generate and store overdue processing report.
        """
        try:
            report_data = {
                'date': today,
                'stats': stats,
                'timestamp': timezone.now(),
            }
            
            # Create report content
            report_lines = [
                "="*60,
                "OVERDUE PROCESSING REPORT",
                "="*60,
                f"Date: {today}",
                f"Generated: {timezone.now()}",
                "",
                "STATISTICS",
                "-"*40,
                f"Loans processed: {stats['loans_processed']}",
                f"Repayments processed: {stats['repayments_processed']}",
                f"Penalties applied: {stats['penalties_applied']}",
                f"Notifications sent: {stats['notifications_sent']}",
                f"Loans marked as defaulted: {stats['loans_defaulted']}",
                f"Errors encountered: {stats['errors']}",
                "="*60,
            ]
            
            report_content = "\n".join(report_lines)
            
            if not dry_run:
                # Save report to file
                from django.core.files.base import ContentFile
                from django.core.files.storage import default_storage
                
                filename = f"overdue_report_{today}.txt"
                filepath = f"reports/overdue/{filename}"
                
                default_storage.save(filepath, ContentFile(report_content.encode('utf-8')))
                
                self.stdout.write(f"\nReport saved to: {filepath}")
            
            # Display report
            self.stdout.write("\n" + report_content)
            
        except Exception as e:
            logger.error(f"Error generating overdue report: {e}")
            self.stdout.write(self.style.ERROR(f"Failed to generate report: {e}"))