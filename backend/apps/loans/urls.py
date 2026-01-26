# backend/apps/loans/urls.py
from django.urls import path
from .views import (
    LoanListView,
    LoanCreateView,
    LoanDetailView,
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

app_name = 'loans'

urlpatterns = [
    # Loan URLs
    path('', LoanListView.as_view(), name='loan-list'),
    path('create/', LoanCreateView.as_view(), name='loan-create'),
    path('<int:pk>/', LoanDetailView.as_view(), name='loan-detail'),
    path('<int:pk>/approve/', LoanApproveView.as_view(), name='loan-approve'),
    path('<int:pk>/reject/', LoanRejectView.as_view(), name='loan-reject'),
    path('<int:pk>/disburse/', LoanDisburseView.as_view(), name='loan-disburse'),
    path('calculator/', LoanCalculatorView.as_view(), name='loan-calculator'),
    path('stats/', LoanStatsView.as_view(), name='loan-stats'),
    path('search/', LoanSearchView.as_view(), name='loan-search'),
    path('export/', LoanExportView.as_view(), name='loan-export'),
    
    # Loan Application URLs
    path('applications/', LoanApplicationListView.as_view(), name='application-list'),
    path('applications/create/', LoanApplicationCreateView.as_view(), name='application-create'),
    path('applications/<int:pk>/', LoanApplicationDetailView.as_view(), name='application-detail'),
    path('applications/<int:pk>/submit/', LoanApplicationSubmitView.as_view(), name='application-submit'),
    path('applications/<int:pk>/review/', LoanApplicationReviewView.as_view(), name='application-review'),
    path('applications/<int:pk>/approve/', LoanApplicationApproveView.as_view(), name='application-approve'),
    path('applications/<int:pk>/reject/', LoanApplicationRejectView.as_view(), name='application-reject'),
    
    # Collateral URLs
    path('<int:loan_id>/collateral/', CollateralListView.as_view(), name='collateral-list'),
    path('<int:loan_id>/collateral/create/', CollateralCreateView.as_view(), name='collateral-create'),
    path('collateral/<int:pk>/', CollateralDetailView.as_view(), name='collateral-detail'),
    path('collateral/<int:pk>/release/', CollateralReleaseView.as_view(), name='collateral-release'),
]

# Add filtered endpoints
urlpatterns += [
    path('applications/pending/', LoanApplicationListView.as_view(), 
         {'pending': 'true'}, name='application-pending-list'),
    path('applications/my/', LoanApplicationListView.as_view(), 
         {'my_applications': 'true'}, name='application-my-list'),
    path('loans/active/', LoanListView.as_view(), 
         {'active': 'true'}, name='loan-active-list'),
    path('loans/overdue/', LoanListView.as_view(), 
         {'overdue': 'true'}, name='loan-overdue-list'),
]