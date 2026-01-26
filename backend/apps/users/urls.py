# backend/apps/users/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    LoginView,
    LogoutView,
    RefreshTokenView,
    UserViewSet,
    StaffProfileViewSet,
)

app_name = 'users'

# ---------------------------------------------------------------------
# API Routers (Protected Resources)
# ---------------------------------------------------------------------
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'staff-profiles', StaffProfileViewSet, basename='staff-profile')

# ---------------------------------------------------------------------
# Public Authentication Endpoints (No Auth Required)
# ---------------------------------------------------------------------
auth_urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),

    path(
        'password-reset/',
        UserViewSet.as_view({'post': 'request_password_reset'}),
        name='password-reset',
    ),
    path(
        'password-reset-confirm/',
        UserViewSet.as_view({'post': 'reset_password_confirm'}),
        name='password-reset-confirm',
    ),
    path(
        'verify-email/',
        UserViewSet.as_view({'post': 'verify_email'}),
        name='verify-email',
    ),
    path(
        'resend-verification/',
        UserViewSet.as_view({'post': 'resend_verification'}),
        name='resend-verification',
    ),
]

# ---------------------------------------------------------------------
# Root URL Configuration
# ---------------------------------------------------------------------
urlpatterns = [
    # Public auth endpoints
    path('auth/', include(auth_urlpatterns)),

    # Protected API resources
    path('', include(router.urls)),
]
