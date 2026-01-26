# backend/apps/notifications/tasks/send_sms.py
import logging
from celery import shared_task
from django.utils import timezone
from django.db.models import Q
from datetime import datetime, timedelta
from typing import List, Dict, Optional

from apps.notifications.models import Notification, SMSLog, Template
from apps.notifications.services.sms_service import SMSService
from apps.notifications.services.notification_service import NotificationService
from apps.core.utils.helpers import format_currency

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_sms_task(
    self,
    notification_id: int,
    retry_count: int = 0
) -> Dict:
    """
    Celery task to send a single SMS notification.
    
    Args:
        notification_id: ID of the notification to send
        retry_count: Current retry count
        
    Returns:
        Dictionary with task results
    """
    try:
        logger.info(f"Starting SMS task for notification {notification_id} (retry {retry_count})")
        
        # Get notification
        try:
            notification = Notification.objects.get(id=notification_id)
        except Notification.DoesNotExist:
            logger.error(f"Notification {notification_id} not found")
            return {
                'success': False,
                'error': f'Notification {notification_id} not found',
                'notification_id': notification_id
            }
        
        # Check if already sent
        if notification.status not in ['PENDING', 'FAILED']:
            logger.info(f"Notification {notification_id} already {notification.status}")
            return {
                'success': True,
                'status': 'already_sent',
                'notification_id': notification_id,
                'current_status': notification.status
            }
        
        # Initialize services
        sms_service = SMSService()
        notification_service = NotificationService()
        
        # Send notification
        success, result = notification_service.send_notification(notification)
        
        if success:
            logger.info(f"SMS notification {notification_id} sent successfully")
            return {
                'success': True,
                'notification_id': notification_id,
                'message_id': result.get('message_id'),
                'cost': float(notification.cost),
                'status': notification.status
            }
        else:
            logger.error(f"Failed to send SMS notification {notification_id}: {result}")
            
            # Retry if we haven't exceeded max retries
            if retry_count < 2:  # Max 3 attempts total
                logger.info(f"Retrying notification {notification_id} in 60 seconds")
                raise self.retry(countdown=60)
            
            return {
                'success': False,
                'notification_id': notification_id,
                'error': result.get('error', 'Unknown error'),
                'status': notification.status,
                'retry_count': retry_count
            }
            
    except Exception as e:
        logger.error(f"Error in send_sms_task for notification {notification_id}: {str(e)}")
        
        # Update notification status
        try:
            notification = Notification.objects.get(id=notification_id)
            notification.mark_as_failed(str(e))
        except:
            pass
        
        # Retry if we haven't exceeded max retries
        if retry_count < 2:
            logger.info(f"Retrying task for notification {notification_id} due to exception")
            raise self.retry(countdown=60, exc=e)
        
        return {
            'success': False,
            'notification_id': notification_id,
            'error': str(e),
            'retry_count': retry_count
        }


@shared_task(bind=True, max_retries=3, default_retry_delay=120)
def send_bulk_sms_task(
    self,
    template_id: int,
    recipients: List[Dict],
    context: Optional[Dict] = None,
    user_id: Optional[int] = None,
    retry_count: int = 0
) -> Dict:
    """
    Celery task to send bulk SMS notifications.
    
    Args:
        template_id: ID of template to use
        recipients: List of recipient dictionaries
        context: Common context data for all recipients
        user_id: ID of user sending the bulk messages
        retry_count: Current retry count
        
    Returns:
        Dictionary with task results
    """
    try:
        logger.info(f"Starting bulk SMS task for template {template_id}, {len(recipients)} recipients")
        
        # Get template
        try:
            template = Template.objects.get(id=template_id, is_active=True)
        except Template.DoesNotExist:
            logger.error(f"Template {template_id} not found or not active")
            return {
                'success': False,
                'error': 'Template not found or not active',
                'template_id': template_id
            }
        
        # Get user if provided
        from django.contrib.auth import get_user_model
        User = get_user_model()
        user = None
        if user_id:
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                logger.warning(f"User {user_id} not found")
        
        # Initialize services
        notification_service = NotificationService()
        
        # Process recipients
        results = {
            'total': len(recipients),
            'successful': 0,
            'failed': 0,
            'details': [],
            'total_cost': 0.0
        }
        
        for recipient in recipients:
            try:
                # Create notification for each recipient
                notification = notification_service.create_notification_from_template(
                    template=template,
                    recipient_name=recipient.get('name'),
                    recipient_phone=recipient.get('phone'),
                    recipient_email=recipient.get('email'),
                    context={**(context or {}), **(recipient.get('context', {}))},
                    sender=user,
                    additional_data={
                        'notification_type': 'MARKETING',
                        'priority': 'MEDIUM',
                        'title': f'Bulk: {template.name}',
                    }
                )
                
                # Send notification
                success, result = notification_service.send_notification(notification)
                
                if success:
                    results['successful'] += 1
                    results['total_cost'] += float(notification.cost)
                    results['details'].append({
                        'recipient': recipient.get('phone'),
                        'status': 'success',
                        'notification_id': notification.id,
                        'cost': float(notification.cost)
                    })
                else:
                    results['failed'] += 1
                    results['details'].append({
                        'recipient': recipient.get('phone'),
                        'status': 'failed',
                        'error': result.get('error', 'Unknown error')
                    })
                    
            except Exception as e:
                results['failed'] += 1
                results['details'].append({
                    'recipient': recipient.get('phone', 'Unknown'),
                    'status': 'error',
                    'error': str(e)
                })
                logger.error(f"Error processing recipient {recipient}: {str(e)}")
        
        logger.info(f"Bulk SMS task completed: {results['successful']} successful, {results['failed']} failed")
        
        return {
            'success': results['successful'] > 0 or results['failed'] == 0,
            'results': results,
            'template_id': template_id,
            'template_name': template.name,
            'total_cost': results['total_cost'],
            'avg_cost_per_sms': results['total_cost'] / results['successful'] if results['successful'] > 0 else 0
        }
        
    except Exception as e:
        logger.error(f"Error in bulk SMS task: {str(e)}")
        
        # Retry if we haven't exceeded max retries
        if retry_count < 2:
            logger.info(f"Retrying bulk SMS task in 120 seconds")
            raise self.retry(countdown=120, exc=e)
        
        return {
            'success': False,
            'error': str(e),
            'template_id': template_id,
            'retry_count': retry_count
        }


@shared_task
def process_scheduled_sms() -> Dict:
    """
    Process all scheduled SMS notifications that are due.
    Runs every 5 minutes.
    
    Returns:
        Dictionary with processing results
    """
    try:
        logger.info("Starting scheduled SMS processing")
        
        # Get scheduled notifications that are due
        now = timezone.now()
        scheduled_notifications = Notification.objects.filter(
            channel='SMS',
            status='PENDING',
            scheduled_for__lte=now
        ).select_related('template').order_by('scheduled_for', 'priority')
        
        total = scheduled_notifications.count()
        logger.info(f"Found {total} scheduled SMS notifications to process")
        
        if total == 0:
            return {
                'success': True,
                'message': 'No scheduled SMS notifications to process',
                'processed': 0,
                'succeeded': 0,
                'failed': 0
            }
        
        # Initialize services
        notification_service = NotificationService()
        
        # Process notifications
        succeeded = 0
        failed = 0
        details = []
        
        for notification in scheduled_notifications:
            try:
                # Send notification
                success, result = notification_service.send_notification(notification)
                
                if success:
                    succeeded += 1
                    details.append({
                        'notification_id': notification.id,
                        'status': 'success',
                        'message_id': result.get('message_id')
                    })
                else:
                    failed += 1
                    details.append({
                        'notification_id': notification.id,
                        'status': 'failed',
                        'error': result.get('error', 'Unknown error')
                    })
                    
                # Small delay to avoid overwhelming the SMS provider
                import time
                time.sleep(0.1)
                    
            except Exception as e:
                failed += 1
                details.append({
                    'notification_id': notification.id,
                    'status': 'error',
                    'error': str(e)
                })
                logger.error(f"Error processing scheduled notification {notification.id}: {str(e)}")
        
        logger.info(f"Scheduled SMS processing completed: {succeeded} succeeded, {failed} failed")
        
        return {
            'success': failed == 0,
            'processed': total,
            'succeeded': succeeded,
            'failed': failed,
            'details': details,
            'timestamp': now.isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in process_scheduled_sms task: {str(e)}")
        return {
            'success': False,
            'error': str(e),
            'processed': 0,
            'succeeded': 0,
            'failed': 0
        }


@shared_task
def retry_failed_sms(days_old: int = 1, max_attempts: int = 3) -> Dict:
    """
    Retry failed SMS notifications from the last N days.
    
    Args:
        days_old: Retry notifications from the last N days
        max_attempts: Maximum delivery attempts before giving up
        
    Returns:
        Dictionary with retry results
    """
    try:
        logger.info(f"Starting retry of failed SMS notifications from last {days_old} days")
        
        # Calculate date threshold
        date_threshold = timezone.now() - timedelta(days=days_old)
        
        # Get failed notifications with less than max attempts
        failed_notifications = Notification.objects.filter(
            channel='SMS',
            status='FAILED',
            delivery_attempts__lt=max_attempts,
            created_at__gte=date_threshold
        ).order_by('created_at')
        
        total = failed_notifications.count()
        logger.info(f"Found {total} failed SMS notifications to retry")
        
        if total == 0:
            return {
                'success': True,
                'message': 'No failed SMS notifications to retry',
                'retried': 0,
                'still_failed': 0
            }
        
        # Retry notifications
        retried = 0
        still_failed = 0
        details = []
        
        notification_service = NotificationService()
        
        for notification in failed_notifications:
            try:
                # Retry the notification
                if notification.retry():
                    retried += 1
                    details.append({
                        'notification_id': notification.id,
                        'status': 'retried',
                        'new_status': 'PENDING'
                    })
                else:
                    still_failed += 1
                    details.append({
                        'notification_id': notification.id,
                        'status': 'still_failed',
                        'reason': 'Max attempts reached or other issue'
                    })
                    
            except Exception as e:
                still_failed += 1
                details.append({
                    'notification_id': notification.id,
                    'status': 'error',
                    'error': str(e)
                })
                logger.error(f"Error retrying notification {notification.id}: {str(e)}")
        
        logger.info(f"Failed SMS retry completed: {retried} retried, {still_failed} still failed")
        
        return {
            'success': still_failed == 0,
            'total_failed': total,
            'retried': retried,
            'still_failed': still_failed,
            'details': details,
            'date_threshold': date_threshold.isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in retry_failed_sms task: {str(e)}")
        return {
            'success': False,
            'error': str(e),
            'retried': 0,
            'still_failed': 0
        }


@shared_task
def cleanup_old_sms_logs(days_to_keep: int = 90) -> Dict:
    """
    Clean up old SMS logs to save database space.
    
    Args:
        days_to_keep: Number of days of logs to keep
        
    Returns:
        Dictionary with cleanup results
    """
    try:
        logger.info(f"Starting cleanup of SMS logs older than {days_to_keep} days")
        
        # Calculate cutoff date
        cutoff_date = timezone.now() - timedelta(days=days_to_keep)
        
        # Get count of old logs
        old_logs_count = SMSLog.objects.filter(created_at__lt=cutoff_date).count()
        
        if old_logs_count == 0:
            return {
                'success': True,
                'message': 'No old SMS logs to clean up',
                'deleted': 0,
                'cutoff_date': cutoff_date.isoformat()
            }
        
        # Delete old logs
        deleted_count, _ = SMSLog.objects.filter(created_at__lt=cutoff_date).delete()
        
        logger.info(f"Cleaned up {deleted_count} old SMS logs")
        
        return {
            'success': True,
            'deleted': deleted_count,
            'cutoff_date': cutoff_date.isoformat(),
            'remaining': SMSLog.objects.count()
        }
        
    except Exception as e:
        logger.error(f"Error in cleanup_old_sms_logs task: {str(e)}")
        return {
            'success': False,
            'error': str(e),
            'deleted': 0
        }


@shared_task
def update_sms_delivery_status() -> Dict:
    """
    Update delivery status of sent SMS messages.
    Runs every 30 minutes.
    
    Returns:
        Dictionary with update results
    """
    try:
        logger.info("Starting SMS delivery status update")
        
        # Get sent SMS logs without delivery confirmation
        sent_sms_logs = SMSLog.objects.filter(
            status='SENT',
            message_id__isnull=False,
            sent_at__isnull=False,
            delivered_at__isnull=True
        ).select_related('notification')
        
        total = sent_sms_logs.count()
        logger.info(f"Found {total} sent SMS logs to check delivery status")
        
        if total == 0:
            return {
                'success': True,
                'message': 'No sent SMS logs to check',
                'checked': 0,
                'updated': 0
            }
        
        # Initialize SMS service
        sms_service = SMSService()
        
        # Check delivery status
        checked = 0
        updated = 0
        details = []
        
        for sms_log in sent_sms_logs:
            try:
                # Check if enough time has passed since sending (at least 5 minutes)
                if (timezone.now() - sms_log.sent_at).total_seconds() < 300:
                    continue
                
                # Check delivery status
                status_info = sms_service.check_delivery_status(sms_log.message_id)
                
                if status_info:
                    old_status = sms_log.status
                    sms_log.update_status(
                        status_info['status'],
                        status_info.get('message')
                    )
                    
                    if old_status != sms_log.status:
                        updated += 1
                        details.append({
                            'sms_log_id': sms_log.id,
                            'message_id': sms_log.message_id,
                            'old_status': old_status,
                            'new_status': sms_log.status,
                            'phone': sms_log.phone_number
                        })
                
                checked += 1
                
                # Small delay to avoid overwhelming the API
                import time
                time.sleep(0.5)
                    
            except Exception as e:
                details.append({
                    'sms_log_id': sms_log.id,
                    'status': 'error',
                    'error': str(e)
                })
                logger.error(f"Error checking delivery status for SMS log {sms_log.id}: {str(e)}")
        
        logger.info(f"SMS delivery status update completed: {checked} checked, {updated} updated")
        
        return {
            'success': True,
            'checked': checked,
            'updated': updated,
            'details': details,
            'timestamp': timezone.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in update_sms_delivery_status task: {str(e)}")
        return {
            'success': False,
            'error': str(e),
            'checked': 0,
            'updated': 0
        }


@shared_task
def send_sms_usage_report(days: int = 7) -> Dict:
    """
    Send SMS usage report to administrators.
    
    Args:
        days: Number of days to include in report
        
    Returns:
        Dictionary with report results
    """
    try:
        logger.info(f"Generating SMS usage report for last {days} days")
        
        # Calculate date range
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)
        
        # Get SMS statistics
        from django.db.models import Count, Sum, Avg
        
        sms_stats = SMSLog.objects.filter(
            created_at__range=[start_date, end_date]
        ).aggregate(
            total=Count('id'),
            sent=Count('id', filter=Q(status='SENT')),
            delivered=Count('id', filter=Q(status='DELIVERED')),
            failed=Count('id', filter=Q(status='FAILED')),
            total_cost=Sum('cost'),
            avg_cost=Avg('cost')
        )
        
        # Get daily breakdown
        daily_stats = []
        for i in range(days):
            date = end_date.date() - timedelta(days=i)
            day_start = timezone.make_aware(timezone.datetime.combine(date, timezone.datetime.min.time()))
            day_end = timezone.make_aware(timezone.datetime.combine(date, timezone.datetime.max.time()))
            
            day_stats = SMSLog.objects.filter(
                created_at__range=[day_start, day_end]
            ).aggregate(
                total=Count('id'),
                sent=Count('id', filter=Q(status='SENT')),
                delivered=Count('id', filter=Q(status='DELIVERED')),
                cost=Sum('cost')
            )
            
            daily_stats.append({
                'date': date.isoformat(),
                'total': day_stats['total'] or 0,
                'sent': day_stats['sent'] or 0,
                'delivered': day_stats['delivered'] or 0,
                'cost': float(day_stats['cost'] or 0)
            })
        
        # Get provider breakdown
        provider_stats = SMSLog.objects.filter(
            created_at__range=[start_date, end_date]
        ).values('provider').annotate(
            total=Count('id'),
            sent=Count('id', filter=Q(status='SENT')),
            cost=Sum('cost')
        ).order_by('-total')
        
        # Prepare report
        report = {
            'period': {
                'start': start_date.isoformat(),
                'end': end_date.isoformat(),
                'days': days
            },
            'summary': {
                'total_sms': sms_stats['total'] or 0,
                'sent_sms': sms_stats['sent'] or 0,
                'delivered_sms': sms_stats['delivered'] or 0,
                'failed_sms': sms_stats['failed'] or 0,
                'delivery_rate': (sms_stats['delivered'] or 0) / (sms_stats['sent'] or 1) * 100,
                'total_cost': float(sms_stats['total_cost'] or 0),
                'avg_cost_per_sms': float(sms_stats['avg_cost'] or 0)
            },
            'daily_breakdown': daily_stats,
            'provider_breakdown': list(provider_stats),
            'generated_at': end_date.isoformat()
        }
        
        logger.info(f"SMS usage report generated: {report['summary']['total_sms']} SMS, KES {report['summary']['total_cost']:,.2f}")
        
        # Send report to administrators (placeholder)
        # In production, you would email this report to admins
        
        return {
            'success': True,
            'report': report,
            'sent_to_admins': False,  # Set to True when email implementation is added
            'message': 'SMS usage report generated successfully'
        }
        
    except Exception as e:
        logger.error(f"Error in send_sms_usage_report task: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }