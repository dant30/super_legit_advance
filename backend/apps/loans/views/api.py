# backend/apps/loans/views/api.py
# backend/apps/loans/views/api.py
import logging
from django.forms import ValidationError
from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Sum, Avg, F
from django.http import HttpResponse
from django.utils import timezone
from decimal import Decimal, InvalidOperation
import pandas as pd
import io
from apps.core.utils.db_utils import group_by_period
from django.db.models.functions import TruncMonth
from datetime import timedelta

from apps.loans.models import Loan, LoanApplication, Collateral
from apps.loans.serializers import (
    LoanSerializer,
    LoanCreateSerializer,
    LoanUpdateSerializer,
    LoanDetailSerializer,
    LoanApplicationSerializer,
    LoanApplicationCreateSerializer,
    LoanApplicationDetailSerializer,
    CollateralSerializer,
    CollateralCreateSerializer,
)
from apps.loans.calculators.loan_calculator import LoanCalculator
from apps.core.utils.permissions import (
    IsStaff, IsManager, IsAdmin, CanApproveLoans, 
    CanProcessPayments, IsLoanOfficer
)
from apps.core.mixins.api_mixins import AuditMixin, PaginationMixin

logger = logging.getLogger(__name__)


class LoanListView(AuditMixin, PaginationMixin, generics.ListCreateAPIView):
    """
    List all loans or create a new loan.
    """
    queryset = Loan.objects.all().select_related(
        'customer', 'approved_by', 'disbursed_by', 'created_by', 'updated_by'
    ).prefetch_related('collateral')
    
    serializer_class = LoanSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'loan_type', 'risk_level', 'repayment_frequency']
    search_fields = [
        'loan_number', 
        'customer__first_name', 
        'customer__last_name',
        'customer__customer_number',
        'customer__phone_number',
        'customer__id_number',
    ]
    ordering_fields = [
        'application_date', 'approval_date', 'disbursement_date',
        'amount_approved', 'outstanding_balance', 'created_at'
    ]
    ordering = ['-created_at']
    
    def get_queryset(self):
        """
        Optionally filter by:
        - overdue loans
        - active loans
        - date ranges
        - amount ranges
        """
        queryset = super().get_queryset()
        
        # Filter by overdue
        overdue = self.request.query_params.get('overdue', None)
        if overdue is not None:
            if overdue.lower() == 'true':
                queryset = queryset.filter(status='OVERDUE')
            elif overdue.lower() == 'false':
                queryset = queryset.exclude(status='OVERDUE')
        
        # Filter by active
        active = self.request.query_params.get('active', None)
        if active is not None:
            if active.lower() == 'true':
                queryset = queryset.filter(status='ACTIVE')
            elif active.lower() == 'false':
                queryset = queryset.exclude(status='ACTIVE')
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        if start_date:
            queryset = queryset.filter(application_date__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(application_date__date__lte=end_date)
        
        # Filter by amount range
        min_amount = self.request.query_params.get('min_amount', None)
        max_amount = self.request.query_params.get('max_amount', None)
        if min_amount:
            queryset = queryset.filter(amount_approved__gte=min_amount)
        if max_amount:
            queryset = queryset.filter(amount_approved__lte=max_amount)
        
        # Filter by customer
        customer_id = self.request.query_params.get('customer_id', None)
        if customer_id:
            queryset = queryset.filter(customer_id=customer_id)
        
        # Filter by risk level
        risk_level = self.request.query_params.get('risk_level', None)
        if risk_level:
            queryset = queryset.filter(risk_level=risk_level)
        
        # Filter by created date
        created_after = self.request.query_params.get('created_after', None)
        created_before = self.request.query_params.get('created_before', None)
        if created_after:
            queryset = queryset.filter(created_at__date__gte=created_after)
        if created_before:
            queryset = queryset.filter(created_at__date__lte=created_before)
        
        return queryset
    
    def perform_create(self, serializer):
        """Create loan with audit trail."""
        try:
            loan = serializer.save(created_by=self.request.user)
            
            # Log the creation
            self.audit_log(
                action='CREATE',
                model_name='Loan',
                object_id=loan.id,
                user=self.request.user,
                changes=f"Created loan {loan.loan_number}"
            )
            
            logger.info(f"Loan {loan.loan_number} created successfully by {self.request.user}")
            
        except Exception as e:
            logger.error(f"Error creating loan: {str(e)}", exc_info=True)
            raise


class LoanCreateView(AuditMixin, generics.CreateAPIView):
    """
    Create a new loan.
    """
    queryset = Loan.objects.all()
    serializer_class = LoanCreateSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def perform_create(self, serializer):
        """Create loan with validation."""
        try:
            loan = serializer.save(created_by=self.request.user)
            
            # Log the creation
            self.audit_log(
                action='CREATE',
                model_name='Loan',
                object_id=loan.id,
                user=self.request.user,
                changes=f"Created loan {loan.loan_number}"
            )
            
            logger.info(f"Loan {loan.loan_number} created successfully via LoanCreateView by {self.request.user}")
            
        except Exception as e:
            logger.error(f"Error in LoanCreateView: {str(e)}", exc_info=True)
            raise


class LoanDetailView(AuditMixin, generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a loan instance.
    """
    queryset = Loan.objects.all().select_related(
        'customer', 'approved_by', 'disbursed_by', 
        'created_by', 'updated_by'
    ).prefetch_related('collateral')
    
    serializer_class = LoanDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return LoanUpdateSerializer
        return LoanDetailSerializer
    
    def retrieve(self, request, *args, **kwargs):
        """Retrieve loan with additional data."""
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            
            # Add repayment information
            try:
                from apps.repayments.models import Repayment, RepaymentSchedule
                
                repayments = Repayment.objects.filter(loan=instance).order_by('-payment_date')
                schedule = RepaymentSchedule.objects.filter(loan=instance).order_by('due_date')
                
                response_data = serializer.data
                response_data.update({
                    'repayment_history': [
                        {
                            'id': r.id,
                            'amount': r.amount,
                            'payment_date': r.payment_date,
                            'payment_method': r.payment_method,
                            'status': r.status,
                        }
                        for r in repayments[:10]  # Last 10 payments
                    ],
                    'repayment_schedule': [
                        {
                            'id': s.id,
                            'installment_number': s.installment_number,
                            'due_date': s.due_date,
                            'amount_due': s.amount_due,
                            'status': s.status,
                            'paid_amount': s.paid_amount,
                            'balance': s.balance,
                        }
                        for s in schedule
                    ],
                    'next_payment': schedule.filter(status='PENDING').order_by('due_date').first(),
                })
                
                return Response(response_data)
                
            except ImportError:
                # Repayments app might not be available
                return Response(serializer.data)
                
        except Exception as e:
            logger.error(f"Error retrieving loan details: {str(e)}", exc_info=True)
            return Response(
                {'error': 'An error occurred while retrieving loan details.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def perform_update(self, serializer):
        """Update loan with audit trail."""
        old_instance = self.get_object()
        new_instance = serializer.save(updated_by=self.request.user)
        
        # Log changes
        changes = self.get_changes(old_instance, new_instance, serializer.validated_data)
        if changes:
            self.audit_log(
                action='UPDATE',
                model_name='Loan',
                object_id=new_instance.id,
                user=self.request.user,
                changes=changes
            )
    
    def perform_destroy(self, instance):
        """Soft delete loan."""
        if instance.status not in ['DRAFT', 'REJECTED', 'CANCELLED']:
            raise ValidationError("Only draft, rejected, or cancelled loans can be deleted.")
        
        instance.status = 'CANCELLED'
        instance.save()
        
        self.audit_log(
            action='DELETE',
            model_name='Loan',
            object_id=instance.id,
            user=self.request.user,
            changes=f"Cancelled loan {instance.loan_number}"
        )


class LoanApproveView(AuditMixin, APIView):
    """
    Approve a loan.
    """
    permission_classes = [permissions.IsAuthenticated, CanApproveLoans]
    
    def post(self, request, pk):
        """Approve loan."""
        try:
            loan = get_object_or_404(Loan, pk=pk)
            
            # Check if loan can be approved
            if loan.status not in ['PENDING', 'UNDER_REVIEW']:
                return Response(
                    {'error': f'Loan is in {loan.status} status and cannot be approved.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get approved amount from request
            approved_amount = request.data.get('approved_amount', loan.amount_requested)
            
            try:
                approved_amount_decimal = Decimal(str(approved_amount))
            except (InvalidOperation, TypeError, ValueError):
                return Response(
                    {'error': 'Invalid approved amount format.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate approved amount is not greater than requested
            if approved_amount_decimal > loan.amount_requested:
                return Response(
                    {'error': f'Approved amount (KES {approved_amount_decimal:,.2f}) cannot exceed requested amount (KES {loan.amount_requested:,.2f}).'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate approved amount is not zero or negative
            if approved_amount_decimal <= Decimal('0.00'):
                return Response(
                    {'error': 'Approved amount must be greater than 0.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Approve the loan
            loan.approve(request.user, approved_amount_decimal)
            
            # Log the action
            self.audit_log(
                action='APPROVE',
                model_name='Loan',
                object_id=loan.id,
                user=request.user,
                changes=f"Approved loan {loan.loan_number} for KES {loan.amount_approved:,.2f}"
            )
            
            logger.info(f"Loan {loan.loan_number} approved by {request.user}")
            
            return Response({
                'message': f'Loan {loan.loan_number} has been approved.',
                'loan_id': loan.id,
                'loan_number': loan.loan_number,
                'approved_amount': loan.amount_approved,
                'status': loan.status,
                'approval_date': loan.approval_date,
            })
            
        except ValidationError as e:
            logger.warning(f"Validation error approving loan {pk}: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error approving loan {pk}: {str(e)}", exc_info=True)
            return Response(
                {'error': 'An unexpected error occurred while approving the loan.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class LoanRejectView(AuditMixin, APIView):
    """
    Reject a loan.
    """
    permission_classes = [permissions.IsAuthenticated, CanApproveLoans]
    
    def post(self, request, pk):
        """Reject loan."""
        try:
            loan = get_object_or_404(Loan, pk=pk)
            
            # Check if loan can be rejected
            if loan.status not in ['PENDING', 'UNDER_REVIEW']:
                return Response(
                    {'error': f'Loan is in {loan.status} status and cannot be rejected.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get rejection reason from request
            rejection_reason = request.data.get('rejection_reason', 'No reason provided.')
            
            if not rejection_reason or len(rejection_reason.strip()) < 10:
                return Response(
                    {'error': 'Rejection reason must be at least 10 characters long.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Reject the loan
            loan.reject(request.user, rejection_reason)
            
            # Log the action
            self.audit_log(
                action='REJECT',
                model_name='Loan',
                object_id=loan.id,
                user=request.user,
                changes=f"Rejected loan {loan.loan_number}. Reason: {rejection_reason}"
            )
            
            logger.info(f"Loan {loan.loan_number} rejected by {request.user}")
            
            return Response({
                'message': f'Loan {loan.loan_number} has been rejected.',
                'loan_id': loan.id,
                'loan_number': loan.loan_number,
                'rejection_reason': rejection_reason,
                'status': loan.status,
                'rejection_date': loan.updated_at,
            })
            
        except ValidationError as e:
            logger.warning(f"Validation error rejecting loan {pk}: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error rejecting loan {pk}: {str(e)}", exc_info=True)
            return Response(
                {'error': 'An unexpected error occurred while rejecting the loan.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class LoanDisburseView(AuditMixin, APIView):
    """
    Disburse a loan.
    """
    permission_classes = [permissions.IsAuthenticated, CanProcessPayments]
    
    def post(self, request, pk):
        """Disburse loan."""
        try:
            loan = get_object_or_404(Loan, pk=pk)
            
            # Check if loan can be disbursed
            if loan.status != 'APPROVED':
                return Response(
                    {'error': f'Loan must be approved before disbursement. Current status: {loan.status}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if loan already disbursed
            if loan.amount_disbursed and loan.amount_disbursed > Decimal('0.00'):
                return Response(
                    {'error': f'Loan {loan.loan_number} has already been disbursed.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get disbursement amount from request
            disbursement_amount = request.data.get('disbursement_amount', loan.amount_approved)
            
            try:
                disbursement_amount_decimal = Decimal(str(disbursement_amount))
            except (InvalidOperation, TypeError, ValueError):
                return Response(
                    {'error': 'Invalid disbursement amount format.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate disbursement amount
            if disbursement_amount_decimal > loan.amount_approved:
                return Response(
                    {'error': f'Disbursement amount (KES {disbursement_amount_decimal:,.2f}) cannot exceed approved amount (KES {loan.amount_approved:,.2f}).'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if disbursement_amount_decimal <= Decimal('0.00'):
                return Response(
                    {'error': 'Disbursement amount must be greater than 0.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Calculate net amount after processing fee
            net_amount = disbursement_amount_decimal - loan.processing_fee
            if net_amount <= Decimal('0.00'):
                return Response(
                    {'error': f'Disbursement amount after processing fee (KES {net_amount:,.2f}) must be greater than 0.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Disburse the loan
            loan.disburse(request.user, disbursement_amount_decimal)
            
            # Log the action
            self.audit_log(
                action='DISBURSE',
                model_name='Loan',
                object_id=loan.id,
                user=request.user,
                changes=f"Disbursed loan {loan.loan_number}. Amount: KES {loan.amount_disbursed:,.2f}"
            )
            
            logger.info(f"Loan {loan.loan_number} disbursed by {request.user}")
            
            return Response({
                'message': f'Loan {loan.loan_number} has been disbursed.',
                'loan_id': loan.id,
                'loan_number': loan.loan_number,
                'disbursed_amount': loan.amount_disbursed,
                'net_amount': net_amount,
                'processing_fee': loan.processing_fee,
                'status': loan.status,
                'start_date': loan.start_date,
                'maturity_date': loan.maturity_date,
                'disbursement_date': loan.disbursement_date,
            })
            
        except ValidationError as e:
            logger.warning(f"Validation error disbursing loan {pk}: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error disbursing loan {pk}: {str(e)}", exc_info=True)
            return Response(
                {'error': 'An unexpected error occurred while disbursing the loan.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class LoanCalculatorView(APIView):
    """
    Loan calculator API.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Calculate loan terms."""
        data = request.data
        
        # Validate required fields
        required_fields = ['principal', 'interest_rate', 'term_months']
        for field in required_fields:
            if field not in data:
                return Response(
                    {'error': f'Missing required field: {field}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        try:
            # Parse input data
            principal = Decimal(data['principal'])
            interest_rate = Decimal(data['interest_rate'])
            term_months = int(data['term_months'])
            
            # Validate inputs
            if principal <= Decimal('0.00'):
                return Response(
                    {'error': 'Principal amount must be greater than 0.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if interest_rate < Decimal('0.00') or interest_rate > Decimal('100.00'):
                return Response(
                    {'error': 'Interest rate must be between 0 and 100.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if term_months <= 0 or term_months > 120:
                return Response(
                    {'error': 'Loan term must be between 1 and 120 months.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Optional fields with defaults
            interest_type = data.get('interest_type', 'REDUCING_BALANCE')
            repayment_frequency = data.get('repayment_frequency', 'MONTHLY')
            processing_fee_percentage = Decimal(data.get('processing_fee_percentage', '1.00'))
            
            # Validate optional fields
            if processing_fee_percentage < Decimal('0.00') or processing_fee_percentage > Decimal('10.00'):
                return Response(
                    {'error': 'Processing fee percentage must be between 0 and 10.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Calculate processing fee
            processing_fee = (principal * processing_fee_percentage) / Decimal('100.00')
            
            # Create calculator
            calculator = LoanCalculator(
                principal=principal,
                interest_rate=interest_rate,
                term_months=term_months,
                interest_type=interest_type,
                repayment_frequency=repayment_frequency,
                processing_fee=processing_fee
            )
            
            # Calculate loan terms
            calculations = calculator.calculate()
            
            # Calculate amortization schedule
            amortization_schedule = calculator.amortization_schedule()
            
            return Response({
                'calculations': calculations,
                'amortization_schedule': amortization_schedule[:12],  # First 12 months
                'summary': {
                    'principal': principal,
                    'net_disbursement': principal - processing_fee,
                    'processing_fee': processing_fee,
                    'processing_fee_percentage': processing_fee_percentage,
                }
            })
            
        except (InvalidOperation, TypeError, ValueError) as e:
            return Response(
                {'error': f'Invalid input format: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error in loan calculator: {str(e)}", exc_info=True)
            return Response(
                {'error': 'An error occurred while calculating loan terms.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class LoanStatsView(AuditMixin, APIView):
    """
    Get loan statistics.
    """
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    
    def get(self, request):
        """Return loan statistics."""
        try:
            # Total statistics
            total_loans = Loan.objects.count()
            total_active_loans = Loan.objects.filter(status='ACTIVE').count()
            total_overdue_loans = Loan.objects.filter(status='OVERDUE').count()
            total_completed_loans = Loan.objects.filter(status='COMPLETED').count()
            total_pending_loans = Loan.objects.filter(status__in=['PENDING', 'UNDER_REVIEW']).count()
            
            # Amount statistics
            total_amount_approved = Loan.objects.aggregate(
                total=Sum('amount_approved')
            )['total'] or Decimal('0.00')
            
            total_amount_disbursed = Loan.objects.aggregate(
                total=Sum('amount_disbursed')
            )['total'] or Decimal('0.00')
            
            total_outstanding_balance = Loan.objects.filter(
                status__in=['ACTIVE', 'OVERDUE']
            ).aggregate(
                total=Sum('outstanding_balance')
            )['total'] or Decimal('0.00')
            
            total_amount_repaid = Loan.objects.aggregate(
                total=Sum('amount_paid')
            )['total'] or Decimal('0.00')
            
            total_interest_earned = Loan.objects.aggregate(
                total=Sum('total_interest')
            )['total'] or Decimal('0.00')
            
            # Average loan size
            avg_loan_size = Loan.objects.filter(
                amount_approved__isnull=False
            ).aggregate(
                avg=Avg('amount_approved')
            )['avg'] or Decimal('0.00')
            
            # Average interest rate
            avg_interest_rate = Loan.objects.filter(
                interest_rate__isnull=False
            ).aggregate(
                avg=Avg('interest_rate')
            )['avg'] or Decimal('0.00')
            
            # Status distribution
            status_distribution = Loan.objects.values('status').annotate(
                count=Count('id'),
                total_amount=Sum('amount_approved'),
                avg_amount=Avg('amount_approved')
            ).order_by('status')
            
            # Loan type distribution
            type_distribution = Loan.objects.values('loan_type').annotate(
                count=Count('id'),
                total_amount=Sum('amount_approved'),
                avg_amount=Avg('amount_approved')
            ).order_by('loan_type')
            
            # Risk level distribution
            risk_distribution = Loan.objects.values('risk_level').annotate(
                count=Count('id'),
                total_amount=Sum('amount_approved'),
                avg_amount=Avg('amount_approved')
            ).order_by('risk_level')
            
            # Monthly loan applications (last 6 months)
            six_months_ago = timezone.now() - timedelta(days=180)
            monthly_applications = Loan.objects.filter(
                application_date__gte=six_months_ago
            ).annotate(
                month=TruncMonth('application_date')
            ).values('month').annotate(
                applications=Count('id'),
                approved=Count('id', filter=Q(status='APPROVED')),
                disbursed=Count('id', filter=Q(status='ACTIVE')),
                total_amount=Sum('amount_approved')
            ).order_by('month')
            
            # Top customers by loan amount
            top_customers = Loan.objects.values(
                'customer__id',
                'customer__first_name',
                'customer__last_name',
                'customer__customer_number'
            ).annotate(
                loan_count=Count('id'),
                total_borrowed=Sum('amount_approved'),
                total_outstanding=Sum('outstanding_balance'),
                total_repaid=Sum('amount_paid')
            ).order_by('-total_borrowed')[:10]
            
            # Performance metrics
            if total_amount_approved > 0:
                repayment_rate = (total_amount_repaid / total_amount_approved) * 100
            else:
                repayment_rate = 0
            
            if total_active_loans > 0:
                overdue_rate = (total_overdue_loans / total_active_loans) * 100
            else:
                overdue_rate = 0
            
            # Portfolio at risk (PAR)
            if total_outstanding_balance > 0:
                overdue_amount = Loan.objects.filter(status='OVERDUE').aggregate(
                    total=Sum('outstanding_balance')
                )['total'] or Decimal('0.00')
                par_rate = (overdue_amount / total_outstanding_balance) * 100
            else:
                par_rate = 0
            
            return Response({
                'summary': {
                    'total_loans': total_loans,
                    'total_active_loans': total_active_loans,
                    'total_overdue_loans': total_overdue_loans,
                    'total_completed_loans': total_completed_loans,
                    'total_pending_loans': total_pending_loans,
                    'total_amount_approved': float(total_amount_approved),
                    'total_amount_disbursed': float(total_amount_disbursed),
                    'total_outstanding_balance': float(total_outstanding_balance),
                    'total_amount_repaid': float(total_amount_repaid),
                    'total_interest_earned': float(total_interest_earned),
                    'average_loan_size': float(avg_loan_size),
                    'average_interest_rate': float(avg_interest_rate),
                    'repayment_rate': round(repayment_rate, 2),
                    'overdue_rate': round(overdue_rate, 2),
                    'portfolio_at_risk_rate': round(par_rate, 2),
                },
                'distributions': {
                    'status': list(status_distribution),
                    'loan_type': list(type_distribution),
                    'risk_level': list(risk_distribution),
                },
                'trends': {
                    'monthly_applications': list(monthly_applications),
                },
                'top_customers': list(top_customers),
            })
            
        except Exception as e:
            logger.error(f"Error generating loan stats: {str(e)}", exc_info=True)
            return Response(
                {'error': 'An error occurred while generating statistics.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class LoanSearchView(AuditMixin, generics.ListAPIView):
    """
    Advanced search for loans.
    """
    serializer_class = LoanSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    pagination_class = PaginationMixin.pagination_class
    
    def get_queryset(self):
        queryset = Loan.objects.all().select_related('customer')
        
        # Search parameters
        search_query = self.request.query_params.get('q', '')
        search_type = self.request.query_params.get('type', 'basic')
        
        if search_query:
            if search_type == 'loan_number':
                queryset = queryset.filter(loan_number__icontains=search_query)
            elif search_type == 'customer_name':
                queryset = queryset.filter(
                    Q(customer__first_name__icontains=search_query) |
                    Q(customer__last_name__icontains=search_query)
                )
            elif search_type == 'customer_phone':
                queryset = queryset.filter(customer__phone_number__icontains=search_query)
            elif search_type == 'customer_id':
                queryset = queryset.filter(customer__id_number__icontains=search_query)
            elif search_type == 'customer_email':
                queryset = queryset.filter(customer__email__icontains=search_query)
            else:  # Basic search - search all fields
                queryset = queryset.filter(
                    Q(loan_number__icontains=search_query) |
                    Q(customer__first_name__icontains=search_query) |
                    Q(customer__last_name__icontains=search_query) |
                    Q(customer__customer_number__icontains=search_query) |
                    Q(customer__phone_number__icontains=search_query) |
                    Q(customer__id_number__icontains=search_query) |
                    Q(customer__email__icontains=search_query)
                )
        
        return queryset


class LoanExportView(AuditMixin, APIView):
    """
    Export loans to Excel or CSV.
    """
    permission_classes = [permissions.IsAuthenticated, IsManager]
    
    def get(self, request):
        """Export loans data."""
        format_type = request.query_params.get('format', 'excel')  # 'excel' or 'csv'
        
        try:
            # Get filtered queryset
            queryset = Loan.objects.all().select_related('customer')
            
            # Apply filters from request
            status_filter = request.query_params.get('status', None)
            if status_filter:
                queryset = queryset.filter(status=status_filter)
            
            loan_type = request.query_params.get('loan_type', None)
            if loan_type:
                queryset = queryset.filter(loan_type=loan_type)
            
            date_from = request.query_params.get('date_from', None)
            date_to = request.query_params.get('date_to', None)
            if date_from:
                queryset = queryset.filter(application_date__date__gte=date_from)
            if date_to:
                queryset = queryset.filter(application_date__date__lte=date_to)
            
            risk_level = request.query_params.get('risk_level', None)
            if risk_level:
                queryset = queryset.filter(risk_level=risk_level)
            
            # Prepare data
            data = []
            for loan in queryset:
                data.append({
                    'Loan Number': loan.loan_number,
                    'Customer Name': loan.customer.full_name,
                    'Customer ID': loan.customer.id_number,
                    'Customer Phone': loan.customer.phone_number,
                    'Customer Email': loan.customer.email,
                    'Loan Type': loan.get_loan_type_display(),
                    'Purpose': loan.get_purpose_display(),
                    'Amount Requested': float(loan.amount_requested),
                    'Amount Approved': float(loan.amount_approved) if loan.amount_approved else None,
                    'Amount Disbursed': float(loan.amount_disbursed) if loan.amount_disbursed else None,
                    'Term (Months)': loan.term_months,
                    'Interest Rate': float(loan.interest_rate),
                    'Interest Type': loan.get_interest_type_display(),
                    'Repayment Frequency': loan.get_repayment_frequency_display(),
                    'Status': loan.get_status_display(),
                    'Application Date': loan.application_date.strftime('%Y-%m-%d %H:%M:%S'),
                    'Approval Date': loan.approval_date.strftime('%Y-%m-%d %H:%M:%S') if loan.approval_date else '',
                    'Disbursement Date': loan.disbursement_date.strftime('%Y-%m-%d %H:%M:%S') if loan.disbursement_date else '',
                    'Start Date': loan.start_date.strftime('%Y-%m-%d') if loan.start_date else '',
                    'Maturity Date': loan.maturity_date.strftime('%Y-%m-%d') if loan.maturity_date else '',
                    'Completion Date': loan.completion_date.strftime('%Y-%m-%d') if loan.completion_date else '',
                    'Total Interest': float(loan.total_interest),
                    'Total Amount Due': float(loan.total_amount_due),
                    'Amount Paid': float(loan.amount_paid),
                    'Outstanding Balance': float(loan.outstanding_balance),
                    'Installment Amount': float(loan.installment_amount) if loan.installment_amount else None,
                    'Processing Fee': float(loan.processing_fee),
                    'Total Penalties': float(loan.total_penalties),
                    'Credit Score': float(loan.credit_score_at_application) if loan.credit_score_at_application else None,
                    'Risk Level': loan.get_risk_level_display(),
                    'Created Date': loan.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                    'Updated Date': loan.updated_at.strftime('%Y-%m-%d %H:%M:%S'),
                })
            
            # Create DataFrame
            df = pd.DataFrame(data)
            
            if format_type == 'csv':
                # Export to CSV
                response = HttpResponse(content_type='text/csv')
                response['Content-Disposition'] = 'attachment; filename="loans_export.csv"'
                
                df.to_csv(response, index=False, encoding='utf-8-sig')
                
                # Log export
                self.audit_log(
                    action='EXPORT',
                    model_name='Loan',
                    user=request.user,
                    changes=f"Exported {len(data)} loans to CSV"
                )
                
                logger.info(f"Exported {len(data)} loans to CSV by {request.user}")
                return response
            
            else:  # Excel format
                # Export to Excel
                output = io.BytesIO()
                with pd.ExcelWriter(output, engine='openpyxl') as writer:
                    df.to_excel(writer, sheet_name='Loans', index=False)
                
                response = HttpResponse(
                    output.getvalue(),
                    content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                )
                response['Content-Disposition'] = 'attachment; filename="loans_export.xlsx"'
                
                # Log export
                self.audit_log(
                    action='EXPORT',
                    model_name='Loan',
                    user=request.user,
                    changes=f"Exported {len(data)} loans to Excel"
                )
                
                logger.info(f"Exported {len(data)} loans to Excel by {request.user}")
                return response
                
        except Exception as e:
            logger.error(f"Error exporting loans: {str(e)}", exc_info=True)
            return Response(
                {'error': 'An error occurred while exporting loan data.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class LoanApplicationListView(AuditMixin, PaginationMixin, generics.ListAPIView):
    """
    List all loan applications.
    """
    queryset = LoanApplication.objects.all().select_related(
        'customer', 'reviewer', 'approved_by', 'rejected_by',
        'created_by', 'updated_by'
    )
    
    serializer_class = LoanApplicationSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'loan_type', 'risk_level']
    search_fields = [
        'customer__first_name',
        'customer__last_name',
        'customer__customer_number',
        'customer__phone_number',
        'customer__id_number',
        'purpose',
    ]
    ordering_fields = ['application_date', 'review_date', 'approval_date']
    ordering = ['-application_date']
    
    def get_queryset(self):
        """
        Optionally filter by:
        - pending applications
        - my applications (for customers)
        - date ranges
        """
        queryset = super().get_queryset()
        
        # Filter by pending status
        pending = self.request.query_params.get('pending', None)
        if pending is not None:
            if pending.lower() == 'true':
                queryset = queryset.filter(status__in=['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_REQUESTED'])
            elif pending.lower() == 'false':
                queryset = queryset.exclude(status__in=['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_REQUESTED'])
        
        # Filter by my applications (for customers)
        my_applications = self.request.query_params.get('my_applications', None)
        if my_applications is not None and my_applications.lower() == 'true':
            if hasattr(self.request.user, 'customer_profile'):
                queryset = queryset.filter(customer=self.request.user.customer_profile)
        
        # Filter by reviewer
        reviewer_id = self.request.query_params.get('reviewer_id', None)
        if reviewer_id:
            queryset = queryset.filter(reviewer_id=reviewer_id)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        if start_date:
            queryset = queryset.filter(application_date__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(application_date__date__lte=end_date)
        
        return queryset


class LoanApplicationCreateView(AuditMixin, generics.CreateAPIView):
    """
    Create a new loan application.
    """
    serializer_class = LoanApplicationCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def perform_create(self, serializer):
        """Create loan application."""
        try:
            # Get customer from request
            customer = None
            if hasattr(self.request.user, 'customer_profile'):
                customer = self.request.user.customer_profile
            else:
                # Staff can create applications for any customer
                customer_id = serializer.validated_data.get('customer')
                if not customer_id:
                    raise ValidationError("Customer is required for staff applications.")
            
            application = serializer.save(
                customer=customer,
                created_by=self.request.user
            )
            
            # Log the creation
            self.audit_log(
                action='CREATE',
                model_name='LoanApplication',
                object_id=application.id,
                user=self.request.user,
                changes=f"Created loan application for {application.customer.full_name}"
            )
            
            logger.info(f"Loan application {application.id} created by {self.request.user}")
            
        except Exception as e:
            logger.error(f"Error creating loan application: {str(e)}", exc_info=True)
            raise


class LoanApplicationDetailView(AuditMixin, generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a loan application.
    """
    queryset = LoanApplication.objects.all().select_related(
        'customer', 'reviewer', 'approved_by', 'rejected_by',
        'created_by', 'updated_by', 'loan'
    )
    
    serializer_class = LoanApplicationDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_permissions(self):
        """Custom permissions for different actions."""
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated(), IsStaff()]
        return [permissions.IsAuthenticated()]
    
    def retrieve(self, request, *args, **kwargs):
        """Retrieve application with affordability analysis."""
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            
            # Add affordability analysis
            affordability = instance.calculate_affordability()
            
            response_data = serializer.data
            response_data['affordability_analysis'] = affordability
            
            return Response(response_data)
            
        except Exception as e:
            logger.error(f"Error retrieving application details: {str(e)}", exc_info=True)
            return Response(
                {'error': 'An error occurred while retrieving application details.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def perform_update(self, serializer):
        """Update application with audit trail."""
        old_instance = self.get_object()
        new_instance = serializer.save(updated_by=self.request.user)
        
        # Log changes
        changes = self.get_changes(old_instance, new_instance, serializer.validated_data)
        if changes:
            self.audit_log(
                action='UPDATE',
                model_name='LoanApplication',
                object_id=new_instance.id,
                user=self.request.user,
                changes=changes
            )
    
    def perform_destroy(self, instance):
        """Delete application."""
        if instance.status not in ['DRAFT', 'CANCELLED']:
            raise ValidationError("Only draft or cancelled applications can be deleted.")
        
        instance.delete()
        
        self.audit_log(
            action='DELETE',
            model_name='LoanApplication',
            object_id=instance.id,
            user=self.request.user,
            changes=f"Deleted loan application for {instance.customer.full_name}"
        )


class LoanApplicationSubmitView(AuditMixin, APIView):
    """
    Submit a loan application for review.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        """Submit application."""
        try:
            application = get_object_or_404(LoanApplication, pk=pk)
            
            # Check permissions
            if not (application.customer.user == request.user or request.user.is_staff):
                return Response(
                    {'error': 'You do not have permission to submit this application.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Check if application can be submitted
            if application.status != 'DRAFT':
                return Response(
                    {'error': f'Application is in {application.status} status and cannot be submitted.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Submit the application
            application.submit()
            
            # Log the action
            self.audit_log(
                action='SUBMIT',
                model_name='LoanApplication',
                object_id=application.id,
                user=request.user,
                changes=f"Submitted loan application for review"
            )
            
            logger.info(f"Application {application.id} submitted by {request.user}")
            
            return Response({
                'message': 'Loan application has been submitted for review.',
                'application_id': application.id,
                'status': application.status
            })
            
        except ValidationError as e:
            logger.warning(f"Validation error submitting application {pk}: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error submitting application {pk}: {str(e)}", exc_info=True)
            return Response(
                {'error': 'An unexpected error occurred while submitting the application.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class LoanApplicationReviewView(AuditMixin, APIView):
    """
    Review a loan application.
    """
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    
    def post(self, request, pk):
        """Review application."""
        try:
            application = get_object_or_404(LoanApplication, pk=pk)
            
            # Check if application can be reviewed
            if application.status != 'SUBMITTED':
                return Response(
                    {'error': f'Application is in {application.status} status and cannot be reviewed.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            action = request.data.get('action', 'assign')  # 'assign', 'request_docs', 'receive_docs', 'credit_check'
            
            if action == 'assign':
                # Assign reviewer
                application.assign_reviewer(request.user)
                message = 'Application assigned for review.'
                
            elif action == 'request_docs':
                # Request documents
                notes = request.data.get('notes', '')
                application.request_documents(notes)
                message = 'Documents requested.'
                
            elif action == 'receive_docs':
                # Mark documents as received
                application.receive_documents()
                message = 'Documents marked as received.'
                
            elif action == 'credit_check':
                # Perform credit check
                score = request.data.get('score')
                if not score:
                    return Response(
                        {'error': 'Credit score is required for credit check.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                try:
                    score_decimal = Decimal(str(score))
                except (InvalidOperation, TypeError, ValueError):
                    return Response(
                        {'error': 'Invalid credit score format.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                notes = request.data.get('notes', '')
                application.perform_credit_check(score_decimal, notes)
                message = 'Credit check performed.'
                
            else:
                return Response(
                    {'error': 'Invalid action. Must be one of: assign, request_docs, receive_docs, credit_check'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Log the action
            self.audit_log(
                action='REVIEW',
                model_name='LoanApplication',
                object_id=application.id,
                user=request.user,
                changes=f"Reviewed application. Action: {action}"
            )
            
            logger.info(f"Application {application.id} reviewed (action: {action}) by {request.user}")
            
            return Response({
                'message': message,
                'application_id': application.id,
                'status': application.status
            })
            
        except ValidationError as e:
            logger.warning(f"Validation error reviewing application {pk}: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error reviewing application {pk}: {str(e)}", exc_info=True)
            return Response(
                {'error': 'An unexpected error occurred while reviewing the application.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class LoanApplicationApproveView(AuditMixin, APIView):
    """
    Approve a loan application.
    """
    permission_classes = [permissions.IsAuthenticated, CanApproveLoans]
    
    def post(self, request, pk):
        """Approve application."""
        try:
            application = get_object_or_404(LoanApplication, pk=pk)
            
            # Check if application can be approved
            if application.status not in ['UNDER_REVIEW', 'DOCUMENTS_RECEIVED', 'CREDIT_CHECK']:
                return Response(
                    {'error': f'Application is in {application.status} status and cannot be approved.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get approval details
            approved_amount = request.data.get('approved_amount', application.amount_requested)
            interest_rate = request.data.get('interest_rate', '12.5')
            notes = request.data.get('notes', '')
            
            try:
                approved_amount_decimal = Decimal(str(approved_amount))
                interest_rate_decimal = Decimal(str(interest_rate))
            except (InvalidOperation, TypeError, ValueError):
                return Response(
                    {'error': 'Invalid amount or interest rate format.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate approved amount
            if approved_amount_decimal <= Decimal('0.00'):
                return Response(
                    {'error': 'Approved amount must be greater than 0.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if interest_rate_decimal < Decimal('0.00') or interest_rate_decimal > Decimal('100.00'):
                return Response(
                    {'error': 'Interest rate must be between 0 and 100.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Approve the application
            loan = application.approve(
                request.user,
                approved_amount_decimal,
                interest_rate_decimal,
                notes
            )
            
            # Log the action
            self.audit_log(
                action='APPROVE',
                model_name='LoanApplication',
                object_id=application.id,
                user=request.user,
                changes=f"Approved application. Created loan {loan.loan_number}"
            )
            
            logger.info(f"Application {application.id} approved by {request.user}, created loan {loan.loan_number}")
            
            return Response({
                'message': 'Loan application has been approved.',
                'application_id': application.id,
                'loan_id': loan.id,
                'loan_number': loan.loan_number,
                'approved_amount': application.approved_amount,
                'interest_rate': application.approved_interest_rate,
                'status': application.status
            })
            
        except ValidationError as e:
            logger.warning(f"Validation error approving application {pk}: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error approving application {pk}: {str(e)}", exc_info=True)
            return Response(
                {'error': 'An unexpected error occurred while approving the application.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class LoanApplicationRejectView(AuditMixin, APIView):
    """
    Reject a loan application.
    """
    permission_classes = [permissions.IsAuthenticated, CanApproveLoans]
    
    def post(self, request, pk):
        """Reject application."""
        try:
            application = get_object_or_404(LoanApplication, pk=pk)
            
            # Check if application can be rejected
            if application.status not in ['UNDER_REVIEW', 'DOCUMENTS_RECEIVED', 'CREDIT_CHECK']:
                return Response(
                    {'error': f'Application is in {application.status} status and cannot be rejected.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get rejection reason
            rejection_reason = request.data.get('rejection_reason', 'No reason provided.')
            
            if not rejection_reason or len(rejection_reason.strip()) < 10:
                return Response(
                    {'error': 'Rejection reason must be at least 10 characters long.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Reject the application
            application.reject(request.user, rejection_reason)
            
            # Log the action
            self.audit_log(
                action='REJECT',
                model_name='LoanApplication',
                object_id=application.id,
                user=request.user,
                changes=f"Rejected application. Reason: {rejection_reason}"
            )
            
            logger.info(f"Application {application.id} rejected by {request.user}")
            
            return Response({
                'message': 'Loan application has been rejected.',
                'application_id': application.id,
                'rejection_reason': rejection_reason,
                'status': application.status
            })
            
        except ValidationError as e:
            logger.warning(f"Validation error rejecting application {pk}: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error rejecting application {pk}: {str(e)}", exc_info=True)
            return Response(
                {'error': 'An unexpected error occurred while rejecting the application.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CollateralListView(AuditMixin, PaginationMixin, generics.ListAPIView):
    """
    List all collateral for a loan.
    """
    serializer_class = CollateralSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['collateral_type', 'status', 'ownership_type']
    search_fields = ['description', 'owner_name', 'registration_number']
    
    def get_queryset(self):
        loan_id = self.kwargs.get('loan_id')
        return Collateral.objects.filter(
            loan_id=loan_id
        ).select_related('loan', 'created_by', 'updated_by').order_by('-pledged_date')


class CollateralCreateView(AuditMixin, generics.CreateAPIView):
    """
    Create new collateral for a loan.
    """
    serializer_class = CollateralCreateSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def perform_create(self, serializer):
        """Create collateral for specific loan."""
        try:
            loan_id = self.kwargs.get('loan_id')
            loan = get_object_or_404(Loan, pk=loan_id)
            
            collateral = serializer.save(
                loan=loan,
                created_by=self.request.user
            )
            
            # Log the creation
            self.audit_log(
                action='CREATE',
                model_name='Collateral',
                object_id=collateral.id,
                user=self.request.user,
                changes=f"Created collateral for loan {loan.loan_number}"
            )
            
            logger.info(f"Collateral created for loan {loan.loan_number} by {self.request.user}")
            
        except Exception as e:
            logger.error(f"Error creating collateral: {str(e)}", exc_info=True)
            raise


class CollateralDetailView(AuditMixin, generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete collateral.
    """
    queryset = Collateral.objects.all().select_related('loan', 'created_by', 'updated_by')
    serializer_class = CollateralSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def perform_update(self, serializer):
        """Update collateral with audit trail."""
        old_instance = self.get_object()
        new_instance = serializer.save(updated_by=self.request.user)
        
        # Log changes
        changes = self.get_changes(old_instance, new_instance, serializer.validated_data)
        if changes:
            self.audit_log(
                action='UPDATE',
                model_name='Collateral',
                object_id=new_instance.id,
                user=self.request.user,
                changes=changes
            )
    
    def perform_destroy(self, instance):
        """Delete collateral."""
        if instance.status != 'ACTIVE':
            raise ValidationError("Only active collateral can be deleted.")
        
        instance.delete()
        
        self.audit_log(
            action='DELETE',
            model_name='Collateral',
            object_id=instance.id,
            user=self.request.user,
            changes=f"Deleted collateral for loan {instance.loan.loan_number}"
        )


class CollateralReleaseView(AuditMixin, APIView):
    """
    Release collateral.
    """
    permission_classes = [permissions.IsAuthenticated, IsManager]
    
    def post(self, request, pk):
        """Release collateral."""
        try:
            collateral = get_object_or_404(Collateral, pk=pk)
            
            # Check if collateral can be released
            if collateral.status != 'ACTIVE':
                return Response(
                    {'error': f'Collateral is in {collateral.status} status and cannot be released.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if loan is completed
            if collateral.loan.status != 'COMPLETED':
                return Response(
                    {'error': 'Loan must be completed before collateral can be released.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get release date
            release_date = request.data.get('release_date', None)
            
            # Release collateral
            collateral.release(request.user, release_date)
            
            # Log the action
            self.audit_log(
                action='RELEASE',
                model_name='Collateral',
                object_id=collateral.id,
                user=request.user,
                changes=f"Released collateral"
            )
            
            logger.info(f"Collateral {collateral.id} released by {request.user}")
            
            return Response({
                'message': 'Collateral has been released.',
                'collateral_id': collateral.id,
                'status': collateral.status,
                'release_date': collateral.release_date
            })
            
        except ValidationError as e:
            logger.warning(f"Validation error releasing collateral {pk}: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error releasing collateral {pk}: {str(e)}", exc_info=True)
            return Response(
                {'error': 'An unexpected error occurred while releasing collateral.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )