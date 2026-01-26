# backend/apps/mpesa/utils/security.py
import hashlib
import hmac
import base64
import json
from django.conf import settings
from cryptography.fernet import Fernet
import logging

logger = logging.getLogger(__name__)


def validate_mpesa_signature(data, signature, secret_key=None):
    """
    Validate M-Pesa callback signature.
    
    Args:
        data (dict): Callback data
        signature (str): Provided signature
        secret_key (str): Secret key for validation
        
    Returns:
        bool: True if signature is valid
    """
    try:
        if not secret_key:
            secret_key = getattr(settings, 'MPESA_CALLBACK_SECRET', '')
        
        if not secret_key:
            logger.warning("No secret key configured for signature validation")
            return True  # Skip validation if no key configured
        
        # Create signature string
        signature_string = json.dumps(data, sort_keys=True, separators=(',', ':'))
        
        # Generate HMAC SHA256 signature
        expected_signature = hmac.new(
            secret_key.encode(),
            signature_string.encode(),
            hashlib.sha256
        ).hexdigest()
        
        # Compare signatures
        return hmac.compare_digest(expected_signature, signature)
        
    except Exception as e:
        logger.error(f"Error validating signature: {str(e)}")
        return False


def generate_mpesa_signature(data, secret_key=None):
    """
    Generate M-Pesa signature for outgoing requests.
    
    Args:
        data (dict): Request data
        secret_key (str): Secret key for signing
        
    Returns:
        str: Generated signature
    """
    try:
        if not secret_key:
            secret_key = getattr(settings, 'MPESA_API_SECRET', '')
        
        if not secret_key:
            raise ValueError("No secret key configured for signature generation")
        
        # Create signature string
        signature_string = json.dumps(data, sort_keys=True, separators=(',', ':'))
        
        # Generate HMAC SHA256 signature
        signature = hmac.new(
            secret_key.encode(),
            signature_string.encode(),
            hashlib.sha256
        ).hexdigest()
        
        return signature
        
    except Exception as e:
        logger.error(f"Error generating signature: {str(e)}")
        raise


def encrypt_mpesa_data(data, key=None):
    """
    Encrypt sensitive M-Pesa data.
    
    Args:
        data (dict): Data to encrypt
        key (str): Encryption key
        
    Returns:
        str: Encrypted data (base64 encoded)
    """
    try:
        if not key:
            key = getattr(settings, 'MPESA_ENCRYPTION_KEY', None)
        
        if not key:
            logger.warning("No encryption key configured, returning plain data")
            return json.dumps(data)
        
        # Ensure key is proper length for Fernet (32 bytes)
        if len(key) < 32:
            key = key.ljust(32, '0')
        elif len(key) > 32:
            key = key[:32]
        
        # Convert to URL-safe base64
        key = base64.urlsafe_b64encode(key.encode())
        
        # Create cipher
        cipher = Fernet(key)
        
        # Encrypt data
        json_data = json.dumps(data).encode()
        encrypted_data = cipher.encrypt(json_data)
        
        return encrypted_data.decode()
        
    except Exception as e:
        logger.error(f"Error encrypting data: {str(e)}")
        raise


def decrypt_mpesa_data(encrypted_data, key=None):
    """
    Decrypt M-Pesa data.
    
    Args:
        encrypted_data (str): Encrypted data
        key (str): Decryption key
        
    Returns:
        dict: Decrypted data
    """
    try:
        if not key:
            key = getattr(settings, 'MPESA_ENCRYPTION_KEY', None)
        
        if not key:
            logger.warning("No decryption key configured, assuming plain data")
            try:
                return json.loads(encrypted_data)
            except json.JSONDecodeError:
                raise ValueError("Invalid JSON data")
        
        # Ensure key is proper length for Fernet (32 bytes)
        if len(key) < 32:
            key = key.ljust(32, '0')
        elif len(key) > 32:
            key = key[:32]
        
        # Convert to URL-safe base64
        key = base64.urlsafe_b64encode(key.encode())
        
        # Create cipher
        cipher = Fernet(key)
        
        # Decrypt data
        decrypted_data = cipher.decrypt(encrypted_data.encode())
        
        return json.loads(decrypted_data.decode())
        
    except Exception as e:
        logger.error(f"Error decrypting data: {str(e)}")
        raise


def verify_mpesa_ip(ip_address):
    """
    Verify that request is from M-Pesa IP addresses.
    
    Args:
        ip_address (str): Client IP address
        
    Returns:
        bool: True if IP is from M-Pesa
    """
    # M-Pesa IP ranges (Safaricom)
    mpesa_ip_ranges = [
        '196.201.214.',  # Safaricom IP range
        '196.201.212.',
        '196.201.213.',
        '196.201.214.',
        '196.201.215.',
        '196.201.216.',
        '196.201.217.',
        '41.204.161.',   # Additional Safaricom IPs
        '41.204.162.',
        '41.204.163.',
        '41.204.164.',
        '41.204.165.',
        '41.204.166.',
        '41.204.167.',
        '41.204.168.',
        '41.204.169.',
        '41.204.170.',
        '41.204.171.',
        '41.204.172.',
        '41.204.173.',
        '41.204.174.',
        '41.204.175.',
        '41.204.176.',
        '41.204.177.',
        '41.204.178.',
        '41.204.179.',
        '41.204.180.',
        '41.204.181.',
        '41.204.182.',
        '41.204.183.',
        '41.204.184.',
        '41.204.185.',
        '41.204.186.',
        '41.204.187.',
        '41.204.188.',
        '41.204.189.',
        '41.204.190.',
        '41.204.191.',
    ]
    
    # Check if IP matches any M-Pesa range
    for ip_range in mpesa_ip_ranges:
        if ip_address.startswith(ip_range):
            return True
    
    # For development/testing, allow localhost and internal IPs
    if settings.DEBUG:
        allowed_ips = ['127.0.0.1', 'localhost', '::1']
        if ip_address in allowed_ips:
            return True
        
        # Allow internal network IPs
        if ip_address.startswith('192.168.') or ip_address.startswith('10.'):
            return True
    
    return False


def sanitize_phone_number(phone_number):
    """
    Sanitize and validate phone number.
    
    Args:
        phone_number (str): Raw phone number
        
    Returns:
        str: Sanitized phone number or None if invalid
    """
    import re
    
    if not phone_number:
        return None
    
    # Remove any non-digit characters except +
    phone_number = re.sub(r'[^\d+]', '', phone_number)
    
    # Check if it's a valid Kenyan number
    kenyan_patterns = [
        r'^\+2547\d{8}$',      # +2547XXXXXXXX
        r'^2547\d{8}$',        # 2547XXXXXXXX
        r'^07\d{8}$',          # 07XXXXXXXX
        r'^7\d{8}$',           # 7XXXXXXXX (without country code)
    ]
    
    for pattern in kenyan_patterns:
        if re.match(pattern, phone_number):
            # Convert to standard format (+2547XXXXXXXX)
            if phone_number.startswith('0'):
                return '+254' + phone_number[1:]
            elif phone_number.startswith('254'):
                return '+' + phone_number
            elif phone_number.startswith('7') and len(phone_number) == 9:
                return '+254' + phone_number
            elif phone_number.startswith('+254'):
                return phone_number
    
    return None


def generate_api_key():
    """
    Generate API key for M-Pesa integration.
    
    Returns:
        str: Generated API key
    """
    import secrets
    import string
    
    # Generate random string
    alphabet = string.ascii_letters + string.digits
    api_key = ''.join(secrets.choice(alphabet) for _ in range(32))
    
    return api_key


def validate_api_key(api_key):
    """
    Validate API key.
    
    Args:
        api_key (str): API key to validate
        
    Returns:
        bool: True if valid
    """
    expected_key = getattr(settings, 'MPESA_API_KEY', None)
    
    if not expected_key:
        logger.warning("No API key configured for validation")
        return True  # Skip validation if no key configured
    
    return api_key == expected_key