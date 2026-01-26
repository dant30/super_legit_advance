# backend/apps/repayments/views/api.py
from rest_framework import generics, permissions, status, filters, serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Sum, Avg, F, ExpressionWrapper, DecimalField
from django.db import transaction
from django.http import HttpResponse
from django.utils import timezone
from datetime import timedelta, datetime
import pandas as pd
import io
import json
from django.db.models.functions import TruncMonth

from apps.repayments.models import Repayment, RepaymentSchedule, Penalty
from apps.repayments.serializers import (
    RepaymentSerializer,
    RepaymentCreateSerializer,
    RepaymentUpdateSerializer,
    RepaymentDetailSerializer,
    ScheduleSerializer,
    ScheduleCreateSerializer,
    ScheduleUpdateSerializer,
    PenaltySerializer,
    PenaltyCreateSerializer,
    PenaltyUpdateSerializer,
)
from apps.repayments.calculators.repayment_calculator import RepaymentCalculator
from apps.loans.models import Loan
from apps.customers.models import Customer
from apps.core.utils.permissions import IsStaff, IsAdmin, IsManager, IsCollector
from apps.core.mixins.api_mixins import AuditMixin, PaginationMixin


class RepaymentListView(AuditMixin, PaginationMixin, generics.ListAPIView):
    """
    List all repayments or create a new repayment.
    """
    queryset = Repayment.objects.all().select_related(
        'loan', 'customer', 'collected_by', 'verified_by', 'mpesa_payment'
    ).order_by('-payment_date', '-created_at')
    
    serializer_class = RepaymentSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'payment_method', 'repayment_type', 'loan__id', 'customer__id']
    search_fields = [
        'repayment_number',
        'loan__loan_number',
        'customer__customer_number',
        'customer__first_name',
        'customer__last_name',
        'payment_reference',
        'transaction_id',
    ]
    ordering_fields = ['payment_date', 'due_date', 'amount_paid', 'created_at']
    ordering = ['-payment_date']
    
    def get_queryset(self):
        """
        Optionally filter by:
        - date range
        - amount range
        - overdue status
        - collected by user
        """
        queryset = super().get_queryset()
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        if start_date:
            queryset = queryset.filter(payment_date__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(payment_date__date__lte=end_date)
        
        # Filter by due date range
        due_start = self.request.query_params.get('due_start', None)
        due_end = self.request.query_params.get('due_end', None)
        if due_start:
            queryset = queryset.filter(due_date__gte=due_start)
        if due_end:
            queryset = queryset.filter(due_date__lte=due_end)
        
        # Filter by amount range
        min_amount = self.request.query_params.get('min_amount', None)
        max_amount = self.request.query_params.get('max_amount', None)
        if min_amount:
            queryset = queryset.filter(amount_paid__gte=min_amount)
        if max_amount:
            queryset = queryset.filter(amount_paid__lte=max_amount)
        
        # Filter by overdue status
        overdue = self.request.query_params.get('overdue', None)
        if overdue is not None:
            if overdue.lower() == 'true':
                queryset = queryset.filter(status='OVERDUE')
            elif overdue.lower() == 'false':
                queryset = queryset.exclude(status='OVERDUE')
        
        # Filter by collected by user
        collected_by = self.request.query_params.get('collected_by', None)
        if collected_by:
            queryset = queryset.filter(collected_by_id=collected_by)
        
        # Filter by payment method
        payment_method = self.request.query_params.get('payment_method', None)
        if payment_method:
            queryset = queryset.filter(payment_method=payment_method)
        
        return queryset


class RepaymentCreateView(AuditMixin, generics.CreateAPIView):
    """
    Create a new repayment.
    """
    queryset = Repayment.objects.all()
    serializer_class = RepaymentCreateSerializer
    permission_classes = [permissions.IsAuthenticated, IsCollector]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def perform_create(self, serializer):
        """Create repayment with validation."""
        with transaction.atomic():
            repayment = serializer.save(collected_by=self.request.user)
            
            # Log the creation
            self.audit_log(
                action='CREATE',
                model_name='Repayment',
                object_id=repayment.id,
                user=self.request.user,
                changes=f"Created repayment {repayment.repayment_number} for loan {repayment.loan.loan_number}"
            )
            
            # Update loan status
            repayment.update_loan_status()
            
            # Send notification if payment is completed
            if repayment.status == 'COMPLETED':
                self.send_payment_notification(repayment)


class RepaymentDetailView(AuditMixin, generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a repayment instance.
    """
    queryset = Repayment.objects.all().select_related(
        'loan', 'customer', 'collected_by', 'verified_by', 'mpesa_payment'
    ).prefetch_related('penalties', 'schedule_items')
    
    serializer_class = RepaymentDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return RepaymentUpdateSerializer
        return RepaymentDetailSerializer
    
    def perform_update(self, serializer):
        """Update repayment with audit trail."""
        old_instance = self.get_object()
        new_instance = serializer.save()
        
        # Log changes
        changes = self.get_changes(old_instance, new_instance, serializer.validated_data)
        if changes:
            self.audit_log(
                action='UPDATE',
                model_name='Repayment',
                object_id=new_instance.id,
                user=self.request.user,
                changes=changes
            )
        
        # Update loan status
        new_instance.update_loan_status()
    
    def perform_destroy(self, instance):
        """Delete repayment (soft delete through status change)."""
        instance.status = 'CANCELLED'
        instance.notes = f"{instance.notes}\nCancelled by {self.request.user.get_full_name()} on {timezone.now()}"
        instance.save()
        
        self.audit_log(
            action='DELETE',
            model_name='Repayment',
            object_id=instance.id,
            user=self.request.user,
            changes=f"Cancelled repayment {instance.repayment_number}"
        )
        
        # Update loan status
        instance.update_loan_status()

class RepaymentUpdateView(AuditMixin, generics.UpdateAPIView):
    """
    Update a repayment instance.
    """
    queryset = Repayment.objects.all().select_related(
        'loan', 'customer', 'collected_by', 'verified_by', 'mpesa_payment'
    )
    
    serializer_class = RepaymentUpdateSerializer
    permission_classes = [permissions.IsAuthenticated, IsManager]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def perform_update(self, serializer):
        """Update repayment with audit trail."""
        old_instance = self.get_object()
        new_instance = serializer.save()
        
        # Log changes
        changes = self.get_changes(old_instance, new_instance, serializer.validated_data)
        if changes:
            self.audit_log(
                action='UPDATE',
                model_name='Repayment',
                object_id=new_instance.id,
                user=self.request.user,
                changes=changes
            )
        
        # Update loan status
        new_instance.update_loan_status()


class RepaymentDeleteView(AuditMixin, generics.DestroyAPIView):
    """
    Delete a repayment instance (soft delete).
    """
    queryset = Repayment.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsManager]
    
    def perform_destroy(self, instance):
        """Soft delete repayment by changing status to CANCELLED."""
        instance.status = 'CANCELLED'
        instance.notes = f"{instance.notes}\nCancelled by {self.request.user.get_full_name()} on {timezone.now()}"
        instance.save()
        
        self.audit_log(
            action='DELETE',
            model_name='Repayment',
            object_id=instance.id,
            user=self.request.user,
            changes=f"Cancelled repayment {instance.repayment_number}"
        )
        
        # Update loan status
        instance.update_loan_status()


class RepaymentSearchView(AuditMixin, generics.ListAPIView):
    """
    Advanced search for repayments.
    """
    serializer_class = RepaymentSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    
    def get_queryset(self):
        queryset = Repayment.objects.all().select_related(
            'loan', 'customer', 'collected_by'
        )
        
        # Search parameters
        search_query = self.request.query_params.get('q', '')
        search_type = self.request.query_params.get('type', 'basic')
        
        if search_query:
            if search_type == 'repayment_number':
                queryset = queryset.filter(repayment_number__icontains=search_query)
            elif search_type == 'loan_number':
                queryset = queryset.filter(loan__loan_number__icontains=search_query)
            elif search_type == 'customer_name':
                queryset = queryset.filter(
                    Q(customer__first_name__icontains=search_query) |
                    Q(customer__last_name__icontains=search_query)
                )
            elif search_type == 'customer_number':
                queryset = queryset.filter(customer__customer_number__icontains=search_query)
            elif search_type == 'phone':
                queryset = queryset.filter(customer__phone_number__icontains=search_query)
            elif search_type == 'reference':
                queryset = queryset.filter(
                    Q(payment_reference__icontains=search_query) |
                    Q(transaction_id__icontains=search_query)
                )
            else:  # Basic search - search all fields
                queryset = queryset.filter(
                    Q(repayment_number__icontains=search_query) |
                    Q(loan__loan_number__icontains=search_query) |
                    Q(customer__customer_number__icontains=search_query) |
                    Q(customer__first_name__icontains=search_query) |
                    Q(customer__last_name__icontains=search_query) |
                    Q(payment_reference__icontains=search_query) |
                    Q(transaction_id__icontains=search_query)
                )
        
        return queryset


class RepaymentStatsView(AuditMixin, APIView):
    """
    Get repayment statistics.
    """
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    
    def get(self, request):
        """Return repayment statistics."""
        today = timezone.now().date()
        month_start = today.replace(day=1)
        
        # Total counts
        total_repayments = Repayment.objects.count()
        completed_repayments = Repayment.objects.filter(status='COMPLETED').count()
        pending_repayments = Repayment.objects.filter(status='PENDING').count()
        overdue_repayments = Repayment.objects.filter(status='OVERDUE').count()
        
        # Amount statistics
        total_amount_due = Repayment.objects.aggregate(
            total=Sum('amount_due')
        )['total'] or 0
        
        total_amount_paid = Repayment.objects.aggregate(
            total=Sum('amount_paid')
        )['total'] or 0
        
        total_amount_outstanding = Repayment.objects.aggregate(
            total=Sum('amount_outstanding')
        )['total'] or 0
        
        # Monthly statistics
        monthly_completed = Repayment.objects.filter(
            status='COMPLETED',
            payment_date__date__gte=month_start,
            payment_date__date__lte=today
        ).aggregate(
            count=Count('id'),
            amount=Sum('amount_paid')
        )
        
        # Today's statistics
        today_completed = Repayment.objects.filter(
            status='COMPLETED',
            payment_date__date=today
        ).aggregate(
            count=Count('id'),
            amount=Sum('amount_paid')
        )
        
        # Payment method statistics
        payment_method_stats = Repayment.objects.filter(status='COMPLETED').values(
            'payment_method'
        ).annotate(
            count=Count('id'),
            amount=Sum('amount_paid')
        ).order_by('-amount')
        
        # Status distribution
        status_distribution = Repayment.objects.values('status').annotate(
            count=Count('id'),
            amount_due=Sum('amount_due'),
            amount_paid=Sum('amount_paid'),
            amount_outstanding=Sum('amount_outstanding')
        ).order_by('status')
        
        # Average payment amounts
        avg_payment = Repayment.objects.filter(status='COMPLETED').aggregate(
            avg=Avg('amount_paid')
        )['avg'] or 0
        
        # Collection performance
        collection_rate = (total_amount_paid / total_amount_due * 100) if total_amount_due > 0 else 0
        
        return Response({
            'counts': {
                'total': total_repayments,
                'completed': completed_repayments,
                'pending': pending_repayments,
                'overdue': overdue_repayments,
            },
            'amounts': {
                'total_due': float(total_amount_due),
                'total_paid': float(total_amount_paid),
                'total_outstanding': float(total_amount_outstanding),
                'collection_rate': round(collection_rate, 2),
            },
            'monthly': {
                'count': monthly_completed['count'] or 0,
                'amount': float(monthly_completed['amount'] or 0),
            },
            'today': {
                'count': today_completed['count'] or 0,
                'amount': float(today_completed['amount'] or 0),
            },
            'payment_methods': list(payment_method_stats),
            'status_distribution': list(status_distribution),
            'averages': {
                'avg_payment': float(avg_payment),
                'avg_days_overdue': Repayment.objects.filter(status='OVERDUE').aggregate(
                    avg=Avg('days_overdue')
                )['avg'] or 0,
            },
        })


class ScheduleDetailView(AuditMixin, generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a schedule instance.
    """
    queryset = RepaymentSchedule.objects.all().select_related('loan', 'customer', 'repayment')
    
    serializer_class = ScheduleSerializer
    permission_classes = [permissions.IsAuthenticated, IsManager]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ScheduleUpdateSerializer
        return ScheduleSerializer
    
    def perform_update(self, serializer):
        """Update schedule with audit trail."""
        old_instance = self.get_object()
        new_instance = serializer.save()
        
        # Log changes
        changes = self.get_changes(old_instance, new_instance, serializer.validated_data)
        if changes:
            self.audit_log(
                action='UPDATE',
                model_name='RepaymentSchedule',
                object_id=new_instance.id,
                user=self.request.user,
                changes=changes
            )
    
    def perform_destroy(self, instance):
        """Delete schedule item."""
        instance.delete()
        
        self.audit_log(
            action='DELETE',
            model_name='RepaymentSchedule',
            object_id=instance.id,
            user=self.request.user,
            changes=f"Deleted schedule item #{instance.installment_number} for loan {instance.loan.loan_number}"
        )


class PenaltyDetailView(AuditMixin, generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a penalty instance.
    """
    queryset = Penalty.objects.all().select_related(
        'loan', 'customer', 'repayment', 'applied_by', 'waived_by'
    )
    
    serializer_class = PenaltySerializer
    permission_classes = [permissions.IsAuthenticated, IsManager]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return PenaltyUpdateSerializer
        return PenaltySerializer
    
    def perform_update(self, serializer):
        """Update penalty with audit trail."""
        old_instance = self.get_object()
        new_instance = serializer.save()
        
        # Log changes
        changes = self.get_changes(old_instance, new_instance, serializer.validated_data)
        if changes:
            self.audit_log(
                action='UPDATE',
                model_name='Penalty',
                object_id=new_instance.id,
                user=self.request.user,
                changes=changes
            )
    
    def perform_destroy(self, instance):
        """Delete penalty."""
        instance.delete()
        
        self.audit_log(
            action='DELETE',
            model_name='Penalty',
            object_id=instance.id,
            user=self.request.user,
            changes=f"Deleted penalty {instance.penalty_number}"
        )


class RepaymentProcessView(AuditMixin, APIView):
    """
    Process a payment for a repayment.
    """
    permission_classes = [permissions.IsAuthenticated, IsCollector]
    
    def post(self, request, pk):
        """Process payment for repayment."""
        repayment = get_object_or_404(Repayment, pk=pk)
        
        amount = request.data.get('amount')
        payment_method = request.data.get('payment_method', 'CASH')
        reference = request.data.get('reference', '')
        
        try:
            amount = float(amount)
        except (ValueError, TypeError):
            return Response(
                {'error': 'Invalid amount provided.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if repayment can accept payment
        if repayment.status in ['COMPLETED', 'WAIVED', 'CANCELLED']:
            return Response(
                {'error': f'Cannot process payment for {repayment.status.lower()} repayment.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Process payment
            repayment.make_payment(
                amount=amount,
                payment_method=payment_method,
                reference=reference,
                collected_by=request.user
            )
            
            # Log the action
            self.audit_log(
                action='PAYMENT',
                model_name='Repayment',
                object_id=repayment.id,
                user=request.user,
                changes=f"Processed payment of KES {amount} for repayment {repayment.repayment_number}"
            )
            
            return Response({
                'message': f'Payment of KES {amount} processed successfully.',
                'repayment': RepaymentSerializer(repayment).data
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class RepaymentWaiverView(AuditMixin, APIView):
    """
    Waive part of a repayment amount.
    """
    permission_classes = [permissions.IsAuthenticated, IsManager]
    
    def post(self, request, pk):
        """Waive repayment amount."""
        repayment = get_object_or_404(Repayment, pk=pk)
        
        amount = request.data.get('amount')
        reason = request.data.get('reason', '')
        
        if not reason:
            return Response(
                {'error': 'Reason is required for waiver.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            amount = float(amount)
        except (ValueError, TypeError):
            return Response(
                {'error': 'Invalid amount provided.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Apply waiver
            repayment.waive_amount(
                amount=amount,
                reason=reason,
                waived_by=request.user
            )
            
            return Response({
                'message': f'Waiver of KES {amount} applied successfully.',
                'repayment': RepaymentSerializer(repayment).data
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class RepaymentCancelView(AuditMixin, APIView):
    """
    Cancel a repayment.
    """
    permission_classes = [permissions.IsAuthenticated, IsManager]
    
    def post(self, request, pk):
        """Cancel repayment."""
        repayment = get_object_or_404(Repayment, pk=pk)
        
        reason = request.data.get('reason', '')
        
        if not reason:
            return Response(
                {'error': 'Reason is required for cancellation.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Cancel repayment
            repayment.cancel_payment(
                reason=reason,
                cancelled_by=request.user
            )
            
            return Response({
                'message': 'Repayment cancelled successfully.',
                'repayment': RepaymentSerializer(repayment).data
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class ScheduleListView(AuditMixin, PaginationMixin, generics.ListAPIView):
    """
    List repayment schedules for a loan.
    """
    serializer_class = ScheduleSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['status', 'is_adjusted']
    
    def get_queryset(self):
        loan_id = self.kwargs.get('loan_id')
        loan = get_object_or_404(Loan, pk=loan_id)
        
        queryset = RepaymentSchedule.objects.filter(
            loan=loan
        ).select_related('loan', 'customer', 'repayment').order_by('installment_number')
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by overdue
        overdue = self.request.query_params.get('overdue', None)
        if overdue is not None:
            if overdue.lower() == 'true':
                queryset = queryset.filter(status='OVERDUE')
            elif overdue.lower() == 'false':
                queryset = queryset.exclude(status='OVERDUE')
        
        return queryset


class ScheduleGenerateView(AuditMixin, APIView):
    """
    Generate repayment schedule for a loan.
    """
    permission_classes = [permissions.IsAuthenticated, IsManager]
    
    def post(self, request, loan_id):
        """Generate repayment schedule for loan."""
        loan = get_object_or_404(Loan, pk=loan_id)
        
        # Check if schedule already exists
        existing_schedule = RepaymentSchedule.objects.filter(loan=loan).exists()
        if existing_schedule:
            return Response(
                {'error': 'Repayment schedule already exists for this loan.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Generate schedule using calculator
            calculator = RepaymentCalculator(loan)
            schedule_items = calculator.generate_schedule()
            
            # Create schedule items
            created_items = []
            with transaction.atomic():
                for item in schedule_items:
                    schedule_item = RepaymentSchedule.objects.create(
                        loan=loan,
                        customer=loan.customer,
                        installment_number=item['installment_number'],
                        due_date=item['due_date'],
                        principal_amount=item['principal_amount'],
                        interest_amount=item['interest_amount'],
                        total_amount=item['total_amount'],
                        status='PENDING'
                    )
                    created_items.append(schedule_item)
            
            # Log the action
            self.audit_log(
                action='CREATE',
                model_name='RepaymentSchedule',
                user=request.user,
                changes=f"Generated repayment schedule for loan {loan.loan_number} with {len(created_items)} installments"
            )
            
            return Response({
                'message': f'Repayment schedule generated with {len(created_items)} installments.',
                'schedule_items': ScheduleSerializer(created_items, many=True).data
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class ScheduleAdjustView(AuditMixin, APIView):
    """
    Adjust a repayment schedule item.
    """
    permission_classes = [permissions.IsAuthenticated, IsManager]
    
    def post(self, request, pk):
        """Adjust schedule item."""
        schedule_item = get_object_or_404(RepaymentSchedule, pk=pk)
        
        new_due_date = request.data.get('new_due_date', None)
        new_amount = request.data.get('new_amount', None)
        reason = request.data.get('reason', '')
        
        if not reason:
            return Response(
                {'error': 'Reason is required for adjustment.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Parse new due date if provided
        if new_due_date:
            try:
                new_due_date = datetime.strptime(new_due_date, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {'error': 'Invalid date format. Use YYYY-MM-DD.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Parse new amount if provided
        if new_amount:
            try:
                new_amount = float(new_amount)
            except ValueError:
                return Response(
                    {'error': 'Invalid amount provided.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        try:
            # Adjust schedule
            schedule_item.adjust_schedule(
                new_due_date=new_due_date,
                new_amount=new_amount,
                reason=reason
            )
            
            # Log the action
            self.audit_log(
                action='UPDATE',
                model_name='RepaymentSchedule',
                object_id=schedule_item.id,
                user=request.user,
                changes=f"Adjusted schedule item #{schedule_item.installment_number}. Reason: {reason}"
            )
            
            return Response({
                'message': 'Schedule item adjusted successfully.',
                'schedule_item': ScheduleSerializer(schedule_item).data
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class PenaltyListView(AuditMixin, PaginationMixin, generics.ListAPIView):
    """
    List all penalties.
    """
    queryset = Penalty.objects.all().select_related(
        'loan', 'customer', 'repayment', 'applied_by', 'waived_by'
    ).order_by('-applied_date', '-created_at')
    
    serializer_class = PenaltySerializer
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['status', 'penalty_type', 'loan__id', 'customer__id']
    search_fields = ['penalty_number', 'reason', 'loan__loan_number', 'customer__customer_number']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        if start_date:
            queryset = queryset.filter(applied_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(applied_date__lte=end_date)
        
        # Filter by overdue
        overdue = self.request.query_params.get('overdue', None)
        if overdue is not None:
            today = timezone.now().date()
            if overdue.lower() == 'true':
                queryset = queryset.filter(
                    Q(status__in=['APPLIED', 'PENDING']) & Q(due_date__lt=today)
                )
            elif overdue.lower() == 'false':
                queryset = queryset.exclude(
                    Q(status__in=['APPLIED', 'PENDING']) & Q(due_date__lt=today)
                )
        
        return queryset


class PenaltyCreateView(AuditMixin, generics.CreateAPIView):
    """
    Create a new penalty.
    """
    serializer_class = PenaltyCreateSerializer
    permission_classes = [permissions.IsAuthenticated, IsManager]
    
    def perform_create(self, serializer):
        """Create penalty with audit trail."""
        penalty = serializer.save(applied_by=self.request.user)
        
        # Log the creation
        self.audit_log(
            action='CREATE',
            model_name='Penalty',
            object_id=penalty.id,
            user=self.request.user,
            changes=f"Created penalty {penalty.penalty_number} for loan {penalty.loan.loan_number}"
        )


class PenaltyApplyView(AuditMixin, APIView):
    """
    Apply a pending penalty.
    """
    permission_classes = [permissions.IsAuthenticated, IsManager]
    
    def post(self, request, pk):
        """Apply penalty."""
        penalty = get_object_or_404(Penalty, pk=pk)
        
        if penalty.status != 'PENDING':
            return Response(
                {'error': 'Penalty is already applied or processed.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Apply penalty
            penalty.apply_penalty(applied_by=request.user)
            
            return Response({
                'message': 'Penalty applied successfully.',
                'penalty': PenaltySerializer(penalty).data
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class PenaltyWaiverView(AuditMixin, APIView):
    """
    Waive a penalty.
    """
    permission_classes = [permissions.IsAuthenticated, IsManager]
    
    def post(self, request, pk):
        """Waive penalty."""
        penalty = get_object_or_404(Penalty, pk=pk)
        
        reason = request.data.get('reason', '')
        
        if not reason:
            return Response(
                {'error': 'Reason is required for waiver.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Waive penalty
            penalty.waive_penalty(
                waiver_reason=reason,
                waived_by=request.user
            )
            
            return Response({
                'message': 'Penalty waived successfully.',
                'penalty': PenaltySerializer(penalty).data
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class CustomerRepaymentsView(AuditMixin, PaginationMixin, generics.ListAPIView):
    """
    List all repayments for a customer.
    """
    serializer_class = RepaymentSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    
    def get_queryset(self):
        customer_id = self.kwargs.get('customer_id')
        customer = get_object_or_404(Customer, pk=customer_id)
        
        queryset = Repayment.objects.filter(
            customer=customer
        ).select_related('loan', 'collected_by').order_by('-payment_date')
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        if start_date:
            queryset = queryset.filter(payment_date__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(payment_date__date__lte=end_date)
        
        return queryset


class LoanRepaymentsView(AuditMixin, PaginationMixin, generics.ListAPIView):
    """
    List all repayments for a loan.
    """
    serializer_class = RepaymentSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    
    def get_queryset(self):
        loan_id = self.kwargs.get('loan_id')
        loan = get_object_or_404(Loan, pk=loan_id)
        
        queryset = Repayment.objects.filter(
            loan=loan
        ).select_related('customer', 'collected_by').order_by('-payment_date')
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset


class OverdueRepaymentsView(AuditMixin, PaginationMixin, generics.ListAPIView):
    """
    List all overdue repayments.
    """
    serializer_class = RepaymentSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    
    def get_queryset(self):
        queryset = Repayment.objects.filter(
            status='OVERDUE'
        ).select_related('loan', 'customer', 'collected_by').order_by('due_date')
        
        # Filter by days overdue range
        min_days = self.request.query_params.get('min_days', None)
        max_days = self.request.query_params.get('max_days', None)
        if min_days:
            queryset = queryset.filter(days_overdue__gte=min_days)
        if max_days:
            queryset = queryset.filter(days_overdue__lte=max_days)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        if start_date:
            queryset = queryset.filter(due_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(due_date__lte=end_date)
        
        return queryset


class UpcomingRepaymentsView(AuditMixin, PaginationMixin, generics.ListAPIView):
    """
    List all upcoming repayments (due in next 7 days).
    """
    serializer_class = RepaymentSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    
    def get_queryset(self):
        today = timezone.now().date()
        next_week = today + timedelta(days=7)
        
        queryset = Repayment.objects.filter(
            status__in=['PENDING', 'PARTIAL'],
            due_date__range=[today, next_week]
        ).select_related('loan', 'customer').order_by('due_date')
        
        # Filter by customer if provided
        customer_id = self.request.query_params.get('customer_id', None)
        if customer_id:
            queryset = queryset.filter(customer_id=customer_id)
        
        return queryset


class RepaymentExportView(AuditMixin, APIView):
    """
    Export repayments to Excel or CSV.
    """
    permission_classes = [permissions.IsAuthenticated, IsManager]
    
    def get(self, request):
        """Export repayments data."""
        format_type = request.query_params.get('format', 'excel')  # 'excel' or 'csv'
        
        # Get filtered queryset
        queryset = Repayment.objects.all().select_related('loan', 'customer', 'collected_by')
        
        # Apply filters from request
        status_filter = request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        start_date = request.query_params.get('start_date', None)
        end_date = request.query_params.get('end_date', None)
        if start_date:
            queryset = queryset.filter(payment_date__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(payment_date__date__lte=end_date)
        
        # Prepare data
        data = []
        for repayment in queryset:
            data.append({
                'Repayment Number': repayment.repayment_number,
                'Loan Number': repayment.loan.loan_number if repayment.loan else '',
                'Customer': repayment.customer.full_name if repayment.customer else '',
                'Customer Number': repayment.customer.customer_number if repayment.customer else '',
                'Amount Due': float(repayment.amount_due),
                'Amount Paid': float(repayment.amount_paid),
                'Amount Outstanding': float(repayment.amount_outstanding),
                'Payment Method': repayment.get_payment_method_display(),
                'Repayment Type': repayment.get_repayment_type_display(),
                'Status': repayment.get_status_display(),
                'Due Date': repayment.due_date.strftime('%Y-%m-%d') if repayment.due_date else '',
                'Payment Date': repayment.payment_date.strftime('%Y-%m-%d %H:%M') if repayment.payment_date else '',
                'Days Overdue': repayment.days_overdue,
                'Payment Reference': repayment.payment_reference,
                'Transaction ID': repayment.transaction_id,
                'Collected By': repayment.collected_by.get_full_name() if repayment.collected_by else '',
                'Created Date': repayment.created_at.strftime('%Y-%m-%d %H:%M'),
            })
        
        # Create DataFrame
        df = pd.DataFrame(data)
        
        if format_type == 'csv':
            # Export to CSV
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="repayments_export.csv"'
            
            df.to_csv(response, index=False)
            
            # Log export
            self.audit_log(
                action='EXPORT',
                model_name='Repayment',
                user=request.user,
                changes=f"Exported {len(data)} repayments to CSV"
            )
            
            return response
        
        else:  # Excel format
            # Export to Excel
            output = io.BytesIO()
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                df.to_excel(writer, sheet_name='Repayments', index=False)
            
            response = HttpResponse(
                output.getvalue(),
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            response['Content-Disposition'] = 'attachment; filename="repayments_export.xlsx"'
            
            # Log export
            self.audit_log(
                action='EXPORT',
                model_name='Repayment',
                user=request.user,
                changes=f"Exported {len(data)} repayments to Excel"
            )
            
            return response


class RepaymentDashboardView(AuditMixin, APIView):
    """
    Get repayment dashboard statistics.
    """
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    
    def get(self, request):
        """Return repayment dashboard statistics."""
        today = timezone.now().date()
        month_start = today.replace(day=1)
        
        # Total statistics
        total_repayments = Repayment.objects.count()
        total_amount_paid = Repayment.objects.aggregate(
            total=Sum('amount_paid')
        )['total'] or 0
        
        # Monthly statistics
        monthly_repayments = Repayment.objects.filter(
            payment_date__date__gte=month_start,
            payment_date__date__lte=today
        )
        
        monthly_count = monthly_repayments.count()
        monthly_amount = monthly_repayments.aggregate(
            total=Sum('amount_paid')
        )['total'] or 0
        
        # Today's statistics
        today_repayments = Repayment.objects.filter(
            payment_date__date=today
        )
        
        today_count = today_repayments.count()
        today_amount = today_repayments.aggregate(
            total=Sum('amount_paid')
        )['total'] or 0
        
        # Status breakdown
        status_breakdown = Repayment.objects.values('status').annotate(
            count=Count('id'),
            amount=Sum('amount_paid')
        ).order_by('status')
        
        # Payment method breakdown
        method_breakdown = Repayment.objects.values('payment_method').annotate(
            count=Count('id'),
            amount=Sum('amount_paid')
        ).order_by('payment_method')
        
        # Overdue statistics
        overdue_repayments = Repayment.objects.filter(status='OVERDUE')
        overdue_count = overdue_repayments.count()
        overdue_amount = overdue_repayments.aggregate(
            total=Sum('amount_outstanding')
        )['total'] or 0
        
        # Upcoming repayments (next 7 days)
        next_week = today + timedelta(days=7)
        upcoming_repayments = Repayment.objects.filter(
            status__in=['PENDING', 'PARTIAL'],
            due_date__range=[today, next_week]
        )
        
        upcoming_count = upcoming_repayments.count()
        upcoming_amount = upcoming_repayments.aggregate(
            total=Sum('amount_outstanding')
        )['total'] or 0
        
        # Top collectors (last 30 days)
        thirty_days_ago = today - timedelta(days=30)
        top_collectors = Repayment.objects.filter(
            payment_date__date__gte=thirty_days_ago,
            collected_by__isnull=False
        ).values('collected_by__email', 'collected_by__first_name', 'collected_by__last_name').annotate(
            count=Count('id'),
            amount=Sum('amount_paid')
        ).order_by('-amount')[:10]
        
        # Monthly trend (last 6 months)
        six_months_ago = today - timedelta(days=180)
        monthly_trend = Repayment.objects.filter(
            payment_date__date__gte=six_months_ago
        ).annotate(
            month=TruncMonth('payment_date')
        ).values('month').annotate(
            count=Count('id'),
            amount=Sum('amount_paid')
        ).order_by('month')
        
        return Response({
            'overview': {
                'total_repayments': total_repayments,
                'total_amount_paid': float(total_amount_paid),
                'monthly_repayments': monthly_count,
                'monthly_amount': float(monthly_amount),
                'today_repayments': today_count,
                'today_amount': float(today_amount),
            },
            'status_breakdown': list(status_breakdown),
            'method_breakdown': list(method_breakdown),
            'overdue': {
                'count': overdue_count,
                'amount': float(overdue_amount),
                'average_days_overdue': overdue_repayments.aggregate(
                    avg=Avg('days_overdue')
                )['avg'] or 0,
            },
            'upcoming': {
                'count': upcoming_count,
                'amount': float(upcoming_amount),
            },
            'top_collectors': list(top_collectors),
            'monthly_trend': list(monthly_trend),
        })


class BulkRepaymentCreateView(AuditMixin, APIView):
    """
    Create multiple repayments in bulk.
    """
    permission_classes = [permissions.IsAuthenticated, IsManager]
    
    def post(self, request):
        """Create bulk repayments."""
        repayments_data = request.data.get('repayments', [])
        
        if not repayments_data or not isinstance(repayments_data, list):
            return Response(
                {'error': 'Repayments data must be a non-empty list.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        created_count = 0
        errors = []
        
        with transaction.atomic():
            for index, repayment_data in enumerate(repayments_data):
                try:
                    # Validate required fields
                    required_fields = ['loan_id', 'amount_due', 'due_date']
                    for field in required_fields:
                        if field not in repayment_data:
                            errors.append(f"Item {index + 1}: Missing required field '{field}'")
                            continue
                    
                    # Get loan
                    loan = get_object_or_404(Loan, pk=repayment_data['loan_id'])
                    
                    # Create repayment
                    repayment = Repayment.objects.create(
                        loan=loan,
                        customer=loan.customer,
                        amount_due=repayment_data['amount_due'],
                        due_date=repayment_data['due_date'],
                        principal_amount=repayment_data.get('principal_amount', 0),
                        interest_amount=repayment_data.get('interest_amount', 0),
                        payment_method=repayment_data.get('payment_method', 'MPESA'),
                        repayment_type=repayment_data.get('repayment_type', 'FULL'),
                        notes=repayment_data.get('notes', ''),
                        collected_by=request.user,
                    )
                    
                    created_count += 1
                    
                except Exception as e:
                    errors.append(f"Item {index + 1}: {str(e)}")
                    continue
        
        # Log bulk creation
        self.audit_log(
            action='BULK_CREATE',
            model_name='Repayment',
            user=request.user,
            changes=f"Created {created_count} repayments in bulk. Errors: {len(errors)}"
        )
        
        return Response({
            'message': f'Successfully created {created_count} repayments.',
            'created_count': created_count,
            'error_count': len(errors),
            'errors': errors if errors else None
        })


class RepaymentReminderView(AuditMixin, APIView):
    """
    Send payment reminders for upcoming or overdue repayments.
    """
    permission_classes = [permissions.IsAuthenticated, IsManager]
    
    def post(self, request):
        """Send payment reminders."""
        reminder_type = request.data.get('type', 'upcoming')  # 'upcoming' or 'overdue'
        customer_id = request.data.get('customer_id', None)
        loan_id = request.data.get('loan_id', None)
        
        # Get repayments based on type
        today = timezone.now().date()
        
        if reminder_type == 'upcoming':
            next_week = today + timedelta(days=7)
            queryset = Repayment.objects.filter(
                status__in=['PENDING', 'PARTIAL'],
                due_date__range=[today, next_week]
            )
        elif reminder_type == 'overdue':
            queryset = Repayment.objects.filter(
                status='OVERDUE'
            )
        else:
            return Response(
                {'error': 'Invalid reminder type. Use "upcoming" or "overdue".'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Filter by customer or loan if specified
        if customer_id:
            queryset = queryset.filter(customer_id=customer_id)
        
        if loan_id:
            queryset = queryset.filter(loan_id=loan_id)
        
        # Send reminders
        sent_count = 0
        failed_count = 0
        
        for repayment in queryset:
            try:
                # Send SMS reminder
                self.send_sms_reminder(repayment)
                sent_count += 1
                
            except Exception as e:
                failed_count += 1
                # Log error but continue with other reminders
        
        # Log reminder sending
        self.audit_log(
            action='SEND_REMINDERS',
            model_name='Repayment',
            user=request.user,
            changes=f"Sent {sent_count} {reminder_type} payment reminders. Failed: {failed_count}"
        )
        
        return Response({
            'message': f'Sent {sent_count} {reminder_type} payment reminders.',
            'sent_count': sent_count,
            'failed_count': failed_count,
        })
    
    def send_sms_reminder(self, repayment):
        """
        Send SMS reminder for repayment.
        This would integrate with your SMS service (Africa's Talking).
        """
        # This is a placeholder - implement based on your SMS service
        customer = repayment.customer
        loan = repayment.loan
        
        message = f"""
        Dear {customer.first_name},
        
        Your loan payment of KES {repayment.amount_due:,.2f} for loan {loan.loan_number} is due on {repayment.due_date}.
        
        Please make payment before the due date to avoid penalties.
        
        Thank you,
        Super Legit Advance
        """
        
        # Here you would integrate with your SMS service
        # Example: sms_service.send_sms(customer.phone_number, message)
        
        # For now, just log the message
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"SMS reminder for repayment {repayment.repayment_number}: {message}")
    
    def send_payment_notification(self, repayment):
        """
        Send payment confirmation notification.
        """
        customer = repayment.customer
        
        message = f"""
        Dear {customer.first_name},
        
        Thank you for your payment of KES {repayment.amount_paid:,.2f} for loan {repayment.loan.loan_number}.
        
        Payment Reference: {repayment.repayment_number}
        Payment Date: {repayment.payment_date.strftime('%Y-%m-%d %H:%M')}
        
        Your new outstanding balance is KES {repayment.loan.outstanding_balance:,.2f}.
        
        Thank you for choosing Super Legit Advance.
        """
        
        # Here you would integrate with your SMS service
        # For now, just log the message
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"Payment notification for repayment {repayment.repayment_number}: {message}")