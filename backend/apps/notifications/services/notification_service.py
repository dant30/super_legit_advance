# backend/apps/notifications/services/notification_service.py
import logging
from typing import Dict, List, Optional, Tuple, Any
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.conf import settings
from datetime import datetime, timedelta

from apps.notifications.models import Notification, Template, SMSLog
from apps.notifications.services.sms_service import SMSService
from apps.notifications.services.email_service import EmailService

User = get_user_model()
logger = logging.getLogger(__name__)


class NotificationService:
    """
    Main service for handling all types of notifications.
    """
    
    def __init__(self):
        """Initialize notification services."""
        self.sms_service = SMSService()
        self.email_service = EmailService()
    
    def send_notification(self, notification: Notification) -> Tuple[bool, Dict]:
        """
        Send a notification based on its channel.
        
        Args:
            notification: Notification object to send
            
        Returns:
            Tuple of (success, result_data)
        """
        try:
            # Check if notification is scheduled for future
            if notification.scheduled_for and notification.scheduled_for > timezone.now():
                logger.info(f"Notification {notification.id} scheduled for {notification.scheduled_for}")
                return True, {'status': 'scheduled', 'scheduled_for': notification.scheduled_for.isoformat()}
            
            # Send based on channel
            if notification.channel == 'SMS':
                return self._send_sms_notification(notification)
            
            elif notification.channel == 'EMAIL':
                return self._send_email_notification(notification)
            
            elif notification.channel == 'PUSH':
                return self._send_push_notification(notification)
            
            elif notification.channel == 'WHATSAPP':
                return self._send_whatsapp_notification(notification)
            
            else:
                # For in-app or other notifications, just mark as sent
                notification.mark_as_sent()
                return True, {'status': 'sent', 'channel': notification.channel}
                
        except Exception as e:
            error_msg = f"Error sending notification {notification.id}: {str(e)}"
            logger.error(error_msg)
            notification.mark_as_failed(error_msg)
            return False, {'error': error_msg}
    
    def create_notification_from_template(
        self,
        template: Template,
        recipient: Optional[User] = None,
        recipient_name: Optional[str] = None,
        recipient_phone: Optional[str] = None,
        recipient_email: Optional[str] = None,
        context: Optional[Dict] = None,
        sender: Optional[User] = None,
        additional_data: Optional[Dict] = None
    ) -> Notification:
        """
        Create a notification from a template.
        
        Args:
            template: Template object
            recipient: User object (optional)
            recipient_name: Recipient name (optional, required if no recipient)
            recipient_phone: Recipient phone (optional, required for SMS)
            recipient_email: Recipient email (optional, required for email)
            context: Template context data
            sender: User object sending the notification
            additional_data: Additional notification data
            
        Returns:
            Created Notification object
        """
        if context is None:
            context = {}
        
        # Validate template context
        template.validate_context(context)
        
        # Determine recipient information
        if recipient:
            recipient_name = recipient_name or recipient.get_full_name()
            recipient_phone = recipient_phone or getattr(recipient, 'phone_number', None)
            recipient_email = recipient_email or recipient.email
        
        # Render template
        message = template.render(context)
        
        # Prepare notification data
        notification_data = {
            'notification_type': additional_data.get('notification_type', 'SYSTEM_ALERT') if additional_data else 'SYSTEM_ALERT',
            'channel': template.template_type if template.template_type in ['SMS', 'EMAIL'] else 'SMS',
            'priority': additional_data.get('priority', 'MEDIUM') if additional_data else 'MEDIUM',
            'title': additional_data.get('title', template.name) if additional_data else template.name,
            'message': message,
            'recipient': recipient,
            'recipient_name': recipient_name,
            'recipient_phone': recipient_phone,
            'recipient_email': recipient_email,
            'sender': sender,
            'sender_name': sender.get_full_name() if sender else 'System',
            'template': template,
            'scheduled_for': additional_data.get('scheduled_for') if additional_data else None,
            'related_object_type': additional_data.get('related_object_type') if additional_data else '',
            'related_object_id': additional_data.get('related_object_id') if additional_data else '',
            'metadata': additional_data.get('metadata', {}) if additional_data else {},
        }
        
        # Remove None values
        notification_data = {k: v for k, v in notification_data.items() if v is not None}
        
        # Create notification
        notification = Notification.objects.create(**notification_data)
        
        # Increment template usage
        template.increment_usage()
        
        logger.info(f"Created notification {notification.id} from template {template.name}")
        
        return notification
    
    def send_loan_approved_notification(
        self,
        loan,
        customer,
        staff_member=None
    ) -> Tuple[bool, Dict]:
        """
        Send loan approval notification.
        
        Args:
            loan: Loan object
            customer: Customer object
            staff_member: Staff member who approved the loan
            
        Returns:
            Tuple of (success, result_data)
        """
        try:
            # Get or create loan approval template
            template = self._get_or_create_loan_approved_template()
            
            # Prepare context
            context = {
                'customer_name': customer.full_name,
                'loan_amount': loan.amount_approved,
                'loan_id': loan.loan_number,
                'approval_date': loan.approved_date.strftime('%d/%m/%Y') if loan.approved_date else timezone.now().strftime('%d/%m/%Y'),
                'interest_rate': loan.interest_rate,
                'repayment_period': loan.repayment_period_months,
                'monthly_installment': loan.monthly_installment,
                'total_repayment': loan.total_repayment_amount,
                'first_payment_date': loan.first_payment_date.strftime('%d/%m/%Y') if loan.first_payment_date else '',
                'customer_service_phone': '+254700000000',
            }
            
            # Create notification
            notification = self.create_notification_from_template(
                template=template,
                recipient=customer.user if customer.user else None,
                recipient_name=customer.full_name,
                recipient_phone=customer.phone_number,
                recipient_email=customer.email,
                context=context,
                sender=staff_member,
                additional_data={
                    'notification_type': 'LOAN_APPROVED',
                    'priority': 'HIGH',
                    'title': f'Loan Approved: {loan.loan_number}',
                    'related_object_type': 'LOAN',
                    'related_object_id': str(loan.id),
                }
            )
            
            # Send notification
            success, result = self.send_notification(notification)
            
            if success:
                logger.info(f"Loan approval notification sent for loan {loan.loan_number}")
            else:
                logger.error(f"Failed to send loan approval notification for loan {loan.loan_number}")
            
            return success, result
            
        except Exception as e:
            error_msg = f"Error sending loan approval notification: {str(e)}"
            logger.error(error_msg)
            return False, {'error': error_msg}
    
    def send_payment_reminder_notification(
        self,
        repayment_schedule,
        customer,
        days_before=1
    ) -> Tuple[bool, Dict]:
        """
        Send payment reminder notification.
        
        Args:
            repayment_schedule: RepaymentSchedule object
            customer: Customer object
            days_before: Days before payment is due
            
        Returns:
            Tuple of (success, result_data)
        """
        try:
            # Get or create payment reminder template
            template = self._get_or_create_payment_reminder_template()
            
            # Calculate due date
            due_date = repayment_schedule.due_date
            reminder_date = due_date - timedelta(days=days_before)
            
            # Prepare context
            context = {
                'customer_name': customer.full_name,
                'amount_due': repayment_schedule.amount_due,
                'due_date': due_date.strftime('%d/%m/%Y'),
                'loan_id': repayment_schedule.loan.loan_number if repayment_schedule.loan else '',
                'installment_number': repayment_schedule.installment_number,
                'total_installments': repayment_schedule.total_installments,
                'remaining_balance': repayment_schedule.loan.outstanding_balance if repayment_schedule.loan else 0,
                'payment_methods': 'M-Pesa Paybill: 123456 Account: Your Phone Number',
                'late_fee': repayment_schedule.late_fee if hasattr(repayment_schedule, 'late_fee') else 0,
            }
            
            # Create notification
            notification = self.create_notification_from_template(
                template=template,
                recipient=customer.user if customer.user else None,
                recipient_name=customer.full_name,
                recipient_phone=customer.phone_number,
                context=context,
                additional_data={
                    'notification_type': 'PAYMENT_REMINDER',
                    'priority': 'MEDIUM',
                    'title': f'Payment Reminder: KES {repayment_schedule.amount_due:,.2f} Due Soon',
                    'scheduled_for': reminder_date,
                    'related_object_type': 'REPAYMENT',
                    'related_object_id': str(repayment_schedule.id),
                }
            )
            
            # Send notification if not scheduled
            if not notification.scheduled_for or notification.scheduled_for <= timezone.now():
                success, result = self.send_notification(notification)
            else:
                success, result = True, {'status': 'scheduled', 'scheduled_for': notification.scheduled_for.isoformat()}
            
            return success, result
            
        except Exception as e:
            error_msg = f"Error sending payment reminder notification: {str(e)}"
            logger.error(error_msg)
            return False, {'error': error_msg}
    
    def send_payment_received_notification(
        self,
        payment,
        customer
    ) -> Tuple[bool, Dict]:
        """
        Send payment received notification.
        
        Args:
            payment: Payment object
            customer: Customer object
            
        Returns:
            Tuple of (success, result_data)
        """
        try:
            # Get or create payment received template
            template = self._get_or_create_payment_received_template()
            
            # Prepare context
            context = {
                'customer_name': customer.full_name,
                'amount_paid': payment.amount,
                'payment_date': payment.payment_date.strftime('%d/%m/%Y %H:%M'),
                'transaction_id': payment.transaction_id or payment.reference,
                'payment_method': payment.get_payment_method_display() if hasattr(payment, 'get_payment_method_display') else 'M-Pesa',
                'loan_id': payment.loan.loan_number if payment.loan else '',
                'remaining_balance': payment.loan.outstanding_balance if payment.loan else 0,
                'next_payment_date': payment.loan.next_payment_date.strftime('%d/%m/%Y') if payment.loan and payment.loan.next_payment_date else '',
            }
            
            # Create notification
            notification = self.create_notification_from_template(
                template=template,
                recipient=customer.user if customer.user else None,
                recipient_name=customer.full_name,
                recipient_phone=customer.phone_number,
                recipient_email=customer.email,
                context=context,
                additional_data={
                    'notification_type': 'PAYMENT_RECEIVED',
                    'priority': 'MEDIUM',
                    'title': f'Payment Received: KES {payment.amount:,.2f}',
                    'related_object_type': 'PAYMENT',
                    'related_object_id': str(payment.id),
                }
            )
            
            # Send notification
            success, result = self.send_notification(notification)
            
            return success, result
            
        except Exception as e:
            error_msg = f"Error sending payment received notification: {str(e)}"
            logger.error(error_msg)
            return False, {'error': error_msg}
    
    def send_overdue_notification(
        self,
        loan,
        customer,
        overdue_days
    ) -> Tuple[bool, Dict]:
        """
        Send overdue loan notification.
        
        Args:
            loan: Loan object
            customer: Customer object
            overdue_days: Number of days overdue
            
        Returns:
            Tuple of (success, result_data)
        """
        try:
            # Get or create overdue template
            template = self._get_or_create_overdue_template()
            
            # Prepare context
            context = {
                'customer_name': customer.full_name,
                'loan_id': loan.loan_number,
                'overdue_amount': loan.overdue_amount if hasattr(loan, 'overdue_amount') else loan.outstanding_balance,
                'overdue_days': overdue_days,
                'late_fee': loan.late_fee if hasattr(loan, 'late_fee') else 0,
                'total_due': (loan.overdue_amount if hasattr(loan, 'overdue_amount') else loan.outstanding_balance) + 
                            (loan.late_fee if hasattr(loan, 'late_fee') else 0),
                'due_date': loan.last_payment_due_date.strftime('%d/%m/%Y') if loan.last_payment_due_date else '',
                'collection_contact': '+254700000000',
                'collection_email': 'collections@superlegitadvance.com',
            }
            
            # Create notification
            notification = self.create_notification_from_template(
                template=template,
                recipient=customer.user if customer.user else None,
                recipient_name=customer.full_name,
                recipient_phone=customer.phone_number,
                recipient_email=customer.email,
                context=context,
                additional_data={
                    'notification_type': 'PAYMENT_OVERDUE',
                    'priority': 'HIGH',
                    'title': f'URGENT: Loan #{loan.loan_number} Overdue by {overdue_days} days',
                    'related_object_type': 'LOAN',
                    'related_object_id': str(loan.id),
                }
            )
            
            # Send notification
            success, result = self.send_notification(notification)
            
            return success, result
            
        except Exception as e:
            error_msg = f"Error sending overdue notification: {str(e)}"
            logger.error(error_msg)
            return False, {'error': error_msg}
    
    def process_scheduled_notifications(self) -> Tuple[int, int]:
        """
        Process all pending scheduled notifications that are due.
        
        Returns:
            Tuple of (sent_count, failed_count)
        """
        try:
            # Get scheduled notifications that are due
            now = timezone.now()
            scheduled_notifications = Notification.objects.filter(
                status='PENDING',
                scheduled_for__lte=now
            )
            
            sent_count = 0
            failed_count = 0
            
            for notification in scheduled_notifications:
                success, _ = self.send_notification(notification)
                
                if success:
                    sent_count += 1
                else:
                    failed_count += 1
            
            logger.info(f"Processed scheduled notifications: {sent_count} sent, {failed_count} failed")
            return sent_count, failed_count
            
        except Exception as e:
            logger.error(f"Error processing scheduled notifications: {str(e)}")
            return 0, 0
    
    def retry_failed_notifications(self, max_attempts=3) -> Tuple[int, int]:
        """
        Retry failed notifications that have less than max attempts.
        
        Args:
            max_attempts: Maximum delivery attempts before giving up
            
        Returns:
            Tuple of (retried_count, still_failed_count)
        """
        try:
            # Get failed notifications with less than max attempts
            failed_notifications = Notification.objects.filter(
                status='FAILED',
                delivery_attempts__lt=max_attempts
            )
            
            retried_count = 0
            still_failed_count = 0
            
            for notification in failed_notifications:
                if notification.retry():
                    retried_count += 1
                else:
                    still_failed_count += 1
            
            logger.info(f"Retried failed notifications: {retried_count} retried, {still_failed_count} still failed")
            return retried_count, still_failed_count
            
        except Exception as e:
            logger.error(f"Error retrying failed notifications: {str(e)}")
            return 0, 0
    
    def get_notification_stats(self, days=30) -> Dict:
        """
        Get notification statistics for the last N days.
        
        Args:
            days: Number of days to look back
            
        Returns:
            Dictionary with statistics
        """
        try:
            date_threshold = timezone.now() - timedelta(days=days)
            
            stats = Notification.objects.filter(
                created_at__gte=date_threshold
            ).aggregate(
                total=Count('id'),
                sent=Count('id', filter=Q(status__in=['SENT', 'DELIVERED', 'READ'])),
                failed=Count('id', filter=Q(status='FAILED')),
                pending=Count('id', filter=Q(status='PENDING')),
                total_cost=Sum('cost'),
            )
            
            # Add channel breakdown
            channel_stats = Notification.objects.filter(
                created_at__gte=date_threshold
            ).values('channel').annotate(
                count=Count('id'),
                sent=Count('id', filter=Q(status__in=['SENT', 'DELIVERED', 'READ'])),
                cost=Sum('cost'),
            ).order_by('-count')
            
            # Add type breakdown
            type_stats = Notification.objects.filter(
                created_at__gte=date_threshold
            ).values('notification_type').annotate(
                count=Count('id'),
            ).order_by('-count')
            
            return {
                'period_days': days,
                'total': stats['total'] or 0,
                'sent': stats['sent'] or 0,
                'failed': stats['failed'] or 0,
                'pending': stats['pending'] or 0,
                'success_rate': (stats['sent'] / stats['total'] * 100) if stats['total'] > 0 else 0,
                'total_cost': float(stats['total_cost'] or 0),
                'avg_cost_per_notification': float((stats['total_cost'] or 0) / stats['total']) if stats['total'] > 0 else 0,
                'channel_breakdown': list(channel_stats),
                'type_breakdown': list(type_stats),
            }
            
        except Exception as e:
            logger.error(f"Error getting notification stats: {str(e)}")
            return {}
    
    # Private helper methods
    def _send_sms_notification(self, notification: Notification) -> Tuple[bool, Dict]:
        """Send SMS notification."""
        try:
            # Validate phone number
            if not notification.recipient_phone:
                raise ValueError("Phone number is required for SMS notifications")
            
            # Send SMS
            success, result = self.sms_service.send_sms(
                phone_number=notification.recipient_phone,
                message=notification.message,
                sender_id=notification.sender_name or settings.SMS_SENDER_ID
            )
            
            if success:
                # Create SMS log
                sms_log = SMSLog.objects.create(
                    notification=notification,
                    phone_number=notification.recipient_phone,
                    message=notification.message,
                    provider='AFRICASTALKING',
                    status='SENT',
                    message_id=result.get('message_id'),
                    cost=self.sms_service.calculate_sms_cost(notification.message, notification.recipient_phone),
                )
                
                # Mark notification as sent
                notification.mark_as_sent(
                    external_id=result.get('message_id'),
                    cost=sms_log.cost
                )
                
                logger.info(f"SMS notification {notification.id} sent successfully")
                return True, {'sms_log_id': sms_log.id, 'message_id': result.get('message_id')}
            else:
                notification.mark_as_failed(result.get('error', 'SMS sending failed'))
                return False, result
                
        except Exception as e:
            error_msg = f"Error sending SMS notification: {str(e)}"
            notification.mark_as_failed(error_msg)
            return False, {'error': error_msg}
    
    def _send_email_notification(self, notification: Notification) -> Tuple[bool, Dict]:
        """Send email notification."""
        try:
            # Validate email
            if not notification.recipient_email:
                raise ValueError("Email address is required for email notifications")
            
            # Send email
            success, result = self.email_service.send_email(
                recipient_email=notification.recipient_email,
                subject=notification.title,
                message=notification.message,
                from_email=notification.sender_name or settings.DEFAULT_FROM_EMAIL
            )
            
            if success:
                # Mark notification as sent (email cost is typically 0)
                notification.mark_as_sent()
                logger.info(f"Email notification {notification.id} sent successfully")
                return True, result
            else:
                notification.mark_as_failed(result.get('error', 'Email sending failed'))
                return False, result
                
        except Exception as e:
            error_msg = f"Error sending email notification: {str(e)}"
            notification.mark_as_failed(error_msg)
            return False, {'error': error_msg}
    
    def _send_push_notification(self, notification: Notification) -> Tuple[bool, Dict]:
        """Send push notification (placeholder implementation)."""
        try:
            # Placeholder for push notification implementation
            # Would integrate with Firebase Cloud Messaging or similar
            
            notification.mark_as_sent()
            logger.info(f"Push notification {notification.id} marked as sent (not implemented)")
            return True, {'status': 'sent', 'note': 'Push notifications not implemented'}
            
        except Exception as e:
            error_msg = f"Error sending push notification: {str(e)}"
            notification.mark_as_failed(error_msg)
            return False, {'error': error_msg}
    
    def _send_whatsapp_notification(self, notification: Notification) -> Tuple[bool, Dict]:
        """Send WhatsApp notification (placeholder implementation)."""
        try:
            # Placeholder for WhatsApp notification implementation
            # Would integrate with WhatsApp Business API
            
            notification.mark_as_sent()
            logger.info(f"WhatsApp notification {notification.id} marked as sent (not implemented)")
            return True, {'status': 'sent', 'note': 'WhatsApp notifications not implemented'}
            
        except Exception as e:
            error_msg = f"Error sending WhatsApp notification: {str(e)}"
            notification.mark_as_failed(error_msg)
            return False, {'error': error_msg}
    
    def _get_or_create_loan_approved_template(self) -> Template:
        """Get or create loan approved template."""
        template_name = "Loan Approval Notification"
        
        try:
            return Template.objects.get(name=template_name, is_active=True)
        except Template.DoesNotExist:
            return Template.objects.create(
                name=template_name,
                template_type='SMS',
                category='LOAN',
                language='EN',
                content="""Dear {{customer_name}},

Your loan application #{{loan_id}} has been approved!

Amount: KES {{loan_amount:,.2f}}
Interest Rate: {{interest_rate}}%
Period: {{repayment_period}} months
Monthly Installment: KES {{monthly_installment:,.2f}}
Total Repayment: KES {{total_repayment:,.2f}}

First payment due: {{first_payment_date}}

Funds will be disbursed within 24 hours.

Thank you for choosing Super Legit Advance!
Call {{customer_service_phone}} for assistance.""",
                variables=['customer_name', 'loan_id', 'loan_amount', 'interest_rate', 
                         'repayment_period', 'monthly_installment', 'total_repayment', 
                         'first_payment_date', 'customer_service_phone'],
                description="SMS template for loan approval notifications",
                sample_data={
                    'customer_name': 'John Doe',
                    'loan_id': 'LN-2024-00123',
                    'loan_amount': 50000,
                    'interest_rate': 12.5,
                    'repayment_period': 12,
                    'monthly_installment': 4447.92,
                    'total_repayment': 53375.00,
                    'first_payment_date': '15/02/2024',
                    'customer_service_phone': '+254700000000',
                }
            )
    
    def _get_or_create_payment_reminder_template(self) -> Template:
        """Get or create payment reminder template."""
        template_name = "Payment Reminder"
        
        try:
            return Template.objects.get(name=template_name, is_active=True)
        except Template.DoesNotExist:
            return Template.objects.create(
                name=template_name,
                template_type='SMS',
                category='PAYMENT',
                language='EN',
                content="""Hi {{customer_name}},

Friendly reminder: Payment of KES {{amount_due:,.2f}} is due on {{due_date}} for loan #{{loan_id}}.

Installment {{installment_number}} of {{total_installments}}
Remaining balance: KES {{remaining_balance:,.2f}}

Pay via M-Pesa:
Paybill: 123456
Account: Your Phone Number

Late payment may incur fees.
Thank you!""",
                variables=['customer_name', 'amount_due', 'due_date', 'loan_id', 
                         'installment_number', 'total_installments', 'remaining_balance'],
                description="SMS template for payment reminders",
                sample_data={
                    'customer_name': 'John Doe',
                    'amount_due': 4447.92,
                    'due_date': '15/02/2024',
                    'loan_id': 'LN-2024-00123',
                    'installment_number': 1,
                    'total_installments': 12,
                    'remaining_balance': 53375.00,
                }
            )
    
    def _get_or_create_payment_received_template(self) -> Template:
        """Get or create payment received template."""
        template_name = "Payment Received Confirmation"
        
        try:
            return Template.objects.get(name=template_name, is_active=True)
        except Template.DoesNotExist:
            return Template.objects.create(
                name=template_name,
                template_type='SMS',
                category='PAYMENT',
                language='EN',
                content="""Dear {{customer_name}},

We have received your payment of KES {{amount_paid:,.2f}} on {{payment_date}}.

Transaction ID: {{transaction_id}}
Payment Method: {{payment_method}}
Loan: #{{loan_id}}
Remaining Balance: KES {{remaining_balance:,.2f}}

Next payment due: {{next_payment_date}}

Thank you for your timely payment!""",
                variables=['customer_name', 'amount_paid', 'payment_date', 'transaction_id',
                         'payment_method', 'loan_id', 'remaining_balance', 'next_payment_date'],
                description="SMS template for payment confirmations",
                sample_data={
                    'customer_name': 'John Doe',
                    'amount_paid': 4447.92,
                    'payment_date': '15/02/2024 10:30',
                    'transaction_id': 'MPE123456789',
                    'payment_method': 'M-Pesa',
                    'loan_id': 'LN-2024-00123',
                    'remaining_balance': 48927.08,
                    'next_payment_date': '15/03/2024',
                }
            )
    
    def _get_or_create_overdue_template(self) -> Template:
        """Get or create overdue loan template."""
        template_name = "Overdue Loan Notification"
        
        try:
            return Template.objects.get(name=template_name, is_active=True)
        except Template.DoesNotExist:
            return Template.objects.create(
                name=template_name,
                template_type='SMS',
                category='LOAN',
                language='EN',
                content="""URGENT: {{customer_name}}

Your loan #{{loan_id}} is OVERDUE by {{overdue_days}} days.

Amount Due: KES {{overdue_amount:,.2f}}
Late Fee: KES {{late_fee:,.2f}}
TOTAL: KES {{total_due:,.2f}}

Due Date: {{due_date}}

Please pay IMMEDIATELY to avoid further penalties and credit score impact.

Contact Collections: {{collection_contact}}
Email: {{collection_email}}

Act now to resolve this matter.""",
                variables=['customer_name', 'loan_id', 'overdue_days', 'overdue_amount',
                         'late_fee', 'total_due', 'due_date', 'collection_contact', 'collection_email'],
                description="SMS template for overdue loan notifications",
                sample_data={
                    'customer_name': 'John Doe',
                    'loan_id': 'LN-2024-00123',
                    'overdue_days': 7,
                    'overdue_amount': 4447.92,
                    'late_fee': 500.00,
                    'total_due': 4947.92,
                    'due_date': '15/02/2024',
                    'collection_contact': '+254700000000',
                    'collection_email': 'collections@superlegitadvance.com',
                }
            )


# Singleton instance
notification_service = NotificationService()