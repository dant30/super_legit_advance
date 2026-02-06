# backend/apps/admin_api/urls.py
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import RoleViewSet, PermissionViewSet

app_name = 'admin_api'

router = DefaultRouter()
router.register(r'roles', RoleViewSet, basename='admin-role')
router.register(r'permissions', PermissionViewSet, basename='admin-permission')

urlpatterns = [
    path('', include(router.urls)),
]
