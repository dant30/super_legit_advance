# backend/apps/mpesa/services/mpesa_service.py
import base64
import datetime
import requests
import json
from django.conf import settings
from django.utils import timezone
from requests.auth import HTTPBasicAuth
import logging

logger = logging.getLogger(__name__)


class MpesaService:
    """
    M-Pesa Service for handling M-Pesa API operations.
    """
    
    def __init__(self, environment=None):
        """
        Initialize M-Pesa service.
        
        Args:
            environment (str): 'sandbox' or 'production'. Defaults to settings.
        """
        self.environment = environment or getattr(settings, 'MPESA_ENVIRONMENT', 'sandbox')
        
        if self.environment == 'sandbox':
            self.base_url = "https://sandbox.safaricom.co.ke"
        else:
            self.base_url = "https://api.safaricom.co.ke"
        
        # Load credentials from settings
        self.consumer_key = getattr(settings, 'MPESA_CONSUMER_KEY', '')
        self.consumer_secret = getattr(settings, 'MPESA_CONSUMER_SECRET', '')
        self.shortcode = getattr(settings, 'MPESA_SHORTCODE', '')
        self.passkey = getattr(settings, 'MPESA_PASSKEY', '')
        
        # Initialize access token
        self.access_token = None
        self.token_expiry = None
    
    def get_access_token(self):
        """
        Get OAuth access token from M-Pesa.
        
        Returns:
            str: Access token or None if failed
        """
        # Check if token is still valid
        if self.access_token and self.token_expiry and timezone.now() < self.token_expiry:
            return self.access_token
        
        try:
            url = f"{self.base_url}/oauth/v1/generate?grant_type=client_credentials"
            auth = HTTPBasicAuth(self.consumer_key, self.consumer_secret)
            headers = {'Content-Type': 'application/json'}
            
            response = requests.get(url, auth=auth, headers=headers, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            self.access_token = data.get('access_token')
            
            # Set expiry (M-Pesa tokens expire in 1 hour)
            self.token_expiry = timezone.now() + datetime.timedelta(seconds=3500)  # 58.3 minutes
            
            logger.info("Successfully obtained M-Pesa access token")
            return self.access_token
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to get M-Pesa access token: {str(e)}")
            return None
        except (KeyError, ValueError) as e:
            logger.error(f"Invalid response from M-Pesa token endpoint: {str(e)}")
            return None
    
    def generate_password(self, timestamp=None):
        """
        Generate M-Pesa API password.
        
        Args:
            timestamp (str): Timestamp in format YYYYMMDDHHMMSS
            
        Returns:
            tuple: (password, timestamp)
        """
        if not timestamp:
            timestamp = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
        
        data = f"{self.shortcode}{self.passkey}{timestamp}"
        password = base64.b64encode(data.encode()).decode()
        
        return password, timestamp
    
    def stk_push(self, phone_number, amount, account_reference, transaction_desc, callback_url):
        """
        Initiate STK Push request.
        
        Args:
            phone_number (str): Customer phone number
            amount (float): Amount to charge
            account_reference (str): Account reference
            transaction_desc (str): Transaction description
            callback_url (str): Callback URL
            
        Returns:
            dict: Response data
        """
        access_token = self.get_access_token()
        if not access_token:
            return {
                'success': False,
                'message': 'Failed to get access token',
                'error_code': 'AUTH_ERROR'
            }
        
        try:
            url = f"{self.base_url}/mpesa/stkpush/v1/processrequest"
            
            # Generate password
            timestamp = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
            password, _ = self.generate_password(timestamp)
            
            # Format phone number
            if phone_number.startswith('0'):
                phone_number = '254' + phone_number[1:]
            elif phone_number.startswith('+254'):
                phone_number = phone_number[1:]
            
            # Prepare request payload
            payload = {
                "BusinessShortCode": self.shortcode,
                "Password": password,
                "Timestamp": timestamp,
                "TransactionType": "CustomerPayBillOnline",
                "Amount": int(amount),
                "PartyA": phone_number,
                "PartyB": self.shortcode,
                "PhoneNumber": phone_number,
                "CallBackURL": callback_url,
                "AccountReference": account_reference,
                "TransactionDesc": transaction_desc
            }
            
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            if 'ResponseCode' in data and data['ResponseCode'] == '0':
                return {
                    'success': True,
                    'message': 'STK push initiated successfully',
                    'merchant_request_id': data.get('MerchantRequestID'),
                    'checkout_request_id': data.get('CheckoutRequestID'),
                    'response_code': data.get('ResponseCode'),
                    'response_description': data.get('ResponseDescription'),
                    'customer_message': data.get('CustomerMessage'),
                    'raw_response': data
                }
            else:
                error_code = data.get('errorCode') or data.get('ResponseCode', 'UNKNOWN')
                error_message = data.get('errorMessage') or data.get('ResponseDescription', 'Unknown error')
                
                return {
                    'success': False,
                    'message': 'Failed to initiate STK push',
                    'error_code': error_code,
                    'error_message': error_message,
                    'raw_response': data
                }
                
        except requests.exceptions.RequestException as e:
            logger.error(f"STK push request failed: {str(e)}")
            return {
                'success': False,
                'message': 'Network error during STK push',
                'error_code': 'NETWORK_ERROR',
                'error_message': str(e)
            }
        except Exception as e:
            logger.error(f"Unexpected error during STK push: {str(e)}")
            return {
                'success': False,
                'message': 'Unexpected error during STK push',
                'error_code': 'UNEXPECTED_ERROR',
                'error_message': str(e)
            }
    
    def query_transaction_status(self, checkout_request_id):
        """
        Query transaction status.
        
        Args:
            checkout_request_id (str): Checkout request ID from STK push
            
        Returns:
            dict: Transaction status
        """
        access_token = self.get_access_token()
        if not access_token:
            return {
                'success': False,
                'message': 'Failed to get access token',
                'error_code': 'AUTH_ERROR'
            }
        
        try:
            url = f"{self.base_url}/mpesa/stkpushquery/v1/query"
            
            # Generate password
            timestamp = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
            password, _ = self.generate_password(timestamp)
            
            # Prepare request payload
            payload = {
                "BusinessShortCode": self.shortcode,
                "Password": password,
                "Timestamp": timestamp,
                "CheckoutRequestID": checkout_request_id
            }
            
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            if 'ResponseCode' in data and data['ResponseCode'] == '0':
                result_code = data.get('ResultCode')
                result_description = data.get('ResultDesc')
                
                return {
                    'success': True,
                    'message': 'Transaction status retrieved successfully',
                    'result_code': result_code,
                    'result_description': result_description,
                    'merchant_request_id': data.get('MerchantRequestID'),
                    'checkout_request_id': data.get('CheckoutRequestID'),
                    'raw_response': data
                }
            else:
                error_code = data.get('errorCode') or data.get('ResponseCode', 'UNKNOWN')
                error_message = data.get('errorMessage') or data.get('ResponseDescription', 'Unknown error')
                
                return {
                    'success': False,
                    'message': 'Failed to query transaction status',
                    'error_code': error_code,
                    'error_message': error_message,
                    'raw_response': data
                }
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Transaction query failed: {str(e)}")
            return {
                'success': False,
                'message': 'Network error during transaction query',
                'error_code': 'NETWORK_ERROR',
                'error_message': str(e)
            }
        except Exception as e:
            logger.error(f"Unexpected error during transaction query: {str(e)}")
            return {
                'success': False,
                'message': 'Unexpected error during transaction query',
                'error_code': 'UNEXPECTED_ERROR',
                'error_message': str(e)
            }
    
    def reverse_transaction(self, transaction_id, amount, remarks):
        """
        Reverse a transaction.
        
        Args:
            transaction_id (str): M-Pesa transaction ID
            amount (float): Amount to reverse
            remarks (str): Reason for reversal
            
        Returns:
            dict: Reversal response
        """
        access_token = self.get_access_token()
        if not access_token:
            return {
                'success': False,
                'message': 'Failed to get access token',
                'error_code': 'AUTH_ERROR'
            }
        
        try:
            url = f"{self.base_url}/mpesa/reversal/v1/request"
            
            # Generate password
            timestamp = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
            password, _ = self.generate_password(timestamp)
            
            # Generate unique identifier
            identifier = f"REV{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}"
            
            # Prepare request payload
            payload = {
                "CommandID": "TransactionReversal",
                "Initiator": "initiator_name",  # Should be configured in settings
                "SecurityCredential": self.get_security_credential(),  # Requires encryption
                "TransactionID": transaction_id,
                "Amount": int(amount),
                "ReceiverParty": self.shortcode,
                "RecieverIdentifierType": "11",
                "ResultURL": f"{settings.MPESA_CALLBACK_URL}/reversal/result/",
                "QueueTimeOutURL": f"{settings.MPESA_CALLBACK_URL}/reversal/timeout/",
                "Remarks": remarks,
                "Occasion": "Reversal"
            }
            
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            if 'ResponseCode' in data and data['ResponseCode'] == '0':
                return {
                    'success': True,
                    'message': 'Reversal initiated successfully',
                    'conversation_id': data.get('ConversationID'),
                    'originator_conversation_id': data.get('OriginatorConversationID'),
                    'response_code': data.get('ResponseCode'),
                    'response_description': data.get('ResponseDescription'),
                    'raw_response': data
                }
            else:
                error_code = data.get('errorCode') or data.get('ResponseCode', 'UNKNOWN')
                error_message = data.get('errorMessage') or data.get('ResponseDescription', 'Unknown error')
                
                return {
                    'success': False,
                    'message': 'Failed to initiate reversal',
                    'error_code': error_code,
                    'error_message': error_message,
                    'raw_response': data
                }
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Reversal request failed: {str(e)}")
            return {
                'success': False,
                'message': 'Network error during reversal',
                'error_code': 'NETWORK_ERROR',
                'error_message': str(e)
            }
        except Exception as e:
            logger.error(f"Unexpected error during reversal: {str(e)}")
            return {
                'success': False,
                'message': 'Unexpected error during reversal',
                'error_code': 'UNEXPECTED_ERROR',
                'error_message': str(e)
            }
    
    def get_security_credential(self):
        """
        Get security credential (encrypted initiator password).
        This requires proper encryption implementation.
        
        Returns:
            str: Encrypted security credential
        """
        # This is a simplified version. In production, you need to properly
        # encrypt the initiator password using the M-Pesa public key.
        initiator_password = getattr(settings, 'MPESA_INITIATOR_PASSWORD', '')
        
        # For sandbox, you might not need proper encryption
        if self.environment == 'sandbox':
            return initiator_password
        
        # In production, implement proper RSA encryption
        # This is a placeholder - implement proper encryption
        try:
            # Example using cryptography library
            from cryptography.hazmat.primitives import serialization, hashes
            from cryptography.hazmat.primitives.asymmetric import padding
            from cryptography.hazmat.backends import default_backend
            
            # Load M-Pesa public key
            public_key_pem = getattr(settings, 'MPESA_PUBLIC_KEY', '')
            if not public_key_pem:
                logger.error("M-Pesa public key not configured")
                return initiator_password
            
            public_key = serialization.load_pem_public_key(
                public_key_pem.encode(),
                backend=default_backend()
            )
            
            # Encrypt the password
            encrypted = public_key.encrypt(
                initiator_password.encode(),
                padding.PKCS1v15()
            )
            
            return base64.b64encode(encrypted).decode()
            
        except ImportError:
            logger.error("Cryptography library not installed")
            return initiator_password
        except Exception as e:
            logger.error(f"Failed to encrypt security credential: {str(e)}")
            return initiator_password
    
    def register_c2b_urls(self, validation_url, confirmation_url):
        """
        Register C2B URLs with M-Pesa.
        
        Args:
            validation_url (str): Validation callback URL
            confirmation_url (str): Confirmation callback URL
            
        Returns:
            dict: Registration response
        """
        access_token = self.get_access_token()
        if not access_token:
            return {
                'success': False,
                'message': 'Failed to get access token',
                'error_code': 'AUTH_ERROR'
            }
        
        try:
            url = f"{self.base_url}/mpesa/c2b/v1/registerurl"
            
            payload = {
                "ShortCode": self.shortcode,
                "ResponseType": "Completed",
                "ConfirmationURL": confirmation_url,
                "ValidationURL": validation_url
            }
            
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            if 'ResponseCode' in data and data['ResponseCode'] == '0':
                return {
                    'success': True,
                    'message': 'C2B URLs registered successfully',
                    'response_code': data.get('ResponseCode'),
                    'response_description': data.get('ResponseDescription'),
                    'raw_response': data
                }
            else:
                error_code = data.get('errorCode') or data.get('ResponseCode', 'UNKNOWN')
                error_message = data.get('errorMessage') or data.get('ResponseDescription', 'Unknown error')
                
                return {
                    'success': False,
                    'message': 'Failed to register C2B URLs',
                    'error_code': error_code,
                    'error_message': error_message,
                    'raw_response': data
                }
                
        except requests.exceptions.RequestException as e:
            logger.error(f"C2B URL registration failed: {str(e)}")
            return {
                'success': False,
                'message': 'Network error during C2B URL registration',
                'error_code': 'NETWORK_ERROR',
                'error_message': str(e)
            }
        except Exception as e:
            logger.error(f"Unexpected error during C2B URL registration: {str(e)}")
            return {
                'success': False,
                'message': 'Unexpected error during C2B URL registration',
                'error_code': 'UNEXPECTED_ERROR',
                'error_message': str(e)
            }
    
    def b2c_payment(self, phone_number, amount, remarks, occasion=""):
        """
        Initiate B2C payment (disbursement).
        
        Args:
            phone_number (str): Recipient phone number
            amount (float): Amount to send
            remarks (str): Payment remarks
            occasion (str): Occasion (optional)
            
        Returns:
            dict: B2C response
        """
        access_token = self.get_access_token()
        if not access_token:
            return {
                'success': False,
                'message': 'Failed to get access token',
                'error_code': 'AUTH_ERROR'
            }
        
        try:
            url = f"{self.base_url}/mpesa/b2c/v1/paymentrequest"
            
            # Prepare request payload
            payload = {
                "InitiatorName": "initiator_name",  # Should be configured in settings
                "SecurityCredential": self.get_security_credential(),
                "CommandID": "BusinessPayment",
                "Amount": int(amount),
                "PartyA": self.shortcode,
                "PartyB": phone_number,
                "Remarks": remarks,
                "QueueTimeOutURL": f"{settings.MPESA_CALLBACK_URL}/b2c/timeout/",
                "ResultURL": f"{settings.MPESA_CALLBACK_URL}/b2c/result/",
                "Occasion": occasion
            }
            
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            if 'ResponseCode' in data and data['ResponseCode'] == '0':
                return {
                    'success': True,
                    'message': 'B2C payment initiated successfully',
                    'conversation_id': data.get('ConversationID'),
                    'originator_conversation_id': data.get('OriginatorConversationID'),
                    'response_code': data.get('ResponseCode'),
                    'response_description': data.get('ResponseDescription'),
                    'raw_response': data
                }
            else:
                error_code = data.get('errorCode') or data.get('ResponseCode', 'UNKNOWN')
                error_message = data.get('errorMessage') or data.get('ResponseDescription', 'Unknown error')
                
                return {
                    'success': False,
                    'message': 'Failed to initiate B2C payment',
                    'error_code': error_code,
                    'error_message': error_message,
                    'raw_response': data
                }
                
        except requests.exceptions.RequestException as e:
            logger.error(f"B2C payment failed: {str(e)}")
            return {
                'success': False,
                'message': 'Network error during B2C payment',
                'error_code': 'NETWORK_ERROR',
                'error_message': str(e)
            }
        except Exception as e:
            logger.error(f"Unexpected error during B2C payment: {str(e)}")
            return {
                'success': False,
                'message': 'Unexpected error during B2C payment',
                'error_code': 'UNEXPECTED_ERROR',
                'error_message': str(e)
            }
    
    def check_balance(self):
        """
        Check account balance.
        
        Returns:
            dict: Balance response
        """
        access_token = self.get_access_token()
        if not access_token:
            return {
                'success': False,
                'message': 'Failed to get access token',
                'error_code': 'AUTH_ERROR'
            }
        
        try:
            url = f"{self.base_url}/mpesa/accountbalance/v1/query"
            
            # Generate password
            timestamp = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
            password, _ = self.generate_password(timestamp)
            
            # Prepare request payload
            payload = {
                "Initiator": "initiator_name",  # Should be configured in settings
                "SecurityCredential": self.get_security_credential(),
                "CommandID": "AccountBalance",
                "PartyA": self.shortcode,
                "IdentifierType": "4",
                "Remarks": "Balance check",
                "QueueTimeOutURL": f"{settings.MPESA_CALLBACK_URL}/balance/timeout/",
                "ResultURL": f"{settings.MPESA_CALLBACK_URL}/balance/result/"
            }
            
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            if 'ResponseCode' in data and data['ResponseCode'] == '0':
                return {
                    'success': True,
                    'message': 'Balance check initiated successfully',
                    'conversation_id': data.get('ConversationID'),
                    'originator_conversation_id': data.get('OriginatorConversationID'),
                    'response_code': data.get('ResponseCode'),
                    'response_description': data.get('ResponseDescription'),
                    'raw_response': data
                }
            else:
                error_code = data.get('errorCode') or data.get('ResponseCode', 'UNKNOWN')
                error_message = data.get('errorMessage') or data.get('ResponseDescription', 'Unknown error')
                
                return {
                    'success': False,
                    'message': 'Failed to check balance',
                    'error_code': error_code,
                    'error_message': error_message,
                    'raw_response': data
                }
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Balance check failed: {str(e)}")
            return {
                'success': False,
                'message': 'Network error during balance check',
                'error_code': 'NETWORK_ERROR',
                'error_message': str(e)
            }
        except Exception as e:
            logger.error(f"Unexpected error during balance check: {str(e)}")
            return {
                'success': False,
                'message': 'Unexpected error during balance check',
                'error_code': 'UNEXPECTED_ERROR',
                'error_message': str(e)
            }