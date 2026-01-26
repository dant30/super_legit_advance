# backend/apps/audit/views/api.py
from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.db.models import Count, Q, F, ExpressionWrapper, FloatField
from django.db.models.functions import TruncDay, TruncHour, TruncMonth
from django.utils import timezone
from datetime import timedelta
import pandas as pd
import io

from apps.audit.models import AuditLog
from apps.audit.serializers import (
    AuditLogSerializer,
    AuditLogDetailSerializer,
    AuditLogExportSerializer,
)
from apps.core.utils.permissions import IsAdmin, IsAuditor
from apps.core.mixins.api_mixins import AuditMixin


class AuditLogPagination(PageNumberPagination):
    """Custom pagination for audit logs."""
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 200


class AuditLogListView(AuditMixin, generics.ListAPIView):
    """
    List audit logs with filtering and search.
    Only accessible by auditors and administrators.
    """
    queryset = AuditLog.objects.all().select_related('user')
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated, IsAuditor]
    pagination_class = AuditLogPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'action', 
        'severity', 
        'status', 
        'model_name',
        'module',
        'is_compliance_event',
    ]
    search_fields = [
        'user__username',
        'user__first_name',
        'user__last_name',
        'object_repr',
        'model_name',
        'changes',
        'error_message',
        'user_ip',
    ]
    ordering_fields = [
        'timestamp',
        'severity',
        'action',
        'user__username',
    ]
    ordering = ['-timestamp']
    
    def get_queryset(self):
        """
        Apply additional filters based on query parameters.
        """
        queryset = super().get_queryset()
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(timestamp__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(timestamp__date__lte=end_date)
        
        # Filter by user ID
        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # Filter by object ID
        object_id = self.request.query_params.get('object_id')
        if object_id:
            queryset = queryset.filter(object_id=object_id)
        
        # Filter by IP address
        ip_address = self.request.query_params.get('ip_address')
        if ip_address:
            queryset = queryset.filter(user_ip=ip_address)
        
        # Filter by success/failure
        success = self.request.query_params.get('success')
        if success is not None:
            if success.lower() == 'true':
                queryset = queryset.filter(status='SUCCESS')
            elif success.lower() == 'false':
                queryset = queryset.filter(status='FAILURE')
        
        # Filter by high severity
        high_severity = self.request.query_params.get('high_severity')
        if high_severity is not None:
            if high_severity.lower() == 'true':
                queryset = queryset.filter(severity__in=['HIGH', 'CRITICAL'])
        
        # Filter by tags
        tags = self.request.query_params.getlist('tags')
        if tags:
            # Assuming tags is a JSON array in the database
            for tag in tags:
                queryset = queryset.filter(tags__contains=[tag])
        
        # Exclude sensitive actions if not admin
        if not self.request.user.is_superuser:
            queryset = queryset.exclude(
                Q(action__in=['LOGIN', 'LOGOUT']) |
                Q(model_name__in=['User', 'Group', 'Permission'])
            )
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        """Override to add summary statistics."""
        response = super().list(request, *args, **kwargs)
        
        # Add summary statistics
        queryset = self.filter_queryset(self.get_queryset())
        
        total_logs = queryset.count()
        success_logs = queryset.filter(status='SUCCESS').count()
        failure_logs = queryset.filter(status='FAILURE').count()
        
        # Count by severity
        severity_counts = queryset.values('severity').annotate(
            count=Count('id')
        ).order_by('severity')
        
        # Count by action
        action_counts = queryset.values('action').annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        
        # Count by user
        user_counts = queryset.filter(user__isnull=False).values(
            'user__email', 'user__first_name', 'user__last_name'
        ).annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        
        response.data['summary'] = {
            'total_logs': total_logs,
            'success_logs': success_logs,
            'failure_logs': failure_logs,
            'success_rate': (success_logs / total_logs * 100) if total_logs > 0 else 0,
            'severity_distribution': list(severity_counts),
            'top_actions': list(action_counts),
            'top_users': list(user_counts),
        }
        
        return response


class AuditLogDetailView(AuditMixin, generics.RetrieveAPIView):
    """
    Retrieve detailed audit log information.
    """
    queryset = AuditLog.objects.all().select_related('user')
    serializer_class = AuditLogDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsAuditor]
    lookup_field = 'id'
    
    def retrieve(self, request, *args, **kwargs):
        """Retrieve audit log with additional context."""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        
        # Add related logs for the same object
        if instance.model_name and instance.object_id:
            related_logs = AuditLog.objects.filter(
                model_name=instance.model_name,
                object_id=instance.object_id
            ).exclude(id=instance.id).order_by('-timestamp')[:10]
            
            related_data = AuditLogSerializer(related_logs, many=True).data
            
            response_data = serializer.data
            response_data['related_logs'] = related_data
            
            return Response(response_data)
        
        return Response(serializer.data)


class AuditLogSearchView(AuditMixin, generics.ListAPIView):
    """
    Advanced search for audit logs.
    """
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated, IsAuditor]
    pagination_class = AuditLogPagination
    
    def get_queryset(self):
        queryset = AuditLog.objects.all().select_related('user')
        
        # Get search parameters
        search_type = self.request.query_params.get('type', 'all')
        search_query = self.request.query_params.get('q', '').strip()
        
        if not search_query:
            return queryset.none()
        
        # Build search query based on type - FIXED: Changed from username to email
        if search_type == 'user':
            queryset = queryset.filter(
                Q(user__email__icontains=search_query) |
                Q(user__first_name__icontains=search_query) |
                Q(user__last_name__icontains=search_query)
            )
        elif search_type == 'object':
            queryset = queryset.filter(
                Q(object_repr__icontains=search_query) |
                Q(model_name__icontains=search_query)
            )
        elif search_type == 'ip':
            queryset = queryset.filter(user_ip__icontains=search_query)
        elif search_type == 'changes':
            queryset = queryset.filter(changes__icontains=search_query)
        else:  # All fields
            queryset = queryset.filter(
                Q(user__email__icontains=search_query) |
                Q(user__first_name__icontains=search_query) |
                Q(user__last_name__icontains=search_query) |
                Q(object_repr__icontains=search_query) |
                Q(model_name__icontains=search_query) |
                Q(changes__icontains=search_query) |
                Q(error_message__icontains=search_query) |
                Q(user_ip__icontains=search_query) |
                Q(notes__icontains=search_query)
            )
        
        return queryset

class AuditLogStatsView(AuditMixin, APIView):
    """
    Get audit log statistics and analytics.
    """
    permission_classes = [permissions.IsAuthenticated, IsAuditor]
    
    def get(self, request):
        """Return comprehensive audit statistics."""
        # Time period (default: last 30 days)
        days = int(request.query_params.get('days', 30))
        start_date = timezone.now() - timedelta(days=days)
        
        # Get base queryset
        queryset = AuditLog.objects.filter(timestamp__gte=start_date)
        
        # Overall statistics
        total_logs = queryset.count()
        success_logs = queryset.filter(status='SUCCESS').count()
        failure_logs = queryset.filter(status='FAILURE').count()
        
        # Daily activity
        daily_activity = queryset.annotate(
            day=TruncDay('timestamp')
        ).values('day').annotate(
            count=Count('id'),
            success=Count('id', filter=Q(status='SUCCESS')),
            failure=Count('id', filter=Q(status='FAILURE')),
        ).order_by('day')
        
        # Hourly activity (last 7 days)
        weekly_start = timezone.now() - timedelta(days=7)
        hourly_activity = queryset.filter(
            timestamp__gte=weekly_start
        ).annotate(
            hour=TruncHour('timestamp')
        ).values('hour').annotate(
            count=Count('id')
        ).order_by('hour')
        
        # Top users by activity
        top_users = queryset.filter(user__isnull=False).values(
            'user__username',
            'user__first_name',
            'user__last_name',
            'user__email'
        ).annotate(
            total_actions=Count('id'),
            successful_actions=Count('id', filter=Q(status='SUCCESS')),
            failed_actions=Count('id', filter=Q(status='FAILURE')),
            success_rate=ExpressionWrapper(
                Count('id', filter=Q(status='SUCCESS')) * 100.0 / Count('id'),
                output_field=FloatField()
            )
        ).order_by('-total_actions')[:20]
        
        # Most active models
        active_models = queryset.exclude(model_name='').values(
            'model_name'
        ).annotate(
            count=Count('id'),
            last_activity=F('timestamp')
        ).order_by('-count')[:10]
        
        # Most common actions
        common_actions = queryset.values('action').annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        
        # Severity distribution
        severity_dist = queryset.values('severity').annotate(
            count=Count('id')
        ).order_by('severity')
        
        # Module/feature distribution
        module_dist = queryset.exclude(module='').values('module').annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        
        # IP addresses with most activity
        top_ips = queryset.exclude(user_ip='').values('user_ip').annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        
        # Recent security events
        security_events = queryset.filter(
            severity__in=['HIGH', 'CRITICAL'],
            status='FAILURE'
        ).order_by('-timestamp')[:20]
        
        # Compliance events
        compliance_events = queryset.filter(
            is_compliance_event=True
        ).count()
        
        return Response({
            'time_period': {
                'days': days,
                'start_date': start_date,
                'end_date': timezone.now(),
            },
            'overall_statistics': {
                'total_logs': total_logs,
                'successful_logs': success_logs,
                'failed_logs': failure_logs,
                'success_rate': (success_logs / total_logs * 100) if total_logs > 0 else 0,
            },
            'activity_trends': {
                'daily_activity': list(daily_activity),
                'hourly_activity': list(hourly_activity),
            },
            'user_activity': {
                'top_users': list(top_users),
                'total_unique_users': queryset.filter(user__isnull=False).values('user').distinct().count(),
            },
            'system_activity': {
                'active_models': list(active_models),
                'common_actions': list(common_actions),
                'module_distribution': list(module_dist),
            },
            'security_metrics': {
                'severity_distribution': list(severity_dist),
                'top_ip_addresses': list(top_ips),
                'recent_security_events': AuditLogSerializer(security_events, many=True).data,
                'total_compliance_events': compliance_events,
            },
            'performance_metrics': {
                'average_duration': queryset.exclude(duration=None).aggregate(
                    avg=ExpressionWrapper(
                        Avg('duration'),
                        output_field=FloatField()
                    )
                )['avg'] or 0,
                'max_duration': queryset.exclude(duration=None).aggregate(
                    max_duration=Max('duration')
                )['max_duration'] or 0,
            }
        })


class AuditLogExportView(AuditMixin, APIView):
    """
    Export audit logs to various formats.
    """
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    
    def get(self, request):
        """Export audit logs."""
        format_type = request.query_params.get('format', 'excel')  # 'excel', 'csv', 'json'
        
        # Get filtered queryset
        queryset = AuditLog.objects.all().select_related('user')
        
        # Apply filters from request
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(timestamp__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(timestamp__date__lte=end_date)
        
        action = request.query_params.get('action')
        if action:
            queryset = queryset.filter(action=action)
        
        severity = request.query_params.get('severity')
        if severity:
            queryset = queryset.filter(severity=severity)
        
        status = request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
        
        model_name = request.query_params.get('model_name')
        if model_name:
            queryset = queryset.filter(model_name=model_name)
        
        user_id = request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # Limit to 10,000 records for export
        queryset = queryset[:10000]
        
        # Prepare data
        data = []
        for log in queryset:
            data.append({
                'ID': str(log.id),
                'Timestamp': log.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                'Action': log.get_action_display(),
                'Severity': log.get_severity_display(),
                'Status': log.get_status_display(),
                'User': log.user_display,
                'User IP': log.user_ip or '',
                'Model': log.model_name or '',
                'Object ID': log.object_id or '',
                'Object': log.object_repr or '',
                'Changes': log.changes_summary,
                'Module': log.module or '',
                'Feature': log.feature or '',
                'Request Method': log.request_method or '',
                'Request Path': log.request_path or '',
                'Response Status': log.response_status or '',
                'Duration (s)': log.duration or '',
                'Error Message': log.error_message or '',
                'Compliance Event': 'Yes' if log.is_compliance_event else 'No',
                'Tags': ', '.join(log.tags) if log.tags else '',
                'Notes': log.notes or '',
            })
        
        if format_type == 'csv':
            # Export to CSV
            df = pd.DataFrame(data)
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="audit_logs_{timezone.now().strftime("%Y%m%d_%H%M%S")}.csv"'
            
            df.to_csv(response, index=False)
            return response
        
        elif format_type == 'json':
            # Export to JSON
            from django.http import JsonResponse
            return JsonResponse(data, safe=False)
        
        else:  # Excel format
            # Export to Excel
            df = pd.DataFrame(data)
            output = io.BytesIO()
            
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                df.to_excel(writer, sheet_name='Audit Logs', index=False)
                
                # Add summary sheet
                summary_data = self._create_summary_data(queryset)
                summary_df = pd.DataFrame(summary_data)
                summary_df.to_excel(writer, sheet_name='Summary', index=False)
            
            response = HttpResponse(
                output.getvalue(),
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            response['Content-Disposition'] = f'attachment; filename="audit_logs_{timezone.now().strftime("%Y%m%d_%H%M%S")}.xlsx"'
            
            return response
    
    def _create_summary_data(self, queryset):
        """Create summary data for export."""
        summary = []
        
        # Overall counts
        summary.append({'Metric': 'Total Logs', 'Value': queryset.count()})
        summary.append({'Metric': 'Successful Actions', 'Value': queryset.filter(status='SUCCESS').count()})
        summary.append({'Metric': 'Failed Actions', 'Value': queryset.filter(status='FAILURE').count()})
        summary.append({'Metric': 'Success Rate', 'Value': f"{(queryset.filter(status='SUCCESS').count() / queryset.count() * 100):.1f}%" if queryset.count() > 0 else '0%'})
        
        # Count by action
        action_counts = queryset.values('action').annotate(count=Count('id')).order_by('-count')
        for item in action_counts:
            summary.append({'Metric': f"Action: {item['action']}", 'Value': item['count']})
        
        # Count by severity
        severity_counts = queryset.values('severity').annotate(count=Count('id')).order_by('severity')
        for item in severity_counts:
            summary.append({'Metric': f"Severity: {item['severity']}", 'Value': item['count']})
        
        # Count by model
        model_counts = queryset.exclude(model_name='').values('model_name').annotate(count=Count('id')).order_by('-count')[:10]
        for item in model_counts:
            summary.append({'Metric': f"Model: {item['model_name']}", 'Value': item['count']})
        
        # Top users
        user_counts = queryset.filter(user__isnull=False).values('user__username').annotate(count=Count('id')).order_by('-count')[:10]
        for item in user_counts:
            summary.append({'Metric': f"User: {item['user__username']}", 'Value': item['count']})
        
        return summary


class UserActivityView(AuditMixin, APIView):
    """
    Get user activity details.
    """
    permission_classes = [permissions.IsAuthenticated, IsAuditor]
    
    def get(self, request, user_id):
        """Get activity for specific user."""
        days = int(request.query_params.get('days', 30))
        start_date = timezone.now() - timedelta(days=days)
        
        # Get user activity
        user_logs = AuditLog.objects.filter(
            user_id=user_id,
            timestamp__gte=start_date
        ).select_related('user').order_by('-timestamp')
        
        # Get statistics
        total_actions = user_logs.count()
        successful_actions = user_logs.filter(status='SUCCESS').count()
        failed_actions = user_logs.filter(status='FAILURE').count()
        
        # Most common actions
        common_actions = user_logs.values('action').annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        
        # Most accessed models
        common_models = user_logs.exclude(model_name='').values('model_name').annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        
        # Daily activity pattern
        daily_pattern = user_logs.annotate(
            hour=TruncHour('timestamp')
        ).values('hour').annotate(
            count=Count('id')
        ).order_by('hour')
        
        # Recent activity
        recent_activity = user_logs[:50]
        
        return Response({
            'user_id': user_id,
            'time_period': {
                'days': days,
                'start_date': start_date,
                'end_date': timezone.now(),
            },
            'statistics': {
                'total_actions': total_actions,
                'successful_actions': successful_actions,
                'failed_actions': failed_actions,
                'success_rate': (successful_actions / total_actions * 100) if total_actions > 0 else 0,
            },
            'patterns': {
                'common_actions': list(common_actions),
                'common_models': list(common_models),
                'daily_pattern': list(daily_pattern),
            },
            'recent_activity': AuditLogSerializer(recent_activity, many=True).data,
        })


class SecurityEventsView(AuditMixin, generics.ListAPIView):
    """
    List security-related events.
    """
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    pagination_class = AuditLogPagination
    
    def get_queryset(self):
        """Get security events (high severity failures)."""
        days = int(self.request.query_params.get('days', 30))
        start_date = timezone.now() - timedelta(days=days)
        
        return AuditLog.objects.filter(
            timestamp__gte=start_date,
            severity__in=['HIGH', 'CRITICAL'],
            status='FAILURE'
        ).select_related('user').order_by('-timestamp')


class ComplianceEventsView(AuditMixin, generics.ListAPIView):
    """
    List compliance-related events.
    """
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    pagination_class = AuditLogPagination
    
    def get_queryset(self):
        """Get compliance events."""
        days = int(self.request.query_params.get('days', 90))
        start_date = timezone.now() - timedelta(days=days)
        
        return AuditLog.objects.filter(
            timestamp__gte=start_date,
            is_compliance_event=True
        ).select_related('user').order_by('-timestamp')