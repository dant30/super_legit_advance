# backend/apps/core/utils/__init__.py
"""
Core utility modules for the Super Legit Advance application.
"""

from .permissions import *
from .validators import *
from .helpers import *
from .date_utils import *
from .exceptions import *

__all__ = [
    # Permissions
    'IsAdmin',
    'IsStaff',
    'IsManager',
    'IsLoanOfficer',
    'IsCollector',
    'IsAuditor',
    'IsVerifiedUser',
    'IsOwnerOrStaff',
    'HasPermission',
    'IsAuthenticatedAndActive',
    'RateLimitPermission',
    'TwoFactorPermission',
    'IsAuditorOrReadOnly',
    
    # Validators
    'validate_phone_number',
    'validate_email',
    'validate_positive_amount',
    'validate_payment_amount',
    'validate_percentage',
    'validate_id_number',
    'validate_kra_pin',
    'validate_date_not_in_past',
    'validate_date_not_in_future',
    'validate_min_age',
    'validate_file_size',
    'validate_file_extension',
    'validate_loan_term',
    'ValidatorRegistry',
    
    # Helpers
    'ReferenceGenerator',
    'FinancialHelper',
    'CacheHelper',
    'SecurityHelper',
    'SettingHelper',
    'DateHelper',
    'DataExportHelper',
    'generate_reference',
    'current_timestamp',
    'mask_sensitive',
    
    # Date utilities
    'format_date',
    'format_date_time',
    'format_time',
    'add_days',
    'add_months',
    'add_years',
    'get_date_range',
    'get_week_start_end',
    'get_month_start_end',
    'get_quarter_start_end',
    'get_year_start_end',
    'is_weekend',
    'is_business_day',
    'get_business_days',
    'get_age',
    'get_days_between',
    'get_months_between',
    'get_years_between',
    
    # Exceptions
    'custom_exception_handler',
    'BaseAPIException',
    'BadRequestException',
    'UnauthorizedException',
    'ForbiddenException',
    'NotFoundException',
    'ConflictException',
    'ValidationException',
    'TooManyRequestsException',
    'ServerException',
    'ServiceUnavailableException',
    'raise_validation_error',
    'raise_not_found',
    'raise_forbidden',
]