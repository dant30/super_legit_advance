# backend/apps/loans/exceptions.py
"""
Custom exceptions for loan management.
"""

class LoanException(Exception):
    """Base exception for loan-related errors."""
    pass

class LoanStateException(LoanException):
    """Exception for invalid loan state transitions."""
    pass

class LoanAmountException(LoanException):
    """Exception for invalid loan amounts."""
    pass

class LoanValidationException(LoanException):
    """Exception for loan validation errors."""
    pass

class ApplicationException(Exception):
    """Base exception for application-related errors."""
    pass

class ApplicationStateException(ApplicationException):
    """Exception for invalid application state transitions."""
    pass

class CollateralException(Exception):
    """Base exception for collateral-related errors."""
    pass

class CollateralStateException(CollateralException):
    """Exception for invalid collateral state transitions."""
    pass