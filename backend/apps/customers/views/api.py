# backend/apps/customers/views/api.py
from django.utils import timezone
from datetime import timedelta
from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Sum, Avg
from django.http import HttpResponse
import pandas as pd
import io
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from django.db.models.functions import TruncMonth  # ✓ FIXED: Django compatibility
import logging

from apps.customers.models import Customer, Guarantor, Employment
from apps.customers.serializers import (
    CustomerSerializer,
    CustomerCreateSerializer,
    CustomerUpdateSerializer,
    CustomerDetailSerializer,
    GuarantorSerializer,
    GuarantorCreateSerializer,
    EmploymentSerializer,
    EmploymentUpdateSerializer,
)
from apps.customers.validators.customer_validator import CustomerValidator
from apps.core.utils.permissions import IsStaff, IsAdmin, IsManager
from apps.core.mixins.api_mixins import AuditMixin, PaginationMixin

logger = logging.getLogger(__name__)


class CustomerListView(AuditMixin, PaginationMixin, generics.ListAPIView):
    """
    List all customers or create a new customer.
    """
    queryset = Customer.objects.all().select_related(
        'employment', 'created_by', 'updated_by'
    ).prefetch_related('guarantors')
    
    serializer_class = CustomerSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'gender', 'marital_status', 'county', 'risk_level']
    search_fields = [
        'customer_number', 
        'first_name', 
        'last_name', 
        'id_number', 
        'phone_number', 
        'email'
    ]
    ordering_fields = ['created_at', 'last_name', 'registration_date', 'credit_score']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """
        Optionally filter by:
        - active/inactive
        - blacklisted
        - date range
        - loan status
        """
        queryset = super().get_queryset()
        
        # Filter by active status
        active = self.request.query_params.get('active', None)
        if active is not None:
            if active.lower() == 'true':
                queryset = queryset.filter(status='ACTIVE')
            elif active.lower() == 'false':
                queryset = queryset.exclude(status='ACTIVE')
        
        # Filter by blacklisted
        blacklisted = self.request.query_params.get('blacklisted', None)
        if blacklisted is not None:
            if blacklisted.lower() == 'true':
                queryset = queryset.filter(status='BLACKLISTED')
            elif blacklisted.lower() == 'false':
                queryset = queryset.exclude(status='BLACKLISTED')
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        if start_date:
            queryset = queryset.filter(created_at__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__date__lte=end_date)
        
        # Filter by loan status
        has_loans = self.request.query_params.get('has_loans', None)
        if has_loans is not None:
            from apps.loans.models import Loan
            if has_loans.lower() == 'true':
                # Customers with active loans
                active_loan_customers = Loan.objects.filter(
                    status__in=['ACTIVE', 'APPROVED']
                ).values_list('customer_id', flat=True)
                queryset = queryset.filter(id__in=active_loan_customers)
            elif has_loans.lower() == 'false':
                # Customers without loans
                all_loan_customers = Loan.objects.values_list('customer_id', flat=True)
                queryset = queryset.exclude(id__in=all_loan_customers)
        
        return queryset
    
    def perform_create(self, serializer):
        """Create customer with audit trail."""
        serializer.save(created_by=self.request.user)


class CustomerCreateView(AuditMixin, generics.CreateAPIView):
    """
    Create a new customer.
    """
    queryset = Customer.objects.all()
    serializer_class = CustomerCreateSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def perform_create(self, serializer):
        """Create customer with validation."""
        customer_data = serializer.validated_data
        
        # Validate customer using custom validator
        validator = CustomerValidator(customer_data)
        if not validator.validate():
            raise serializers.ValidationError(validator.errors)
        
        # Save customer
        customer = serializer.save(created_by=self.request.user)
        
        # Log the creation
        self.audit_log(
            action='CREATE',
            model_name='Customer',
            object_id=customer.id,
            user=self.request.user,
            changes=f"Created customer {customer.customer_number}"
        )


class CustomerDetailView(AuditMixin, generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a customer with optimized queries.
    
    ✓ FIXED:
    - Added prefetch_related for N+1 prevention
    - Fixed get_changes method
    """
    queryset = Customer.objects.all().select_related(
        'employment', 'created_by', 'updated_by', 'referred_by'
    ).prefetch_related('guarantors')
    
    serializer_class = CustomerDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_queryset(self):
        """✓ FIXED: Optimized queryset with prefetch_related"""
        return Customer.objects.select_related(
            'employment', 'created_by', 'updated_by', 'referred_by'
        ).prefetch_related(
            'guarantors',
            'loans',  # ✓ ADDED
        )
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return CustomerUpdateSerializer
        return CustomerDetailSerializer
    
    def retrieve(self, request, *args, **kwargs):
        """Retrieve customer with additional data."""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        
        # Add loan information
        from apps.loans.models import Loan
        from apps.repayments.models import Repayment
        
        loans = Loan.objects.filter(customer=instance)
        active_loans = loans.filter(status__in=['ACTIVE', 'APPROVED'])
        
        response_data = serializer.data
        response_data.update({
            'loan_statistics': {
                'total_loans': loans.count(),
                'active_loans': active_loans.count(),
                'total_borrowed': loans.aggregate(total=Sum('amount_approved'))['total'] or 0,
                'total_outstanding': active_loans.aggregate(total=Sum('outstanding_balance'))['total'] or 0,
                'total_repaid': Repayment.objects.filter(
                    loan__customer=instance,
                    status='COMPLETED'
                ).aggregate(total=Sum('amount'))['total'] or 0,
            }
        })
        
        return Response(response_data)
    
    def perform_update(self, serializer):
        """✓ FIXED: Added get_changes validation"""
        old_instance = self.get_object()
        new_instance = serializer.save(updated_by=self.request.user)
        
        # Get changes
        changes = self._get_changes(old_instance, new_instance)
        if changes:
            self.audit_log(
                action='UPDATE',
                model_name='Customer',
                object_id=new_instance.id,
                user=self.request.user,
                changes=changes
            )
    
    def _get_changes(self, old_instance, new_instance):
        """
        ✓ FIXED: Proper change detection
        
        Returns:
            str: Summary of changes
        """
        changes = []
        for field in ['first_name', 'last_name', 'status', 'credit_score', 'risk_level']:
            old_val = getattr(old_instance, field, None)
            new_val = getattr(new_instance, field, None)
            if old_val != new_val:
                changes.append(f"{field}: {old_val} → {new_val}")
        
        return "\n".join(changes) if changes else "No changes"


class CustomerSearchView(AuditMixin, generics.ListAPIView):
    """
    Advanced search for customers.
    
    ✓ FIXED: Added IsStaff permission for consistency
    """
    serializer_class = CustomerSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaff]  # ✓ FIXED
    
    def get_queryset(self):
        """
        Advanced search with multiple query types.
        
        Supported search types:
        - basic: Search all fields
        - phone: Phone number only
        - id: ID number only
        - name: Name fields only
        - customer_number: Customer number only
        """
        queryset = Customer.objects.all()
        
        search_query = self.request.query_params.get('q', '')
        search_type = self.request.query_params.get('type', 'basic')
        
        if not search_query:
            return queryset
        
        if search_type == 'phone':
            queryset = queryset.filter(phone_number__icontains=search_query)
        elif search_type == 'id':
            queryset = queryset.filter(id_number__icontains=search_query)
        elif search_type == 'name':
            queryset = queryset.filter(
                Q(first_name__icontains=search_query) |
                Q(last_name__icontains=search_query) |
                Q(middle_name__icontains=search_query)
            )
        elif search_type == 'customer_number':
            queryset = queryset.filter(customer_number__icontains=search_query)
        else:  # Basic search
            queryset = queryset.filter(
                Q(customer_number__icontains=search_query) |
                Q(first_name__icontains=search_query) |
                Q(last_name__icontains=search_query) |
                Q(middle_name__icontains=search_query) |
                Q(id_number__icontains=search_query) |
                Q(phone_number__icontains=search_query) |
                Q(email__icontains=search_query)
            )
        
        return queryset


class CustomerStatsView(AuditMixin, APIView):
    """
    Get customer statistics with caching.
    
    ✓ FIXED:
    - Added caching decorator
    - Fixed DATE_TRUNC for SQLite compatibility
    """
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    
    @method_decorator(cache_page(60 * 5))  # ✓ FIXED: Cache for 5 minutes
    def get(self, request):
        """
        Return customer statistics.
        
        Returns:
            dict: Comprehensive customer statistics
        """
        total_customers = Customer.objects.count()
        active_customers = Customer.objects.filter(status=Customer.STATUS_ACTIVE).count()
        blacklisted_customers = Customer.objects.filter(status=Customer.STATUS_BLACKLISTED).count()
        
        # Monthly registrations - ✓ FIXED: Use TruncMonth for compatibility
        six_months_ago = timezone.now() - timedelta(days=180)
        
        monthly_registrations = Customer.objects.filter(
            created_at__gte=six_months_ago
        ).annotate(
            month=TruncMonth('created_at')  # ✓ FIXED: Works with SQLite
        ).values('month').annotate(
            count=Count('id')
        ).order_by('month')
        
        return Response({
            'total_customers': total_customers,
            'active_customers': active_customers,
            'blacklisted_customers': blacklisted_customers,
            'monthly_registrations': list(monthly_registrations),
        })


class CustomerMixin:
    """
    ✓ FIXED: Mixin to avoid code duplication for getting customer.
    """
    def get_customer(self):
        """Get customer by ID from kwargs."""
        customer_id = self.kwargs.get('customer_id') or self.kwargs.get('pk')
        return get_object_or_404(Customer, pk=customer_id)


class GuarantorListView(AuditMixin, CustomerMixin, PaginationMixin, generics.ListAPIView):
    """
    List all guarantors for a customer.
    
    ✓ FIXED: Uses CustomerMixin
    """
    serializer_class = GuarantorSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['is_active', 'verification_status']
    search_fields = ['first_name', 'last_name', 'id_number', 'phone_number']
    
    def get_queryset(self):
        customer = self.get_customer()
        return Guarantor.objects.filter(
            customer=customer
        ).select_related('customer').order_by('-created_at')


class GuarantorCreateView(AuditMixin, generics.CreateAPIView):
    """
    Create a new guarantor for a customer.
    """
    serializer_class = GuarantorCreateSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def perform_create(self, serializer):
        """Create guarantor for specific customer."""
        customer_id = self.kwargs.get('customer_id')
        customer = get_object_or_404(Customer, pk=customer_id)
        
        # Validate maximum guarantors (max 3)
        existing_guarantors = Guarantor.objects.filter(customer=customer, is_active=True).count()
        if existing_guarantors >= 3:
            raise serializers.ValidationError({
                'error': 'Maximum of 3 active guarantors allowed per customer.'
            })
        
        guarantor = serializer.save(customer=customer)
        
        # Log the creation
        self.audit_log(
            action='CREATE',
            model_name='Guarantor',
            object_id=guarantor.id,
            user=self.request.user,
            changes=f"Created guarantor for customer {customer.customer_number}"
        )


class GuarantorDetailView(AuditMixin, generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a guarantor instance.
    """
    queryset = Guarantor.objects.all()
    serializer_class = GuarantorSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def perform_update(self, serializer):
        """Update guarantor with audit trail."""
        old_instance = self.get_object()
        new_instance = serializer.save()
        
        # Log changes
        changes = self.get_changes(old_instance, new_instance, serializer.validated_data)
        if changes:
            self.audit_log(
                action='UPDATE',
                model_name='Guarantor',
                object_id=new_instance.id,
                user=self.request.user,
                changes=changes
            )
    
    def perform_destroy(self, instance):
        """Soft delete guarantor."""
        instance.is_active = False
        instance.save()
        
        self.audit_log(
            action='DELETE',
            model_name='Guarantor',
            object_id=instance.id,
            user=self.request.user,
            changes=f"Deactivated guarantor for customer {instance.customer.customer_number}"
        )


class GuarantorVerifyView(AuditMixin, APIView):
    """
    Verify or reject a guarantor.
    """
    permission_classes = [permissions.IsAuthenticated, IsManager]
    
    def post(self, request, pk):
        """Verify or reject guarantor."""
        guarantor = get_object_or_404(Guarantor, pk=pk)
        action = request.data.get('action', 'verify')  # 'verify' or 'reject'
        notes = request.data.get('notes', '')
        
        old_status = guarantor.verification_status
        
        if action == 'verify':
            guarantor.verify(notes)
            message = 'Guarantor has been verified.'
        elif action == 'reject':
            guarantor.reject(notes)
            message = 'Guarantor has been rejected.'
        else:
            return Response(
                {'error': 'Invalid action. Use "verify" or "reject".'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Log the action
        self.audit_log(
            action='UPDATE',
            model_name='Guarantor',
            object_id=guarantor.id,
            user=request.user,
            changes=f"Changed verification status from {old_status} to {guarantor.verification_status}. Notes: {notes}"
        )
        
        return Response({
            'message': message,
            'guarantor_id': guarantor.id,
            'verification_status': guarantor.verification_status,
            'verification_date': guarantor.verification_date
        })


class EmploymentDetailView(AuditMixin, generics.RetrieveAPIView):
    """
    Retrieve employment information for a customer.
    """
    serializer_class = EmploymentSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    
    def get_object(self):
        customer_id = self.kwargs.get('customer_id')
        customer = get_object_or_404(Customer, pk=customer_id)
        
        # Get or create employment record
        employment, created = Employment.objects.get_or_create(customer=customer)
        if created:
            self.audit_log(
                action='CREATE',
                model_name='Employment',
                object_id=employment.id,
                user=self.request.user,
                changes=f"Created employment record for customer {customer.customer_number}"
            )
        
        return employment


class EmploymentUpdateView(AuditMixin, generics.UpdateAPIView):
    """
    Update employment information for a customer.
    """
    serializer_class = EmploymentUpdateSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_object(self):
        customer_id = self.kwargs.get('customer_id')
        customer = get_object_or_404(Customer, pk=customer_id)
        
        # Get or create employment record
        employment, created = Employment.objects.get_or_create(customer=customer)
        if created:
            self.audit_log(
                action='CREATE',
                model_name='Employment',
                object_id=employment.id,
                user=self.request.user,
                changes=f"Created employment record for customer {customer.customer_number}"
            )
        
        return employment
    
    def perform_update(self, serializer):
        """Update employment with audit trail."""
        old_instance = self.get_object()
        new_instance = serializer.save()
        
        # Log changes
        changes = self.get_changes(old_instance, new_instance, serializer.validated_data)
        if changes:
            self.audit_log(
                action='UPDATE',
                model_name='Employment',
                object_id=new_instance.id,
                user=self.request.user,
                changes=changes
            )


class CustomerExportView(AuditMixin, APIView):
    """
    Export customers to Excel or CSV.
    """
    permission_classes = [permissions.IsAuthenticated, IsManager]
    
    def get(self, request):
        """Export customers data."""
        format_type = request.query_params.get('format', 'excel')  # 'excel' or 'csv'
        
        # Get filtered queryset
        queryset = Customer.objects.all()
        
        # Apply filters from request
        status_filter = request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        date_from = request.query_params.get('date_from', None)
        date_to = request.query_params.get('date_to', None)
        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)
        
        # Prepare data
        data = []
        for customer in queryset:
            data.append({
                'Customer Number': customer.customer_number,
                'Full Name': customer.full_name,
                'ID Number': customer.id_number,
                'Phone Number': customer.phone_number,
                'Email': customer.email,
                'Date of Birth': customer.date_of_birth,
                'Gender': customer.get_gender_display(),
                'Marital Status': customer.get_marital_status_display(),
                'Physical Address': customer.physical_address,
                'County': customer.county,
                'Status': customer.get_status_display(),
                'Credit Score': customer.credit_score,
                'Risk Level': customer.get_risk_level_display(),
                'Registration Date': customer.registration_date,
                'Total Loans': customer.total_loans,
                'Active Loans': customer.active_loans,
                'Outstanding Balance': customer.outstanding_balance,
            })
        
        # Create DataFrame
        df = pd.DataFrame(data)
        
        if format_type == 'csv':
            # Export to CSV
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="customers_export.csv"'
            
            df.to_csv(response, index=False)
            
            # Log export
            self.audit_log(
                action='EXPORT',
                model_name='Customer',
                user=request.user,
                changes=f"Exported {len(data)} customers to CSV"
            )
            
            return response
        
        else:  # Excel format
            # Export to Excel
            output = io.BytesIO()
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                df.to_excel(writer, sheet_name='Customers', index=False)
            
            response = HttpResponse(
                output.getvalue(),
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            response['Content-Disposition'] = 'attachment; filename="customers_export.xlsx"'
            
            # Log export
            self.audit_log(
                action='EXPORT',
                model_name='Customer',
                user=request.user,
                changes=f"Exported {len(data)} customers to Excel"
            )
            
            return response


class CustomerImportView(AuditMixin, APIView):
    """
    Import customers from Excel or CSV.
    """
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request):
        """Import customers from file."""
        file = request.FILES.get('file')
        if not file:
            return Response(
                {'error': 'No file provided.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check file extension
        file_name = file.name.lower()
        if file_name.endswith('.csv'):
            df = pd.read_csv(file)
        elif file_name.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(file)
        else:
            return Response(
                {'error': 'Invalid file format. Use CSV or Excel.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate required columns
        required_columns = [
            'First Name', 'Last Name', 'ID Number', 'Phone Number',
            'Date of Birth', 'Gender', 'Physical Address', 'County'
        ]
        
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            return Response(
                {'error': f'Missing required columns: {missing_columns}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        imported_count = 0
        errors = []
        
        for index, row in df.iterrows():
            try:
                # Prepare customer data
                customer_data = {
                    'first_name': str(row['First Name']).strip(),
                    'last_name': str(row['Last Name']).strip(),
                    'id_number': str(row['ID Number']).strip(),
                    'phone_number': str(row['Phone Number']).strip(),
                    'date_of_birth': pd.to_datetime(row['Date of Birth']).date(),
                    'gender': str(row['Gender']).strip().upper()[:1],
                    'physical_address': str(row['Physical Address']).strip(),
                    'county': str(row['County']).strip(),
                }
                
                # Optional fields
                if 'Middle Name' in df.columns:
                    customer_data['middle_name'] = str(row['Middle Name']).strip()
                if 'Email' in df.columns:
                    customer_data['email'] = str(row['Email']).strip()
                if 'Marital Status' in df.columns:
                    customer_data['marital_status'] = str(row['Marital Status']).strip().upper()
                if 'ID Type' in df.columns:
                    customer_data['id_type'] = str(row['ID Type']).strip().upper()
                if 'Postal Address' in df.columns:
                    customer_data['postal_address'] = str(row['Postal Address']).strip()
                if 'Sub County' in df.columns:
                    customer_data['sub_county'] = str(row['Sub County']).strip()
                if 'Ward' in df.columns:
                    customer_data['ward'] = str(row['Ward']).strip()
                
                # Validate customer data
                validator = CustomerValidator(customer_data)
                if not validator.validate():
                    errors.append(f"Row {index + 2}: {validator.errors}")
                    continue
                
                # Check for duplicate ID number
                if Customer.objects.filter(id_number=customer_data['id_number']).exists():
                    errors.append(f"Row {index + 2}: ID number {customer_data['id_number']} already exists.")
                    continue
                
                # Check for duplicate phone number
                if Customer.objects.filter(phone_number=customer_data['phone_number']).exists():
                    errors.append(f"Row {index + 2}: Phone number {customer_data['phone_number']} already exists.")
                    continue
                
                # Create customer
                customer = Customer.objects.create(
                    **customer_data,
                    created_by=request.user
                )
                imported_count += 1
                
            except Exception as e:
                errors.append(f"Row {index + 2}: {str(e)}")
                continue
        
        # Log import
        self.audit_log(
            action='IMPORT',
            model_name='Customer',
            user=request.user,
            changes=f"Imported {imported_count} customers from file. Errors: {len(errors)}"
        )
        
        return Response({
            'message': f'Successfully imported {imported_count} customers.',
            'imported_count': imported_count,
            'error_count': len(errors),
            'errors': errors if errors else None
        })


class CustomerBlacklistView(AuditMixin, APIView):
    """
    Blacklist a customer.
    """
    permission_classes = [permissions.IsAuthenticated, IsManager]
    
    def post(self, request, pk):
        """Blacklist a customer."""
        try:
            customer = get_object_or_404(Customer, pk=pk)
            reason = request.data.get('reason', 'No reason provided')
            
            # Blacklist the customer
            customer.blacklist(reason=reason)
            
            # Log the action
            self.audit_log(
                action='BLACKLIST',
                model_name='Customer',
                object_id=customer.id,
                user=request.user,
                changes=f"Customer blacklisted. Reason: {reason}"
            )
            
            serializer = CustomerDetailSerializer(customer)
            return Response(
                {
                    'message': 'Customer blacklisted successfully',
                    'customer': serializer.data
                },
                status=status.HTTP_200_OK
            )
        except Customer.DoesNotExist:
            return Response(
                {'error': 'Customer not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error blacklisting customer: {str(e)}", exc_info=True)
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class CustomerActivateView(AuditMixin, APIView):
    """
    Activate a customer.
    """
    permission_classes = [permissions.IsAuthenticated, IsManager]
    
    def post(self, request, pk):
        """Activate a customer."""
        try:
            customer = get_object_or_404(Customer, pk=pk)
            
            # Activate the customer
            customer.activate()
            
            # Log the action
            self.audit_log(
                action='ACTIVATE',
                model_name='Customer',
                object_id=customer.id,
                user=request.user,
                changes='Customer activated'
            )
            
            serializer = CustomerDetailSerializer(customer)
            return Response(
                {
                    'message': 'Customer activated successfully',
                    'customer': serializer.data
                },
                status=status.HTTP_200_OK
            )
        except Customer.DoesNotExist:
            return Response(
                {'error': 'Customer not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error activating customer: {str(e)}", exc_info=True)
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )