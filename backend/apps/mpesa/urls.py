# backend/apps/mpesa/urls.py
from django.urls import path
from .views import (
    STKPushInitiateView,
    STKPushCallbackView,
    PaymentStatusView,
    PaymentHistoryView,
    TransactionListView,
    TransactionDetailView,
    C2BValidationView,
    C2BConfirmationView,
    B2CResultView,
    B2CTimeoutView,
    ReversalResultView,
    PaymentWebhookTestView,
    PaymentSummaryView,
    PaymentRetryView,
    PaymentReversalView,
)

app_name = 'mpesa'

urlpatterns = [
    # STK Push endpoints
    path('stk-push/initiate/', STKPushInitiateView.as_view(), name='stk-push-initiate'),
    path('stk-push/callback/', STKPushCallbackView.as_view(), name='stk-push-callback'),
    
    # Payment status and history
    path('payment/status/', PaymentStatusView.as_view(), name='payment-status'),
    path('payment/status/<str:payment_reference>/', PaymentStatusView.as_view(), name='payment-status-reference'),
    path('payment/history/', PaymentHistoryView.as_view(), name='payment-history'),
    
    # Transaction endpoints
    path('transactions/', TransactionListView.as_view(), name='transaction-list'),
    path('transactions/<str:receipt_number>/', TransactionDetailView.as_view(), name='transaction-detail'),
    
    # C2B endpoints (for PayBill)
    path('c2b/validation/', C2BValidationView.as_view(), name='c2b-validation'),
    path('c2b/confirmation/', C2BConfirmationView.as_view(), name='c2b-confirmation'),
    
    # B2C endpoints (for disbursements)
    path('b2c/result/', B2CResultView.as_view(), name='b2c-result'),
    path('b2c/timeout/', B2CTimeoutView.as_view(), name='b2c-timeout'),
    
    # Reversal endpoint
    path('reversal/result/', ReversalResultView.as_view(), name='reversal-result'),
    
    # Payment retry and reversal
    path('payment/<int:payment_id>/retry/', PaymentRetryView.as_view(), name='payment-retry'),
    path('payment/<str:receipt_number>/reverse/', PaymentReversalView.as_view(), name='payment-reversal'),
    
    # Summary and analytics
    path('summary/', PaymentSummaryView.as_view(), name='payment-summary'),
    
    # Testing endpoints (admin only)
    path('webhook/test/', PaymentWebhookTestView.as_view(), name='webhook-test'),
]