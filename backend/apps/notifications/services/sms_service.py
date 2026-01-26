# backend/apps/notifications/services/sms_service.py
import africastalking
import requests
import json
import logging
from django.conf import settings
from django.utils import timezone
from datetime import datetime
from typing import Dict, Optional, Tuple, List

logger = logging.getLogger(__name__)


class SMSService:
    """
    Service for sending SMS messages using Africa's Talking API.
    """
    
    def __init__(self):
        """Initialize SMS service with Africa's Talking credentials."""
        self.username = settings.AFRICASTALKING_USERNAME
        self.api_key = settings.AFRICASTALKING_API_KEY
        self.sender_id = settings.SMS_SENDER_ID
        
        # Initialize Africa's Talking SDK
        try:
            africastalking.initialize(self.username, self.api_key)
            self.sms = africastalking.SMS
            self.initialized = True
            logger.info("Africa's Talking SDK initialized successfully.")
        except Exception as e:
            self.initialized = False
            logger.error(f"Failed to initialize Africa's Talking SDK: {str(e)}")
    
    def send_sms(
        self,
        phone_number: str,
        message: str,
        sender_id: Optional[str] = None,
        enqueue: bool = False
    ) -> Tuple[bool, Dict]:
        """
        Send an SMS message.
        
        Args:
            phone_number: Recipient phone number (format: +2547XXXXXXXX)
            message: SMS message content
            sender_id: Sender ID (default from settings)
            enqueue: Whether to enqueue message for later sending
            
        Returns:
            Tuple of (success, response_data)
        """
        if not self.initialized:
            return False, {'error': 'SMS service not initialized'}
        
        if not phone_number or not message:
            return False, {'error': 'Phone number and message are required'}
        
        # Format phone number
        phone_number = self.format_phone_number(phone_number)
        if not phone_number:
            return False, {'error': 'Invalid phone number format'}
        
        # Use default sender ID if not provided
        sender_id = sender_id or self.sender_id
        
        try:
            if enqueue:
                # Enqueue for bulk sending
                response = self.sms.send(
                    message=message,
                    recipients=[phone_number],
                    sender_id=sender_id,
                    enqueue=True
                )
            else:
                # Send immediately
                response = self.sms.send(
                    message=message,
                    recipients=[phone_number],
                    sender_id=sender_id
                )
            
            # Parse response
            success, result = self.parse_response(response)
            
            if success:
                logger.info(f"SMS sent successfully to {phone_number}. Message ID: {result.get('message_id')}")
            else:
                logger.error(f"Failed to send SMS to {phone_number}. Error: {result.get('error')}")
            
            return success, result
            
        except Exception as e:
            error_msg = f"Exception while sending SMS: {str(e)}"
            logger.error(error_msg)
            return False, {'error': error_msg}
    
    def send_bulk_sms(
        self,
        recipients: List[Dict],
        message_template: str,
        sender_id: Optional[str] = None
    ) -> Tuple[bool, List[Dict]]:
        """
        Send bulk SMS messages.
        
        Args:
            recipients: List of recipient dicts with 'phone' and optional 'context'
            message_template: Message template with {{variables}}
            sender_id: Sender ID (default from settings)
            
        Returns:
            Tuple of (overall_success, list_of_results)
        """
        if not self.initialized:
            return False, [{'error': 'SMS service not initialized'}]
        
        results = []
        overall_success = True
        
        for recipient in recipients:
            phone_number = recipient.get('phone')
            context = recipient.get('context', {})
            
            # Render message with context
            message = self.render_template(message_template, context)
            
            # Send SMS
            success, result = self.send_sms(phone_number, message, sender_id, enqueue=True)
            
            results.append({
                'phone_number': phone_number,
                'success': success,
                'result': result,
                'message': message
            })
            
            if not success:
                overall_success = False
        
        return overall_success, results
    
    def check_delivery_status(self, message_id: str) -> Optional[Dict]:
        """
        Check delivery status of an SMS.
        
        Args:
            message_id: Africa's Talking message ID
            
        Returns:
            Dictionary with status information or None if error
        """
        if not self.initialized:
            logger.error("SMS service not initialized")
            return None
        
        try:
            # Africa's Talking doesn't have a direct status check API for single messages
            # We can implement webhook-based status updates instead
            # For now, return a placeholder response
            return {
                'message_id': message_id,
                'status': 'SENT',  # Placeholder
                'message': 'Status check not fully implemented',
                'checked_at': timezone.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error checking delivery status: {str(e)}")
            return None
    
    def get_account_balance(self) -> Tuple[bool, Dict]:
        """
        Get Africa's Talking account balance.
        
        Returns:
            Tuple of (success, balance_data)
        """
        if not self.initialized:
            return False, {'error': 'SMS service not initialized'}
        
        try:
            # Africa's Talking provides balance via User service
            user_service = africastalking.User
            response = user_service.fetch_user_data()
            
            balance_data = {
                'balance': float(response.get('balance', 0)),
                'currency': 'KES',
                'account_type': response.get('accountType', ''),
                'username': response.get('userName', ''),
                'updated_at': timezone.now().isoformat()
            }
            
            logger.info(f"Account balance retrieved: {balance_data['balance']} {balance_data['currency']}")
            return True, balance_data
            
        except Exception as e:
            error_msg = f"Error fetching account balance: {str(e)}"
            logger.error(error_msg)
            return False, {'error': error_msg}
    
    def calculate_sms_cost(self, message: str, phone_number: Optional[str] = None) -> float:
        """
        Calculate SMS cost based on message length and recipient network.
        
        Args:
            message: SMS message content
            phone_number: Optional phone number for network-specific pricing
            
        Returns:
            Cost in KES
        """
        # Basic cost calculation
        # Africa's Talking charges per SMS segment (160 chars)
        message_length = len(message)
        
        if message_length <= 160:
            segments = 1
        else:
            # For messages > 160 chars, each 153 chars is a segment
            segments = (message_length - 1) // 153 + 1
        
        # Base cost per segment (adjust based on your Africa's Talking plan)
        cost_per_segment = 1.0  # KES per segment
        
        # Apply network multiplier if phone number provided
        network_multiplier = self.get_network_multiplier(phone_number)
        
        total_cost = segments * cost_per_segment * network_multiplier
        
        return round(total_cost, 2)
    
    def get_network_multiplier(self, phone_number: Optional[str]) -> float:
        """
        Get cost multiplier based on recipient network.
        
        Args:
            phone_number: Recipient phone number
            
        Returns:
            Cost multiplier (1.0 for most networks)
        """
        if not phone_number:
            return 1.0
        
        # Network prefixes in Kenya
        safaricom_prefixes = ['+2547', '+2541']
        airtel_prefixes = ['+2547']
        telkom_prefixes = ['+2547']
        
        for prefix in safaricom_prefixes:
            if phone_number.startswith(prefix):
                return 1.0  # Safaricom
        
        for prefix in airtel_prefixes:
            if phone_number.startswith(prefix):
                return 1.0  # Airtel
        
        for prefix in telkom_prefixes:
            if phone_number.startswith(prefix):
                return 1.0  # Telkom
        
        return 1.0  # Default multiplier
    
    def format_phone_number(self, phone_number: str) -> Optional[str]:
        """
        Format phone number to E.164 format.
        
        Args:
            phone_number: Raw phone number
            
        Returns:
            Formatted phone number or None if invalid
        """
        # Remove all non-digit characters except +
        cleaned = ''.join(c for c in phone_number if c.isdigit() or c == '+')
        
        # Check if already in international format
        if cleaned.startswith('+254'):
            if len(cleaned) == 13:  # +2547XXXXXXXX
                return cleaned
            else:
                return None
        
        # Convert local format to international
        if cleaned.startswith('254'):
            if len(cleaned) == 12:  # 2547XXXXXXXX
                return '+' + cleaned
            else:
                return None
        
        if cleaned.startswith('07'):
            if len(cleaned) == 10:  # 07XXXXXXXX
                return '+254' + cleaned[1:]
            else:
                return None
        
        if cleaned.startswith('7'):
            if len(cleaned) == 9:  # 7XXXXXXXX
                return '+254' + cleaned
            else:
                return None
        
        return None
    
    def render_template(self, template: str, context: Dict) -> str:
        """
        Render template with context variables.
        
        Args:
            template: Template string with {{variables}}
            context: Dictionary of variable values
            
        Returns:
            Rendered message
        """
        message = template
        for key, value in context.items():
            placeholder = f'{{{{{key}}}}}'
            message = message.replace(placeholder, str(value))
        
        return message
    
    def parse_response(self, response: Dict) -> Tuple[bool, Dict]:
        """
        Parse Africa's Talking API response.
        
        Args:
            response: API response dictionary
            
        Returns:
            Tuple of (success, parsed_result)
        """
        try:
            # Africa's Talking response structure
            if response.get('SMSMessageData'):
                message_data = response['SMSMessageData']
                recipients = message_data.get('Recipients', [])
                
                if recipients:
                    recipient = recipients[0]
                    success = recipient.get('statusCode') == 101
                    
                    result = {
                        'message_id': recipient.get('messageId'),
                        'status': recipient.get('status'),
                        'status_code': recipient.get('statusCode'),
                        'number': recipient.get('number'),
                        'cost': recipient.get('cost'),
                        'provider_response': response
                    }
                    
                    return success, result
            
            # If we can't parse the response, assume failure
            return False, {
                'error': 'Unable to parse API response',
                'raw_response': response
            }
            
        except Exception as e:
            return False, {
                'error': f'Error parsing response: {str(e)}',
                'raw_response': response
            }
    
    def validate_phone_number(self, phone_number: str) -> bool:
        """
        Validate phone number format.
        
        Args:
            phone_number: Phone number to validate
            
        Returns:
            True if valid, False otherwise
        """
        formatted = self.format_phone_number(phone_number)
        return formatted is not None
    
    def get_sms_character_count(self, message: str) -> Dict:
        """
        Get SMS character count and segment information.
        
        Args:
            message: SMS message
            
        Returns:
            Dictionary with character count and segment info
        """
        char_count = len(message)
        
        if char_count <= 160:
            segments = 1
            chars_remaining = 160 - char_count
        else:
            segments = (char_count - 1) // 153 + 1
            chars_remaining = segments * 153 - char_count
        
        return {
            'characters': char_count,
            'segments': segments,
            'chars_remaining': chars_remaining,
            'is_single_segment': segments == 1,
            'cost': self.calculate_sms_cost(message)
        }
    
    def handle_delivery_report(self, delivery_data: Dict) -> bool:
        """
        Handle SMS delivery report from Africa's Talking webhook.
        
        Args:
            delivery_data: Delivery report data
            
        Returns:
            True if processed successfully
        """
        try:
            # Parse delivery report
            status = delivery_data.get('status')
            message_id = delivery_data.get('id')
            phone_number = delivery_data.get('phoneNumber')
            network_code = delivery_data.get('networkCode')
            failure_reason = delivery_data.get('failureReason')
            
            logger.info(f"Delivery report received: {message_id} - {status}")
            
            # Update SMS log in database
            from apps.notifications.models import SMSLog
            
            try:
                sms_log = SMSLog.objects.get(message_id=message_id)
                
                if status == 'Success':
                    sms_log.mark_as_delivered(network_code=network_code)
                elif status == 'Failed':
                    sms_log.mark_as_failed(failure_reason or 'Delivery failed')
                else:
                    sms_log.update_status(status.upper())
                
                return True
                
            except SMSLog.DoesNotExist:
                logger.warning(f"No SMS log found for message ID: {message_id}")
                return False
                
        except Exception as e:
            logger.error(f"Error processing delivery report: {str(e)}")
            return False


# Singleton instance
sms_service = SMSService()