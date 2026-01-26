# backend/apps/reports/generators/pdf_generator.py
import os
import io
from datetime import datetime
from decimal import Decimal
from django.conf import settings
from django.template.loader import render_to_string
from django.utils import timezone
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4, landscape
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, Image, KeepTogether, PageTemplate, Frame,
    NextPageTemplate, BaseDocTemplate
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import qrcode
from io import BytesIO


class PDFGenerator:
    """
    PDF report generator for Super Legit Advance.
    """
    
    def __init__(self):
        """Initialize PDF generator."""
        self.styles = getSampleStyleSheet()
        self._register_fonts()
        self._define_custom_styles()
    
    def _register_fonts(self):
        """Register custom fonts if available."""
        try:
            # Try to register Arial font if available
            font_path = os.path.join(settings.BASE_DIR, 'static', 'fonts', 'arial.ttf')
            if os.path.exists(font_path):
                pdfmetrics.registerFont(TTFont('Arial', font_path))
                pdfmetrics.registerFont(TTFont('Arial-Bold', font_path))
        except:
            pass  # Use default fonts if custom fonts not available
    
    def _define_custom_styles(self):
        """Define custom paragraph styles."""
        # Title style
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Title'],
            fontSize=24,
            textColor=colors.HexColor('#2c3e50'),
            spaceAfter=30,
            alignment=TA_CENTER,
        ))
        
        # Heading 1
        self.styles.add(ParagraphStyle(
            name='Heading1',
            parent=self.styles['Heading1'],
            fontSize=18,
            textColor=colors.HexColor('#2c3e50'),
            spaceAfter=12,
            spaceBefore=20,
            leftIndent=0,
        ))
        
        # Heading 2
        self.styles.add(ParagraphStyle(
            name='Heading2',
            parent=self.styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#34495e'),
            spaceAfter=10,
            spaceBefore=15,
            leftIndent=0,
        ))
        
        # Normal text
        self.styles.add(ParagraphStyle(
            name='NormalText',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#333333'),
            spaceAfter=6,
            leading=14,
        ))
        
        # Small text
        self.styles.add(ParagraphStyle(
            name='SmallText',
            parent=self.styles['Normal'],
            fontSize=8,
            textColor=colors.HexColor('#666666'),
            spaceAfter=4,
            leading=12,
        ))
        
        # Table header
        self.styles.add(ParagraphStyle(
            name='TableHeader',
            parent=self.styles['Normal'],
            fontSize=9,
            textColor=colors.white,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold',
        ))
        
        # Table cell
        self.styles.add(ParagraphStyle(
            name='TableCell',
            parent=self.styles['Normal'],
            fontSize=9,
            textColor=colors.HexColor('#333333'),
            leading=12,
        ))
        
        # Footer text
        self.styles.add(ParagraphStyle(
            name='FooterText',
            parent=self.styles['Normal'],
            fontSize=7,
            textColor=colors.HexColor('#7f8c8d'),
            alignment=TA_CENTER,
            spaceBefore=10,
        ))
        
        # Highlight box
        self.styles.add(ParagraphStyle(
            name='HighlightBox',
            parent=self.styles['Normal'],
            fontSize=10,
            backColor=colors.HexColor('#fff3cd'),
            borderColor=colors.HexColor('#ffc107'),
            borderWidth=1,
            borderPadding=10,
            leftIndent=10,
            rightIndent=10,
            spaceAfter=10,
            spaceBefore=10,
        ))
        
        # Amount style
        self.styles.add(ParagraphStyle(
            name='Amount',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#2c3e50'),
            alignment=TA_RIGHT,
            fontName='Courier',
        ))
        
        # Company header
        self.styles.add(ParagraphStyle(
            name='CompanyHeader',
            parent=self.styles['Title'],
            fontSize=16,
            textColor=colors.HexColor('#3498db'),
            alignment=TA_CENTER,
            spaceAfter=5,
        ))
    
    def generate_report(self, report_name, report_data):
        """
        Generate a PDF report from report data.
        
        Args:
            report_name (str): Name of the report
            report_data (dict): Report data dictionary
            
        Returns:
            bytes: PDF content
        """
        buffer = BytesIO()
        
        # Create document
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72,
            title=report_name
        )
        
        # Build story
        story = []
        
        # Add header
        story.extend(self._create_header(report_name, report_data))
        
        # Add summary section
        if 'summary' in report_data:
            story.extend(self._create_summary_section(report_data['summary']))
        
        # Add detailed sections based on report type
        if 'loans' in report_name.lower():
            story.extend(self._create_loans_section(report_data))
        elif 'payments' in report_name.lower():
            story.extend(self._create_payments_section(report_data))
        elif 'customers' in report_name.lower():
            story.extend(self._create_customers_section(report_data))
        elif 'performance' in report_name.lower():
            story.extend(self._create_performance_section(report_data))
        
        # Add footer
        story.extend(self._create_footer(report_data))
        
        # Build PDF
        doc.build(story, onFirstPage=self._add_page_number, onLaterPages=self._add_page_number)
        
        # Get PDF content
        pdf_content = buffer.getvalue()
        buffer.close()
        
        return pdf_content
    
    def generate_export(self, title, data, include_charts=False, generated_by=None):
        """
        Generate a PDF export of data.
        
        Args:
            title (str): Export title
            data (list): List of data records
            include_charts (bool): Whether to include charts
            generated_by (str): Name of user who generated the export
            
        Returns:
            bytes: PDF content
        """
        buffer = BytesIO()
        
        # Create document
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36,
            title=title
        )
        
        # Build story
        story = []
        
        # Add export header
        story.extend(self._create_export_header(title, generated_by))
        
        # Add data table
        if data and len(data) > 0:
            story.extend(self._create_data_table(data))
        
        # Add summary if applicable
        if include_charts and len(data) > 0:
            story.append(PageBreak())
            story.extend(self._create_summary_charts(data))
        
        # Add footer
        story.extend(self._create_export_footer(title, len(data)))
        
        # Build PDF
        doc.build(story, onFirstPage=self._add_page_number, onLaterPages=self._add_page_number)
        
        # Get PDF content
        pdf_content = buffer.getvalue()
        buffer.close()
        
        return pdf_content
    
    def generate_loan_agreement(self, loan, customer, guarantors=None, collateral=None):
        """
        Generate a loan agreement PDF.
        
        Args:
            loan: Loan object
            customer: Customer object
            guarantors: List of guarantor objects
            collateral: Collateral object
            
        Returns:
            bytes: PDF content
        """
        # Prepare template context
        context = {
            'loan': loan,
            'customer': customer,
            'guarantors': guarantors or [],
            'collateral': collateral,
            'agreement_date': timezone.now().strftime('%B %d, %Y'),
            'generated_date': timezone.now().strftime('%Y-%m-%d %H:%M:%S'),
            'monthly_installment': self._calculate_monthly_installment(loan),
            'total_repayment': self._calculate_total_repayment(loan),
            'total_interest': self._calculate_total_interest(loan),
            'first_payment_date': self._calculate_first_payment_date(loan),
            'penalty_rate': 5.0,  # Default penalty rate
            'paybill_number': '123456',  # From settings
            'schedule': self._generate_repayment_schedule(loan),
        }
        
        # Render HTML template
        html_content = render_to_string('pdf/loan_agreement.html', context)
        
        # Convert HTML to PDF (using reportlab directly for better control)
        return self._generate_from_html(html_content, 'loan_agreement')
    
    def generate_repayment_schedule(self, loan, customer, include_amortization=True):
        """
        Generate a repayment schedule PDF.
        
        Args:
            loan: Loan object
            customer: Customer object
            include_amortization (bool): Whether to include amortization details
            
        Returns:
            bytes: PDF content
        """
        # Prepare template context
        context = {
            'loan': loan,
            'customer': customer,
            'generated_date': timezone.now().strftime('%Y-%m-%d %H:%M:%S'),
            'monthly_installment': self._calculate_monthly_installment(loan),
            'total_repayment': self._calculate_total_repayment(loan),
            'total_interest': self._calculate_total_interest(loan),
            'apr': self._calculate_apr(loan),
            'days_to_maturity': (loan.due_date - timezone.now().date()).days if loan.due_date else 0,
            'penalty_rate': 5.0,  # From settings
            'paybill_number': '123456',  # From settings
            'bank_name': 'Equity Bank',
            'account_number': '1234567890',
            'branch_name': 'Nairobi CBD',
            'swift_code': 'EQBLKENA',
            'schedule': self._generate_detailed_schedule(loan),
            'include_amortization': include_amortization,
            'amortization': self._generate_amortization_schedule(loan) if include_amortization else [],
            'total_principal': loan.amount_approved,
            'paid_principal': loan.total_repaid or Decimal('0'),
            'paid_interest': loan.total_interest_paid or Decimal('0'),
            'paid_total': (loan.total_repaid or Decimal('0')) + (loan.total_interest_paid or Decimal('0')),
            'balance_principal': loan.outstanding_balance,
            'balance_interest': (loan.total_interest or Decimal('0')) - (loan.total_interest_paid or Decimal('0')),
            'balance_total': loan.outstanding_balance + ((loan.total_interest or Decimal('0')) - (loan.total_interest_paid or Decimal('0'))),
        }
        
        # Render HTML template
        html_content = render_to_string('pdf/repayment_schedule.html', context)
        
        # Convert HTML to PDF
        return self._generate_from_html(html_content, 'repayment_schedule')
    
    def _generate_from_html(self, html_content, document_type):
        """
        Convert HTML content to PDF using reportlab.
        
        Args:
            html_content (str): HTML content
            document_type (str): Type of document
            
        Returns:
            bytes: PDF content
        """
        # Note: This is a simplified implementation
        # In production, you might want to use a proper HTML to PDF converter
        # like weasyprint, xhtml2pdf, or a commercial solution
        
        buffer = BytesIO()
        
        # For now, create a simple PDF with the HTML content as text
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72,
            title=document_type.replace('_', ' ').title()
        )
        
        story = [
            Paragraph("HTML to PDF Conversion", self.styles['CustomTitle']),
            Spacer(1, 20),
            Paragraph("Note: HTML to PDF conversion is not implemented in this demo.", self.styles['NormalText']),
            Spacer(1, 10),
            Paragraph("In production, use a proper HTML to PDF converter.", self.styles['NormalText']),
            Spacer(1, 10),
            Paragraph(f"Document type: {document_type}", self.styles['NormalText']),
        ]
        
        doc.build(story)
        
        pdf_content = buffer.getvalue()
        buffer.close()
        
        return pdf_content
    
    def _create_header(self, report_name, report_data):
        """Create report header."""
        elements = []
        
        # Company header
        elements.append(Paragraph("SUPER LEGIT ADVANCE LTD", self.styles['CompanyHeader']))
        elements.append(Paragraph("Professional Financial Services", self.styles['NormalText']))
        elements.append(Spacer(1, 10))
        
        # Report title
        elements.append(Paragraph(report_name, self.styles['CustomTitle']))
        
        # Report metadata
        metadata = report_data.get('metadata', {})
        if metadata:
            elements.append(Spacer(1, 10))
            
            meta_table_data = [
                ['Generated By:', metadata.get('generated_by', 'System')],
                ['Generated At:', metadata.get('generated_at', timezone.now().strftime('%Y-%m-%d %H:%M:%S'))],
                ['Report Type:', metadata.get('report_type', 'General')],
            ]
            
            if 'period' in report_data:
                meta_table_data.append(['Period:', report_data['period']])
            
            meta_table = Table(meta_table_data, colWidths=[2*inch, 3*inch])
            meta_table.setStyle(TableStyle([
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
                ('ALIGN', (1, 0), (1, -1), 'LEFT'),
                ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#555555')),
                ('TEXTCOLOR', (1, 0), (1, -1), colors.HexColor('#333333')),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ]))
            
            elements.append(meta_table)
        
        elements.append(Spacer(1, 20))
        
        return elements
    
    def _create_summary_section(self, summary_data):
        """Create summary section."""
        elements = []
        
        elements.append(Paragraph("SUMMARY", self.styles['Heading1']))
        elements.append(Spacer(1, 10))
        
        # Convert summary data to table
        table_data = []
        for key, value in summary_data.items():
            if isinstance(value, (int, float, Decimal)):
                formatted_value = f"KES {value:,.2f}" if isinstance(value, (float, Decimal)) else f"{value:,}"
            else:
                formatted_value = str(value)
            
            # Format key for display
            display_key = ' '.join(word.capitalize() for word in key.split('_'))
            table_data.append([display_key, formatted_value])
        
        summary_table = Table(table_data, colWidths=[2.5*inch, 2.5*inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f8f9fa')),
            ('BACKGROUND', (1, 0), (1, -1), colors.white),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#dee2e6')),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('PADDING', (0, 0), (-1, -1), 8),
            ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
            ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ]))
        
        elements.append(summary_table)
        elements.append(Spacer(1, 20))
        
        return elements
    
    def _create_loans_section(self, report_data):
        """Create loans data section."""
        elements = []
        
        elements.append(Paragraph("LOANS DETAIL", self.styles['Heading1']))
        elements.append(Spacer(1, 10))
        
        loans = report_data.get('loans', [])
        if not loans:
            elements.append(Paragraph("No loans data available.", self.styles['NormalText']))
            return elements
        
        # Create table header
        table_data = []
        headers = [
            'Loan Number', 'Customer', 'Product',
            'Amount', 'Status', 'Disbursement Date'
        ]
        table_data.append(headers)
        
        # Add loan data
        for loan in loans[:50]:  # Limit to 50 records in PDF
            row = [
                loan.get('loan_number', ''),
                f"{loan.get('customer__first_name', '')} {loan.get('customer__last_name', '')}",
                loan.get('loan_product__name', 'N/A'),
                f"KES {loan.get('amount_approved', 0):,.2f}",
                loan.get('status', ''),
                loan.get('disbursement_date', '')[:10] if loan.get('disbursement_date') else 'N/A',
            ]
            table_data.append(row)
        
        # Create table
        col_widths = [1*inch, 1.5*inch, 1*inch, 1*inch, 0.8*inch, 1*inch]
        loans_table = Table(table_data, colWidths=col_widths, repeatRows=1)
        
        # Style table
        loans_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2c3e50')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            
            ('ALIGN', (3, 1), (3, -1), 'RIGHT'),
            ('ALIGN', (0, 1), (2, -1), 'LEFT'),
            ('ALIGN', (4, 1), (-1, -1), 'CENTER'),
            
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#dee2e6')),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('PADDING', (0, 0), (-1, -1), 6),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9f9f9')]),
        ]))
        
        elements.append(loans_table)
        
        if len(loans) > 50:
            elements.append(Spacer(1, 10))
            elements.append(Paragraph(
                f"Showing 50 of {len(loans)} records. Use export for full dataset.",
                self.styles['SmallText']
            ))
        
        elements.append(Spacer(1, 20))
        
        return elements
    
    def _create_payments_section(self, report_data):
        """Create payments data section."""
        elements = []
        
        elements.append(Paragraph("PAYMENTS DETAIL", self.styles['Heading1']))
        elements.append(Spacer(1, 10))
        
        payments = report_data.get('payments', [])
        if not payments:
            elements.append(Paragraph("No payments data available.", self.styles['NormalText']))
            return elements
        
        # Create table header
        table_data = []
        headers = [
            'Reference', 'Loan Number', 'Customer',
            'Amount', 'Method', 'Status', 'Date'
        ]
        table_data.append(headers)
        
        # Add payment data
        for payment in payments[:50]:  # Limit to 50 records
            row = [
                payment.get('payment_reference', ''),
                payment.get('loan__loan_number', 'N/A'),
                f"{payment.get('loan__customer__first_name', '')} {payment.get('loan__customer__last_name', '')}",
                f"KES {payment.get('amount', 0):,.2f}",
                payment.get('payment_method', ''),
                payment.get('status', ''),
                payment.get('payment_date', '')[:10] if payment.get('payment_date') else 'N/A',
            ]
            table_data.append(row)
        
        # Create table
        col_widths = [1.2*inch, 1*inch, 1.5*inch, 0.8*inch, 0.7*inch, 0.8*inch, 0.8*inch]
        payments_table = Table(table_data, colWidths=col_widths, repeatRows=1)
        
        # Style table
        payments_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2c3e50')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            
            ('ALIGN', (3, 1), (3, -1), 'RIGHT'),
            ('ALIGN', (0, 1), (2, -1), 'LEFT'),
            ('ALIGN', (4, 1), (-1, -1), 'CENTER'),
            
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#dee2e6')),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('PADDING', (0, 0), (-1, -1), 6),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9f9f9')]),
        ]))
        
        elements.append(payments_table)
        
        if len(payments) > 50:
            elements.append(Spacer(1, 10))
            elements.append(Paragraph(
                f"Showing 50 of {len(payments)} records. Use export for full dataset.",
                self.styles['SmallText']
            ))
        
        elements.append(Spacer(1, 20))
        
        return elements
    
    def _create_customers_section(self, report_data):
        """Create customers data section."""
        elements = []
        
        elements.append(Paragraph("CUSTOMERS DETAIL", self.styles['Heading1']))
        elements.append(Spacer(1, 10))
        
        customers = report_data.get('customers', [])
        if not customers:
            elements.append(Paragraph("No customers data available.", self.styles['NormalText']))
            return elements
        
        # Create table header
        table_data = []
        headers = [
            'Customer Number', 'Name', 'Phone',
            'ID Number', 'County', 'Status', 'Risk Level'
        ]
        table_data.append(headers)
        
        # Add customer data
        for customer in customers[:50]:  # Limit to 50 records
            row = [
                customer.get('customer_number', ''),
                f"{customer.get('first_name', '')} {customer.get('last_name', '')}",
                customer.get('phone_number', ''),
                customer.get('id_number', ''),
                customer.get('county', ''),
                customer.get('status', ''),
                customer.get('risk_level', ''),
            ]
            table_data.append(row)
        
        # Create table
        col_widths = [1.2*inch, 1.5*inch, 1*inch, 1*inch, 0.8*inch, 0.8*inch, 0.8*inch]
        customers_table = Table(table_data, colWidths=col_widths, repeatRows=1)
        
        # Style table
        customers_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2c3e50')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            
            ('ALIGN', (0, 1), (-1, -1), 'LEFT'),
            
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#dee2e6')),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('PADDING', (0, 0), (-1, -1), 6),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9f9f9')]),
        ]))
        
        elements.append(customers_table)
        
        if len(customers) > 50:
            elements.append(Spacer(1, 10))
            elements.append(Paragraph(
                f"Showing 50 of {len(customers)} records. Use export for full dataset.",
                self.styles['SmallText']
            ))
        
        elements.append(Spacer(1, 20))
        
        return elements
    
    def _create_performance_section(self, report_data):
        """Create performance metrics section."""
        elements = []
        
        elements.append(Paragraph("PERFORMANCE METRICS", self.styles['Heading1']))
        elements.append(Spacer(1, 10))
        
        # KPIs
        kpis = report_data.get('key_performance_indicators', {})
        if kpis:
            elements.append(Paragraph("Key Performance Indicators", self.styles['Heading2']))
            
            kpi_data = []
            for kpi_name, kpi_value in kpis.items():
                if isinstance(kpi_value, dict):
                    # Handle nested KPIs
                    for sub_name, sub_value in kpi_value.items():
                        display_name = ' '.join(word.capitalize() for word in sub_name.split('_'))
                        if isinstance(sub_value, (int, float)):
                            formatted_value = f"{sub_value:.1f}"
                            if 'rate' in sub_name or 'percentage' in sub_name:
                                formatted_value += '%'
                        else:
                            formatted_value = str(sub_value)
                        kpi_data.append([display_name, formatted_value])
                else:
                    display_name = ' '.join(word.capitalize() for word in kpi_name.split('_'))
                    if isinstance(kpi_value, (int, float)):
                        formatted_value = f"{kpi_value:.1f}"
                        if 'rate' in kpi_name or 'percentage' in kpi_name:
                            formatted_value += '%'
                    else:
                        formatted_value = str(kpi_value)
                    kpi_data.append([display_name, formatted_value])
            
            kpi_table = Table(kpi_data, colWidths=[2.5*inch, 2.5*inch])
            kpi_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f8f9fa')),
                ('BACKGROUND', (1, 0), (1, -1), colors.white),
                ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#dee2e6')),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('PADDING', (0, 0), (-1, -1), 8),
                ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
                ('ALIGN', (1, 0), (1, -1), 'LEFT'),
            ]))
            
            elements.append(kpi_table)
            elements.append(Spacer(1, 20))
        
        # Trends
        trends = report_data.get('trends', {})
        if trends:
            elements.append(Paragraph("Performance Trends", self.styles['Heading2']))
            
            for trend_name, trend_data in trends.items():
                if trend_data:
                    elements.append(Paragraph(
                        trend_name.replace('_', ' ').title(),
                        self.styles['NormalText']
                    ))
                    
                    # Create trend table
                    trend_headers = ['Period', 'Count', 'Amount']
                    trend_table_data = [trend_headers]
                    
                    for item in trend_data[:10]:  # Limit to 10 periods
                        period = item.get('month', item.get('period', ''))
                        if isinstance(period, datetime):
                            period = period.strftime('%b %Y')
                        
                        trend_table_data.append([
                            period,
                            str(item.get('count', 0)),
                            f"KES {item.get('amount', 0):,.2f}" if item.get('amount') else 'N/A'
                        ])
                    
                    trend_table = Table(trend_table_data, colWidths=[1.5*inch, 1*inch, 1.5*inch])
                    trend_table.setStyle(TableStyle([
                        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#6c757d')),
                        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
                        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                        ('FONTSIZE', (0, 0), (-1, 0), 9),
                        
                        ('ALIGN', (1, 1), (1, -1), 'CENTER'),
                        ('ALIGN', (2, 1), (2, -1), 'RIGHT'),
                        
                        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#dee2e6')),
                        ('FONTSIZE', (0, 1), (-1, -1), 8),
                        ('PADDING', (0, 0), (-1, -1), 6),
                        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                    ]))
                    
                    elements.append(trend_table)
                    elements.append(Spacer(1, 10))
        
        elements.append(Spacer(1, 20))
        
        return elements
    
    def _create_export_header(self, title, generated_by):
        """Create export header."""
        elements = []
        
        elements.append(Paragraph("SUPER LEGIT ADVANCE LTD", self.styles['CompanyHeader']))
        elements.append(Paragraph("Data Export", self.styles['NormalText']))
        elements.append(Spacer(1, 10))
        
        elements.append(Paragraph(title, self.styles['CustomTitle']))
        
        if generated_by:
            elements.append(Paragraph(f"Generated by: {generated_by}", self.styles['NormalText']))
        
        elements.append(Paragraph(f"Generated on: {timezone.now().strftime('%Y-%m-%d %H:%M:%S')}", self.styles['NormalText']))
        elements.append(Spacer(1, 20))
        
        return elements
    
    def _create_data_table(self, data):
        """Create data table for export."""
        elements = []
        
        if not data or len(data) == 0:
            elements.append(Paragraph("No data available for export.", self.styles['NormalText']))
            return elements
        
        # Determine headers from first row
        if isinstance(data[0], dict):
            headers = list(data[0].keys())
            table_data = [headers]
            
            for row in data:
                table_data.append([str(row.get(key, '')) for key in headers])
        else:
            # Assume list of lists
            table_data = data
        
        # Create table
        num_columns = len(table_data[0])
        col_width = (7.5 * inch) / num_columns  # Distribute width evenly
        
        export_table = Table(table_data, colWidths=[col_width] * num_columns, repeatRows=1)
        
        # Style table
        export_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2c3e50')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#dee2e6')),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('PADDING', (0, 0), (-1, -1), 4),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9f9f9')]),
        ]))
        
        elements.append(export_table)
        
        return elements
    
    def _create_summary_charts(self, data):
        """Create summary charts for export."""
        elements = []
        
        elements.append(Paragraph("DATA SUMMARY", self.styles['Heading1']))
        elements.append(Spacer(1, 10))
        
        # Add summary statistics
        num_records = len(data)
        elements.append(Paragraph(f"Total Records: {num_records:,}", self.styles['NormalText']))
        
        # Add timestamp
        elements.append(Paragraph(
            f"Export completed: {timezone.now().strftime('%Y-%m-%d %H:%M:%S')}",
            self.styles['SmallText']
        ))
        
        elements.append(Spacer(1, 20))
        
        return elements
    
    def _create_footer(self, report_data):
        """Create report footer."""
        elements = []
        
        elements.append(Spacer(1, 30))
        elements.append(Paragraph("- End of Report -", self.styles['NormalText']))
        elements.append(Spacer(1, 10))
        
        # Company information
        footer_text = """
        Super Legit Advance Ltd | Registered Office: Nairobi, Kenya | 
        Phone: +254 700 000 000 | Email: info@superlegitadvance.com | 
        Website: www.superlegitadvance.com
        """
        
        elements.append(Paragraph(footer_text, self.styles['FooterText']))
        
        # Confidential notice
        confidential = "CONFIDENTIAL - This report contains sensitive business information."
        elements.append(Paragraph(confidential, self.styles['FooterText']))
        
        return elements
    
    def _create_export_footer(self, title, num_records):
        """Create export footer."""
        elements = []
        
        elements.append(Spacer(1, 30))
        elements.append(Paragraph("- End of Export -", self.styles['NormalText']))
        elements.append(Spacer(1, 10))
        
        # Export summary
        summary = f"Export: {title} | Records: {num_records:,} | Generated: {timezone.now().strftime('%Y-%m-%d %H:%M:%S')}"
        elements.append(Paragraph(summary, self.styles['FooterText']))
        
        # Confidential notice
        confidential = "CONFIDENTIAL - This document contains proprietary information."
        elements.append(Paragraph(confidential, self.styles['FooterText']))
        
        return elements
    
    def _add_page_number(self, canvas, doc):
        """Add page number to each page."""
        canvas.saveState()
        canvas.setFont('Helvetica', 9)
        page_number = f"Page {doc.page}"
        canvas.drawRightString(doc.pagesize[0] - 72, 50, page_number)
        
        # Add company name at bottom left
        company_name = "Super Legit Advance"
        canvas.drawString(72, 50, company_name)
        
        canvas.restoreState()
    
    # Helper methods for loan calculations
    
    def _calculate_monthly_installment(self, loan):
        """Calculate monthly installment amount."""
        # Simplified calculation - in reality, use proper amortization formula
        if loan.amount_approved and loan.interest_rate and loan.term_months:
            monthly_rate = loan.interest_rate / 100 / 12
            numerator = monthly_rate * (1 + monthly_rate) ** loan.term_months
            denominator = (1 + monthly_rate) ** loan.term_months - 1
            return loan.amount_approved * (numerator / denominator)
        return Decimal('0')
    
    def _calculate_total_repayment(self, loan):
        """Calculate total repayment amount."""
        monthly_installment = self._calculate_monthly_installment(loan)
        return monthly_installment * loan.term_months if monthly_installment else Decimal('0')
    
    def _calculate_total_interest(self, loan):
        """Calculate total interest amount."""
        total_repayment = self._calculate_total_repayment(loan)
        return total_repayment - loan.amount_approved if total_repayment else Decimal('0')
    
    def _calculate_apr(self, loan):
        """Calculate Annual Percentage Rate."""
        # Simplified calculation
        total_interest = self._calculate_total_interest(loan)
        if loan.amount_approved and loan.term_months:
            return (total_interest / loan.amount_approved) * (12 / loan.term_months) * 100
        return 0
    
    def _calculate_first_payment_date(self, loan):
        """Calculate first payment date."""
        if loan.disbursement_date:
            # First payment is typically one month after disbursement
            from dateutil.relativedelta import relativedelta
            return loan.disbursement_date + relativedelta(months=1)
        return None
    
    def _generate_repayment_schedule(self, loan):
        """Generate repayment schedule."""
        schedule = []
        monthly_installment = self._calculate_monthly_installment(loan)
        balance = loan.amount_approved
        
        for i in range(1, loan.term_months + 1):
            interest = balance * (loan.interest_rate / 100 / 12)
            principal = monthly_installment - interest
            balance -= principal
            
            schedule.append({
                'installment_number': i,
                'due_date': self._calculate_first_payment_date(loan) + relativedelta(months=i-1) if self._calculate_first_payment_date(loan) else None,
                'principal': principal,
                'interest': interest,
                'total_due': monthly_installment,
                'remaining_balance': max(balance, Decimal('0')),
            })
        
        return schedule
    
    def _generate_detailed_schedule(self, loan):
        """Generate detailed repayment schedule."""
        schedule = self._generate_repayment_schedule(loan)
        detailed = []
        cumulative_principal = Decimal('0')
        cumulative_interest = Decimal('0')
        
        for i, installment in enumerate(schedule, 1):
            opening_balance = loan.amount_approved if i == 1 else detailed[-1]['closing_balance']
            principal = installment['principal']
            interest = installment['interest']
            total_due = installment['total_due']
            closing_balance = installment['remaining_balance']
            
            cumulative_principal += principal
            cumulative_interest += interest
            
            # Determine status (simplified)
            today = timezone.now().date()
            due_date = installment['due_date']
            
            if due_date:
                if due_date > today:
                    status = 'PENDING'
                elif due_date <= today:
                    status = 'PAID'  # Simplified - in reality check payment records
                else:
                    status = 'OVERDUE'
            else:
                status = 'PENDING'
            
            detailed.append({
                'installment_number': i,
                'due_date': due_date,
                'opening_balance': opening_balance,
                'principal': principal,
                'interest': interest,
                'total_due': total_due,
                'cumulative_principal': cumulative_principal,
                'cumulative_interest': cumulative_interest,
                'closing_balance': closing_balance,
                'status': status,
                'is_current': due_date and due_date.month == today.month and due_date.year == today.year,
            })
        
        return detailed
    
    def _generate_amortization_schedule(self, loan):
        """Generate amortization schedule."""
        detailed = self._generate_detailed_schedule(loan)
        amortization = []
        
        for installment in detailed:
            interest_percentage = (installment['interest'] / installment['total_due'] * 100) if installment['total_due'] > 0 else 0
            
            amortization.append({
                'month': installment['installment_number'],
                'payment_date': installment['due_date'],
                'beginning_balance': installment['opening_balance'],
                'payment': installment['total_due'],
                'principal': installment['principal'],
                'interest': installment['interest'],
                'ending_balance': installment['closing_balance'],
                'interest_percentage': interest_percentage,
                'cumulative_interest': installment['cumulative_interest'],
                'cumulative_principal': installment['cumulative_principal'],
            })
        
        return amortization