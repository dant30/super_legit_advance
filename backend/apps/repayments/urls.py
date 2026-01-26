# backend/apps/repayments/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RepaymentListView,
    RepaymentDetailView,
    RepaymentCreateView,
    RepaymentProcessView,
    RepaymentWaiverView,
    RepaymentCancelView,
    RepaymentSearchView,
    RepaymentStatsView,
    ScheduleListView,
    ScheduleGenerateView,
    ScheduleAdjustView,
    PenaltyListView,
    PenaltyDetailView,
    PenaltyCreateView,
    PenaltyApplyView,
    PenaltyWaiverView,
    CustomerRepaymentsView,
    LoanRepaymentsView,
    OverdueRepaymentsView,
    UpcomingRepaymentsView,
    RepaymentExportView,
    RepaymentDashboardView,
    BulkRepaymentCreateView,
    RepaymentReminderView,
)

app_name = 'repayments'

urlpatterns = [
    # Repayment URLs
    path('', RepaymentListView.as_view(), name='repayment-list'),
    path('create/', RepaymentCreateView.as_view(), name='repayment-create'),
    path('bulk-create/', BulkRepaymentCreateView.as_view(), name='repayment-bulk-create'),
    path('search/', RepaymentSearchView.as_view(), name='repayment-search'),
    path('stats/', RepaymentStatsView.as_view(), name='repayment-stats'),
    path('dashboard/', RepaymentDashboardView.as_view(), name='repayment-dashboard'),
    path('export/', RepaymentExportView.as_view(), name='repayment-export'),
    path('reminders/', RepaymentReminderView.as_view(), name='repayment-reminders'),
    
    # Repayment detail URLs
    path('<int:pk>/', RepaymentDetailView.as_view(), name='repayment-detail'),
    path('<int:pk>/process/', RepaymentProcessView.as_view(), name='repayment-process'),
    path('<int:pk>/waive/', RepaymentWaiverView.as_view(), name='repayment-waive'),
    path('<int:pk>/cancel/', RepaymentCancelView.as_view(), name='repayment-cancel'),
    
    # Customer repayments
    path('customer/<int:customer_id>/', CustomerRepaymentsView.as_view(), name='customer-repayments'),
    
    # Loan repayments
    path('loan/<int:loan_id>/', LoanRepaymentsView.as_view(), name='loan-repayments'),
    path('loan/<int:loan_id>/schedule/', ScheduleListView.as_view(), name='loan-schedule'),
    path('loan/<int:loan_id>/schedule/generate/', ScheduleGenerateView.as_view(), name='schedule-generate'),
    
    # Schedule URLs
    path('schedule/<int:pk>/adjust/', ScheduleAdjustView.as_view(), name='schedule-adjust'),
    
    # Penalty URLs
    path('penalties/', PenaltyListView.as_view(), name='penalty-list'),
    path('penalties/create/', PenaltyCreateView.as_view(), name='penalty-create'),
    path('penalties/<int:pk>/', PenaltyDetailView.as_view(), name='penalty-detail'),
    path('penalties/<int:pk>/apply/', PenaltyApplyView.as_view(), name='penalty-apply'),
    path('penalties/<int:pk>/waive/', PenaltyWaiverView.as_view(), name='penalty-waive'),
    
    # Special views
    path('overdue/', OverdueRepaymentsView.as_view(), name='overdue-repayments'),
    path('upcoming/', UpcomingRepaymentsView.as_view(), name='upcoming-repayments'),
]