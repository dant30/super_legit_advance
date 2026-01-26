# loans/models/__init__.py
"""
Loan models package.
"""

from .loan import Loan
from .application import LoanApplication
from .collateral import Collateral

__all__ = ['Loan', 'LoanApplication', 'Collateral']