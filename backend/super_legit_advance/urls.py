# backend/super_legit_advance/urls.py
"""
URL configuration for super_legit_advance project.
"""

from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

from rest_framework import permissions
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

from drf_yasg.views import get_schema_view
from drf_yasg import openapi


# ------------------------------------------------------------------------------
# API Schema / Documentation (Swagger & ReDoc)
# ------------------------------------------------------------------------------
schema_view = get_schema_view(
    openapi.Info(
        title="Super Legit Advance API",
        default_version="v1",
        description="Loan Management System API Documentation",
        terms_of_service="https://superlegitadvance.com/terms/",
        contact=openapi.Contact(email="tech@superlegitadvance.com"),
        license=openapi.License(name="Proprietary License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)


# ------------------------------------------------------------------------------
# Admin branding
# ------------------------------------------------------------------------------
admin.site.site_header = "Super Legit Advance Administration"
admin.site.site_title = "SLA Admin Portal"
admin.site.index_title = "Welcome to Super Legit Advance Admin"


# ------------------------------------------------------------------------------
# URL Patterns
# ------------------------------------------------------------------------------
urlpatterns = [
    # --------------------------------------------------------------------------
    # Admin
    # --------------------------------------------------------------------------
    path("admin/", admin.site.urls),

    # --------------------------------------------------------------------------
    # API Documentation
    # --------------------------------------------------------------------------
    path("api/docs/", schema_view.with_ui("swagger", cache_timeout=0), name="swagger-ui"),
    path("api/redoc/", schema_view.with_ui("redoc", cache_timeout=0), name="redoc"),

    # --------------------------------------------------------------------------
    # Authentication (JWT)
    # --------------------------------------------------------------------------
    path("api/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/token/verify/", TokenVerifyView.as_view(), name="token_verify"),

    # --------------------------------------------------------------------------
    # Core API endpoints
    # --------------------------------------------------------------------------
    path("api/", include("apps.core.urls")),              # includes /api/health/
    path("api/users/", include("apps.users.urls")),
    path("api/loans/", include("apps.loans.urls")),
    path("api/customers/", include("apps.customers.urls")),
    path("api/repayments/", include("apps.repayments.urls")),
    path("api/mpesa/", include("apps.mpesa.urls")),
    path("api/notifications/", include("apps.notifications.urls")),
    path("api/reports/", include("apps.reports.urls")),
    path("api/audit/", include("apps.audit.urls")),

    # --------------------------------------------------------------------------
    # DRF browsable API auth
    # --------------------------------------------------------------------------
    path("api-auth/", include("rest_framework.urls", namespace="rest_framework")),
]


# ------------------------------------------------------------------------------
# Swagger raw schema (JSON / YAML)
# ------------------------------------------------------------------------------
urlpatterns += [
    re_path(
        r"^swagger(?P<format>\.json|\.yaml)$",
        schema_view.without_ui(cache_timeout=0),
        name="schema-json",
    ),
]


# ------------------------------------------------------------------------------
# Development-only URLs
# ------------------------------------------------------------------------------
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

    # Django Debug Toolbar
    try:
        import debug_toolbar
        urlpatterns += [path("__debug__/", include(debug_toolbar.urls))]
    except ImportError:
        pass


# ------------------------------------------------------------------------------
# Error handlers
# ------------------------------------------------------------------------------
handler400 = "apps.core.views.error_400"
handler403 = "apps.core.views.error_403"
handler404 = "apps.core.views.error_404"
handler500 = "apps.core.views.error_500"


# ------------------------------------------------------------------------------
# Frontend catch-all (React / SPA)
# ------------------------------------------------------------------------------
if not settings.DEBUG:
    urlpatterns += [
        re_path(
            r"^(?!admin|api|media|static).*",
            TemplateView.as_view(template_name="index.html"),
            name="frontend-catchall",
        ),
    ]