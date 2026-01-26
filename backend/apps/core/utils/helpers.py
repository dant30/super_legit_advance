# backend/apps/core/utils/helpers.py
import uuid
import hashlib
import json
import random
import string
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Any, Optional, Dict, List
from django.utils import timezone
from django.core.cache import cache
from django.conf import settings


class ReferenceGenerator:
    """
    Generates unique reference numbers for various entities.
    """
    PREFIXES = {
        'loan': 'LN',
        'customer': 'CUST',
        'repayment': 'RPMT',
        'payment': 'PAY',
        'application': 'APP',
        'transaction': 'TRX',
        'invoice': 'INV',
    }
    
    @staticmethod
    def generate(prefix: str, length: int = 10) -> str:
        """
        Generate a reference with prefix and timestamp.
        """
        timestamp = datetime.now().strftime("%y%m%d%H%M")
        random_part = ''.join(random.choices(string.digits, k=length))
        return f"{prefix}{timestamp}{random_part}"
    
    @staticmethod
    def generate_loan_reference() -> str:
        return ReferenceGenerator.generate(ReferenceGenerator.PREFIXES['loan'])
    
    @staticmethod
    def generate_customer_reference() -> str:
        return ReferenceGenerator.generate(ReferenceGenerator.PREFIXES['customer'])
    
    @staticmethod
    def generate_repayment_reference() -> str:
        return ReferenceGenerator.generate(ReferenceGenerator.PREFIXES['repayment'])
    
    @staticmethod
    def generate_unique_id(prefix: str = "", length: int = 8) -> str:
        """
        Generate a short unique ID.
        """
        uid = uuid.uuid4().hex[:length].upper()
        return f"{prefix}{uid}" if prefix else uid


class FinancialHelper:
    """
    Financial calculation utilities.
    """
    @staticmethod
    def calculate_interest(principal: float, rate: float, days: int) -> float:
        """
        Calculate simple interest.
        """
        return round(principal * rate * days / 365 / 100, 2)
    
    @staticmethod
    def calculate_installment(
        principal: float, 
        annual_rate: float, 
        months: int
    ) -> float:
        """
        Calculate monthly installment using reducing balance method.
        """
        if months <= 0:
            return principal
        
        monthly_rate = annual_rate / 12 / 100
        installment = principal * monthly_rate * (1 + monthly_rate) ** months
        installment /= ((1 + monthly_rate) ** months - 1)
        
        return round(installment, 2)
    
    @staticmethod
    def calculate_total_repayment(principal: float, interest: float) -> float:
        return round(principal + interest, 2)
    
    @staticmethod
    def calculate_penalty(
        amount: float, 
        rate: float, 
        days_overdue: int
    ) -> float:
        """
        Calculate penalty for overdue payments.
        """
        daily_rate = rate / 365 / 100
        penalty = amount * daily_rate * days_overdue
        return round(penalty, 2)
    
    @staticmethod
    def format_currency(amount: float, currency: str = "KES") -> str:
        """
        Format currency with proper symbols and separators.
        """
        return f"{currency} {amount:,.2f}"


class CacheHelper:
    """
    Cache utilities for common operations.
    """
    @staticmethod
    def get_or_set(key: str, func, timeout: int = 300, version=None):
        """
        Get from cache or set using provided function.
        """
        value = cache.get(key, version=version)
        if value is None:
            value = func()
            cache.set(key, value, timeout, version=version)
        return value
    
    @staticmethod
    def invalidate_pattern(pattern: str):
        """
        Invalidate cache keys matching pattern.
        """
        keys = cache.keys(pattern)
        if keys:
            cache.delete_many(keys)
    
    @staticmethod
    def generate_cache_key(*args, **kwargs):
        """
        Generate consistent cache key from arguments.
        """
        parts = [str(arg) for arg in args]
        parts.extend(f"{k}:{v}" for k, v in sorted(kwargs.items()))
        return hashlib.md5(":".join(parts).encode()).hexdigest()


class SecurityHelper:
    """
    Security-related utilities.
    """
    @staticmethod
    def hash_sensitive_data(data: str) -> str:
        """
        Hash sensitive data (not for passwords).
        """
        return hashlib.sha256(data.encode()).hexdigest()
    
    @staticmethod
    def mask_string(value: str, visible: int = 4) -> str:
        """
        Mask sensitive string data.
        """
        if len(value) <= visible:
            return value
        return value[:visible] + '*' * (len(value) - visible)
    
    @staticmethod
    def mask_phone(phone: str) -> str:
        """
        Mask phone number for display.
        """
        if len(phone) < 7:
            return phone
        return phone[:4] + '****' + phone[-3:]
    
    @staticmethod
    def mask_email(email: str) -> str:
        """
        Mask email address for display.
        """
        if '@' not in email:
            return email
        
        local, domain = email.split('@')
        if len(local) <= 2:
            masked_local = local[0] + '*' * (len(local) - 1)
        else:
            masked_local = local[0] + '*' * (len(local) - 2) + local[-1]
        
        return f"{masked_local}@{domain}"


class SettingHelper:
    """
    Helper for system settings.
    """
    @staticmethod
    def get_setting(key: str, default=None):
        """
        Get system setting by key.
        """
        from apps.core.models import SystemSetting
        
        try:
            setting = SystemSetting.objects.get(key=key, is_public=True)
            return SettingHelper.get_typed_value(setting.value, setting.data_type)
        except SystemSetting.DoesNotExist:
            return default
    
    @staticmethod
    def get_typed_value(value: str, data_type: str):
        """
        Convert setting value to appropriate type.
        """
        try:
            if data_type == 'integer':
                return int(value)
            elif data_type == 'float':
                return float(value)
            elif data_type == 'boolean':
                return value.lower() in ('true', '1', 'yes')
            elif data_type == 'json':
                return json.loads(value)
            elif data_type == 'date':
                return datetime.strptime(value, '%Y-%m-%d').date()
            else:  # string
                return value
        except (ValueError, json.JSONDecodeError):
            return value
    
    @staticmethod
    def get_all_settings(category=None):
        """
        Get all settings, optionally filtered by category.
        """
        from apps.core.models import SystemSetting
        
        queryset = SystemSetting.objects.filter(is_public=True)
        if category:
            queryset = queryset.filter(category=category)
        
        return {
            setting.key: SettingHelper.get_typed_value(setting.value, setting.data_type)
            for setting in queryset
        }


class DateHelper:
    """
    Date and time utilities.
    """
    @staticmethod
    def now():
        return timezone.now()
    
    @staticmethod
    def today():
        return timezone.now().date()
    
    @staticmethod
    def days_from_now(days: int):
        return timezone.now() + timedelta(days=days)
    
    @staticmethod
    def months_from_now(months: int):
        return timezone.now() + timedelta(days=months * 30)
    
    @staticmethod
    def format_date(dt: datetime, fmt: str = "%Y-%m-%d %H:%M:%S"):
        if not dt:
            return None
        return dt.strftime(fmt)
    
    @staticmethod
    def format_date_human(dt: datetime):
        """
        Format date in human-readable format.
        """
        if not dt:
            return "N/A"
        
        now = timezone.now()
        diff = now - dt
        
        if diff.days == 0:
            if diff.seconds < 60:
                return "just now"
            elif diff.seconds < 3600:
                return f"{diff.seconds // 60} minutes ago"
            else:
                return f"{diff.seconds // 3600} hours ago"
        elif diff.days == 1:
            return "yesterday"
        elif diff.days < 7:
            return f"{diff.days} days ago"
        elif diff.days < 30:
            return f"{diff.days // 7} weeks ago"
        elif diff.days < 365:
            return f"{diff.days // 30} months ago"
        else:
            return f"{diff.days // 365} years ago"
    
    @staticmethod
    def get_financial_year(date_obj=None):
        """
        Get financial year (July-June) for a date.
        """
        if date_obj is None:
            date_obj = timezone.now()
        
        year = date_obj.year
        if date_obj.month >= 7:  # Financial year starts in July
            return f"{year}/{year + 1}"
        else:
            return f"{year - 1}/{year}"


class DataExportHelper:
    """
    Helper for data export operations.
    """
    @staticmethod
    def dict_to_csv(data: List[Dict], filename: str) -> str:
        """
        Convert list of dicts to CSV string.
        """
        import csv
        import io
        
        if not data:
            return ""
        
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=data[0].keys())
        writer.writeheader()
        writer.writerows(data)
        
        return output.getvalue()
    
    @staticmethod
    def prepare_for_export(queryset, fields: List[str]):
        """
        Prepare queryset for export.
        """
        return [
            {field: getattr(obj, field) for field in fields}
            for obj in queryset
        ]


# Convenience functions
def generate_reference(prefix: str = "") -> str:
    return ReferenceGenerator.generate_unique_id(prefix)

def current_timestamp() -> str:
    return datetime.utcnow().isoformat()

def mask_sensitive(value: str, data_type: str = "generic") -> str:
    """
    Mask sensitive data based on type.
    """
    if data_type == "phone":
        return SecurityHelper.mask_phone(value)
    elif data_type == "email":
        return SecurityHelper.mask_email(value)
    elif data_type == "id_number":
        return SecurityHelper.mask_string(value, 4)
    else:
        return SecurityHelper.mask_string(value)