# NEW FILE - Reusable mixins

from django.shortcuts import get_object_or_404
from apps.customers.models import Customer


class CustomerMixin:
    """
    Mixin to get customer object and avoid code duplication.
    
    Usage:
        class MyView(CustomerMixin, APIView):
            def get(self, request, *args, **kwargs):
                customer = self.get_customer()
                # ... rest of logic
    """
    
    def get_customer(self):
        """
        Get customer by ID from URL kwargs.
        
        Returns:
            Customer: Customer instance
            
        Raises:
            Http404: If customer not found
        """
        customer_id = self.kwargs.get('customer_id') or self.kwargs.get('pk')
        return get_object_or_404(Customer, pk=customer_id)


class EmploymentMixin:
    """
    Mixin for employment-related operations.
    """
    
    def get_or_create_employment(self, customer):
        """
        Get or create employment record for customer.
        
        Args:
            customer (Customer): Customer instance
            
        Returns:
            tuple: (Employment, created)
        """
        from apps.customers.models import Employment
        return Employment.objects.get_or_create(customer=customer)