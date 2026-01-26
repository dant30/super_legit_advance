# backend/apps/reports/urls.py
from django.urls import path
from .views import (
    ReportListView,
    ReportGenerateView,
    LoansReportView,
    PaymentsReportView,
    CustomersReportView,
    PerformanceReportView,
    DailySummaryReportView,
    MonthlySummaryReportView,
    AuditReportView,
    CollectionReportView,
    RiskAssessmentReportView,
    ReportDownloadView,
    ReportScheduleView,
    ReportHistoryView,
    ExportToPDFView,
    ExportToExcelView,
)

app_name = 'reports'

urlpatterns = [
    # Report listing and generation
    path('', ReportListView.as_view(), name='report-list'),
    path('generate/', ReportGenerateView.as_view(), name='report-generate'),
    
    # Specialized report endpoints
    path('loans/', LoansReportView.as_view(), name='loans-report'),
    path('payments/', PaymentsReportView.as_view(), name='payments-report'),
    path('customers/', CustomersReportView.as_view(), name='customers-report'),
    path('performance/', PerformanceReportView.as_view(), name='performance-report'),
    path('daily-summary/', DailySummaryReportView.as_view(), name='daily-summary'),
    path('monthly-summary/', MonthlySummaryReportView.as_view(), name='monthly-summary'),
    path('audit/', AuditReportView.as_view(), name='audit-report'),
    path('collection/', CollectionReportView.as_view(), name='collection-report'),
    path('risk-assessment/', RiskAssessmentReportView.as_view(), name='risk-assessment'),
    
    # Export endpoints
    path('export/pdf/', ExportToPDFView.as_view(), name='export-pdf'),
    path('export/excel/', ExportToExcelView.as_view(), name='export-excel'),
    
    # Report management
    path('history/', ReportHistoryView.as_view(), name='report-history'),
    path('schedule/', ReportScheduleView.as_view(), name='report-schedule'),
    path('download/<int:report_id>/', ReportDownloadView.as_view(), name='report-download'),
]