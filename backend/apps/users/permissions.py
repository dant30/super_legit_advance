# backend/apps/users/permissions.py
"""
User-specific permissions (imports from core for consistency).
"""
# Import all permissions from core to maintain consistency
from apps.core.utils.permissions import (
    IsAdmin,
    IsStaff,
    IsManager,
    IsLoanOfficer,
    IsCollector,
    IsAuditor,
    IsVerifiedUser,
    IsOwnerOrStaff,
    CanApproveLoans,
    CanManageCustomers,
    CanProcessPayments,
    CanGenerateReports,
    IsAuthenticatedAndActive,
    IsAuditorOrReadOnly,
    create_role_permission,
    IsAdminOnly,
    IsAdminOrStaff,
    IsAdminStaffOrOfficer,
    IsCustomerOnly,
)

__all__ = [
    'IsAdmin', 'IsStaff', 'IsManager', 'IsLoanOfficer', 'IsCollector',
    'IsAuditor', 'IsVerifiedUser', 'IsOwnerOrStaff', 'CanApproveLoans',
    'CanManageCustomers', 'CanProcessPayments', 'CanGenerateReports',
    'IsAuthenticatedAndActive', 'IsAuditorOrReadOnly', 'create_role_permission',
    'IsAdminOnly', 'IsAdminOrStaff', 'IsAdminStaffOrOfficer', 'IsCustomerOnly',
]