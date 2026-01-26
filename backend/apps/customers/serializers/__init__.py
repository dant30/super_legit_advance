# customers/serializers/__init__.py
"""
Serializers package for customer management.
"""

from .customer import (
    CustomerSerializer,
    CustomerCreateSerializer,
    CustomerUpdateSerializer,
    CustomerDetailSerializer,
    BaseCustomerSerializer,
)
from .guarantor import (
    GuarantorSerializer,
    GuarantorCreateSerializer,
)
from .employement import (  # ✓ FIXED: Was 'employement' (typo)
    EmploymentSerializer,
    EmploymentUpdateSerializer,
)

__all__ = [
    'BaseCustomerSerializer',
    'CustomerSerializer',
    'CustomerCreateSerializer',
    'CustomerUpdateSerializer',
    'CustomerDetailSerializer',
    'GuarantorSerializer',
    'GuarantorCreateSerializer',
    'EmploymentSerializer',
    'EmploymentUpdateSerializer',
]