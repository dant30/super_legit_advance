# customers/views/__init__.py
"""
Views package for customer management.
"""

from .api import (
    CustomerListView,
    CustomerDetailView,  # This already handles updates
    CustomerCreateView,
    # CustomerUpdateView,  # Remove this - CustomerDetailView handles updates
    # CustomerDeleteView,  # Remove this - CustomerDetailView handles deletes
    CustomerSearchView,
    CustomerStatsView,
    CustomerBlacklistView,
    CustomerActivateView,
    GuarantorListView,
    GuarantorDetailView,
    GuarantorCreateView,
    GuarantorVerifyView,
    EmploymentDetailView,
    EmploymentUpdateView,
    CustomerExportView,
    CustomerImportView,
)

__all__ = [
    'CustomerListView',
    'CustomerDetailView',
    'CustomerCreateView',
    # 'CustomerUpdateView',  # Remove from __all__
    # 'CustomerDeleteView',  # Remove from __all__
    'CustomerSearchView',
    'CustomerStatsView',
    'CustomerBlacklistView',
    'CustomerActivateView',
    'GuarantorListView',
    'GuarantorDetailView',
    'GuarantorCreateView',
    'GuarantorVerifyView',
    'EmploymentDetailView',
    'EmploymentUpdateView',
    'CustomerExportView',
    'CustomerImportView',
]