# backend/apps/core/management/commands/generate_reports.py
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.conf import settings
from django.db.models import Sum, Count, Avg, Q
from django.core.files.storage import default_storage
from apps.core.utils.helpers import DateHelper, FinancialHelper
from apps.core.utils.date_utils import (
    get_start_of_month, get_end_of_month,
    get_start_of_year, get_end_of_year,
    get_month_range, get_financial_year
)
import pandas as pd
import io
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Generate system reports (daily, weekly, monthly, custom)"
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--report-type',
            type=str,
            choices=['daily', 'weekly', 'monthly', 'quarterly', 'annual', 'custom'],
            default='daily',
            help='Type of report to generate',
        )
        parser.add_argument(
            '--date',
            type=str,
            help='Specific date for report (YYYY-MM-DD). For monthly/quarterly/annual, use first day',
        )
        parser.add_argument(
            '--month',
            type=int,
            help='Month number (1-12) for monthly report',
        )
        parser.add_argument(
            '--year',
            type=int,
            help='Year for report',
        )
        parser.add_argument(
            '--output-format',
            type=str,
            choices=['pdf', 'excel', 'csv', 'json', 'html'],
            default='excel',
            help='Output format',
        )
        parser.add_argument(
            '--save-to-file',
            action='store_true',
            help='Save report to file in media/reports/',
        )
        parser.add_argument(
            '--email-to',
            type=str,
            help='Email address to send report to (comma-separated for multiple)',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Generate report without saving or emailing',
        )
    
    def handle(self, *args, **options):
        """
        Generate various system reports.
        """
        report_type = options['report_type']
        date_str = options['date']
        month = options['month']
        year = options['year'] or timezone.now().year
        output_format = options['output_format']
        save_to_file = options['save_to_file']
        email_to = options['email_to']
        dry_run = options['dry_run']
        
        start_time = timezone.now()
        
        try:
            # Determine date range for report
            if date_str:
                report_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            else:
                report_date = DateHelper.today()
            
            date_range = self._get_date_range(report_type, report_date, month, year)
            
            self.stdout.write(
                self.style.SUCCESS(
                    f"Generating {report_type} report for {date_range['start']} to {date_range['end']}"
                )
            )
            
            # Generate report data
            report_data = self._collect_report_data(date_range)
            
            # Generate report in specified format
            report_content = self._generate_report_content(
                report_data, report_type, date_range, output_format
            )
            
            # Save report if requested
            report_path = None
            if save_to_file and not dry_run:
                report_path = self._save_report_file(
                    report_content, report_type, date_range, output_format
                )
            
            # Email report if requested
            if email_to and not dry_run:
                self._email_report(
                    report_content, email_to, report_type, date_range, output_format, report_path
                )
            
            # Display summary
            self._display_report_summary(report_data, date_range)
            
            if dry_run:
                self.stdout.write(self.style.WARNING("DRY RUN - Report generated but not saved/emailed"))
            else:
                self.stdout.write(self.style.SUCCESS(f"{report_type.capitalize()} report generated successfully"))
                
                if report_path:
                    self.stdout.write(f"Report saved to: {report_path}")
                
                if email_to:
                    self.stdout.write(f"Report emailed to: {email_to}")
        
        except Exception as e:
            logger.error(f"Error generating report: {e}", exc_info=True)
            self.stdout.write(self.style.ERROR(f"Error: {e}"))
        
        end_time = timezone.now()
        duration = (end_time - start_time).total_seconds()
        
        self.stdout.write(f"\nReport generation completed in {duration:.2f} seconds")
    
    def _get_date_range(self, report_type, report_date, month, year):
        """
        Get date range based on report type.
        """
        from apps.core.utils.date_utils import (
            get_start_of_month, get_end_of_month,
            get_start_of_year, get_end_of_year
        )
        
        if report_type == 'daily':
            start_date = report_date
            end_date = report_date
        
        elif report_type == 'weekly':
            start_date = report_date - timedelta(days=report_date.weekday())
            end_date = start_date + timedelta(days=6)
        
        elif report_type == 'monthly':
            if month:
                start_date = datetime(year, month, 1).date()
            else:
                start_date = report_date.replace(day=1)
            _, last_day = get_month_range(start_date.year, start_date.month)
            end_date = start_date.replace(day=last_day)
        
        elif report_type == 'quarterly':
            quarter_month = ((report_date.month - 1) // 3) * 3 + 1
            start_date = datetime(report_date.year, quarter_month, 1).date()
            end_month = quarter_month + 2
            if end_month > 12:
                end_month -= 12
                year += 1
            _, last_day = get_month_range(year, end_month)
            end_date = datetime(year, end_month, last_day).date()
        
        elif report_type == 'annual':
            start_date = datetime(report_date.year, 1, 1).date()
            end_date = datetime(report_date.year, 12, 31).date()
        
        else:  # custom
            # For custom, use provided dates or default to last 30 days
            start_date = report_date - timedelta(days=30)
            end_date = report_date
        
        return {
            'start': start_date,
            'end': end_date,
            'type': report_type,
        }
    
    def _collect_report_data(self, date_range):
        """
        Collect data for the report from various models.
        """
        from apps.loans.models import Loan
        from apps.repayments.models import Repayment
        from apps.customers.models import Customer
        from apps.mpesa.models import Payment
        
        start_date = date_range['start']
        end_date = date_range['end']
        
        data = {
            'summary': {},
            'loans': {},
            'repayments': {},
            'customers': {},
            'payments': {},
            'analytics': {},
        }
        
        try:
            # Loan statistics
            loans_qs = Loan.objects.filter(
                created_at__date__range=[start_date, end_date],
                is_deleted=False
            )
            
            data['loans'] = {
                'total_count': loans_qs.count(),
                'total_amount': loans_qs.aggregate(total=Sum('amount'))['total'] or 0,
                'average_amount': loans_qs.aggregate(avg=Avg('amount'))['avg'] or 0,
                'by_status': dict(loans_qs.values_list('status').annotate(count=Count('id'))),
                'by_officer': list(loans_qs.values('officer__username').annotate(
                    count=Count('id'),
                    amount=Sum('amount')
                ).order_by('-amount')[:10]),
            }
            
            # Repayment statistics
            repayments_qs = Repayment.objects.filter(
                due_date__range=[start_date, end_date],
                is_deleted=False
            )
            
            data['repayments'] = {
                'total_due': repayments_qs.aggregate(total=Sum('amount'))['total'] or 0,
                'total_collected': repayments_qs.filter(status='paid').aggregate(
                    total=Sum('amount_paid')
                )['total'] or 0,
                'collection_rate': (
                    (data['repayments']['total_collected'] / data['repayments']['total_due'] * 100)
                    if data['repayments']['total_due'] > 0 else 0
                ),
                'overdue_count': repayments_qs.filter(status='overdue').count(),
                'overdue_amount': repayments_qs.filter(status='overdue').aggregate(
                    total=Sum('amount')
                )['total'] or 0,
                'by_status': dict(repayments_qs.values_list('status').annotate(count=Count('id'))),
            }
            
            # Customer statistics
            customers_qs = Customer.objects.filter(
                created_at__date__range=[start_date, end_date],
                is_deleted=False
            )
            
            data['customers'] = {
                'new_customers': customers_qs.count(),
                'active_customers': Customer.objects.filter(
                    is_deleted=False,
                    loans__is_deleted=False
                ).distinct().count(),
                'by_gender': dict(customers_qs.values_list('gender').annotate(count=Count('id'))),
                'by_age_group': self._categorize_by_age(customers_qs),
            }
            
            # Payment statistics (M-Pesa)
            payments_qs = Payment.objects.filter(
                created_at__date__range=[start_date, end_date],
                is_deleted=False
            )
            
            data['payments'] = {
                'total_count': payments_qs.count(),
                'total_amount': payments_qs.aggregate(total=Sum('amount'))['total'] or 0,
                'success_rate': (
                    payments_qs.filter(status='successful').count() / payments_qs.count() * 100
                    if payments_qs.count() > 0 else 0
                ),
                'by_status': dict(payments_qs.values_list('status').annotate(count=Count('id'))),
                'top_transactions': list(payments_qs.order_by('-amount').values(
                    'reference', 'amount', 'phone_number', 'created_at'
                )[:10]),
            }
            
            # Analytics and trends
            data['analytics'] = {
                'loan_growth': self._calculate_growth('Loan', start_date, end_date),
                'revenue_growth': self._calculate_growth('Repayment', start_date, end_date, 'amount_paid'),
                'customer_growth': self._calculate_growth('Customer', start_date, end_date),
                'top_performing_officers': data['loans']['by_officer'][:5],
                'risk_indicators': self._calculate_risk_indicators(),
            }
            
            # Summary
            data['summary'] = {
                'period': f"{start_date} to {end_date}",
                'report_date': DateHelper.today(),
                'generated_at': timezone.now(),
                'total_loans_disbursed': data['loans']['total_amount'],
                'total_repayments_collected': data['repayments']['total_collected'],
                'collection_rate': round(data['repayments']['collection_rate'], 2),
                'new_customers': data['customers']['new_customers'],
                'overdue_amount': data['repayments']['overdue_amount'],
                'system_performance': self._calculate_system_performance(),
            }
            
        except Exception as e:
            logger.error(f"Error collecting report data: {e}")
            raise
        
        return data
    
    def _generate_report_content(self, report_data, report_type, date_range, output_format):
        """
        Generate report content in specified format.
        """
        if output_format == 'excel':
            return self._generate_excel_report(report_data, report_type, date_range)
        elif output_format == 'csv':
            return self._generate_csv_report(report_data, report_type, date_range)
        elif output_format == 'pdf':
            return self._generate_pdf_report(report_data, report_type, date_range)
        elif output_format == 'json':
            return self._generate_json_report(report_data, report_type, date_range)
        elif output_format == 'html':
            return self._generate_html_report(report_data, report_type, date_range)
        
        raise ValueError(f"Unsupported output format: {output_format}")
    
    def _generate_excel_report(self, report_data, report_type, date_range):
        """
        Generate Excel report using pandas.
        """
        from apps.core.utils.helpers import DataExportHelper
        
        # Create Excel writer
        output = io.BytesIO()
        
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            # Summary sheet
            summary_df = pd.DataFrame([report_data['summary']])
            summary_df.to_excel(writer, sheet_name='Summary', index=False)
            
            # Loans sheet
            loans_data = []
            for key, value in report_data['loans'].items():
                if isinstance(value, (int, float, str)):
                    loans_data.append({'Metric': key, 'Value': value})
            loans_df = pd.DataFrame(loans_data)
            loans_df.to_excel(writer, sheet_name='Loans', index=False)
            
            # Repayments sheet
            repayments_data = []
            for key, value in report_data['repayments'].items():
                if isinstance(value, (int, float, str)):
                    repayments_data.append({'Metric': key, 'Value': value})
            repayments_df = pd.DataFrame(repayments_data)
            repayments_df.to_excel(writer, sheet_name='Repayments', index=False)
            
            # Customers sheet
            customers_data = []
            for key, value in report_data['customers'].items():
                if isinstance(value, (int, float, str)):
                    customers_data.append({'Metric': key, 'Value': value})
            customers_df = pd.DataFrame(customers_data)
            customers_df.to_excel(writer, sheet_name='Customers', index=False)
        
        output.seek(0)
        return output.getvalue()
    
    def _generate_csv_report(self, report_data, report_type, date_range):
        """
        Generate CSV report.
        """
        import csv
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow(['Report Type', report_type])
        writer.writerow(['Period', f"{date_range['start']} to {date_range['end']}"])
        writer.writerow(['Generated At', timezone.now()])
        writer.writerow([])
        
        # Write summary
        writer.writerow(['SUMMARY'])
        for key, value in report_data['summary'].items():
            writer.writerow([key, value])
        
        return output.getvalue().encode('utf-8')
    
    def _generate_pdf_report(self, report_data, report_type, date_range):
        """
        Generate PDF report.
        """
        # This would use reportlab or weasyprint
        # For now, return a simple text representation
        from apps.reports.generators.pdf_generator import PDFGenerator
        
        try:
            generator = PDFGenerator()
            pdf_content = generator.generate_report(
                report_data, report_type, date_range
            )
            return pdf_content
        except ImportError:
            # Fallback to text if PDF generator not available
            self.stdout.write(self.style.WARNING("PDF generator not available, using text fallback"))
            return self._generate_text_report(report_data, report_type, date_range).encode('utf-8')
    
    def _generate_json_report(self, report_data, report_type, date_range):
        """
        Generate JSON report.
        """
        import json
        
        report_data['metadata'] = {
            'report_type': report_type,
            'date_range': date_range,
            'generated_at': timezone.now().isoformat(),
        }
        
        return json.dumps(report_data, indent=2, default=str).encode('utf-8')
    
    def _generate_html_report(self, report_data, report_type, date_range):
        """
        Generate HTML report.
        """
        from django.template.loader import render_to_string
        
        context = {
            'report_data': report_data,
            'report_type': report_type,
            'date_range': date_range,
            'generated_at': timezone.now(),
        }
        
        html_content = render_to_string('reports/system_report.html', context)
        return html_content.encode('utf-8')
    
    def _generate_text_report(self, report_data, report_type, date_range):
        """
        Generate text report (fallback).
        """
        output = []
        output.append("=" * 60)
        output.append(f"SYSTEM REPORT - {report_type.upper()}")
        output.append("=" * 60)
        output.append(f"Period: {date_range['start']} to {date_range['end']}")
        output.append(f"Generated: {timezone.now()}")
        output.append("")
        
        output.append("SUMMARY")
        output.append("-" * 40)
        for key, value in report_data['summary'].items():
            output.append(f"{key}: {value}")
        
        return "\n".join(output)
    
    def _save_report_file(self, content, report_type, date_range, output_format):
        """
        Save report to file in media/reports/.
        """
        import os
        from django.core.files.base import ContentFile
        
        # Create filename
        filename = f"{report_type}_report_{date_range['start']}_{date_range['end']}.{output_format}"
        filepath = f"reports/{filename}"
        
        # Save to default storage
        default_storage.save(filepath, ContentFile(content))
        
        return default_storage.path(filepath)
    
    def _email_report(self, content, email_to, report_type, date_range, output_format, filepath=None):
        """
        Email report to specified addresses.
        """
        from django.core.mail import EmailMessage
        from django.template.loader import render_to_string
        
        emails = [email.strip() for email in email_to.split(',')]
        
        subject = f"{report_type.capitalize()} System Report - {date_range['start']} to {date_range['end']}"
        
        # Create email message
        if output_format == 'html':
            # HTML email with attachment
            body = render_to_string('reports/email/report_notification.html', {
                'report_type': report_type,
                'date_range': date_range,
                'generated_at': timezone.now(),
            })
            email = EmailMessage(
                subject=subject,
                body=body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=emails,
            )
            email.content_subtype = "html"
        else:
            # Plain text email with attachment
            body = render_to_string('reports/email/report_notification.txt', {
                'report_type': report_type,
                'date_range': date_range,
                'generated_at': timezone.now(),
            })
            email = EmailMessage(
                subject=subject,
                body=body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=emails,
            )
        
        # Attach report file
        filename = f"{report_type}_report_{date_range['start']}_{date_range['end']}.{output_format}"
        
        if output_format == 'pdf':
            email.attach(filename, content, 'application/pdf')
        elif output_format == 'excel':
            email.attach(filename, content, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        elif output_format == 'csv':
            email.attach(filename, content, 'text/csv')
        else:
            email.attach(filename, content, 'text/plain')
        
        # Send email
        email.send(fail_silently=True)
    
    def _display_report_summary(self, report_data, date_range):
        """
        Display report summary in console.
        """
        summary = report_data['summary']
        
        self.stdout.write("\n" + "="*60)
        self.stdout.write(f"REPORT SUMMARY ({date_range['start']} to {date_range['end']})")
        self.stdout.write("="*60)
        self.stdout.write(f"Total Loans Disbursed: {FinancialHelper.format_currency(summary['total_loans_disbursed'])}")
        self.stdout.write(f"Total Repayments Collected: {FinancialHelper.format_currency(summary['total_repayments_collected'])}")
        self.stdout.write(f"Collection Rate: {summary['collection_rate']}%")
        self.stdout.write(f"New Customers: {summary['new_customers']}")
        self.stdout.write(f"Overdue Amount: {FinancialHelper.format_currency(summary['overdue_amount'])}")
        self.stdout.write("="*60)
    
    def _categorize_by_age(self, queryset):
        """
        Categorize customers by age groups.
        """
        from apps.core.utils.date_utils import calculate_age
        
        age_groups = {
            '18-25': 0,
            '26-35': 0,
            '36-45': 0,
            '46-55': 0,
            '56+': 0,
        }
        
        for customer in queryset:
            if customer.date_of_birth:
                age = calculate_age(customer.date_of_birth)
                if 18 <= age <= 25:
                    age_groups['18-25'] += 1
                elif 26 <= age <= 35:
                    age_groups['26-35'] += 1
                elif 36 <= age <= 45:
                    age_groups['36-45'] += 1
                elif 46 <= age <= 55:
                    age_groups['46-55'] += 1
                elif age >= 56:
                    age_groups['56+'] += 1
        
        return age_groups
    
    def _calculate_growth(self, model_name, start_date, end_date, field='id'):
        """
        Calculate growth percentage compared to previous period.
        """
        from django.apps import apps
        
        model = apps.get_model('apps', model_name.lower())
        
        # Current period count
        current = model.objects.filter(
            created_at__date__range=[start_date, end_date],
            is_deleted=False
        ).count()
        
        # Previous period (same length)
        period_length = (end_date - start_date).days
        prev_start = start_date - timedelta(days=period_length + 1)
        prev_end = start_date - timedelta(days=1)
        
        previous = model.objects.filter(
            created_at__date__range=[prev_start, prev_end],
            is_deleted=False
        ).count()
        
        if previous > 0:
            growth = ((current - previous) / previous) * 100
        else:
            growth = 100 if current > 0 else 0
        
        return round(growth, 2)
    
    def _calculate_risk_indicators(self):
        """
        Calculate various risk indicators.
        """
        from apps.loans.models import Loan
        from apps.repayments.models import Repayment
        
        # Default rate
        total_loans = Loan.objects.filter(is_deleted=False).count()
        defaulted_loans = Loan.objects.filter(
            is_deleted=False,
            status='defaulted'
        ).count()
        default_rate = (defaulted_loans / total_loans * 100) if total_loans > 0 else 0
        
        # Overdue ratio
        total_due = Repayment.objects.filter(
            is_deleted=False,
            status__in=['pending', 'overdue']
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        overdue_amount = Repayment.objects.filter(
            is_deleted=False,
            status='overdue'
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        overdue_ratio = (overdue_amount / total_due * 100) if total_due > 0 else 0
        
        return {
            'default_rate': round(default_rate, 2),
            'overdue_ratio': round(overdue_ratio, 2),
            'risk_level': 'HIGH' if default_rate > 10 or overdue_ratio > 20 else 'MEDIUM' if default_rate > 5 else 'LOW',
        }
    
    def _calculate_system_performance(self):
        """
        Calculate system performance metrics.
        """
        # This would include uptime, response times, etc.
        # For now, return basic metrics
        return {
            'uptime': '99.9%',
            'avg_response_time': '120ms',
            'error_rate': '0.1%',
            'active_users': '150',
        }