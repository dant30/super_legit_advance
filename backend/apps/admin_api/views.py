# backend/apps/admin_api/views.py
from django.contrib.auth.models import Group, Permission
from rest_framework import serializers, viewsets, permissions as drf_permissions
from apps.core.utils.permissions import IsAdmin


class RoleSerializer(serializers.ModelSerializer):
    """Serializer for Django Groups (acting as Roles)."""
    id = serializers.IntegerField(source='pk', read_only=True)
    code = serializers.CharField(source='name', read_only=True)
    permissions = serializers.SerializerMethodField()
    user_count = serializers.SerializerMethodField()
    permission_count = serializers.SerializerMethodField()
    description = serializers.CharField(source='name', read_only=True)
    is_active = serializers.SerializerMethodField()
    created_at = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = ('id', 'code', 'name', 'description', 'permissions', 'permission_count', 'user_count', 'is_active', 'created_at')

    def get_permissions(self, obj):
        """Return list of permissions for the role."""
        perms = obj.permissions.all()
        return [{'id': p.pk, 'codename': p.codename, 'name': p.name} for p in perms]

    def get_permission_count(self, obj):
        """Return count of permissions."""
        return obj.permissions.count()

    def get_user_count(self, obj):
        """Return count of users with this role."""
        return obj.user_set.count()

    def get_is_active(self, obj):
        """All groups are considered active."""
        return True

    def get_created_at(self, obj):
        """Return created date (groups don't have created_at by default, return None)."""
        return None


class PermissionSerializer(serializers.ModelSerializer):
    """Serializer for Django Permissions."""
    class Meta:
        model = Permission
        fields = ('id', 'codename', 'name', 'content_type')


class RoleViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only Role API backed by django.contrib.auth.models.Group.
    
    GET /api/admin/roles/ - List all roles
    GET /api/admin/roles/{id}/ - Get a specific role
    
    Note: For full CRUD, create a custom Role model and update this ViewSet.
    """
    queryset = Group.objects.all().prefetch_related('permissions', 'user_set').order_by('name')
    serializer_class = RoleSerializer
    permission_classes = [drf_permissions.IsAuthenticated, IsAdmin]


class PermissionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only Permission API for listing available permissions.
    
    GET /api/admin/permissions/ - List all permissions
    GET /api/admin/permissions/{id}/ - Get a specific permission
    """
    queryset = Permission.objects.all().select_related('content_type').order_by('name')
    serializer_class = PermissionSerializer
    permission_classes = [drf_permissions.IsAuthenticated, IsAdmin]
