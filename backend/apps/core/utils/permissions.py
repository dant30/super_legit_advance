# backend/apps/core/utils/permissions.py
"""
Centralized permission classes for the application.
All role-based and object-level permissions defined here.
"""
from rest_framework.permissions import BasePermission, SAFE_METHODS
from django.contrib.auth.models import AnonymousUser


class IsAdmin(BasePermission):
    """Allows access only to admin users."""
    def has_permission(self, request, view):
        return (
            request.user
            and not isinstance(request.user, AnonymousUser)
            and request.user.is_authenticated
            and request.user.role == "admin"
            and request.user.is_active
        )


class IsStaff(BasePermission):
    """Allows access to admin, staff, and officer roles."""
    STAFF_ROLES = ("admin", "staff", "officer")
    
    def has_permission(self, request, view):
        return (
            request.user
            and not isinstance(request.user, AnonymousUser)
            and request.user.is_authenticated
            and request.user.role in self.STAFF_ROLES
            and request.user.is_active
        )


class IsManager(BasePermission):
    """Allows access only to admin and staff roles (managers)."""
    MANAGER_ROLES = ("admin", "staff")
    
    def has_permission(self, request, view):
        return (
            request.user
            and not isinstance(request.user, AnonymousUser)
            and request.user.is_authenticated
            and request.user.role in self.MANAGER_ROLES
            and request.user.is_active
        )


class IsLoanOfficer(BasePermission):
    """Allows access only to loan officers."""
    def has_permission(self, request, view):
        return (
            request.user
            and not isinstance(request.user, AnonymousUser)
            and request.user.is_authenticated
            and request.user.role == "officer"
            and request.user.is_active
        )


class IsCollector(BasePermission):
    """Allows access only to collectors (officers with collection permission)."""
    def has_permission(self, request, view):
        return (
            request.user
            and not isinstance(request.user, AnonymousUser)
            and request.user.is_authenticated
            and request.user.role in ["officer", "admin", "staff"]
            and request.user.is_active
        )


class IsAuditor(BasePermission):
    """Allows access only to auditors and administrators."""
    AUDITOR_ROLES = ("admin", "auditor")
    
    def has_permission(self, request, view):
        return (
            request.user
            and not isinstance(request.user, AnonymousUser)
            and request.user.is_authenticated
            and request.user.role in self.AUDITOR_ROLES
            and request.user.is_active
        )


class IsVerifiedUser(BasePermission):
    """Allows access only to verified users."""
    def has_permission(self, request, view):
        return (
            request.user
            and not isinstance(request.user, AnonymousUser)
            and request.user.is_authenticated
            and request.user.is_verified
            and request.user.is_active
        )


class IsOwnerOrStaff(BasePermission):
    """Object-level permission to only allow owners or staff to edit."""
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        
        if request.user.role in ("admin", "staff", "officer"):
            return True
        
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'created_by'):
            return obj.created_by == request.user
        elif hasattr(obj, 'customer') and hasattr(obj.customer, 'user'):
            return obj.customer.user == request.user
        
        return False


class CanApproveLoans(BasePermission):
    """Allows access only to users who can approve loans."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.role == "admin":
            return True
        
        try:
            return request.user.staff_profile.can_approve_loans
        except (AttributeError, Exception):
            return False


class CanManageCustomers(BasePermission):
    """Allows access only to users who can manage customers."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        return request.user.role in ("admin", "staff", "officer")


class CanProcessPayments(BasePermission):
    """Allows access only to users who can process payments."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.role in ("admin", "staff", "officer"):
            return True
        
        if request.user.role == "customer":
            return True
        
        return False


class CanGenerateReports(BasePermission):
    """Allows access only to users who can generate reports."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.role in ("admin", "staff"):
            return True
        
        try:
            return request.user.staff_profile.can_generate_reports
        except (AttributeError, Exception):
            return False


class IsAuthenticatedAndActive(BasePermission):
    """Allows access only to authenticated and active users."""
    def has_permission(self, request, view):
        return (
            request.user
            and not isinstance(request.user, AnonymousUser)
            and request.user.is_authenticated
            and request.user.is_active
        )


class IsAuditorOrReadOnly(BasePermission):
    """Allows auditors to view but not modify data."""
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        
        if request.user and request.user.is_authenticated:
            return request.user.role in ["admin", "auditor"]
        
        return False


def create_role_permission(allowed_roles):
    """Factory function to create role-based permission classes."""
    class RolePermission(BasePermission):
        def has_permission(self, request, view):
            return (
                request.user
                and not isinstance(request.user, AnonymousUser)
                and request.user.is_authenticated
                and request.user.role in allowed_roles
                and request.user.is_active
            )
    
    return RolePermission


# Pre-defined role permissions
IsAdminOnly = create_role_permission(['admin'])
IsAdminOrStaff = create_role_permission(['admin', 'staff'])
IsAdminStaffOrOfficer = create_role_permission(['admin', 'staff', 'officer'])
IsCustomerOnly = create_role_permission(['customer'])

__all__ = [
    'IsAdmin', 'IsStaff', 'IsManager', 'IsLoanOfficer', 'IsCollector',
    'IsAuditor', 'IsVerifiedUser', 'IsOwnerOrStaff', 'CanApproveLoans',
    'CanManageCustomers', 'CanProcessPayments', 'CanGenerateReports',
    'IsAuthenticatedAndActive', 'IsAuditorOrReadOnly', 'create_role_permission',
    'IsAdminOnly', 'IsAdminOrStaff', 'IsAdminStaffOrOfficer', 'IsCustomerOnly',
]