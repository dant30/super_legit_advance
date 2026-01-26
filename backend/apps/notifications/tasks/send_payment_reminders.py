# backend/apps/notifications/tasks/send_payment_reminders.py
import logging
from celery import shared_task
from django.utils import timezone
from django.db.models import Q
from datetime import datetime, timedelta
from typing import List, Dict, Optional

from apps.notifications.models import Notification, Template
from apps.notifications.services.notification_service import NotificationService
from apps.loans.models import Loan, RepaymentSchedule
from apps.customers.models import Customer
from apps.core.utils.helpers import format_currency, get_business_days
from apps.core.utils.date_utils import is_business_day

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=300)
def send_payment_reminders_task(
    self,
    days_before: int = 1,
    retry_count: int = 0
) -> Dict:
    """
    Send payment reminders for loans with upcoming due dates.
    Runs daily at 9 AM.
    
    Args:
        days_before: Days before payment is due to send reminder
        retry_count: Current retry count
        
    Returns:
        Dictionary with task results
    """
    try:
        logger.info(f"Starting payment reminders task for payments due in {days_before} days")
        
        # Calculate reminder date
        reminder_date = timezone.now().date() + timedelta(days=days_before)
        
        # Check if it's a business day, if not adjust
        if not is_business_day(reminder_date):
            # Find next business day
            next_business_day = get_business_days(reminder_date, 1)[0]
            logger.info(f"Reminder date {reminder_date} is not a business day, adjusted to {next_business_day}")
            reminder_date = next_business_day
        
        # Get due repayment schedules
        due_schedules = RepaymentSchedule.objects.filter(
            due_date=reminder_date,
            status__in=['PENDING', 'PARTIAL']
        ).select_related(
            'loan',
            'loan__customer',
            'loan__customer__user'
        ).exclude(
            Q(loan__status='PAID') | 
            Q(loan__status='DEFAULTED') |
            Q(loan__status='WRITTEN_OFF')
        )
        
        total_due = due_schedules.count()
        logger.info(f"Found {total_due} repayment schedules due on {reminder_date}")
        
        if total_due == 0:
            return {
                'success': True,
                'message': f'No payments due on {reminder_date}',
                'processed': 0,
                'reminders_sent': 0,
                'failed': 0
            }
        
        # Initialize services
        notification_service = NotificationService()
        
        # Send reminders
        reminders_sent = 0
        failed = 0
        details = []
        
        for schedule in due_schedules:
            try:
                customer = schedule.loan.customer
                
                # Check if customer should receive reminders
                if not self._should_send_reminder(customer, schedule.loan):
                    logger.info(f"Skipping reminder for customer {customer.id} due to settings or status")
                    continue
                
                # Send payment reminder
                success, result = notification_service.send_payment_reminder_notification(
                    repayment_schedule=schedule,
                    customer=customer,
                    days_before=days_before
                )
                
                if success:
                    reminders_sent += 1
                    details.append({
                        'customer_id': customer.id,
                        'customer_name': customer.full_name,
                        'loan_id': schedule.loan.id,
                        'loan_number': schedule.loan.loan_number,
                        'schedule_id': schedule.id,
                        'amount_due': float(schedule.amount_due),
                        'status': 'success',
                        'notification_id': result.get('notification_id') if isinstance(result, dict) else None
                    })
                    logger.info(f"Payment reminder sent to {customer.full_name} for loan {schedule.loan.loan_number}")
                else:
                    failed += 1
                    details.append({
                        'customer_id': customer.id,
                        'customer_name': customer.full_name,
                        'loan_id': schedule.loan.id,
                        'status': 'failed',
                        'error': result.get('error', 'Unknown error') if isinstance(result, dict) else str(result)
                    })
                    logger.error(f"Failed to send payment reminder to {customer.full_name}: {result}")
                    
            except Exception as e:
                failed += 1
                details.append({
                    'customer_id': schedule.loan.customer.id if schedule.loan.customer else None,
                    'loan_id': schedule.loan.id,
                    'status': 'error',
                    'error': str(e)
                })
                logger.error(f"Error sending payment reminder for schedule {schedule.id}: {str(e)}")
        
        logger.info(f"Payment reminders task completed: {reminders_sent} sent, {failed} failed")
        
        return {
            'success': failed == 0,
            'processed': total_due,
            'reminders_sent': reminders_sent,
            'failed': failed,
            'details': details,
            'reminder_date': reminder_date.isoformat(),
            'days_before': days_before
        }
        
    except Exception as e:
        logger.error(f"Error in send_payment_reminders_task: {str(e)}")
        
        # Retry if we haven't exceeded max retries
        if retry_count < 2:
            logger.info(f"Retrying payment reminders task in 5 minutes")
            raise self.retry(countdown=300, exc=e)
        
        return {
            'success': False,
            'error': str(e),
            'processed': 0,
            'reminders_sent': 0,
            'failed': 0,
            'retry_count': retry_count
        }


@shared_task(bind=True, max_retries=3, default_retry_delay=600)
def send_overdue_notifications_task(
    self,
    overdue_days_threshold: int = 1,
    retry_count: int = 0
) -> Dict:
    """
    Send overdue notifications for loans that are past due.
    Runs daily at 10 AM.
    
    Args:
        overdue_days_threshold: Minimum days overdue to send notification
        retry_count: Current retry count
        
    Returns:
        Dictionary with task results
    """
    try:
        logger.info(f"Starting overdue notifications task for loans {overdue_days_threshold}+ days overdue")
        
        # Calculate cutoff date
        cutoff_date = timezone.now().date() - timedelta(days=overdue_days_threshold)
        
        # Get overdue loans
        overdue_loans = Loan.objects.filter(
            status__in=['ACTIVE', 'APPROVED'],
            next_payment_date__lt=cutoff_date,
            outstanding_balance__gt=0
        ).select_related(
            'customer',
            'customer__user'
        ).prefetch_related(
            'repayment_schedules'
        )
        
        total_overdue = overdue_loans.count()
        logger.info(f"Found {total_overdue} loans {overdue_days_threshold}+ days overdue")
        
        if total_overdue == 0:
            return {
                'success': True,
                'message': f'No loans {overdue_days_threshold}+ days overdue',
                'processed': 0,
                'notifications_sent': 0,
                'failed': 0
            }
        
        # Initialize services
        notification_service = NotificationService()
        
        # Send overdue notifications
        notifications_sent = 0
        failed = 0
        details = []
        
        for loan in overdue_loans:
            try:
                customer = loan.customer
                
                # Calculate days overdue
                if loan.next_payment_date:
                    days_overdue = (timezone.now().date() - loan.next_payment_date).days
                else:
                    # Estimate based on last payment or disbursement
                    last_payment = loan.repayments.filter(status='COMPLETED').order_by('-payment_date').first()
                    if last_payment:
                        days_overdue = (timezone.now().date() - last_payment.payment_date).days - 30  # Approximate
                    else:
                        days_overdue = (timezone.now().date() - loan.disbursement_date.date()).days - 30
                
                if days_overdue < overdue_days_threshold:
                    continue
                
                # Check if customer should receive overdue notifications
                if not self._should_send_overdue_notification(customer, loan):
                    logger.info(f"Skipping overdue notification for customer {customer.id}")
                    continue
                
                # Send overdue notification
                success, result = notification_service.send_overdue_notification(
                    loan=loan,
                    customer=customer,
                    overdue_days=days_overdue
                )
                
                if success:
                    notifications_sent += 1
                    details.append({
                        'customer_id': customer.id,
                        'customer_name': customer.full_name,
                        'loan_id': loan.id,
                        'loan_number': loan.loan_number,
                        'days_overdue': days_overdue,
                        'overdue_amount': float(loan.outstanding_balance),
                        'status': 'success',
                        'notification_id': result.get('notification_id') if isinstance(result, dict) else None
                    })
                    logger.info(f"Overdue notification sent to {customer.full_name} for loan {loan.loan_number} ({days_overdue} days overdue)")
                else:
                    failed += 1
                    details.append({
                        'customer_id': customer.id,
                        'customer_name': customer.full_name,
                        'loan_id': loan.id,
                        'status': 'failed',
                        'error': result.get('error', 'Unknown error') if isinstance(result, dict) else str(result)
                    })
                    logger.error(f"Failed to send overdue notification to {customer.full_name}: {result}")
                    
            except Exception as e:
                failed += 1
                details.append({
                    'customer_id': loan.customer.id if loan.customer else None,
                    'loan_id': loan.id,
                    'status': 'error',
                    'error': str(e)
                })
                logger.error(f"Error sending overdue notification for loan {loan.id}: {str(e)}")
        
        logger.info(f"Overdue notifications task completed: {notifications_sent} sent, {failed} failed")
        
        return {
            'success': failed == 0,
            'processed': total_overdue,
            'notifications_sent': notifications_sent,
            'failed': failed,
            'details': details,
            'overdue_days_threshold': overdue_days_threshold,
            'cutoff_date': cutoff_date.isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in send_overdue_notifications_task: {str(e)}")
        
        # Retry if we haven't exceeded max retries
        if retry_count < 2:
            logger.info(f"Retrying overdue notifications task in 10 minutes")
            raise self.retry(countdown=600, exc=e)
        
        return {
            'success': False,
            'error': str(e),
            'processed': 0,
            'notifications_sent': 0,
            'failed': 0,
            'retry_count': retry_count
        }


@shared_task
def send_daily_notifications_summary() -> Dict:
    """
    Send daily summary of notifications sent.
    Runs daily at 6 PM.
    
    Returns:
        Dictionary with summary results
    """
    try:
        logger.info("Starting daily notifications summary")
        
        # Calculate date range (today)
        today = timezone.now().date()
        start_of_day = timezone.make_aware(timezone.datetime.combine(today, timezone.datetime.min.time()))
        end_of_day = timezone.make_aware(timezone.datetime.combine(today, timezone.datetime.max.time()))
        
        # Get today's notifications
        today_notifications = Notification.objects.filter(
            created_at__range=[start_of_day, end_of_day]
        )
        
        # Get statistics
        total_notifications = today_notifications.count()
        
        # Breakdown by type
        type_breakdown = today_notifications.values('notification_type').annotate(
            count=Count('id'),
            sent=Count('id', filter=Q(status__in=['SENT', 'DELIVERED', 'READ'])),
            failed=Count('id', filter=Q(status='FAILED'))
        ).order_by('-count')
        
        # Breakdown by channel
        channel_breakdown = today_notifications.values('channel').annotate(
            count=Count('id'),
            cost=Sum('cost')
        ).order_by('-count')
        
        # Get top 5 customers with most notifications
        top_customers = today_notifications.filter(
            recipient__isnull=False
        ).values(
            'recipient__id',
            'recipient__first_name',
            'recipient__last_name'
        ).annotate(
            count=Count('id')
        ).order_by('-count')[:5]
        
        # Get failed notifications
        failed_notifications = today_notifications.filter(
            status='FAILED'
        ).select_related('recipient').order_by('-created_at')[:10]
        
        # Prepare summary
        summary = {
            'date': today.isoformat(),
            'total_notifications': total_notifications,
            'type_breakdown': list(type_breakdown),
            'channel_breakdown': list(channel_breakdown),
            'top_customers': list(top_customers),
            'failed_count': failed_notifications.count(),
            'failed_examples': [
                {
                    'id': n.id,
                    'type': n.notification_type,
                    'channel': n.channel,
                    'recipient': n.recipient_name,
                    'error': n.delivery_error[:100] if n.delivery_error else 'Unknown error',
                    'created_at': n.created_at.isoformat()
                }
                for n in failed_notifications
            ],
            'total_cost': sum(channel['cost'] or 0 for channel in channel_breakdown),
            'generated_at': timezone.now().isoformat()
        }
        
        logger.info(f"Daily notifications summary generated: {total_notifications} notifications")
        
        # Send summary to administrators (placeholder)
        # In production, you would email this summary to admins
        
        return {
            'success': True,
            'summary': summary,
            'sent_to_admins': False,  # Set to True when email implementation is added
            'message': 'Daily notifications summary generated successfully'
        }
        
    except Exception as e:
        logger.error(f"Error in send_daily_notifications_summary task: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }


@shared_task
def send_weekly_payment_report() -> Dict:
    """
    Send weekly payment report with upcoming and overdue payments.
    Runs every Monday at 8 AM.
    
    Returns:
        Dictionary with report results
    """
    try:
        logger.info("Starting weekly payment report")
        
        # Calculate date range (next 7 days)
        today = timezone.now().date()
        week_start = today
        week_end = today + timedelta(days=7)
        
        # Get upcoming payments
        upcoming_payments = RepaymentSchedule.objects.filter(
            due_date__range=[week_start, week_end],
            status__in=['PENDING', 'PARTIAL']
        ).select_related(
            'loan',
            'loan__customer'
        ).order_by('due_date')
        
        # Get overdue payments
        overdue_payments = RepaymentSchedule.objects.filter(
            due_date__lt=today,
            status__in=['PENDING', 'PARTIAL']
        ).select_related(
            'loan',
            'loan__customer'
        ).order_by('due_date')
        
        # Prepare report
        report = {
            'report_date': today.isoformat(),
            'week_start': week_start.isoformat(),
            'week_end': week_end.isoformat(),
            'upcoming_payments': {
                'count': upcoming_payments.count(),
                'total_amount': sum(float(p.amount_due) for p in upcoming_payments),
                'breakdown': [
                    {
                        'date': p.due_date.isoformat(),
                        'count': RepaymentSchedule.objects.filter(due_date=p.due_date, status__in=['PENDING', 'PARTIAL']).count(),
                        'amount': float(RepaymentSchedule.objects.filter(
                            due_date=p.due_date, status__in=['PENDING', 'PARTIAL']
                        ).aggregate(total=Sum('amount_due'))['total'] or 0)
                    }
                    for p in upcoming_payments.dates('due_date', 'day')
                ],
                'details': [
                    {
                        'customer_name': p.loan.customer.full_name if p.loan.customer else 'Unknown',
                        'loan_number': p.loan.loan_number,
                        'due_date': p.due_date.isoformat(),
                        'amount_due': float(p.amount_due),
                        'installment': f"{p.installment_number}/{p.total_installments}"
                    }
                    for p in upcoming_payments[:20]  # Limit details
                ]
            },
            'overdue_payments': {
                'count': overdue_payments.count(),
                'total_amount': sum(float(p.amount_due) for p in overdue_payments),
                'average_days_overdue': sum(
                    (today - p.due_date).days for p in overdue_payments
                ) / overdue_payments.count() if overdue_payments.count() > 0 else 0,
                'details': [
                    {
                        'customer_name': p.loan.customer.full_name if p.loan.customer else 'Unknown',
                        'loan_number': p.loan.loan_number,
                        'due_date': p.due_date.isoformat(),
                        'days_overdue': (today - p.due_date).days,
                        'amount_due': float(p.amount_due),
                        'loan_status': p.loan.status
                    }
                    for p in overdue_payments[:20]  # Limit details
                ]
            },
            'generated_at': timezone.now().isoformat()
        }
        
        logger.info(f"Weekly payment report generated: {report['upcoming_payments']['count']} upcoming, {report['overdue_payments']['count']} overdue")
        
        # Send report to administrators (placeholder)
        
        return {
            'success': True,
            'report': report,
            'sent_to_admins': False,  # Set to True when email implementation is added
            'message': 'Weekly payment report generated successfully'
        }
        
    except Exception as e:
        logger.error(f"Error in send_weekly_payment_report task: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }


@shared_task
def send_monthly_performance_report() -> Dict:
    """
    Send monthly performance report for notifications.
    Runs on the 1st of every month at 9 AM.
    
    Returns:
        Dictionary with report results
    """
    try:
        logger.info("Starting monthly performance report")
        
        # Calculate date range (previous month)
        today = timezone.now().date()
        first_day_of_month = today.replace(day=1)
        last_day_of_previous_month = first_day_of_month - timedelta(days=1)
        first_day_of_previous_month = last_day_of_previous_month.replace(day=1)
        
        start_date = timezone.make_aware(timezone.datetime.combine(first_day_of_previous_month, timezone.datetime.min.time()))
        end_date = timezone.make_aware(timezone.datetime.combine(last_day_of_previous_month, timezone.datetime.max.time()))
        
        # Get monthly statistics
        monthly_stats = Notification.objects.filter(
            created_at__range=[start_date, end_date]
        ).aggregate(
            total=Count('id'),
            sent=Count('id', filter=Q(status__in=['SENT', 'DELIVERED', 'READ'])),
            failed=Count('id', filter=Q(status='FAILED')),
            total_cost=Sum('cost')
        )
        
        # Get SMS-specific statistics
        sms_stats = Notification.objects.filter(
            created_at__range=[start_date, end_date],
            channel='SMS'
        ).aggregate(
            total=Count('id'),
            delivered=Count('id', filter=Q(status='DELIVERED')),
            failed=Count('id', filter=Q(status='FAILED')),
            total_cost=Sum('cost'),
            avg_cost=Avg('cost')
        )
        
        # Get top notification types
        top_types = Notification.objects.filter(
            created_at__range=[start_date, end_date]
        ).values('notification_type').annotate(
            count=Count('id'),
            success_rate=Count('id', filter=Q(status__in=['SENT', 'DELIVERED', 'READ'])) * 100.0 / Count('id')
        ).order_by('-count')[:10]
        
        # Get cost trends (daily)
        daily_costs = []
        current_date = first_day_of_previous_month
        while current_date <= last_day_of_previous_month:
            day_start = timezone.make_aware(timezone.datetime.combine(current_date, timezone.datetime.min.time()))
            day_end = timezone.make_aware(timezone.datetime.combine(current_date, timezone.datetime.max.time()))
            
            day_cost = Notification.objects.filter(
                created_at__range=[day_start, day_end],
                cost__gt=0
            ).aggregate(total_cost=Sum('cost'))['total_cost'] or 0
            
            daily_costs.append({
                'date': current_date.isoformat(),
                'cost': float(day_cost),
                'notifications': Notification.objects.filter(
                    created_at__range=[day_start, day_end]
                ).count()
            })
            
            current_date += timedelta(days=1)
        
        # Prepare report
        report = {
            'period': {
                'start': first_day_of_previous_month.isoformat(),
                'end': last_day_of_previous_month.isoformat(),
                'month': first_day_of_previous_month.strftime('%B %Y')
            },
            'summary': {
                'total_notifications': monthly_stats['total'] or 0,
                'success_rate': (monthly_stats['sent'] or 0) / (monthly_stats['total'] or 1) * 100,
                'total_cost': float(monthly_stats['total_cost'] or 0),
                'avg_cost_per_notification': float(monthly_stats['total_cost'] or 0) / (monthly_stats['total'] or 1)
            },
            'sms_performance': {
                'total_sms': sms_stats['total'] or 0,
                'delivery_rate': (sms_stats['delivered'] or 0) / (sms_stats['total'] or 1) * 100,
                'total_cost': float(sms_stats['total_cost'] or 0),
                'avg_cost_per_sms': float(sms_stats['avg_cost'] or 0)
            },
            'top_notification_types': list(top_types),
            'daily_cost_trend': daily_costs,
            'recommendations': self._generate_recommendations(monthly_stats, sms_stats),
            'generated_at': timezone.now().isoformat()
        }
        
        logger.info(f"Monthly performance report generated for {report['period']['month']}")
        
        # Send report to administrators (placeholder)
        
        return {
            'success': True,
            'report': report,
            'sent_to_admins': False,  # Set to True when email implementation is added
            'message': 'Monthly performance report generated successfully'
        }
        
    except Exception as e:
        logger.error(f"Error in send_monthly_performance_report task: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }


# Helper methods
def _should_send_reminder(self, customer: Customer, loan: Loan) -> bool:
    """
    Check if a reminder should be sent to a customer.
    
    Args:
        customer: Customer object
        loan: Loan object
        
    Returns:
        True if reminder should be sent
    """
    # Check customer status
    if customer.status == 'BLACKLISTED':
        return False
    
    # Check loan status
    if loan.status not in ['ACTIVE', 'APPROVED']:
        return False
    
    # Check if customer has opted out of reminders
    # This would be stored in customer preferences or metadata
    # For now, assume all customers want reminders
    return True


def _should_send_overdue_notification(self, customer: Customer, loan: Loan) -> bool:
    """
    Check if an overdue notification should be sent to a customer.
    
    Args:
        customer: Customer object
        loan: Loan object
        
    Returns:
        True if overdue notification should be sent
    """
    # Check customer status
    if customer.status == 'BLACKLISTED':
        return False
    
    # Check loan status
    if loan.status not in ['ACTIVE', 'APPROVED']:
        return False
    
    # Check if we've already sent too many overdue notifications
    # This would track notification frequency
    # For now, send all overdue notifications
    return True


def _generate_recommendations(self, monthly_stats: Dict, sms_stats: Dict) -> List[str]:
    """
    Generate recommendations based on notification performance.
    
    Args:
        monthly_stats: Monthly notification statistics
        sms_stats: SMS-specific statistics
        
    Returns:
        List of recommendations
    """
    recommendations = []
    
    # Check success rate
    success_rate = (monthly_stats.get('sent') or 0) / (monthly_stats.get('total') or 1) * 100
    if success_rate < 90:
        recommendations.append(
            f"Low success rate ({success_rate:.1f}%). Review failed notifications and improve delivery methods."
        )
    
    # Check SMS delivery rate
    sms_delivery_rate = (sms_stats.get('delivered') or 0) / (sms_stats.get('total') or 1) * 100
    if sms_delivery_rate < 85:
        recommendations.append(
            f"Low SMS delivery rate ({sms_delivery_rate:.1f}%). Verify phone numbers and consider alternative channels."
        )
    
    # Check costs
    avg_sms_cost = sms_stats.get('avg_cost') or 0
    if avg_sms_cost > 2.0:  # KES per SMS
        recommendations.append(
            f"High average SMS cost (KES {avg_sms_cost:.2f}). Consider bulk SMS plans or alternative providers."
        )
    
    # Check notification volume
    total_notifications = monthly_stats.get('total') or 0
    if total_notifications > 10000:
        recommendations.append(
            f"High notification volume ({total_notifications}). Consider implementing rate limiting and prioritization."
        )
    
    if not recommendations:
        recommendations.append("Notification system is performing well. Continue current practices.")
    
    return recommendations