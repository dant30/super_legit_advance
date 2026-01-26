# notifications/views/__init__.py
"""
Views package for notifications management.
"""

from .api import (
    NotificationViewSet,
    NotificationStatsView,
    NotificationBulkSendView,
    SendTestNotificationView,
    TemplateListView,
    TemplateDetailView,
    TemplateCreateView,
    TemplateUpdateView,
    TemplatePreviewView,
    TemplateDuplicateView,
    SMSLogListView,
    SMSLogDetailView,
    SMSStatsView,
)

__all__ = [
    'NotificationViewSet',
    'NotificationStatsView',
    'NotificationBulkSendView',
    'SendTestNotificationView',
    'TemplateListView',
    'TemplateDetailView',
    'TemplateCreateView',
    'TemplateUpdateView',
    'TemplatePreviewView',
    'TemplateDuplicateView',
    'SMSLogListView',
    'SMSLogDetailView',
    'SMSStatsView',
]