# loans/serializers/__init__.py
"""
Serializers package for loan management.
"""

from .loan import (
    LoanSerializer,
    LoanCreateSerializer,
    LoanUpdateSerializer,
    LoanDetailSerializer,
)
from .application import (
    LoanApplicationSerializer,
    LoanApplicationCreateSerializer,
    LoanApplicationDetailSerializer,
)
from .collateral import (
    CollateralSerializer,
    CollateralCreateSerializer,
)

__all__ = [
    'LoanSerializer',
    'LoanCreateSerializer',
    'LoanUpdateSerializer',
    'LoanDetailSerializer',
    'LoanApplicationSerializer',
    'LoanApplicationCreateSerializer',
    'LoanApplicationDetailSerializer',
    'CollateralSerializer',
    'CollateralCreateSerializer',
]