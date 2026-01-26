# backend/apps/notifications/services/email_service.py
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from django.conf import settings
from django.template.loader import render_to_string
from typing import Dict, List, Optional, Tuple, Any

logger = logging.getLogger(__name__)


class EmailService:
    """
    Service for sending email notifications.
    """
    
    def __init__(self):
        """Initialize email service with SMTP settings."""
        self.host = settings.EMAIL_HOST
        self.port = settings.EMAIL_PORT
        self.username = settings.EMAIL_HOST_USER
        self.password = settings.EMAIL_HOST_PASSWORD
        self.use_tls = settings.EMAIL_USE_TLS
        self.default_from = settings.DEFAULT_FROM_EMAIL
        
        # Test connection on initialization
        self.connected = self.test_connection()
        
        if self.connected:
            logger.info("Email service initialized successfully.")
        else:
            logger.warning("Email service initialized but connection test failed.")
    
    def send_email(
        self,
        recipient_email: str,
        subject: str,
        message: str,
        html_message: Optional[str] = None,
        from_email: Optional[str] = None,
        cc: Optional[List[str]] = None,
        bcc: Optional[List[str]] = None,
        attachments: Optional[List[Dict]] = None
    ) -> Tuple[bool, Dict]:
        """
        Send an email.
        
        Args:
            recipient_email: Recipient email address
            subject: Email subject
            message: Plain text message
            html_message: HTML message (optional)
            from_email: Sender email (default from settings)
            cc: List of CC recipients
            bcc: List of BCC recipients
            attachments: List of attachment dicts with 'filename' and 'content'
            
        Returns:
            Tuple of (success, response_data)
        """
        if not self.connected:
            # Try to reconnect
            self.connected = self.test_connection()
            if not self.connected:
                return False, {'error': 'Email service not connected to SMTP server'}
        
        if not recipient_email or not subject or not message:
            return False, {'error': 'Recipient, subject, and message are required'}
        
        # Use default from email if not provided
        from_email = from_email or self.default_from
        
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = from_email
            msg['To'] = recipient_email
            
            if cc:
                msg['Cc'] = ', '.join(cc)
            
            if bcc:
                msg['Bcc'] = ', '.join(bcc)
            
            # Create recipients list
            recipients = [recipient_email]
            if cc:
                recipients.extend(cc)
            if bcc:
                recipients.extend(bcc)
            
            # Add text part
            text_part = MIMEText(message, 'plain')
            msg.attach(text_part)
            
            # Add HTML part if provided
            if html_message:
                html_part = MIMEText(html_message, 'html')
                msg.attach(html_part)
            
            # Add attachments if any
            if attachments:
                from email.mime.base import MIMEBase
                from email import encoders
                
                for attachment in attachments:
                    filename = attachment.get('filename')
                    content = attachment.get('content')
                    content_type = attachment.get('content_type', 'application/octet-stream')
                    
                    if filename and content:
                        part = MIMEBase(*content_type.split('/', 1))
                        part.set_payload(content)
                        encoders.encode_base64(part)
                        part.add_header(
                            'Content-Disposition',
                            f'attachment; filename="{filename}"'
                        )
                        msg.attach(part)
            
            # Connect to SMTP server and send
            with smtplib.SMTP(self.host, self.port) as server:
                if self.use_tls:
                    server.starttls()
                
                if self.username and self.password:
                    server.login(self.username, self.password)
                
                server.send_message(msg, from_addr=from_email, to_addrs=recipients)
            
            logger.info(f"Email sent successfully to {recipient_email}")
            
            return True, {
                'recipient': recipient_email,
                'subject': subject,
                'from': from_email,
                'timestamp': self.get_current_timestamp()
            }
            
        except smtplib.SMTPAuthenticationError as e:
            error_msg = f"SMTP authentication failed: {str(e)}"
            logger.error(error_msg)
            return False, {'error': error_msg}
            
        except smtplib.SMTPException as e:
            error_msg = f"SMTP error: {str(e)}"
            logger.error(error_msg)
            return False, {'error': error_msg}
            
        except Exception as e:
            error_msg = f"Error sending email: {str(e)}"
            logger.error(error_msg)
            return False, {'error': error_msg}
    
    def send_template_email(
        self,
        recipient_email: str,
        template_name: str,
        context: Dict,
        subject: Optional[str] = None,
        from_email: Optional[str] = None,
        cc: Optional[List[str]] = None,
        bcc: Optional[List[str]] = None,
        attachments: Optional[List[Dict]] = None
    ) -> Tuple[bool, Dict]:
        """
        Send email using a Django template.
        
        Args:
            recipient_email: Recipient email address
            template_name: Django template name (without .txt/.html extension)
            context: Template context data
            subject: Email subject (optional, can be in template)
            from_email: Sender email (default from settings)
            cc: List of CC recipients
            bcc: List of BCC recipients
            attachments: List of attachments
            
        Returns:
            Tuple of (success, response_data)
        """
        try:
            # Render templates
            text_template = f"{template_name}.txt"
            html_template = f"{template_name}.html"
            
            text_message = render_to_string(text_template, context)
            
            try:
                html_message = render_to_string(html_template, context)
            except Exception:
                html_message = None
            
            # Get subject from context or use provided
            email_subject = subject or context.get('subject', '')
            
            return self.send_email(
                recipient_email=recipient_email,
                subject=email_subject,
                message=text_message,
                html_message=html_message,
                from_email=from_email,
                cc=cc,
                bcc=bcc,
                attachments=attachments
            )
            
        except Exception as e:
            error_msg = f"Error sending template email: {str(e)}"
            logger.error(error_msg)
            return False, {'error': error_msg}
    
    def send_bulk_emails(
        self,
        recipients: List[Dict],
        template_name: str,
        context: Dict,
        from_email: Optional[str] = None,
        cc: Optional[List[str]] = None,
        bcc: Optional[List[str]] = None
    ) -> Tuple[bool, List[Dict]]:
        """
        Send bulk emails using a template.
        
        Args:
            recipients: List of recipient dicts with 'email' and optional 'context'
            template_name: Django template name
            context: Common template context data
            from_email: Sender email
            cc: List of CC recipients
            bcc: List of BCC recipients
            
        Returns:
            Tuple of (overall_success, list_of_results)
        """
        results = []
        overall_success = True
        
        for recipient in recipients:
            recipient_email = recipient.get('email')
            recipient_context = recipient.get('context', {})
            
            # Merge common and recipient-specific context
            merged_context = {**context, **recipient_context}
            
            # Send email
            success, result = self.send_template_email(
                recipient_email=recipient_email,
                template_name=template_name,
                context=merged_context,
                from_email=from_email,
                cc=cc,
                bcc=bcc
            )
            
            results.append({
                'email': recipient_email,
                'success': success,
                'result': result
            })
            
            if not success:
                overall_success = False
        
        return overall_success, results
    
    def test_connection(self) -> bool:
        """
        Test SMTP server connection.
        
        Returns:
            True if connection successful
        """
        try:
            with smtplib.SMTP(self.host, self.port, timeout=10) as server:
                if self.use_tls:
                    server.starttls()
                
                if self.username and self.password:
                    server.login(self.username, self.password)
                
                # Send NOOP command to test connection
                server.noop()
            
            return True
            
        except Exception as e:
            logger.warning(f"SMTP connection test failed: {str(e)}")
            return False
    
    def validate_email_address(self, email: str) -> bool:
        """
        Validate email address format.
        
        Args:
            email: Email address to validate
            
        Returns:
            True if valid format
        """
        import re
        
        # Basic email validation regex
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    def get_email_quota(self) -> Dict:
        """
        Get email sending quota/limits (if applicable).
        
        Returns:
            Dictionary with quota information
        """
        # This is a placeholder - implement based on your email provider
        return {
            'provider': 'Custom SMTP',
            'daily_limit': None,  # None means no limit
            'hourly_limit': None,
            'sent_today': 0,  # You'd need to track this
            'sent_this_hour': 0,
            'can_send': True
        }
    
    def get_current_timestamp(self) -> str:
        """
        Get current timestamp in ISO format.
        
        Returns:
            ISO formatted timestamp
        """
        from datetime import datetime
        return datetime.now().isoformat()
    
    def format_email_address(self, name: str, email: str) -> str:
        """
        Format email address with name.
        
        Args:
            name: Recipient name
            email: Email address
            
        Returns:
            Formatted email address
        """
        return f'"{name}" <{email}>'
    
    def create_email_signature(self) -> str:
        """
        Create standard email signature.
        
        Returns:
            HTML email signature
        """
        return """
        <br><br>
        <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; color: #666; font-size: 12px;">
            <strong>Super Legit Advance</strong><br>
            Your Trusted Financial Partner<br>
            Email: support@superlegitadvance.com<br>
            Phone: +254 700 000 000<br>
            Website: <a href="https://superlegitadvance.com">superlegitadvance.com</a>
        </div>
        """
    
    def send_welcome_email(self, user_email: str, user_name: str) -> Tuple[bool, Dict]:
        """
        Send welcome email to new users.
        
        Args:
            user_email: User's email address
            user_name: User's name
            
        Returns:
            Tuple of (success, response_data)
        """
        context = {
            'user_name': user_name,
            'company_name': 'Super Legit Advance',
            'support_email': 'support@superlegitadvance.com',
            'website_url': 'https://superlegitadvance.com',
            'signature': self.create_email_signature()
        }
        
        return self.send_template_email(
            recipient_email=user_email,
            template_name='emails/welcome',
            context=context,
            subject=f'Welcome to Super Legit Advance, {user_name}!'
        )
    
    def send_password_reset_email(self, user_email: str, reset_link: str) -> Tuple[bool, Dict]:
        """
        Send password reset email.
        
        Args:
            user_email: User's email address
            reset_link: Password reset link
            
        Returns:
            Tuple of (success, response_data)
        """
        context = {
            'reset_link': reset_link,
            'company_name': 'Super Legit Advance',
            'support_email': 'support@superlegitadvance.com',
            'signature': self.create_email_signature()
        }
        
        return self.send_template_email(
            recipient_email=user_email,
            template_name='emails/password_reset',
            context=context,
            subject='Password Reset Request - Super Legit Advance'
        )
    
    def send_loan_approved_email(
        self,
        customer_email: str,
        customer_name: str,
        loan_details: Dict
    ) -> Tuple[bool, Dict]:
        """
        Send loan approval email.
        
        Args:
            customer_email: Customer's email address
            customer_name: Customer's name
            loan_details: Loan information dictionary
            
        Returns:
            Tuple of (success, response_data)
        """
        context = {
            'customer_name': customer_name,
            'loan_amount': loan_details.get('amount', 0),
            'loan_id': loan_details.get('loan_number', ''),
            'approval_date': loan_details.get('approval_date', ''),
            'disbursement_date': loan_details.get('disbursement_date', ''),
            'repayment_start': loan_details.get('repayment_start', ''),
            'monthly_installment': loan_details.get('monthly_installment', 0),
            'company_name': 'Super Legit Advance',
            'support_phone': '+254 700 000 000',
            'signature': self.create_email_signature()
        }
        
        return self.send_template_email(
            recipient_email=customer_email,
            template_name='emails/loan_approved',
            context=context,
            subject=f'Congratulations! Your Loan #{loan_details.get("loan_number", "")} Has Been Approved'
        )
    
    def send_payment_confirmation_email(
        self,
        customer_email: str,
        customer_name: str,
        payment_details: Dict
    ) -> Tuple[bool, Dict]:
        """
        Send payment confirmation email.
        
        Args:
            customer_email: Customer's email address
            customer_name: Customer's name
            payment_details: Payment information dictionary
            
        Returns:
            Tuple of (success, response_data)
        """
        context = {
            'customer_name': customer_name,
            'payment_amount': payment_details.get('amount', 0),
            'payment_date': payment_details.get('payment_date', ''),
            'payment_method': payment_details.get('method', 'M-Pesa'),
            'transaction_id': payment_details.get('transaction_id', ''),
            'loan_balance': payment_details.get('remaining_balance', 0),
            'next_payment_date': payment_details.get('next_payment_date', ''),
            'company_name': 'Super Legit Advance',
            'support_email': 'support@superlegitadvance.com',
            'signature': self.create_email_signature()
        }
        
        return self.send_template_email(
            recipient_email=customer_email,
            template_name='emails/payment_confirmation',
            context=context,
            subject=f'Payment Confirmation - KES {payment_details.get("amount", 0):,.2f}'
        )


# Singleton instance
email_service = EmailService()