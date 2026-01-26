# backend/apps/audit/urls.py
from django.urls import path
from .views import (
    AuditLogListView,
    AuditLogDetailView,
    AuditLogSearchView,
    AuditLogStatsView,
    AuditLogExportView,
    UserActivityView,
    SecurityEventsView,
    ComplianceEventsView,
)

app_name = 'audit'

urlpatterns = [
    # Audit log listing and search
    path('', AuditLogListView.as_view(), name='audit-list'),
    path('search/', AuditLogSearchView.as_view(), name='audit-search'),
    path('stats/', AuditLogStatsView.as_view(), name='audit-stats'),
    path('export/', AuditLogExportView.as_view(), name='audit-export'),
    
    # Audit log details
    path('<uuid:id>/', AuditLogDetailView.as_view(), name='audit-detail'),
    
    # User activity
    path('user/<int:user_id>/activity/', UserActivityView.as_view(), name='user-activity'),
    
    # Specialized views
    path('security/', SecurityEventsView.as_view(), name='security-events'),
    path('compliance/', ComplianceEventsView.as_view(), name='compliance-events'),
]