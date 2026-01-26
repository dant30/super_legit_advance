# backend/apps/notifications/views/api.py
# backend/apps/notifications/views/api.py
from rest_framework import generics, permissions, status, filters, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.db.models import Count, Sum, Q, Avg
from django.utils import timezone
from datetime import timedelta

from apps.notifications.models import Notification, Template, SMSLog
from apps.notifications.serializers import (
    NotificationSerializer,
    NotificationCreateSerializer,
    NotificationDetailSerializer,
    TemplateSerializer,
    TemplateCreateSerializer,
    TemplateUpdateSerializer,
    SMSLogSerializer,
    SMSLogDetailSerializer,
    SendNotificationSerializer,
    BulkNotificationSerializer,
    TestNotificationSerializer,
)
from apps.notifications.services.notification_service import NotificationService
from apps.core.utils.permissions import IsStaff, IsAdmin, IsManager
from apps.core.mixins.api_mixins import AuditMixin, PaginationMixin


# Replace NotificationListView, NotificationDetailView, NotificationCreateView with a ViewSet
class NotificationViewSet(AuditMixin, viewsets.ModelViewSet):
    """
    ViewSet for notification management.
    """
    queryset = Notification.objects.all().select_related(
        'recipient', 'sender', 'template'
    ).order_by('-created_at')
    
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['notification_type', 'channel', 'status', 'priority']
    search_fields = ['recipient_name', 'recipient_phone', 'title', 'message']
    ordering_fields = ['created_at', 'sent_at', 'priority']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Return appropriate serializer class based on action."""
        if self.action == 'retrieve':
            return NotificationDetailSerializer
        elif self.action == 'create':
            return NotificationCreateSerializer
        return NotificationSerializer
    
    def get_queryset(self):
        """Apply additional filters based on query parameters."""
        queryset = super().get_queryset()
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        if start_date:
            queryset = queryset.filter(created_at__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__date__lte=end_date)
        
        # Filter by recipient
        recipient_id = self.request.query_params.get('recipient_id', None)
        if recipient_id:
            queryset = queryset.filter(recipient_id=recipient_id)
        
        # Filter by related object
        related_type = self.request.query_params.get('related_type', None)
        related_id = self.request.query_params.get('related_id', None)
        if related_type and related_id:
            queryset = queryset.filter(
                related_object_type=related_type,
                related_object_id=related_id
            )
        
        # Filter by template
        template_id = self.request.query_params.get('template_id', None)
        if template_id:
            queryset = queryset.filter(template_id=template_id)
        
        # Filter by delivery status
        delivered = self.request.query_params.get('delivered', None)
        if delivered is not None:
            if delivered.lower() == 'true':
                queryset = queryset.filter(status__in=['DELIVERED', 'READ'])
            elif delivered.lower() == 'false':
                queryset = queryset.exclude(status__in=['DELIVERED', 'READ'])
        
        return queryset
    
    def perform_create(self, serializer):
        """Create notification with sender information."""
        notification = serializer.save(sender=self.request.user)
        
        # Log the creation
        self.audit_log(
            action='CREATE',
            model_name='Notification',
            object_id=notification.id,
            user=self.request.user,
            changes=f"Created notification of type {notification.notification_type}"
        )
    
    @action(detail=True, methods=['patch'], url_path='mark-read')
    def mark_as_read(self, request, pk=None):
        """Mark a specific notification as read."""
        notification = self.get_object()
        
        # Check if notification belongs to the current user
        if notification.recipient != request.user and not request.user.is_staff:
            return Response(
                {'error': 'You do not have permission to mark this notification as read.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if notification can be marked as read
        if notification.status not in ['SENT', 'DELIVERED']:
            return Response(
                {'error': f'Notification is in {notification.status} status and cannot be marked as read.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Mark as read
        notification.mark_as_read()
        
        # Log the action
        self.audit_log(
            action='UPDATE',
            model_name='Notification',
            object_id=notification.id,
            user=request.user,
            changes="Marked notification as read"
        )
        
        return Response({
            'status': 'success',
            'message': 'Notification marked as read.',
            'notification_id': notification.id,
            'status': notification.status,
            'read_at': notification.read_at
        })
    
    @action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_read(self, request):
        """Mark all unread notifications for the current user as read."""
        user = request.user
        
        # Get unread notifications for the user
        notifications = Notification.objects.filter(
            recipient=user,
            status__in=['SENT', 'DELIVERED']
        )
        
        count = notifications.count()
        
        # Update all notifications
        notifications.update(status='READ', read_at=timezone.now())
        
        # Log the action
        self.audit_log(
            action='UPDATE',
            model_name='Notification',
            user=user,
            changes=f"Marked {count} notifications as read"
        )
        
        return Response({
            'status': 'success',
            'message': f'Marked {count} notifications as read.',
            'marked_read': count
        })
    
    @action(detail=True, methods=['post'], url_path='send')
    def send_notification(self, request, pk=None):
        """Send a notification immediately."""
        notification = self.get_object()
        
        # Check if already sent
        if notification.status not in ['PENDING', 'FAILED']:
            return Response(
                {'error': f'Notification is already {notification.status.lower()}.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Send notification
        notification_service = NotificationService()
        success, result = notification_service.send_notification(notification)
        
        if success:
            # Log the action
            self.audit_log(
                action='UPDATE',
                model_name='Notification',
                object_id=notification.id,
                user=request.user,
                changes=f"Manually sent notification. Result: {result}"
            )
            
            return Response({
                'message': 'Notification sent successfully.',
                'notification_id': notification.id,
                'status': notification.status,
                'result': result
            })
        else:
            return Response({
                'error': 'Failed to send notification.',
                'details': result
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Keep the existing Template and SMSLog views as they are...

class NotificationStatsView(AuditMixin, APIView):
    """
    Get notification statistics.
    """
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    
    def get(self, request):
        """Return notification statistics."""
        # Date range for stats
        days = int(request.query_params.get('days', 30))
        date_threshold = timezone.now() - timedelta(days=days)
        
        # Overall statistics
        total_notifications = Notification.objects.count()
        notifications_last_period = Notification.objects.filter(
            created_at__gte=date_threshold
        ).count()
        
        # Status distribution
        status_stats = Notification.objects.values('status').annotate(
            count=Count('id')
        ).order_by('status')
        
        # Channel distribution
        channel_stats = Notification.objects.values('channel').annotate(
            count=Count('id')
        ).order_by('channel')
        
        # Type distribution
        type_stats = Notification.objects.values('notification_type').annotate(
            count=Count('id')
        ).order_by('notification_type')
        
        # Daily statistics for the last 7 days
        daily_stats = []
        for i in range(7):
            date = timezone.now().date() - timedelta(days=i)
            start_date = timezone.make_aware(timezone.datetime.combine(date, timezone.datetime.min.time()))
            end_date = timezone.make_aware(timezone.datetime.combine(date, timezone.datetime.max.time()))
            
            daily_count = Notification.objects.filter(
                created_at__range=[start_date, end_date]
            ).count()
            
            daily_sent = Notification.objects.filter(
                sent_at__range=[start_date, end_date],
                status__in=['SENT', 'DELIVERED', 'READ']
            ).count()
            
            daily_stats.append({
                'date': date.isoformat(),
                'total': daily_count,
                'sent': daily_sent,
                'success_rate': (daily_sent / daily_count * 100) if daily_count > 0 else 0
            })
        
        # Cost statistics
        total_cost = Notification.objects.aggregate(total=Sum('cost'))['total'] or 0
        avg_cost = Notification.objects.filter(cost__gt=0).aggregate(avg=Avg('cost'))['avg'] or 0
        
        return Response({
            'overall': {
                'total_notifications': total_notifications,
                'notifications_last_period': notifications_last_period,
                'total_cost': float(total_cost),
                'average_cost': float(avg_cost),
            },
            'status_distribution': list(status_stats),
            'channel_distribution': list(channel_stats),
            'type_distribution': list(type_stats),
            'daily_stats': daily_stats,
            'time_period_days': days,
        })


class NotificationBulkSendView(AuditMixin, APIView):
    """
    Send notifications in bulk.
    """
    permission_classes = [permissions.IsAuthenticated, IsManager]
    parser_classes = [JSONParser]
    
    def post(self, request):
        """Send bulk notifications."""
        serializer = BulkNotificationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        template_id = data.get('template_id')
        recipients = data.get('recipients', [])
        context = data.get('context', {})
        
        # Get template
        try:
            template = Template.objects.get(id=template_id, is_active=True)
        except Template.DoesNotExist:
            return Response(
                {'error': 'Template not found or not active.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Send notifications
        notification_service = NotificationService()
        results = {
            'total': len(recipients),
            'successful': 0,
            'failed': 0,
            'details': []
        }
        
        for recipient in recipients:
            try:
                notification = notification_service.create_notification_from_template(
                    template=template,
                    recipient=recipient,
                    context=context,
                    sender=request.user
                )
                
                # Send notification
                success, result = notification_service.send_notification(notification)
                
                if success:
                    results['successful'] += 1
                    results['details'].append({
                        'recipient': recipient,
                        'status': 'success',
                        'notification_id': notification.id
                    })
                else:
                    results['failed'] += 1
                    results['details'].append({
                        'recipient': recipient,
                        'status': 'failed',
                        'error': result
                    })
                    
            except Exception as e:
                results['failed'] += 1
                results['details'].append({
                    'recipient': recipient,
                    'status': 'error',
                    'error': str(e)
                })
        
        # Log the bulk send
        self.audit_log(
            action='CREATE',
            model_name='Notification',
            user=request.user,
            changes=f"Sent bulk notifications: {results['successful']} successful, {results['failed']} failed"
        )
        
        return Response(results)


# Template Views (keep existing)...
class TemplateListView(AuditMixin, PaginationMixin, generics.ListAPIView):
    """
    List all notification templates.
    """
    queryset = Template.objects.all().order_by('name')
    serializer_class = TemplateSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['template_type', 'category', 'language', 'is_active']
    search_fields = ['name', 'description', 'content']
    
    def get_queryset(self):
        """Apply additional filters."""
        queryset = super().get_queryset()
        
        # Filter by active status
        active = self.request.query_params.get('active', None)
        if active is not None:
            if active.lower() == 'true':
                queryset = queryset.filter(is_active=True)
            elif active.lower() == 'false':
                queryset = queryset.filter(is_active=False)
        
        return queryset


class TemplateDetailView(AuditMixin, generics.RetrieveAPIView):
    """
    Retrieve a specific template.
    """
    queryset = Template.objects.all()
    serializer_class = TemplateSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaff]


class TemplateCreateView(AuditMixin, generics.CreateAPIView):
    """
    Create a new template.
    """
    queryset = Template.objects.all()
    serializer_class = TemplateCreateSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    parser_classes = [JSONParser]
    
    def perform_create(self, serializer):
        """Create template."""
        template = serializer.save()
        
        # Log the creation
        self.audit_log(
            action='CREATE',
            model_name='Template',
            object_id=template.id,
            user=self.request.user,
            changes=f"Created template: {template.name}"
        )


class TemplateUpdateView(AuditMixin, generics.UpdateAPIView):
    """
    Update an existing template.
    """
    queryset = Template.objects.all()
    serializer_class = TemplateUpdateSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    parser_classes = [JSONParser]
    
    def perform_update(self, serializer):
        """Update template."""
        old_instance = self.get_object()
        new_instance = serializer.save()
        
        # Log changes
        changes = self.get_changes(old_instance, new_instance, serializer.validated_data)
        if changes:
            self.audit_log(
                action='UPDATE',
                model_name='Template',
                object_id=new_instance.id,
                user=self.request.user,
                changes=changes
            )


class TemplatePreviewView(AuditMixin, APIView):
    """
    Preview a template with sample data.
    """
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    parser_classes = [JSONParser]
    
    def post(self, request, pk):
        """Preview template rendering."""
        template = get_object_or_404(Template, pk=pk)
        
        context = request.data.get('context', template.sample_data)
        
        try:
            rendered_content = template.render(context)
            rendered_subject = template.render_subject(context) if template.subject else None
            
            return Response({
                'template_id': template.id,
                'template_name': template.name,
                'rendered_content': rendered_content,
                'rendered_subject': rendered_subject,
                'content_length': len(rendered_content),
                'variables_used': template.variables,
                'variables_provided': list(context.keys()),
                'character_limit': template.character_limit if template.is_sms_template else None,
                'within_limit': len(rendered_content) <= template.character_limit if template.is_sms_template else True,
            })
        except Exception as e:
            return Response(
                {'error': f'Failed to render template: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )


class TemplateDuplicateView(AuditMixin, APIView):
    """
    Duplicate an existing template.
    """
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    parser_classes = [JSONParser]
    
    def post(self, request, pk):
        """Duplicate template."""
        template = get_object_or_404(Template, pk=pk)
        
        new_name = request.data.get('new_name', f"{template.name} (Copy)")
        
        # Check if name already exists
        if Template.objects.filter(name=new_name).exists():
            return Response(
                {'error': 'A template with this name already exists.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            duplicate = template.duplicate(new_name)
            
            # Log the duplication
            self.audit_log(
                action='CREATE',
                model_name='Template',
                object_id=duplicate.id,
                user=request.user,
                changes=f"Duplicated template from {template.name} to {new_name}"
            )
            
            serializer = TemplateSerializer(duplicate)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': f'Failed to duplicate template: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# SMS Log Views (keep existing)...
class SMSLogListView(AuditMixin, PaginationMixin, generics.ListAPIView):
    """
    List all SMS logs.
    """
    queryset = SMSLog.objects.all().select_related('notification').order_by('-created_at')
    serializer_class = SMSLogSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['status', 'provider']
    search_fields = ['phone_number', 'message', 'message_id']
    
    def get_queryset(self):
        """Apply additional filters."""
        queryset = super().get_queryset()
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        if start_date:
            queryset = queryset.filter(created_at__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__date__lte=end_date)
        
        # Filter by cost
        min_cost = self.request.query_params.get('min_cost', None)
        max_cost = self.request.query_params.get('max_cost', None)
        if min_cost:
            queryset = queryset.filter(cost__gte=min_cost)
        if max_cost:
            queryset = queryset.filter(cost__lte=max_cost)
        
        return queryset


class SMSLogDetailView(AuditMixin, generics.RetrieveAPIView):
    """
    Retrieve a specific SMS log.
    """
    queryset = SMSLog.objects.all().select_related('notification')
    serializer_class = SMSLogDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaff]


class SMSStatsView(AuditMixin, APIView):
    """
    Get SMS statistics.
    """
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    
    def get(self, request):
        """Return SMS statistics."""
        # Date range for stats
        days = int(request.query_params.get('days', 30))
        date_threshold = timezone.now() - timedelta(days=days)
        
        # Overall statistics
        total_sms = SMSLog.objects.count()
        sms_last_period = SMSLog.objects.filter(
            created_at__gte=date_threshold
        ).count()
        
        # Status distribution
        status_stats = SMSLog.objects.values('status').annotate(
            count=Count('id')
        ).order_by('status')
        
        # Provider distribution
        provider_stats = SMSLog.objects.values('provider').annotate(
            count=Count('id'),
            total_cost=Sum('cost'),
            total_units=Sum('units'),
        ).order_by('-count')
        
        # Daily statistics for the last 7 days
        daily_stats = []
        for i in range(7):
            date = timezone.now().date() - timedelta(days=i)
            stats = SMSLog.get_daily_stats(date)
            daily_stats.append(stats)
        
        # Cost statistics
        total_cost = SMSLog.objects.aggregate(total=Sum('cost'))['total'] or 0
        avg_cost_per_sms = SMSLog.objects.filter(cost__gt=0).aggregate(avg=Avg('cost'))['avg'] or 0
        total_units = SMSLog.objects.aggregate(total=Sum('units'))['total__sum'] or 0
        
        # Delivery performance
        delivered_sms = SMSLog.objects.filter(status='DELIVERED').count()
        sent_sms = SMSLog.objects.filter(status='SENT').count()
        delivery_rate = (delivered_sms / sent_sms * 100) if sent_sms > 0 else 0
        
        # Average delivery time
        avg_delivery_time = SMSLog.objects.filter(
            status='DELIVERED',
            sent_at__isnull=False,
            delivered_at__isnull=False
        ).aggregate(
            avg=Avg(models.F('delivered_at') - models.F('sent_at'))
        )['avg']
        
        avg_delivery_seconds = avg_delivery_time.total_seconds() if avg_delivery_time else None
        
        return Response({
            'overall': {
                'total_sms': total_sms,
                'sms_last_period': sms_last_period,
                'total_cost': float(total_cost),
                'total_units': total_units,
                'avg_cost_per_sms': float(avg_cost_per_sms),
                'delivery_rate': delivery_rate,
                'avg_delivery_time_seconds': avg_delivery_seconds,
            },
            'status_distribution': list(status_stats),
            'provider_distribution': list(provider_stats),
            'daily_stats': daily_stats,
            'time_period_days': days,
        })


class SendTestNotificationView(AuditMixin, APIView):
    """
    Send a test notification.
    """
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    parser_classes = [JSONParser]
    
    def post(self, request):
        """Send test notification."""
        serializer = TestNotificationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        channel = data.get('channel')
        recipient_phone = data.get('recipient_phone')
        recipient_email = data.get('recipient_email')
        message = data.get('message')
        
        # Create test notification
        notification_data = {
            'notification_type': 'SYSTEM_ALERT',
            'channel': channel,
            'priority': 'LOW',
            'title': 'Test Notification',
            'message': message,
            'recipient_name': 'Test User',
            'sender': request.user,
        }
        
        if channel == 'SMS' and recipient_phone:
            notification_data['recipient_phone'] = recipient_phone
        elif channel == 'EMAIL' and recipient_email:
            notification_data['recipient_email'] = recipient_email
        else:
            return Response(
                {'error': 'Recipient information is required for the selected channel.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create and send notification
        notification_service = NotificationService()
        
        try:
            # Create notification
            notification = Notification.objects.create(**notification_data)
            
            # Send notification
            success, result = notification_service.send_notification(notification)
            
            if success:
                # Log the test
                self.audit_log(
                    action='CREATE',
                    model_name='Notification',
                    object_id=notification.id,
                    user=request.user,
                    changes=f"Sent test {channel} notification"
                )
                
                return Response({
                    'message': 'Test notification sent successfully.',
                    'notification_id': notification.id,
                    'status': notification.status,
                    'result': result
                })
            else:
                return Response({
                    'error': 'Failed to send test notification.',
                    'details': result
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            return Response(
                {'error': f'Failed to send test notification: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )