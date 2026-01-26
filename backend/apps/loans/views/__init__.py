# loans/views/__init__.py
"""
Views package for loans management.
"""

from .api import (
    LoanListView,
    LoanCreateView,
    LoanDetailView,  # This handles Retrieve, Update, Delete
    LoanApproveView,
    LoanRejectView,
    LoanDisburseView,
    LoanCalculatorView,
    LoanStatsView,
    LoanSearchView,
    LoanExportView,
    LoanApplicationListView,
    LoanApplicationCreateView,
    LoanApplicationDetailView,
    LoanApplicationSubmitView,
    LoanApplicationReviewView,
    LoanApplicationApproveView,
    LoanApplicationRejectView,
    CollateralListView,
    CollateralCreateView,
    CollateralDetailView,
    CollateralReleaseView,
)

__all__ = [
    'LoanListView',
    'LoanCreateView',
    'LoanDetailView',
    'LoanApproveView',
    'LoanRejectView',
    'LoanDisburseView',
    'LoanCalculatorView',
    'LoanStatsView',
    'LoanSearchView',
    'LoanExportView',
    'LoanApplicationListView',
    'LoanApplicationCreateView',
    'LoanApplicationDetailView',
    'LoanApplicationSubmitView',
    'LoanApplicationReviewView',
    'LoanApplicationApproveView',
    'LoanApplicationRejectView',
    'CollateralListView',
    'CollateralCreateView',
    'CollateralDetailView',
    'CollateralReleaseView',
]