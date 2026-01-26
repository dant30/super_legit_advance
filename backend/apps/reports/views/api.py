# backend/apps/reports/views/api.py
import os
import json
import tempfile
from datetime import datetime, timedelta, date
from django.utils import timezone
from django.db.models import (
    Sum, Count, Avg, Q, F, ExpressionWrapper, 
    DecimalField, IntegerField, Case, When, Value
)
from django.db.models.functions import TruncMonth, TruncWeek, TruncDay
from django.http import HttpResponse, FileResponse
from django.shortcuts import get_object_or_404
from django.conf import settings
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.db.models import Max  # Add this for Max function

from apps.reports.generators.pdf_generator import PDFGenerator
from apps.reports.generators.excel_generator import ExcelGenerator
from apps.reports.utils import (
    calculate_loan_performance,
    calculate_collection_efficiency,
    calculate_portfolio_at_risk,
    generate_summary_statistics,
)
from apps.loans.models import Loan, LoanApplication
from apps.customers.models import Customer
from apps.repayments.models import Repayment
from apps.mpesa.models import MpesaPayment, MpesaTransaction
from apps.mpesa.models import MpesaPayment as Payment 
from apps.audit.models import AuditLog
from apps.users.models import User
from apps.core.utils.permissions import IsStaff, IsManager, IsAdmin
from apps.core.mixins.api_mixins import AuditMixin, PaginationMixin


class ReportListView(AuditMixin, APIView):
    """
    List available report types and templates.
    """
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    
    def get(self, request):
        """Return available report types."""
        report_types = [
            {
                'id': 'loans_summary',
                'name': 'Loans Summary Report',
                'description': 'Summary of all loans with status and amounts',
                'category': 'loans',
                'formats': ['pdf', 'excel', 'json'],
                'parameters': ['start_date', 'end_date', 'loan_status', 'loan_officer']
            },
            {
                'id': 'payments_detailed',
                'name': 'Payments Detailed Report',
                'description': 'Detailed payment transactions with breakdown',
                'category': 'payments',
                'formats': ['pdf', 'excel', 'json'],
                'parameters': ['start_date', 'end_date', 'payment_method', 'status']
            },
            {
                'id': 'customers_portfolio',
                'name': 'Customers Portfolio Report',
                'description': 'Customer portfolio with demographics and loan history',
                'category': 'customers',
                'formats': ['pdf', 'excel', 'json'],
                'parameters': ['customer_status', 'county', 'risk_level']
            },
            {
                'id': 'performance_metrics',
                'name': 'Performance Metrics Report',
                'description': 'Key performance indicators and metrics',
                'category': 'analytics',
                'formats': ['pdf', 'excel', 'json'],
                'parameters': ['period', 'metric_type']
            },
            {
                'id': 'daily_summary',
                'name': 'Daily Summary Report',
                'description': 'Daily business summary and transactions',
                'category': 'summary',
                'formats': ['pdf', 'excel'],
                'parameters': ['date']
            },
            {
                'id': 'monthly_summary',
                'name': 'Monthly Summary Report',
                'description': 'Monthly financial summary and analysis',
                'category': 'summary',
                'formats': ['pdf', 'excel'],
                'parameters': ['month', 'year']
            },
            {
                'id': 'audit_trail',
                'name': 'Audit Trail Report',
                'description': 'System activity and audit logs',
                'category': 'audit',
                'formats': ['pdf', 'excel', 'json'],
                'parameters': ['start_date', 'end_date', 'user', 'action_type']
            },
            {
                'id': 'collection_report',
                'name': 'Collection Report',
                'description': 'Collection performance and overdue analysis',
                'category': 'collections',
                'formats': ['pdf', 'excel'],
                'parameters': ['start_date', 'end_date', 'officer']
            },
            {
                'id': 'risk_assessment',
                'name': 'Risk Assessment Report',
                'description': 'Portfolio risk analysis and assessment',
                'category': 'risk',
                'formats': ['pdf', 'excel'],
                'parameters': ['risk_level', 'assessment_date']
            },
        ]
        
        return Response(report_types)


class ReportGenerateView(AuditMixin, APIView):
    """
    Generate reports with parameters.
    """
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    
    @swagger_auto_schema(
        operation_description="Generate a report",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'report_type': openapi.Schema(type=openapi.TYPE_STRING, description='Type of report to generate'),
                'format': openapi.Schema(type=openapi.TYPE_STRING, description='Output format (pdf, excel, json)'),
                'parameters': openapi.Schema(type=openapi.TYPE_OBJECT, description='Report parameters'),
            },
            required=['report_type', 'format']
        )
    )
    
    def post(self, request):
        """Generate report based on parameters."""
        report_type = request.data.get('report_type')
        format_type = request.data.get('format', 'json')
        parameters = request.data.get('parameters', {})
        
        if not report_type:
            return Response(
                {'error': 'Report type is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate format
        valid_formats = ['pdf', 'excel', 'json']
        if format_type not in valid_formats:
            return Response(
                {'error': f'Invalid format. Must be one of: {", ".join(valid_formats)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Generate report based on type
            if report_type == 'loans_summary':
                report_data = self._generate_loans_summary(parameters)
                report_name = 'Loans_Summary_Report'
            elif report_type == 'payments_detailed':
                report_data = self._generate_payments_report(parameters)
                report_name = 'Payments_Detailed_Report'
            elif report_type == 'customers_portfolio':
                report_data = self._generate_customers_report(parameters)
                report_name = 'Customers_Portfolio_Report'
            elif report_type == 'performance_metrics':
                report_data = self._generate_performance_report(parameters)
                report_name = 'Performance_Metrics_Report'
            elif report_type == 'daily_summary':
                report_data = self._generate_daily_summary(parameters)
                report_name = 'Daily_Summary_Report'
            elif report_type == 'monthly_summary':
                report_data = self._generate_monthly_summary(parameters)
                report_name = 'Monthly_Summary_Report'
            elif report_type == 'audit_trail':
                report_data = self._generate_audit_report(parameters)
                report_name = 'Audit_Trail_Report'
            elif report_type == 'collection_report':
                report_data = self._generate_collection_report(parameters)
                report_name = 'Collection_Report'
            elif report_type == 'risk_assessment':
                report_data = self._generate_risk_assessment(parameters)
                report_name = 'Risk_Assessment_Report'
            else:
                return Response(
                    {'error': 'Invalid report type.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Add metadata
            report_data['metadata'] = {
                'generated_at': timezone.now().isoformat(),
                'generated_by': request.user.get_full_name(),
                'report_type': report_type,
                'parameters': parameters,
            }
            
            # Return in requested format
            if format_type == 'json':
                return Response(report_data)
            
            elif format_type == 'pdf':
                # Generate PDF
                pdf_generator = PDFGenerator()
                pdf_content = pdf_generator.generate_report(report_name, report_data)
                
                response = HttpResponse(pdf_content, content_type='application/pdf')
                response['Content-Disposition'] = f'attachment; filename="{report_name}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pdf"'
                
                # Log generation
                self.audit_log(
                    action='GENERATE',
                    model_name='Report',
                    user=request.user,
                    changes=f"Generated PDF report: {report_name}"
                )
                
                return response
            
            elif format_type == 'excel':
                # Generate Excel
                excel_generator = ExcelGenerator()
                excel_file = excel_generator.generate_report(report_name, report_data)
                
                response = HttpResponse(
                    excel_file,
                    content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                )
                response['Content-Disposition'] = f'attachment; filename="{report_name}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx"'
                
                # Log generation
                self.audit_log(
                    action='GENERATE',
                    model_name='Report',
                    user=request.user,
                    changes=f"Generated Excel report: {report_name}"
                )
                
                return response
        
        except Exception as e:
            return Response(
                {'error': f'Failed to generate report: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _generate_loans_summary(self, parameters):
        """Generate loans summary report."""
        # Get parameters
        start_date = parameters.get('start_date')
        end_date = parameters.get('end_date')
        loan_status = parameters.get('loan_status')
        loan_officer = parameters.get('loan_officer')
        
        # Build query
        loans = Loan.objects.all().select_related(
            'customer', 'loan_officer', 'application'
        )
        
        if start_date:
            loans = loans.filter(created_at__date__gte=start_date)
        if end_date:
            loans = loans.filter(created_at__date__lte=end_date)
        if loan_status:
            loans = loans.filter(status=loan_status)
        if loan_officer:
            loans = loans.filter(loan_officer_id=loan_officer)
        
        # Calculate statistics
        total_loans = loans.count()
        total_amount = loans.aggregate(total=Sum('amount_approved'))['total'] or 0
        total_disbursed = loans.filter(status='ACTIVE').aggregate(total=Sum('amount_disbursed'))['total'] or 0
        total_outstanding = loans.filter(status='ACTIVE').aggregate(total=Sum('outstanding_balance'))['total'] or 0
        
        # Status distribution
        status_distribution = loans.values('status').annotate(
            count=Count('id'),
            amount=Sum('amount_approved')
        ).order_by('status')
        
        # Officer performance
        officer_performance = loans.values(
            'loan_officer__first_name',
            'loan_officer__last_name'
        ).annotate(
            count=Count('id'),
            total_amount=Sum('amount_approved'),
            avg_amount=Avg('amount_approved')
        ).order_by('-total_amount')
        
        # Product type distribution
        product_distribution = loans.values('loan_product__name').annotate(
            count=Count('id'),
            amount=Sum('amount_approved')
        ).order_by('-amount')
        
        # Prepare data
        report_data = {
            'title': 'Loans Summary Report',
            'period': f"{start_date or 'Beginning'} to {end_date or 'Now'}",
            'summary': {
                'total_loans': total_loans,
                'total_amount': float(total_amount),
                'total_disbursed': float(total_disbursed),
                'total_outstanding': float(total_outstanding),
                'average_loan_amount': float(total_amount / total_loans) if total_loans > 0 else 0,
            },
            'status_distribution': list(status_distribution),
            'officer_performance': list(officer_performance),
            'product_distribution': list(product_distribution),
            'loans': list(loans.values(
                'loan_number',
                'customer__first_name',
                'customer__last_name',
                'loan_product__name',
                'amount_approved',
                'amount_disbursed',
                'outstanding_balance',
                'status',
                'disbursement_date',
                'created_at',
            )[:100])  # Limit to 100 records for preview
        }
        
        return report_data
    
    def _generate_payments_report(self, parameters):
        """Generate payments detailed report."""
        # Get parameters
        start_date = parameters.get('start_date')
        end_date = parameters.get('end_date')
        payment_method = parameters.get('payment_method')
        payment_status = parameters.get('status')
        
        # Build query
        payments = MpesaPayment.objects.all().select_related(
            'loan', 'loan__customer', 'transaction'
        )
        
        if start_date:
            payments = payments.filter(payment_date__gte=start_date)
        if end_date:
            payments = payments.filter(payment_date__lte=end_date)
        if payment_method:
            payments = payments.filter(payment_method=payment_method)
        if payment_status:
            payments = payments.filter(status=payment_status)
        
        # Calculate statistics
        total_payments = payments.count()
        total_amount = payments.aggregate(total=Sum('amount'))['total'] or 0
        successful_payments = payments.filter(status='COMPLETED').count()
        failed_payments = payments.filter(status='FAILED').count()
        
        # Daily trend
        daily_trend = payments.filter(
            payment_date__gte=timezone.now() - timedelta(days=30)
        ).values('payment_date').annotate(
            count=Count('id'),
            amount=Sum('amount')
        ).order_by('payment_date')
        
        # Method distribution
        method_distribution = payments.values('payment_method').annotate(
            count=Count('id'),
            amount=Sum('amount')
        ).order_by('-amount')
        
        # Customer payments
        customer_payments = payments.values(
            'loan__customer__first_name',
            'loan__customer__last_name',
            'loan__customer__customer_number'
        ).annotate(
            count=Count('id'),
            total_paid=Sum('amount')
        ).order_by('-total_paid')[:20]
        
        # Prepare data
        report_data = {
            'title': 'Payments Detailed Report',
            'period': f"{start_date or 'Beginning'} to {end_date or 'Now'}",
            'summary': {
                'total_payments': total_payments,
                'total_amount': float(total_amount),
                'successful_payments': successful_payments,
                'failed_payments': failed_payments,
                'success_rate': (successful_payments / total_payments * 100) if total_payments > 0 else 0,
            },
            'daily_trend': list(daily_trend),
            'method_distribution': list(method_distribution),
            'top_customers': list(customer_payments),
            'payments': list(payments.values(
                'payment_reference',
                'loan__loan_number',
                'loan__customer__first_name',
                'loan__customer__last_name',
                'amount',
                'payment_method',
                'status',
                'payment_date',
                'created_at',
            )[:100])
        }
        
        return report_data
    
    def _generate_customers_report(self, parameters):
        """Generate customers portfolio report."""
        # Get parameters
        customer_status = parameters.get('customer_status')
        county = parameters.get('county')
        risk_level = parameters.get('risk_level')
        
        # Build query
        customers = Customer.objects.all().select_related('employment')
        
        if customer_status:
            customers = customers.filter(status=customer_status)
        if county:
            customers = customers.filter(county=county)
        if risk_level:
            customers = customers.filter(risk_level=risk_level)
        
        # Calculate statistics
        total_customers = customers.count()
        active_customers = customers.filter(status='ACTIVE').count()
        blacklisted_customers = customers.filter(status='BLACKLISTED').count()
        
        # Demographics
        gender_distribution = customers.values('gender').annotate(
            count=Count('id')
        ).order_by('gender')
        
        county_distribution = customers.values('county').annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        
        age_groups = customers.annotate(
            age_group=Case(
                When(age__lt=25, then=Value('Under 25')),
                When(age__gte=25, age__lt=35, then=Value('25-34')),
                When(age__gte=35, age__lt=45, then=Value('35-44')),
                When(age__gte=45, age__lt=55, then=Value('45-54')),
                default=Value('55+')
            )
        ).values('age_group').annotate(
            count=Count('id')
        ).order_by('age_group')
        
        # Loan performance by customer
        customer_loan_stats = customers.annotate(
            total_loans=Count('loans'),
            total_borrowed=Sum('loans__amount_approved'),
            total_outstanding=Sum('loans__outstanding_balance', filter=Q(loans__status__in=['ACTIVE', 'APPROVED'])),
            total_repaid=Sum('loans__total_repaid')
        ).filter(total_loans__gt=0).order_by('-total_borrowed')[:20]
        
        # Prepare data
        report_data = {
            'title': 'Customers Portfolio Report',
            'summary': {
                'total_customers': total_customers,
                'active_customers': active_customers,
                'blacklisted_customers': blacklisted_customers,
                'customers_with_loans': customers.filter(loans__isnull=False).distinct().count(),
            },
            'demographics': {
                'gender_distribution': list(gender_distribution),
                'county_distribution': list(county_distribution),
                'age_groups': list(age_groups),
            },
            'risk_distribution': list(customers.values('risk_level').annotate(
                count=Count('id')
            ).order_by('risk_level')),
            'top_borrowers': list(customer_loan_stats.values(
                'customer_number',
                'first_name',
                'last_name',
                'total_loans',
                'total_borrowed',
                'total_outstanding',
                'total_repaid',
                'risk_level',
            )),
            'customers': list(customers.values(
                'customer_number',
                'first_name',
                'last_name',
                'phone_number',
                'email',
                'county',
                'status',
                'risk_level',
                'credit_score',
                'registration_date',
            )[:100])
        }
        
        return report_data
    
    def _generate_performance_report(self, parameters):
        """Generate performance metrics report."""
        period = parameters.get('period', 'monthly')  # daily, weekly, monthly, quarterly, yearly
        metric_type = parameters.get('metric_type', 'all')  # loans, payments, collections, risk
        
        # Date ranges
        end_date = timezone.now()
        if period == 'daily':
            start_date = end_date - timedelta(days=1)
            trunc_func = TruncDay
        elif period == 'weekly':
            start_date = end_date - timedelta(weeks=1)
            trunc_func = TruncWeek
        elif period == 'monthly':
            start_date = end_date - timedelta(days=30)
            trunc_func = TruncMonth
        elif period == 'quarterly':
            start_date = end_date - timedelta(days=90)
            trunc_func = TruncMonth
        elif period == 'yearly':
            start_date = end_date - timedelta(days=365)
            trunc_func = TruncMonth
        else:
            start_date = end_date - timedelta(days=30)
            trunc_func = TruncDay
        
        # Loan Metrics
        loan_metrics = Loan.objects.filter(
            created_at__gte=start_date,
            created_at__lte=end_date
        ).annotate(
            period=trunc_func('created_at')
        ).values('period').annotate(
            loans_approved=Count('id', filter=Q(status__in=['APPROVED', 'ACTIVE'])),
            loans_disbursed=Count('id', filter=Q(status='ACTIVE')),
            total_approved=Sum('amount_approved', filter=Q(status__in=['APPROVED', 'ACTIVE'])),
            total_disbursed=Sum('amount_disbursed', filter=Q(status='ACTIVE')),
            avg_loan_size=Avg('amount_approved', filter=Q(status__in=['APPROVED', 'ACTIVE'])),
        ).order_by('period')
        
        # Payment Metrics
        payment_metrics = Payment.objects.filter(
            payment_date__gte=start_date,
            payment_date__lte=end_date,
            status='COMPLETED'
        ).annotate(
            period=trunc_func('payment_date')
        ).values('period').annotate(
            total_payments=Count('id'),
            total_collected=Sum('amount'),
            avg_payment=Avg('amount'),
        ).order_by('period')
        
        # Collection Metrics
        collection_metrics = Loan.objects.filter(
            created_at__gte=start_date,
            created_at__lte=end_date
        ).annotate(
            period=trunc_func('created_at')
        ).values('period').annotate(
            portfolio_at_risk=Sum(
                Case(
                    When(
                        status='OVERDUE',
                        then=F('outstanding_balance')
                    ),
                    default=Value(0),
                    output_field=DecimalField(max_digits=12, decimal_places=2)
                )
            ),
            collection_rate=Avg(
                Case(
                    When(
                        total_repaid__gt=0,
                        then=F('total_repaid') * 100 / F('amount_approved')
                    ),
                    default=Value(0),
                    output_field=DecimalField(max_digits=5, decimal_places=2)
                )
            ),
        ).order_by('period')
        
        # Risk Metrics
        risk_metrics = Customer.objects.filter(
            registration_date__gte=start_date,
            registration_date__lte=end_date
        ).annotate(
            period=trunc_func('registration_date')
        ).values('period').annotate(
            total_customers=Count('id'),
            high_risk_customers=Count('id', filter=Q(risk_level='HIGH')),
            avg_credit_score=Avg('credit_score'),
        ).order_by('period')
        
        # Key Performance Indicators
        kpis = {
            'loan_approval_rate': self._calculate_approval_rate(start_date, end_date),
            'loan_disbursement_rate': self._calculate_disbursement_rate(start_date, end_date),
            'collection_efficiency': calculate_collection_efficiency(start_date, end_date),
            'portfolio_at_risk': calculate_portfolio_at_risk(),
            'customer_satisfaction': self._estimate_customer_satisfaction(),
            'operational_efficiency': self._calculate_operational_efficiency(start_date, end_date),
        }
        
        # Prepare data
        report_data = {
            'title': 'Performance Metrics Report',
            'period': period.capitalize(),
            'date_range': {
                'start': start_date.date(),
                'end': end_date.date(),
            },
            'loan_metrics': list(loan_metrics),
            'payment_metrics': list(payment_metrics),
            'collection_metrics': list(collection_metrics),
            'risk_metrics': list(risk_metrics),
            'key_performance_indicators': kpis,
            'trends': self._calculate_trends(start_date, end_date),
        }
        
        return report_data
    
    def _generate_daily_summary(self, parameters):
        """Generate daily summary report."""
        report_date = parameters.get('date', timezone.now().date())
        
        # Convert to datetime for queries
        start_datetime = timezone.make_aware(datetime.combine(report_date, datetime.min.time()))
        end_datetime = timezone.make_aware(datetime.combine(report_date, datetime.max.time()))
        
        # Loans for the day
        daily_loans = Loan.objects.filter(
            created_at__gte=start_datetime,
            created_at__lte=end_datetime
        ).select_related('customer', 'loan_officer')
        
        # Payments for the day
        daily_payments = Payment.objects.filter(
            payment_date=report_date
        ).select_related('loan', 'loan__customer')
        
        # New customers for the day
        new_customers = Customer.objects.filter(
            registration_date__date=report_date
        )
        
        # Calculate totals
        loans_approved = daily_loans.filter(status__in=['APPROVED', 'ACTIVE']).count()
        loans_disbursed = daily_loans.filter(status='ACTIVE').count()
        total_approved = daily_loans.filter(status__in=['APPROVED', 'ACTIVE']).aggregate(
            total=Sum('amount_approved')
        )['total'] or 0
        
        total_disbursed = daily_loans.filter(status='ACTIVE').aggregate(
            total=Sum('amount_disbursed')
        )['total'] or 0
        
        total_collections = daily_payments.filter(status='COMPLETED').aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        total_new_customers = new_customers.count()
        
        # Top transactions
        top_loans = daily_loans.filter(status__in=['APPROVED', 'ACTIVE']).order_by('-amount_approved')[:5]
        top_payments = daily_payments.filter(status='COMPLETED').order_by('-amount')[:5]
        
        # Prepare data
        report_data = {
            'title': 'Daily Summary Report',
            'date': report_date.isoformat(),
            'summary': {
                'loans_approved': loans_approved,
                'loans_disbursed': loans_disbursed,
                'total_approved': float(total_approved),
                'total_disbursed': float(total_disbursed),
                'total_collections': float(total_collections),
                'new_customers': total_new_customers,
                'active_loans': Loan.objects.filter(status='ACTIVE').count(),
                'overdue_loans': Loan.objects.filter(status='OVERDUE').count(),
            },
            'top_loans': list(top_loans.values(
                'loan_number',
                'customer__first_name',
                'customer__last_name',
                'amount_approved',
                'status',
                'created_at',
            )),
            'top_payments': list(top_payments.values(
                'payment_reference',
                'loan__loan_number',
                'loan__customer__first_name',
                'loan__customer__last_name',
                'amount',
                'payment_method',
                'payment_date',
            )),
            'new_customers': list(new_customers.values(
                'customer_number',
                'first_name',
                'last_name',
                'phone_number',
                'county',
                'registration_date',
            )),
            'staff_performance': self._get_daily_staff_performance(report_date),
        }
        
        return report_data
    
    def _generate_monthly_summary(self, parameters):
        """Generate monthly summary report."""
        month = parameters.get('month', timezone.now().month)
        year = parameters.get('year', timezone.now().year)
        
        # Date range for the month
        start_date = date(year, month, 1)
        if month == 12:
            end_date = date(year + 1, 1, 1) - timedelta(days=1)
        else:
            end_date = date(year, month + 1, 1) - timedelta(days=1)
        
        # Monthly loans
        monthly_loans = Loan.objects.filter(
            created_at__date__gte=start_date,
            created_at__date__lte=end_date
        )
        
        # Monthly payments
        monthly_payments = Payment.objects.filter(
            payment_date__gte=start_date,
            payment_date__lte=end_date
        )
        
        # Monthly customers
        monthly_customers = Customer.objects.filter(
            registration_date__gte=start_date,
            registration_date__lte=end_date
        )
        
        # Calculate totals
        loans_approved = monthly_loans.filter(status__in=['APPROVED', 'ACTIVE']).count()
        loans_disbursed = monthly_loans.filter(status='ACTIVE').count()
        total_approved = monthly_loans.filter(status__in=['APPROVED', 'ACTIVE']).aggregate(
            total=Sum('amount_approved')
        )['total'] or 0
        
        total_disbursed = monthly_loans.filter(status='ACTIVE').aggregate(
            total=Sum('amount_disbursed')
        )['total'] or 0
        
        total_collections = monthly_payments.filter(status='COMPLETED').aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        total_new_customers = monthly_customers.count()
        
        # Monthly trends
        daily_trend = Loan.objects.filter(
            created_at__date__gte=start_date,
            created_at__date__lte=end_date,
            status__in=['APPROVED', 'ACTIVE']
        ).values('created_at__date').annotate(
            count=Count('id'),
            amount=Sum('amount_approved')
        ).order_by('created_at__date')
        
        # Product performance
        product_performance = monthly_loans.values('loan_product__name').annotate(
            count=Count('id'),
            amount=Sum('amount_approved'),
            avg_amount=Avg('amount_approved')
        ).order_by('-amount')
        
        # Officer performance
        officer_performance = monthly_loans.values(
            'loan_officer__first_name',
            'loan_officer__last_name'
        ).annotate(
            count=Count('id'),
            amount=Sum('amount_approved'),
            avg_amount=Avg('amount_approved')
        ).order_by('-amount')
        
        # Prepare data
        report_data = {
            'title': 'Monthly Summary Report',
            'month': start_date.strftime('%B %Y'),
            'date_range': {
                'start': start_date.isoformat(),
                'end': end_date.isoformat(),
            },
            'summary': {
                'loans_approved': loans_approved,
                'loans_disbursed': loans_disbursed,
                'total_approved': float(total_approved),
                'total_disbursed': float(total_disbursed),
                'total_collections': float(total_collections),
                'new_customers': total_new_customers,
                'active_portfolio': Loan.objects.filter(status='ACTIVE').count(),
                'portfolio_value': Loan.objects.filter(status='ACTIVE').aggregate(
                    total=Sum('outstanding_balance')
                )['total'] or 0,
                'collection_rate': (total_collections / total_approved * 100) if total_approved > 0 else 0,
            },
            'daily_trend': list(daily_trend),
            'product_performance': list(product_performance),
            'officer_performance': list(officer_performance),
            'customer_acquisition': list(monthly_customers.values('county').annotate(
                count=Count('id')
            ).order_by('-count')),
            'financial_metrics': self._calculate_financial_metrics(start_date, end_date),
        }
        
        return report_data
    
    def _generate_audit_report(self, parameters):
        """Generate audit trail report."""
        start_date = parameters.get('start_date')
        end_date = parameters.get('end_date')
        user_id = parameters.get('user')
        action_type = parameters.get('action_type')
        
        # Build query
        audit_logs = AuditLog.objects.all().select_related('user')
        
        if start_date:
            audit_logs = audit_logs.filter(timestamp__date__gte=start_date)
        if end_date:
            audit_logs = audit_logs.filter(timestamp__date__lte=end_date)
        if user_id:
            audit_logs = audit_logs.filter(user_id=user_id)
        if action_type:
            audit_logs = audit_logs.filter(action=action_type)
        
        # Summary statistics
        total_actions = audit_logs.count()
        unique_users = audit_logs.values('user').distinct().count()
        
        # Action distribution
        action_distribution = audit_logs.values('action').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # User activity
        user_activity = audit_logs.values(
            'user__first_name',
            'user__last_name',
            'user__username'
        ).annotate(
            count=Count('id'),
            last_activity=Max('timestamp')
        ).order_by('-count')[:10]
        
        # Module activity
        module_activity = audit_logs.values('model_name').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Prepare data
        report_data = {
            'title': 'Audit Trail Report',
            'period': f"{start_date or 'Beginning'} to {end_date or 'Now'}",
            'summary': {
                'total_actions': total_actions,
                'unique_users': unique_users,
                'time_period': f"{start_date or 'N/A'} to {end_date or 'N/A'}",
            },
            'action_distribution': list(action_distribution),
            'user_activity': list(user_activity),
            'module_activity': list(module_activity),
            'audit_logs': list(audit_logs.values(
                'user__username',
                'user__first_name',
                'user__last_name',
                'action',
                'model_name',
                'object_id',
                'changes',
                'ip_address',
                'user_agent',
                'timestamp',
            )[:100])
        }
        
        return report_data
    
    def _generate_collection_report(self, parameters):
        """Generate collection report."""
        start_date = parameters.get('start_date')
        end_date = parameters.get('end_date')
        officer_id = parameters.get('officer')
        
        # Build query for overdue loans
        overdue_loans = Loan.objects.filter(
            status='OVERDUE'
        ).select_related('customer', 'loan_officer')
        
        if start_date:
            overdue_loans = overdue_loans.filter(due_date__gte=start_date)
        if end_date:
            overdue_loans = overdue_loans.filter(due_date__lte=end_date)
        if officer_id:
            overdue_loans = overdue_loans.filter(loan_officer_id=officer_id)
        
        # Calculate collection statistics
        total_overdue = overdue_loans.count()
        total_overdue_amount = overdue_loans.aggregate(
            total=Sum('outstanding_balance')
        )['total'] or 0
        
        # Age analysis
        age_analysis = overdue_loans.annotate(
            days_overdue=ExpressionWrapper(
                timezone.now().date() - F('due_date'),
                output_field=IntegerField()
            )
        ).annotate(
            age_group=Case(
                When(days_overdue__lt=30, then=Value('1-30 days')),
                When(days_overdue__gte=30, days_overdue__lt=60, then=Value('31-60 days')),
                When(days_overdue__gte=60, days_overdue__lt=90, then=Value('61-90 days')),
                default=Value('90+ days')
            )
        ).values('age_group').annotate(
            count=Count('id'),
            amount=Sum('outstanding_balance')
        ).order_by('age_group')
        
        # Collection officer performance
        officer_performance = overdue_loans.values(
            'loan_officer__first_name',
            'loan_officer__last_name'
        ).annotate(
            total_cases=Count('id'),
            total_amount=Sum('outstanding_balance'),
            avg_days_overdue=Avg(
                ExpressionWrapper(
                    timezone.now().date() - F('due_date'),
                    output_field=IntegerField()
                )
            )
        ).order_by('-total_cases')
        
        # Recovery analysis
        recovery_analysis = Payment.objects.filter(
            payment_date__gte=start_date or timezone.now().date() - timedelta(days=30),
            payment_date__lte=end_date or timezone.now().date(),
            status='COMPLETED',
            loan__status='OVERDUE'
        ).values('payment_date').annotate(
            count=Count('id'),
            amount=Sum('amount')
        ).order_by('payment_date')
        
        # Prepare data
        report_data = {
            'title': 'Collection Report',
            'period': f"{start_date or 'Beginning'} to {end_date or 'Now'}",
            'summary': {
                'total_overdue_loans': total_overdue,
                'total_overdue_amount': float(total_overdue_amount),
                'portfolio_at_risk_percentage': (total_overdue_amount / Loan.objects.filter(status='ACTIVE').aggregate(total=Sum('outstanding_balance'))['total'] * 100) if Loan.objects.filter(status='ACTIVE').exists() else 0,
                'average_days_overdue': overdue_loans.annotate(
                    days_overdue=ExpressionWrapper(
                        timezone.now().date() - F('due_date'),
                        output_field=IntegerField()
                    )
                ).aggregate(avg=Avg('days_overdue'))['avg'] or 0,
            },
            'age_analysis': list(age_analysis),
            'officer_performance': list(officer_performance),
            'recovery_analysis': list(recovery_analysis),
            'top_overdue_accounts': list(overdue_loans.values(
                'loan_number',
                'customer__first_name',
                'customer__last_name',
                'customer__phone_number',
                'outstanding_balance',
                'due_date',
                'loan_officer__first_name',
                'loan_officer__last_name',
            ).annotate(
                days_overdue=ExpressionWrapper(
                    timezone.now().date() - F('due_date'),
                    output_field=IntegerField()
                )
            ).order_by('-outstanding_balance')[:20]),
            'collection_strategy': self._generate_collection_strategy(overdue_loans),
        }
        
        return report_data
    
    def _generate_risk_assessment(self, parameters):
        """Generate risk assessment report."""
        risk_level = parameters.get('risk_level')
        assessment_date = parameters.get('assessment_date', timezone.now().date())
        
        # Get loans for assessment
        loans = Loan.objects.filter(status='ACTIVE').select_related(
            'customer', 'loan_product'
        )
        
        if risk_level:
            loans = loans.filter(customer__risk_level=risk_level)
        
        # Risk segmentation
        risk_segmentation = loans.values('customer__risk_level').annotate(
            count=Count('id'),
            amount=Sum('outstanding_balance'),
            avg_loan_size=Avg('outstanding_balance')
        ).order_by('customer__risk_level')
        
        # Industry risk
        industry_risk = loans.filter(
            customer__employment__isnull=False
        ).values('customer__employment__sector').annotate(
            count=Count('id'),
            amount=Sum('outstanding_balance'),
            default_rate=Avg(
                Case(
                    When(status='DEFAULTED', then=Value(100)),
                    default=Value(0),
                    output_field=DecimalField(max_digits=5, decimal_places=2)
                )
            )
        ).order_by('-amount')
        
        # Geographic risk
        geographic_risk = loans.values('customer__county').annotate(
            count=Count('id'),
            amount=Sum('outstanding_balance'),
            concentration=Count('id') * 100 / loans.count()
        ).order_by('-amount')[:10]
        
        # Product risk
        product_risk = loans.values('loan_product__name').annotate(
            count=Count('id'),
            amount=Sum('outstanding_balance'),
            avg_risk_score=Avg('customer__credit_score'),
            default_rate=Avg(
                Case(
                    When(status='DEFAULTED', then=Value(100)),
                    default=Value(0),
                    output_field=DecimalField(max_digits=5, decimal_places=2)
                )
            )
        ).order_by('-amount')
        
        # Concentration risk
        concentration_risk = {
            'top_10_customers': loans.order_by('-outstanding_balance')[:10].aggregate(
                total=Sum('outstanding_balance')
            )['total'] or 0,
            'portfolio_concentration': 0,  # Will be calculated
        }
        
        # Calculate portfolio concentration
        total_portfolio = loans.aggregate(total=Sum('outstanding_balance'))['total'] or 1
        concentration_risk['portfolio_concentration'] = (
            concentration_risk['top_10_customers'] / total_portfolio * 100
        )
        
        # Credit score distribution
        credit_distribution = loans.values(
            credit_score_range=Case(
                When(customer__credit_score__lt=500, then=Value('Poor (<500)')),
                When(customer__credit_score__gte=500, customer__credit_score__lt=650, then=Value('Fair (500-649)')),
                When(customer__credit_score__gte=650, customer__credit_score__lt=750, then=Value('Good (650-749)')),
                When(customer__credit_score__gte=750, then=Value('Excellent (750+)')),
                default=Value('Unknown'),
                output_field=IntegerField()
            )
        ).annotate(
            count=Count('id'),
            amount=Sum('outstanding_balance')
        ).order_by('credit_score_range')
        
        # Prepare data
        report_data = {
            'title': 'Risk Assessment Report',
            'assessment_date': assessment_date.isoformat(),
            'summary': {
                'total_active_loans': loans.count(),
                'total_portfolio_value': float(total_portfolio),
                'weighted_average_risk_score': loans.aggregate(
                    avg=Avg('customer__credit_score')
                )['avg'] or 0,
                'portfolio_at_risk': calculate_portfolio_at_risk(),
                'expected_loss': self._calculate_expected_loss(loans),
            },
            'risk_segmentation': list(risk_segmentation),
            'industry_risk': list(industry_risk),
            'geographic_risk': list(geographic_risk),
            'product_risk': list(product_risk),
            'concentration_risk': concentration_risk,
            'credit_distribution': list(credit_distribution),
            'risk_mitigation_recommendations': self._generate_risk_mitigation_recommendations(loans),
        }
        
        return report_data
    
    # Helper methods for calculations
    
    def _calculate_approval_rate(self, start_date, end_date):
        """Calculate loan approval rate."""
        total_applications = LoanApplication.objects.filter(
            created_at__gte=start_date,
            created_at__lte=end_date
        ).count()
        
        approved_applications = LoanApplication.objects.filter(
            created_at__gte=start_date,
            created_at__lte=end_date,
            status='APPROVED'
        ).count()
        
        if total_applications > 0:
            return (approved_applications / total_applications) * 100
        return 0
    
    def _calculate_disbursement_rate(self, start_date, end_date):
        """Calculate loan disbursement rate."""
        approved_loans = Loan.objects.filter(
            status__in=['APPROVED', 'ACTIVE'],
            created_at__gte=start_date,
            created_at__lte=end_date
        ).count()
        
        disbursed_loans = Loan.objects.filter(
            status='ACTIVE',
            created_at__gte=start_date,
            created_at__lte=end_date
        ).count()
        
        if approved_loans > 0:
            return (disbursed_loans / approved_loans) * 100
        return 0
    
    def _estimate_customer_satisfaction(self):
        """Estimate customer satisfaction based on various factors."""
        # This is a simplified estimation
        # In a real system, you would use surveys, feedback, etc.
        
        total_customers = Customer.objects.count()
        if total_customers == 0:
            return 0
        
        # Factors (simplified)
        repeat_customers = Customer.objects.filter(loans__count__gt=1).distinct().count()
        timely_payments = Repayment.objects.filter(status='COMPLETED', is_on_time=True).count()
        total_payments = Repayment.objects.filter(status='COMPLETED').count()
        
        satisfaction_score = (
            (repeat_customers / total_customers * 40) +  # 40% weight for repeat business
            (timely_payments / total_payments * 60 if total_payments > 0 else 0)  # 60% weight for timely payments
        )
        
        return min(satisfaction_score, 100)
    
    def _calculate_operational_efficiency(self, start_date, end_date):
        """Calculate operational efficiency metrics."""
        # Simplified calculation
        total_loans = Loan.objects.filter(
            created_at__gte=start_date,
            created_at__lte=end_date
        ).count()
        
        total_staff = User.objects.filter(is_staff=True).count()
        
        if total_staff > 0:
            loans_per_staff = total_loans / total_staff
        else:
            loans_per_staff = 0
        
        # This would be more complex in a real system
        return {
            'loans_per_staff': loans_per_staff,
            'processing_time_days': 2.5,  # Average from system data
            'cost_per_loan': 1500,  # Estimated operational cost
        }
    
    def _calculate_trends(self, start_date, end_date):
        """Calculate trends for various metrics."""
        # Monthly trends for the last 6 months
        six_months_ago = end_date - timedelta(days=180)
        
        # Loan trend
        loan_trend = Loan.objects.filter(
            created_at__gte=six_months_ago,
            created_at__lte=end_date
        ).annotate(
            month=TruncMonth('created_at')
        ).values('month').annotate(
            count=Count('id'),
            amount=Sum('amount_approved')
        ).order_by('month')
        
        # Payment trend
        payment_trend = Payment.objects.filter(
            payment_date__gte=six_months_ago,
            payment_date__lte=end_date,
            status='COMPLETED'
        ).annotate(
            month=TruncMonth('payment_date')
        ).values('month').annotate(
            count=Count('id'),
            amount=Sum('amount')
        ).order_by('month')
        
        # Customer trend
        customer_trend = Customer.objects.filter(
            registration_date__gte=six_months_ago,
            registration_date__lte=end_date
        ).annotate(
            month=TruncMonth('registration_date')
        ).values('month').annotate(
            count=Count('id')
        ).order_by('month')
        
        return {
            'loan_trend': list(loan_trend),
            'payment_trend': list(payment_trend),
            'customer_trend': list(customer_trend),
        }
    
    def _get_daily_staff_performance(self, report_date):
        """Get daily performance for staff."""
        staff_performance = Loan.objects.filter(
            created_at__date=report_date
        ).values(
            'loan_officer__first_name',
            'loan_officer__last_name',
            'loan_officer__username'
        ).annotate(
            loans_processed=Count('id'),
            total_approved=Sum('amount_approved'),
            avg_processing_time=Avg(
                ExpressionWrapper(
                    F('updated_at') - F('created_at'),
                    output_field=IntegerField()
                )
            )
        ).order_by('-loans_processed')
        
        return list(staff_performance)
    
    def _calculate_financial_metrics(self, start_date, end_date):
        """Calculate financial metrics."""
        # Revenue from interest
        interest_revenue = Loan.objects.filter(
            status='ACTIVE',
            created_at__date__gte=start_date,
            created_at__date__lte=end_date
        ).aggregate(
            total=Sum('total_interest')
        )['total'] or 0
        
        # Fee revenue
        fee_revenue = Loan.objects.filter(
            created_at__date__gte=start_date,
            created_at__date__lte=end_date
        ).aggregate(
            total=Sum('processing_fee')
        )['total'] or 0
        
        # Penalty revenue
        penalty_revenue = Repayment.objects.filter(
            created_at__date__gte=start_date,
            created_at__date__lte=end_date,
            penalty_amount__gt=0
        ).aggregate(
            total=Sum('penalty_amount')
        )['total'] or 0
        
        # Total revenue
        total_revenue = interest_revenue + fee_revenue + penalty_revenue
        
        # Write-offs
        write_offs = Loan.objects.filter(
            status='DEFAULTED',
            updated_at__date__gte=start_date,
            updated_at__date__lte=end_date
        ).aggregate(
            total=Sum('outstanding_balance')
        )['total'] or 0
        
        return {
            'interest_revenue': float(interest_revenue),
            'fee_revenue': float(fee_revenue),
            'penalty_revenue': float(penalty_revenue),
            'total_revenue': float(total_revenue),
            'write_offs': float(write_offs),
            'net_revenue': float(total_revenue - write_offs),
            'profit_margin': ((total_revenue - write_offs) / total_revenue * 100) if total_revenue > 0 else 0,
        }
    
    def _generate_collection_strategy(self, overdue_loans):
        """Generate collection strategy recommendations."""
        strategies = []
        
        # Analyze by days overdue
        age_groups = overdue_loans.annotate(
            days_overdue=ExpressionWrapper(
                timezone.now().date() - F('due_date'),
                output_field=IntegerField()
            )
        )
        
        # 1-30 days overdue: Gentle reminders
        early_stage = age_groups.filter(days_overdue__lt=30).count()
        if early_stage > 0:
            strategies.append({
                'segment': '1-30 days overdue',
                'count': early_stage,
                'strategy': 'Send SMS reminders and make courtesy calls',
                'priority': 'Low',
                'success_rate': '85%',
            })
        
        # 31-60 days overdue: More frequent contact
        mid_stage = age_groups.filter(days_overdue__gte=30, days_overdue__lt=60).count()
        if mid_stage > 0:
            strategies.append({
                'segment': '31-60 days overdue',
                'count': mid_stage,
                'strategy': 'Increase call frequency, send formal demand letters',
                'priority': 'Medium',
                'success_rate': '65%',
            })
        
        # 61-90 days overdue: Escalation
        late_stage = age_groups.filter(days_overdue__gte=60, days_overdue__lt=90).count()
        if late_stage > 0:
            strategies.append({
                'segment': '61-90 days overdue',
                'count': late_stage,
                'strategy': 'Engage collection agency, consider legal action',
                'priority': 'High',
                'success_rate': '40%',
            })
        
        # 90+ days overdue: Recovery focus
        recovery_stage = age_groups.filter(days_overdue__gte=90).count()
        if recovery_stage > 0:
            strategies.append({
                'segment': '90+ days overdue',
                'count': recovery_stage,
                'strategy': 'Focus on partial recovery, write-off consideration',
                'priority': 'Critical',
                'success_rate': '20%',
            })
        
        return strategies
    
    def _calculate_expected_loss(self, loans):
        """Calculate expected loss for portfolio."""
        # Simplified expected loss calculation
        # In a real system, this would use PD, LGD, EAD models
        
        total_portfolio = loans.aggregate(
            total=Sum('outstanding_balance')
        )['total'] or 0
        
        # Estimate probability of default based on risk level
        risk_factors = {
            'LOW': 0.02,    # 2% PD
            'MEDIUM': 0.05,  # 5% PD
            'HIGH': 0.15,    # 15% PD
        }
        
        expected_loss = 0
        for risk_level, pd in risk_factors.items():
            risk_portfolio = loans.filter(
                customer__risk_level=risk_level
            ).aggregate(
                total=Sum('outstanding_balance')
            )['total'] or 0
            
            # Assume 50% loss given default (LGD)
            expected_loss += risk_portfolio * pd * 0.5
        
        return {
            'expected_loss_amount': float(expected_loss),
            'expected_loss_rate': (expected_loss / total_portfolio * 100) if total_portfolio > 0 else 0,
            'confidence_interval': '95%',
        }
    
    def _generate_risk_mitigation_recommendations(self, loans):
        """Generate risk mitigation recommendations."""
        recommendations = []
        
        # Concentration risk
        top_county = loans.values('customer__county').annotate(
            count=Count('id')
        ).order_by('-count').first()
        
        if top_county and top_county['count'] > loans.count() * 0.3:  # More than 30% concentration
            recommendations.append({
                'type': 'Concentration Risk',
                'issue': f"High concentration in {top_county['customer__county']} ({top_county['count']} loans)",
                'recommendation': 'Diversify lending across different counties',
                'priority': 'High',
            })
        
        # High-risk customer concentration
        high_risk_loans = loans.filter(customer__risk_level='HIGH').count()
        if high_risk_loans > loans.count() * 0.2:  # More than 20% high-risk
            recommendations.append({
                'type': 'Credit Risk',
                'issue': f"High concentration of high-risk customers ({high_risk_loans} loans)",
                'recommendation': 'Tighten credit scoring criteria or increase collateral requirements',
                'priority': 'Medium',
            })
        
        # Large exposure loans
        large_loans = loans.filter(outstanding_balance__gt=1000000).count()  > 1,000,000
        if large_loans > 0:
            recommendations.append({
                'type': 'Exposure Risk',
                'issue': f"{large_loans} loans with exposure > 1,000,000",
                'recommendation': 'Implement exposure limits and require additional approvals',
                'priority': 'High',
            })
        
        # Industry concentration
        top_sector = loans.filter(
            customer__employment__isnull=False
        ).values('customer__employment__sector').annotate(
            count=Count('id')
        ).order_by('-count').first()
        
        if top_sector and top_sector['count'] > loans.count() * 0.4:  # More than 40% concentration
            recommendations.append({
                'type': 'Industry Risk',
                'issue': f"High concentration in {top_sector['customer__employment__sector']} sector",
                'recommendation': 'Diversify across different industries',
                'priority': 'Medium',
            })
        
        return recommendations


class LoansReportView(AuditMixin, APIView):
    """
    Specialized loans report endpoint.
    """
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    
    def get(self, request):
        """Generate loans report with filters."""
        # Get filters from query parameters
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        status = request.query_params.get('status')
        product_id = request.query_params.get('product_id')
        officer_id = request.query_params.get('officer_id')
        
        # Build query
        loans = Loan.objects.all().select_related(
            'customer', 'loan_officer', 'loan_product'
        )
        
        if start_date:
            loans = loans.filter(created_at__date__gte=start_date)
        if end_date:
            loans = loans.filter(created_at__date__lte=end_date)
        if status:
            loans = loans.filter(status=status)
        if product_id:
            loans = loans.filter(loan_product_id=product_id)
        if officer_id:
            loans = loans.filter(loan_officer_id=officer_id)
        
        # Format response
        report_data = {
            'loans': list(loans.values(
                'loan_number',
                'customer__first_name',
                'customer__last_name',
                'customer__customer_number',
                'loan_product__name',
                'amount_approved',
                'amount_disbursed',
                'outstanding_balance',
                'status',
                'disbursement_date',
                'due_date',
                'created_at',
            )),
            'summary': {
                'total_loans': loans.count(),
                'total_approved': loans.aggregate(total=Sum('amount_approved'))['total'] or 0,
                'total_outstanding': loans.filter(status='ACTIVE').aggregate(total=Sum('outstanding_balance'))['total'] or 0,
                'status_distribution': list(loans.values('status').annotate(
                    count=Count('id'),
                    amount=Sum('amount_approved')
                ).order_by('status')),
            }
        }
        
        return Response(report_data)


class PaymentsReportView(AuditMixin, APIView):
    """
    Specialized payments report endpoint.
    """
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    
    def get(self, request):
        """Generate payments report with filters."""
        # Get filters from query parameters
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        status = request.query_params.get('status')
        method = request.query_params.get('method')
        customer_id = request.query_params.get('customer_id')
        
        # Build query
        payments = MpesaPayment.objects.all().select_related(
            'loan', 'loan__customer', 'transaction'
        )
        
        if start_date:
            payments = payments.filter(payment_date__gte=start_date)
        if end_date:
            payments = payments.filter(payment_date__lte=end_date)
        if status:
            payments = payments.filter(status=status)
        if method:
            payments = payments.filter(payment_method=method)
        if customer_id:
            payments = payments.filter(loan__customer_id=customer_id)
        
        # Format response
        report_data = {
            'payments': list(payments.values(
                'payment_reference',
                'loan__loan_number',
                'loan__customer__first_name',
                'loan__customer__last_name',
                'amount',
                'payment_method',
                'status',
                'payment_date',
                'created_at',
            )),
            'summary': {
                'total_payments': payments.count(),
                'total_amount': payments.aggregate(total=Sum('amount'))['total'] or 0,
                'successful_payments': payments.filter(status='COMPLETED').count(),
                'method_distribution': list(payments.values('payment_method').annotate(
                    count=Count('id'),
                    amount=Sum('amount')
                ).order_by('-amount')),
            }
        }
        
        return Response(report_data)


class CustomersReportView(AuditMixin, APIView):
    """
    Specialized customers report endpoint.
    """
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    
    def get(self, request):
        """Generate customers report with filters."""
        # Get filters from query parameters
        status = request.query_params.get('status')
        county = request.query_params.get('county')
        risk_level = request.query_params.get('risk_level')
        has_loans = request.query_params.get('has_loans')
        
        # Build query
        customers = Customer.objects.all().select_related('employment')
        
        if status:
            customers = customers.filter(status=status)
        if county:
            customers = customers.filter(county=county)
        if risk_level:
            customers = customers.filter(risk_level=risk_level)
        if has_loans == 'true':
            customers = customers.filter(loans__isnull=False).distinct()
        elif has_loans == 'false':
            customers = customers.filter(loans__isnull=True)
        
        # Format response
        report_data = {
            'customers': list(customers.values(
                'customer_number',
                'first_name',
                'last_name',
                'phone_number',
                'email',
                'id_number',
                'county',
                'status',
                'risk_level',
                'credit_score',
                'registration_date',
            )),
            'summary': {
                'total_customers': customers.count(),
                'active_customers': customers.filter(status='ACTIVE').count(),
                'customers_with_loans': customers.filter(loans__isnull=False).distinct().count(),
                'demographics': {
                    'gender': list(customers.values('gender').annotate(count=Count('id')).order_by('gender')),
                    'county': list(customers.values('county').annotate(count=Count('id')).order_by('-count')[:10]),
                }
            }
        }
        
        return Response(report_data)


class PerformanceReportView(AuditMixin, APIView):
    """
    Performance metrics report endpoint.
    """
    permission_classes = [permissions.IsAuthenticated, IsManager]
    
    def get(self, request):
        """Generate performance metrics report."""
        period = request.query_params.get('period', 'monthly')
        
        # Generate performance report
        parameters = {'period': period}
        report_generator = ReportGenerateView()
        report_data = report_generator._generate_performance_report(parameters)
        
        return Response(report_data)


class DailySummaryReportView(AuditMixin, APIView):
    """
    Daily summary report endpoint.
    """
    permission_classes = [permissions.IsAuthenticated, IsManager]
    
    def get(self, request):
        """Generate daily summary report."""
        report_date = request.query_params.get('date', timezone.now().date())
        
        # Generate daily summary
        parameters = {'date': report_date}
        report_generator = ReportGenerateView()
        report_data = report_generator._generate_daily_summary(parameters)
        
        return Response(report_data)


class MonthlySummaryReportView(AuditMixin, APIView):
    """
    Monthly summary report endpoint.
    """
    permission_classes = [permissions.IsAuthenticated, IsManager]
    
    def get(self, request):
        """Generate monthly summary report."""
        month = request.query_params.get('month', timezone.now().month)
        year = request.query_params.get('year', timezone.now().year)
        
        # Generate monthly summary
        parameters = {'month': month, 'year': year}
        report_generator = ReportGenerateView()
        report_data = report_generator._generate_monthly_summary(parameters)
        
        return Response(report_data)


class AuditReportView(AuditMixin, APIView):
    """
    Audit trail report endpoint.
    """
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    
    def get(self, request):
        """Generate audit trail report."""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        user_id = request.query_params.get('user_id')
        action_type = request.query_params.get('action_type')
        
        # Generate audit report
        parameters = {
            'start_date': start_date,
            'end_date': end_date,
            'user': user_id,
            'action_type': action_type,
        }
        report_generator = ReportGenerateView()
        report_data = report_generator._generate_audit_report(parameters)
        
        return Response(report_data)


class CollectionReportView(AuditMixin, APIView):
    """
    Collection report endpoint.
    """
    permission_classes = [permissions.IsAuthenticated, IsManager]
    
    def get(self, request):
        """Generate collection report."""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        officer_id = request.query_params.get('officer_id')
        
        # Generate collection report
        parameters = {
            'start_date': start_date,
            'end_date': end_date,
            'officer': officer_id,
        }
        report_generator = ReportGenerateView()
        report_data = report_generator._generate_collection_report(parameters)
        
        return Response(report_data)


class RiskAssessmentReportView(AuditMixin, APIView):
    """
    Risk assessment report endpoint.
    """
    permission_classes = [permissions.IsAuthenticated, IsManager]
    
    def get(self, request):
        """Generate risk assessment report."""
        risk_level = request.query_params.get('risk_level')
        assessment_date = request.query_params.get('assessment_date')
        
        # Generate risk assessment
        parameters = {
            'risk_level': risk_level,
            'assessment_date': assessment_date,
        }
        report_generator = ReportGenerateView()
        report_data = report_generator._generate_risk_assessment(parameters)
        
        return Response(report_data)


class ReportDownloadView(AuditMixin, APIView):
    """
    Download previously generated reports.
    """
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    
    def get(self, request, report_id):
        """Download a specific report."""
        # In a real system, you would store reports and retrieve them by ID
        # For now, we'll generate on-demand
        
        return Response(
            {'error': 'Report storage not implemented yet.'},
            status=status.HTTP_501_NOT_IMPLEMENTED
        )


class ReportScheduleView(AuditMixin, APIView):
    """
    Schedule automatic report generation.
    """
    permission_classes = [permissions.IsAuthenticated, IsManager]
    
    def post(self, request):
        """Schedule a report."""
        report_type = request.data.get('report_type')
        schedule = request.data.get('schedule')  # daily, weekly, monthly
        recipients = request.data.get('recipients', [])
        format_type = request.data.get('format', 'pdf')
        parameters = request.data.get('parameters', {})
        
        if not report_type or not schedule:
            return Response(
                {'error': 'Report type and schedule are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate schedule
        valid_schedules = ['daily', 'weekly', 'monthly']
        if schedule not in valid_schedules:
            return Response(
                {'error': f'Invalid schedule. Must be one of: {", ".join(valid_schedules)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # In a real system, you would create a scheduled task here
        # For now, we'll just log the request
        
        self.audit_log(
            action='CREATE',
            model_name='ReportSchedule',
            user=request.user,
            changes=f"Scheduled {schedule} report: {report_type} for recipients: {recipients}"
        )
        
        return Response({
            'message': f'Report scheduled for {schedule} delivery.',
            'report_type': report_type,
            'schedule': schedule,
            'recipients': recipients,
            'next_run': self._calculate_next_run(schedule),
        })
    
    def _calculate_next_run(self, schedule):
        """Calculate next run time for schedule."""
        now = timezone.now()
        
        if schedule == 'daily':
            return (now + timedelta(days=1)).replace(hour=8, minute=0, second=0, microsecond=0)
        elif schedule == 'weekly':
            # Next Monday at 8 AM
            days_ahead = 7 - now.weekday()
            if days_ahead <= 0:  # Today is Monday or later in the week
                days_ahead += 7
            return (now + timedelta(days=days_ahead)).replace(hour=8, minute=0, second=0, microsecond=0)
        elif schedule == 'monthly':
            # First day of next month at 8 AM
            if now.month == 12:
                next_month = date(now.year + 1, 1, 1)
            else:
                next_month = date(now.year, now.month + 1, 1)
            return timezone.make_aware(
                datetime.combine(next_month, datetime.min.time())
            ).replace(hour=8, minute=0, second=0, microsecond=0)
        
        return None


class ReportHistoryView(AuditMixin, APIView):
    """
    View report generation history.
    """
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    
    def get(self, request):
        """Get report generation history."""
        # In a real system, you would query a ReportHistory model
        # For now, return mock data
        
        history = [
            {
                'id': 1,
                'report_type': 'Daily Summary',
                'generated_by': 'John Doe',
                'generated_at': (timezone.now() - timedelta(days=1)).isoformat(),
                'format': 'pdf',
                'file_size': '245 KB',
                'download_url': '/api/reports/download/1/',
            },
            {
                'id': 2,
                'report_type': 'Monthly Summary',
                'generated_by': 'Jane Smith',
                'generated_at': (timezone.now() - timedelta(days=7)).isoformat(),
                'format': 'excel',
                'file_size': '1.2 MB',
                'download_url': '/api/reports/download/2/',
            },
            {
                'id': 3,
                'report_type': 'Loans Summary',
                'generated_by': 'John Doe',
                'generated_at': (timezone.now() - timedelta(days=14)).isoformat(),
                'format': 'pdf',
                'file_size': '356 KB',
                'download_url': '/api/reports/download/3/',
            },
        ]
        
        return Response(history)


class ExportToPDFView(AuditMixin, APIView):
    """
    Export data to PDF format.
    """
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    
    def post(self, request):
        """Export data to PDF."""
        data_type = request.data.get('data_type')  # loans, payments, customers
        filters = request.data.get('filters', {})
        include_charts = request.data.get('include_charts', False)
        
        if not data_type:
            return Response(
                {'error': 'Data type is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Get data based on type
            if data_type == 'loans':
                data = self._get_loans_data(filters)
                title = 'Loans Export'
            elif data_type == 'payments':
                data = self._get_payments_data(filters)
                title = 'Payments Export'
            elif data_type == 'customers':
                data = self._get_customers_data(filters)
                title = 'Customers Export'
            else:
                return Response(
                    {'error': 'Invalid data type.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Generate PDF
            pdf_generator = PDFGenerator()
            pdf_content = pdf_generator.generate_export(
                title=title,
                data=data,
                include_charts=include_charts,
                generated_by=request.user.get_full_name()
            )
            
            response = HttpResponse(pdf_content, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="{title}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pdf"'
            
            # Log export
            self.audit_log(
                action='EXPORT',
                model_name='Report',
                user=request.user,
                changes=f"Exported {data_type} to PDF"
            )
            
            return response
        
        except Exception as e:
            return Response(
                {'error': f'Failed to generate PDF: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _get_loans_data(self, filters):
        """Get loans data for export."""
        loans = Loan.objects.all().select_related('customer', 'loan_product', 'loan_officer')
        
        # Apply filters
        if filters.get('start_date'):
            loans = loans.filter(created_at__date__gte=filters['start_date'])
        if filters.get('end_date'):
            loans = loans.filter(created_at__date__lte=filters['end_date'])
        if filters.get('status'):
            loans = loans.filter(status=filters['status'])
        
        return list(loans.values(
            'loan_number',
            'customer__first_name',
            'customer__last_name',
            'customer__customer_number',
            'loan_product__name',
            'amount_approved',
            'amount_disbursed',
            'outstanding_balance',
            'status',
            'interest_rate',
            'disbursement_date',
            'due_date',
            'created_at',
        ))
    
    def _get_payments_data(self, filters):
        """Get payments data for export."""
        payments = MpesaPayment.objects.all().select_related('loan', 'loan__customer')
        
        # Apply filters
        if filters.get('start_date'):
            payments = payments.filter(payment_date__gte=filters['start_date'])
        if filters.get('end_date'):
            payments = payments.filter(payment_date__lte=filters['end_date'])
        if filters.get('status'):
            payments = payments.filter(status=filters['status'])
        if filters.get('method'):
            payments = payments.filter(payment_method=filters['method'])
        
        return list(payments.values(
            'payment_reference',
            'loan__loan_number',
            'loan__customer__first_name',
            'loan__customer__last_name',
            'amount',
            'payment_method',
            'status',
            'payment_date',
            'created_at',
        ))
    
    def _get_customers_data(self, filters):
        """Get customers data for export."""
        customers = Customer.objects.all().select_related('employment')
        
        # Apply filters
        if filters.get('status'):
            customers = customers.filter(status=filters['status'])
        if filters.get('county'):
            customers = customers.filter(county=filters['county'])
        if filters.get('risk_level'):
            customers = customers.filter(risk_level=filters['risk_level'])
        
        return list(customers.values(
            'customer_number',
            'first_name',
            'last_name',
            'phone_number',
            'email',
            'id_number',
            'gender',
            'date_of_birth',
            'county',
            'status',
            'risk_level',
            'credit_score',
            'registration_date',
        ))


class ExportToExcelView(AuditMixin, APIView):
    """
    Export data to Excel format.
    """
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    
    def post(self, request):
        """Export data to Excel."""
        data_type = request.data.get('data_type')  # loans, payments, customers
        filters = request.data.get('filters', {})
        
        if not data_type:
            return Response(
                {'error': 'Data type is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Get data based on type
            if data_type == 'loans':
                data = self._get_loans_data(filters)
                title = 'Loans Export'
                columns = [
                    'Loan Number', 'Customer Name', 'Customer Number',
                    'Product', 'Amount Approved', 'Amount Disbursed',
                    'Outstanding Balance', 'Status', 'Interest Rate',
                    'Disbursement Date', 'Due Date', 'Created Date'
                ]
            elif data_type == 'payments':
                data = self._get_payments_data(filters)
                title = 'Payments Export'
                columns = [
                    'Payment Reference', 'Loan Number', 'Customer Name',
                    'Amount', 'Payment Method', 'Status',
                    'Payment Date', 'Created Date'
                ]
            elif data_type == 'customers':
                data = self._get_customers_data(filters)
                title = 'Customers Export'
                columns = [
                    'Customer Number', 'First Name', 'Last Name',
                    'Phone Number', 'Email', 'ID Number',
                    'Gender', 'Date of Birth', 'County',
                    'Status', 'Risk Level', 'Credit Score',
                    'Registration Date'
                ]
            else:
                return Response(
                    {'error': 'Invalid data type.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Generate Excel
            excel_generator = ExcelGenerator()
            excel_file = excel_generator.generate_export(
                title=title,
                columns=columns,
                data=data,
                generated_by=request.user.get_full_name()
            )
            
            response = HttpResponse(
                excel_file,
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            response['Content-Disposition'] = f'attachment; filename="{title}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx"'
            
            # Log export
            self.audit_log(
                action='EXPORT',
                model_name='Report',
                user=request.user,
                changes=f"Exported {data_type} to Excel"
            )
            
            return response
        
        except Exception as e:
            return Response(
                {'error': f'Failed to generate Excel: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _get_loans_data(self, filters):
        """Get loans data for Excel export."""
        # Same as PDF export, but formatted for Excel
        loans = Loan.objects.all().select_related('customer', 'loan_product')
        
        # Apply filters
        if filters.get('start_date'):
            loans = loans.filter(created_at__date__gte=filters['start_date'])
        if filters.get('end_date'):
            loans = loans.filter(created_at__date__lte=filters['end_date'])
        if filters.get('status'):
            loans = loans.filter(status=filters['status'])
        
        data = []
        for loan in loans:
            data.append([
                loan.loan_number,
                f"{loan.customer.first_name} {loan.customer.last_name}",
                loan.customer.customer_number,
                loan.loan_product.name if loan.loan_product else 'N/A',
                float(loan.amount_approved),
                float(loan.amount_disbursed),
                float(loan.outstanding_balance),
                loan.get_status_display(),
                float(loan.interest_rate),
                loan.disbursement_date.strftime('%Y-%m-%d') if loan.disbursement_date else 'N/A',
                loan.due_date.strftime('%Y-%m-%d') if loan.due_date else 'N/A',
                loan.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            ])
        
        return data
    
    def _get_payments_data(self, filters):
        """Get payments data for Excel export."""
        payments = MpesaPayment.objects.all().select_related('loan', 'loan__customer')
        
        # Apply filters
        if filters.get('start_date'):
            payments = payments.filter(payment_date__gte=filters['start_date'])
        if filters.get('end_date'):
            payments = payments.filter(payment_date__lte=filters['end_date'])
        if filters.get('status'):
            payments = payments.filter(status=filters['status'])
        if filters.get('method'):
            payments = payments.filter(payment_method=filters['method'])
        
        data = []
        for payment in payments:
            data.append([
                payment.payment_reference,
                payment.loan.loan_number if payment.loan else 'N/A',
                f"{payment.loan.customer.first_name} {payment.loan.customer.last_name}" if payment.loan and payment.loan.customer else 'N/A',
                float(payment.amount),
                payment.get_payment_method_display(),
                payment.get_status_display(),
                payment.payment_date.strftime('%Y-%m-%d'),
                payment.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            ])
        
        return data
    
    def _get_customers_data(self, filters):
        """Get customers data for Excel export."""
        customers = Customer.objects.all()
        
        # Apply filters
        if filters.get('status'):
            customers = customers.filter(status=filters['status'])
        if filters.get('county'):
            customers = customers.filter(county=filters['county'])
        if filters.get('risk_level'):
            customers = customers.filter(risk_level=filters['risk_level'])
        
        data = []
        for customer in customers:
            data.append([
                customer.customer_number,
                customer.first_name,
                customer.last_name,
                customer.phone_number,
                customer.email or 'N/A',
                customer.id_number,
                customer.get_gender_display(),
                customer.date_of_birth.strftime('%Y-%m-%d'),
                customer.county,
                customer.get_status_display(),
                customer.get_risk_level_display(),
                float(customer.credit_score),
                customer.registration_date.strftime('%Y-%m-%d %H:%M:%S'),
            ])
        
        return data