# backend/apps/mpesa/utils/helpers.py
import re
import datetime
from django.utils import timezone
from django.conf import settings


def format_phone_number(phone_number):
    """
    Format phone number to M-Pesa format (+254XXXXXXXXX).
    
    Args:
        phone_number (str): Raw phone number
        
    Returns:
        str: Formatted phone number
    """
    if not phone_number:
        return None
    
    # Remove any non-digit characters except +
    phone_number = re.sub(r'[^\d+]', '', phone_number)
    
    # Convert to M-Pesa format
    if phone_number.startswith('0'):
        phone_number = '+254' + phone_number[1:]
    elif phone_number.startswith('254'):
        phone_number = '+' + phone_number
    elif phone_number.startswith('7') and len(phone_number) == 9:
        phone_number = '+254' + phone_number
    elif not phone_number.startswith('+254'):
        # Assume it's a 9-digit number without prefix
        if len(phone_number) == 9 and phone_number.startswith('7'):
            phone_number = '+254' + phone_number
        else:
            # Try to extract last 9 digits
            phone_number = phone_number[-9:]
            if phone_number.startswith('7'):
                phone_number = '+254' + phone_number
    
    return phone_number


def generate_transaction_id(prefix='TXN'):
    """
    Generate unique transaction ID.
    
    Args:
        prefix (str): Transaction ID prefix
        
    Returns:
        str: Generated transaction ID
    """
    import uuid
    import time
    
    # Generate timestamp-based ID
    timestamp = int(time.time() * 1000)
    random_str = str(uuid.uuid4())[:8].upper()
    
    return f"{prefix}-{timestamp}-{random_str}"


def parse_mpesa_date(date_string):
    """
    Parse M-Pesa date string to datetime object.
    
    Args:
        date_string (str): Date string in M-Pesa format (YYYYMMDDHHMMSS)
        
    Returns:
        datetime: Parsed datetime object
    """
    try:
        if not date_string:
            return timezone.now()
        
        # M-Pesa date format: YYYYMMDDHHMMSS
        date_obj = datetime.datetime.strptime(date_string, '%Y%m%d%H%M%S')
        
        # Make timezone aware
        if timezone.is_naive(date_obj):
            date_obj = timezone.make_aware(date_obj)
        
        return date_obj
        
    except (ValueError, TypeError):
        return timezone.now()


def calculate_transaction_fee(amount):
    """
    Calculate M-Pesa transaction fee based on amount.
    
    Args:
        amount (float): Transaction amount in KES
        
    Returns:
        float: Transaction fee
    """
    # M-Pesa transaction fees (as of 2024)
    # Source: https://www.safaricom.co.ke/personal/m-pesa/rates
    
    fee_tiers = [
        (1, 49, 0),
        (50, 100, 7),
        (101, 500, 13),
        (501, 1000, 24),
        (1001, 1500, 30),
        (1501, 2500, 44),
        (2501, 3500, 54),
        (3501, 5000, 66),
        (5001, 7500, 82),
        (7501, 10000, 110),
        (10001, 15000, 165),
        (15001, 20000, 187),
        (20001, 35000, 275),
        (35001, 50000, 297),
        (50001, 150000, 330),
    ]
    
    for min_amount, max_amount, fee in fee_tiers:
        if min_amount <= amount <= max_amount:
            return fee
    
    # For amounts above 150,000, fee is 330 + 0.5% of excess
    if amount > 150000:
        excess = amount - 150000
        additional_fee = excess * 0.005  # 0.5%
        return 330 + additional_fee
    
    return 0


def format_amount(amount, currency='KES'):
    """
    Format amount with currency symbol.
    
    Args:
        amount (float): Amount
        currency (str): Currency code
        
    Returns:
        str: Formatted amount
    """
    currency_symbols = {
        'KES': 'KES ',
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
    }
    
    symbol = currency_symbols.get(currency, currency + ' ')
    
    return f"{symbol}{amount:,.2f}"


def get_mpesa_environment():
    """
    Get M-Pesa environment configuration.
    
    Returns:
        dict: Environment configuration
    """
    environment = getattr(settings, 'MPESA_ENVIRONMENT', 'sandbox')
    
    configs = {
        'sandbox': {
            'base_url': 'https://sandbox.safaricom.co.ke',
            'shortcode': '174379',
            'passkey': 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919',
            'callback_url': getattr(settings, 'MPESA_CALLBACK_URL', '') + '/api/mpesa/',
            'description': 'Sandbox (Testing) Environment'
        },
        'production': {
            'base_url': 'https://api.safaricom.co.ke',
            'shortcode': getattr(settings, 'MPESA_SHORTCODE', ''),
            'passkey': getattr(settings, 'MPESA_PASSKEY', ''),
            'callback_url': getattr(settings, 'MPESA_CALLBACK_URL', '') + '/api/mpesa/',
            'description': 'Production Environment'
        }
    }
    
    return configs.get(environment, configs['sandbox'])


def validate_mpesa_response(response_data):
    """
    Validate M-Pesa API response.
    
    Args:
        response_data (dict): Response data from M-Pesa
        
    Returns:
        tuple: (is_valid, error_message)
    """
    if not response_data:
        return False, 'Empty response from M-Pesa'
    
    # Check for error codes
    if 'errorCode' in response_data:
        error_code = response_data.get('errorCode')
        error_message = response_data.get('errorMessage', 'Unknown error')
        return False, f'M-Pesa Error {error_code}: {error_message}'
    
    # Check for response codes
    if 'ResponseCode' in response_data:
        response_code = response_data.get('ResponseCode')
        
        # M-Pesa response codes (0 = success)
        if response_code != '0':
            error_messages = {
                '1': 'The balance is insufficient for the transaction',
                '2': 'Less than minimum transaction value',
                '3': 'More than maximum transaction value',
                '4': 'Would exceed daily transfer limit',
                '5': 'Would exceed minimum balance',
                '6': 'Unresolved Primary Party',
                '7': 'Unresolved Receiver Party',
                '8': 'Would exceed maximum balance',
                '11': 'Debit account invalid',
                '12': 'Credit account invalid',
                '13': 'Unresolved Debit Account',
                '14': 'Unresolved Credit Account',
                '15': 'Duplicate detected',
                '17': 'Internal failure',
                '20': 'Unresolved Initiator',
                '26': 'Traffic blocking condition in place',
            }
            
            error_message = error_messages.get(
                response_code,
                response_data.get('ResponseDescription', 'Unknown error')
            )
            
            return False, f'M-Pesa Error {response_code}: {error_message}'
    
    return True, 'Success'


def get_transaction_status_description(status_code):
    """
    Get human-readable description for transaction status code.
    
    Args:
        status_code (str): Transaction status code
        
    Returns:
        str: Status description
    """
    status_descriptions = {
        '0': 'Success',
        '1': 'Insufficient Funds',
        '2': 'Less Than Minimum Transaction Value',
        '3': 'More Than Maximum Transaction Value',
        '4': 'Would Exceed Daily Transfer Limit',
        '5': 'Would Exceed Minimum Balance',
        '6': 'Unresolved Primary Party',
        '7': 'Unresolved Receiver Party',
        '8': 'Would Exceed Maximum Balance',
        '11': 'Debit Account Invalid',
        '12': 'Credit Account Invalid',
        '13': 'Unresolved Debit Account',
        '14': 'Unresolved Credit Account',
        '15': 'Duplicate Detected',
        '17': 'Internal Failure',
        '20': 'Unresolved Initiator',
        '26': 'Traffic Blocking Condition In Place',
        '1031': 'Request cancelled by user',
        '1032': 'Request cancelled by user',
        '1037': 'Timeout',
        '2001': 'Invalid phone number',
        '2002': 'Invalid amount',
        '2003': 'Invalid account reference',
        '2004': 'Invalid transaction description',
        '2005': 'Invalid shortcode',
    }
    
    return status_descriptions.get(str(status_code), 'Unknown Status')


def generate_receipt_number():
    """
    Generate mock receipt number for testing.
    
    Returns:
        str: Generated receipt number
    """
    import random
    import time
    
    timestamp = int(time.time())
    random_num = random.randint(100000, 999999)
    
    return f"RCPT{timestamp}{random_num}"


def log_mpesa_transaction(transaction_data, log_level='info'):
    """
    Log M-Pesa transaction for auditing.
    
    Args:
        transaction_data (dict): Transaction data
        log_level (str): Log level (info, warning, error)
    """
    import json
    import logging
    
    logger = logging.getLogger('mpesa_transactions')
    
    log_message = json.dumps(transaction_data, indent=2, default=str)
    
    if log_level == 'warning':
        logger.warning(log_message)
    elif log_level == 'error':
        logger.error(log_message)
    else:
        logger.info(log_message)