# backend/apps/customers/urls.py
from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    CustomerListView,
    CustomerCreateView,
    CustomerDetailView,
    CustomerSearchView,
    CustomerStatsView,
    CustomerBlacklistView,
    CustomerActivateView,
    GuarantorListView,
    GuarantorCreateView,
    GuarantorDetailView,
    GuarantorVerifyView,
    EmploymentDetailView,
    EmploymentUpdateView,
    CustomerExportView,
    CustomerImportView,
)

app_name = 'customers'

urlpatterns = [
    # ===== CUSTOMER ENDPOINTS =====
    path(
        '',
        CustomerListView.as_view(),
        name='customer-list'
    ),
    path(
        'create/',
        CustomerCreateView.as_view(),
        name='customer-create'
    ),
    path(
        'search/',
        CustomerSearchView.as_view(),
        name='customer-search'
    ),
    path(
        'stats/',
        CustomerStatsView.as_view(),
        name='customer-stats'
    ),
    path(
        'export/',
        CustomerExportView.as_view(),
        name='customer-export'
    ),
    path(
        'import/',
        CustomerImportView.as_view(),
        name='customer-import'
    ),
    
    # ===== CUSTOMER DETAIL ENDPOINTS =====
    path(
        '<int:pk>/',
        CustomerDetailView.as_view(),
        name='customer-detail'
    ),
    path(
        '<int:pk>/blacklist/',
        CustomerBlacklistView.as_view(),
        name='customer-blacklist'
    ),
    path(
        '<int:pk>/activate/',
        CustomerActivateView.as_view(),
        name='customer-activate'
    ),
    
    # ===== GUARANTOR ENDPOINTS =====
    path(
        '<int:customer_id>/guarantors/',
        GuarantorListView.as_view(),
        name='guarantor-list'
    ),
    path(
        '<int:customer_id>/guarantors/create/',
        GuarantorCreateView.as_view(),
        name='guarantor-create'
    ),
    path(
        'guarantors/<int:pk>/',
        GuarantorDetailView.as_view(),
        name='guarantor-detail'
    ),
    path(
        'guarantors/<int:pk>/verify/',
        GuarantorVerifyView.as_view(),
        name='guarantor-verify'
    ),
    
    # ===== EMPLOYMENT ENDPOINTS =====
    path(
        '<int:customer_id>/employment/',
        EmploymentDetailView.as_view(),
        name='employment-detail'
    ),
    path(
        '<int:customer_id>/employment/update/',
        EmploymentUpdateView.as_view(),
        name='employment-update'
    ),
]