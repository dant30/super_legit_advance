# backend/apps/notifications/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views.api import (
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

app_name = "notifications"

# ----------------------------
# Routers
# ----------------------------
router = DefaultRouter()
router.register(
    r"notifications",
    NotificationViewSet,
    basename="notification"
)

# ----------------------------
# URL Patterns
# ----------------------------
urlpatterns = [
    # ---- Notification extras (place BEFORE router include to avoid being captured as a pk) ----
    path(
        "stats/",
        NotificationStatsView.as_view(),
        name="notification-stats",
    ),
    path(
        "bulk-send/",
        NotificationBulkSendView.as_view(),
        name="notification-bulk-send",
    ),
    path(
        "test/",
        SendTestNotificationView.as_view(),
        name="notification-test",
    ),
    path(
        "templates/",
        TemplateListView.as_view(),
        name="template-list",
    ),
    path(
        "templates/create/",
        TemplateCreateView.as_view(),
        name="template-create",
    ),
    path(
        "templates/<int:pk>/",
        TemplateDetailView.as_view(),
        name="template-detail",
    ),
    path(
        "templates/<int:pk>/update/",
        TemplateUpdateView.as_view(),
        name="template-update",
    ),
    path(
        "templates/<int:pk>/preview/",
        TemplatePreviewView.as_view(),
        name="template-preview",
    ),
    path(
        "templates/<int:pk>/duplicate/",
        TemplateDuplicateView.as_view(),
        name="template-duplicate",
    ),

    # ---- SMS Logs ----
    path(
        "sms-logs/",
        SMSLogListView.as_view(),
        name="sms-log-list",
    ),
    path(
        "sms-logs/<int:pk>/",
        SMSLogDetailView.as_view(),
        name="sms-log-detail",
    ),
    path(
        "sms-logs/stats/",
        SMSStatsView.as_view(),
        name="sms-stats",
    ),

    # ---- Finally include the router (viewset) ----
    path("", include(router.urls)),
]