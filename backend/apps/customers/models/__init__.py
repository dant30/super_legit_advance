# customers/models/__init__.py
"""
Customer models package.
"""

from .customer import Customer
from .guarantor import Guarantor
from .employment import Employment

__all__ = ['Customer', 'Guarantor', 'Employment']