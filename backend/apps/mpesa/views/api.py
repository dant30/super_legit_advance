# backend/apps/mpesa/views/api.py
from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import JSONParser, FormParser, MultiPartParser
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Sum, Avg
from django.utils import timezone
from datetime import datetime, timedelta
import logging

from apps.mpesa.models import MpesaPayment, MpesaTransaction, MpesaCallback
from apps.mpesa.serializers import (
    STKPushSerializer,
    MpesaPaymentSerializer,
    MpesaPaymentDetailSerializer,
    MpesaTransactionSerializer,
    PaymentRetrySerializer,
    PaymentReversalSerializer,
)
from apps.mpesa.services.mpesa_service import MpesaService
from apps.mpesa.services.stk_push import STKPushService
from apps.mpesa.services.callback_handler import CallbackHandler
from apps.core.utils.permissions import IsStaff, IsAdmin, IsManager
from apps.core.mixins.api_mixins import AuditMixin, PaginationMixin

logger = logging.getLogger(__name__)


class STKPushInitiateView(AuditMixin, APIView):
    """
    Initiate STK Push payment request.
    """
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [JSONParser, FormParser]
    
    def post(self, request):
        """Initiate STK push payment."""
        serializer = STKPushSerializer(data=request.data, context={'request': request})
        
        if not serializer.is_valid():
            return Response(
                {'error': 'Invalid data', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Get validated data
            data = serializer.validated_data
            
            # Initiate STK push
            stk_service = STKPushService()
            response = stk_service.initiate_stk_push(
                phone_number=data['phone_number'],
                amount=data['amount'],
                account_reference=data.get('account_reference', ''),
                transaction_description=data.get('description', ''),
                customer=data.get('customer'),
                loan=data.get('loan'),
                repayment=data.get('repayment'),
                payment_type=data.get('payment_type', 'LOAN_REPAYMENT'),
                request=request
            )
            
            if response.get('success', False):
                # Get payment record
                payment_id = response.get('payment_id')
                payment = MpesaPayment.objects.get(id=payment_id)
                
                # Log the action
                self.audit_log(
                    action='CREATE',
                    model_name='MpesaPayment',
                    object_id=payment.id,
                    user=request.user,
                    changes=f"Initiated STK push payment: {payment.payment_reference}"
                )
                
                return Response({
                    'success': True,
                    'message': 'Payment request initiated successfully',
                    'payment_reference': payment.payment_reference,
                    'checkout_request_id': payment.checkout_request_id,
                    'merchant_request_id': payment.merchant_request_id,
                    'payment_id': payment.id,
                    'instructions': 'Check your phone to complete the payment'
                })
            else:
                return Response({
                    'success': False,
                    'error': response.get('message', 'Failed to initiate payment'),
                    'details': response.get('details', {})
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Error initiating STK push: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to initiate payment',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class STKPushCallbackView(APIView):
    """
    Handle STK Push callback from M-Pesa.
    """
    permission_classes = []  # No authentication for callbacks
    parser_classes = [JSONParser]
    
    def post(self, request):
        """Process STK push callback."""
        try:
            callback_data = request.data
            
            # Log the callback
            logger.info(f"STK Push Callback Received: {callback_data}")
            
            # Create callback record
            callback = MpesaCallback.objects.create(
                callback_type='STK_PUSH',
                callback_data=callback_data,
                ip_address=self.get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                headers=dict(request.headers)
            )
            
            # Process the callback
            success = callback.process_callback()
            
            if success:
                return Response({
                    'ResultCode': 0,
                    'ResultDesc': 'Success'
                })
            else:
                return Response({
                    'ResultCode': 1,
                    'ResultDesc': 'Failed to process callback'
                })
                
        except Exception as e:
            logger.error(f"Error processing STK push callback: {str(e)}")
            return Response({
                'ResultCode': 1,
                'ResultDesc': f'Error: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get_client_ip(self, request):
        """Get client IP address."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class PaymentStatusView(AuditMixin, APIView):
    """
    Check payment status.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, payment_reference=None, checkout_request_id=None):
        """Get payment status."""
        try:
            # Find payment by reference or checkout request ID
            if payment_reference:
                payment = get_object_or_404(MpesaPayment, payment_reference=payment_reference)
            elif checkout_request_id:
                payment = get_object_or_404(MpesaPayment, checkout_request_id=checkout_request_id)
            else:
                return Response(
                    {'error': 'Provide payment_reference or checkout_request_id'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Query M-Pesa for current status if payment is pending
            if payment.status in ['PENDING', 'PROCESSING']:
                mpesa_service = MpesaService()
                status_response = mpesa_service.query_transaction_status(
                    checkout_request_id=payment.checkout_request_id
                )
                
                if status_response.get('success', False):
                    # Update payment status based on response
                    result_code = status_response.get('result_code')
                    
                    if result_code == 0:
                        payment.mark_as_successful(
                            result_code=result_code,
                            result_description=status_response.get('result_description', '')
                        )
                    else:
                        payment.mark_as_failed(
                            error_code=str(result_code),
                            error_message=status_response.get('result_description', '')
                        )
            
            serializer = MpesaPaymentDetailSerializer(payment)
            
            return Response({
                'success': True,
                'payment': serializer.data
            })
            
        except MpesaPayment.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Payment not found'
            }, status=status.HTTP_404_NOT_FOUND)
            
        except Exception as e:
            logger.error(f"Error checking payment status: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to check payment status',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PaymentHistoryView(AuditMixin, PaginationMixin, generics.ListAPIView):
    """
    Get payment history for a customer or loan.
    """
    serializer_class = MpesaPaymentSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'payment_type', 'transaction_type']
    
    def get_queryset(self):
        """Filter payments based on query parameters."""
        queryset = MpesaPayment.objects.all().select_related(
            'customer', 'loan', 'repayment'
        ).order_by('-initiated_at')
        
        # Filter by customer
        customer_id = self.request.query_params.get('customer_id')
        if customer_id:
            queryset = queryset.filter(customer_id=customer_id)
        
        # Filter by loan
        loan_id = self.request.query_params.get('loan_id')
        if loan_id:
            queryset = queryset.filter(loan_id=loan_id)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            try:
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
                queryset = queryset.filter(initiated_at__date__gte=start_date)
            except ValueError:
                pass
        
        if end_date:
            try:
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
                queryset = queryset.filter(initiated_at__date__lte=end_date)
            except ValueError:
                pass
        
        # Filter by status
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
        
        # Filter by payment type
        payment_type = self.request.query_params.get('payment_type')
        if payment_type:
            queryset = queryset.filter(payment_type=payment_type)
        
        # Filter by amount range
        min_amount = self.request.query_params.get('min_amount')
        max_amount = self.request.query_params.get('max_amount')
        
        if min_amount:
            try:
                queryset = queryset.filter(amount__gte=float(min_amount))
            except ValueError:
                pass
        
        if max_amount:
            try:
                queryset = queryset.filter(amount__lte=float(max_amount))
            except ValueError:
                pass
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        """Override list to add summary statistics."""
        response = super().list(request, *args, **kwargs)
        
        # Get summary statistics
        queryset = self.filter_queryset(self.get_queryset())
        
        total_payments = queryset.count()
        successful_payments = queryset.filter(status='SUCCESSFUL').count()
        pending_payments = queryset.filter(status__in=['PENDING', 'PROCESSING']).count()
        failed_payments = queryset.filter(status='FAILED').count()
        
        total_amount = queryset.aggregate(total=Sum('amount'))['total'] or 0
        successful_amount = queryset.filter(status='SUCCESSFUL').aggregate(total=Sum('amount'))['total'] or 0
        
        response.data['summary'] = {
            'total_payments': total_payments,
            'successful_payments': successful_payments,
            'pending_payments': pending_payments,
            'failed_payments': failed_payments,
            'total_amount': float(total_amount),
            'successful_amount': float(successful_amount),
            'success_rate': (successful_payments / total_payments * 100) if total_payments > 0 else 0
        }
        
        return response


class TransactionListView(AuditMixin, PaginationMixin, generics.ListAPIView):
    """
    List all M-Pesa transactions.
    """
    serializer_class = MpesaTransactionSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'transaction_type']
    
    def get_queryset(self):
        """Filter transactions."""
        queryset = MpesaTransaction.objects.all().select_related(
            'payment', 'payment__customer', 'payment__loan'
        ).order_by('-transaction_date')
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            try:
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
                queryset = queryset.filter(transaction_date__date__gte=start_date)
            except ValueError:
                pass
        
        if end_date:
            try:
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
                queryset = queryset.filter(transaction_date__date__lte=end_date)
            except ValueError:
                pass
        
        # Filter by phone number
        phone_number = self.request.query_params.get('phone_number')
        if phone_number:
            queryset = queryset.filter(phone_number__icontains=phone_number)
        
        # Filter by receipt number
        receipt_number = self.request.query_params.get('receipt_number')
        if receipt_number:
            queryset = queryset.filter(mpesa_receipt_number__icontains=receipt_number)
        
        return queryset


class TransactionDetailView(AuditMixin, generics.RetrieveAPIView):
    """
    Retrieve M-Pesa transaction details.
    """
    queryset = MpesaTransaction.objects.all().select_related(
        'payment', 'payment__customer', 'payment__loan', 'payment__repayment'
    )
    serializer_class = MpesaTransactionSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    lookup_field = 'mpesa_receipt_number'
    lookup_url_kwarg = 'receipt_number'


class C2BValidationView(APIView):
    """
    Handle C2B validation callback from M-Pesa.
    """
    permission_classes = []
    parser_classes = [JSONParser]
    
    def post(self, request):
        """Process C2B validation callback."""
        try:
            callback_data = request.data
            logger.info(f"C2B Validation Callback: {callback_data}")
            
            # Create callback record
            callback = MpesaCallback.objects.create(
                callback_type='C2B_VALIDATION',
                callback_data=callback_data,
                ip_address=self.get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                headers=dict(request.headers)
            )
            
            # Process validation
            handler = CallbackHandler()
            result = handler.handle_c2b_validation(callback_data)
            
            if result.get('success', False):
                callback.mark_as_processed(result.get('message', ''))
                return Response(result.get('response', {
                    'ResultCode': 0,
                    'ResultDesc': 'Success'
                }))
            else:
                callback.mark_as_error(result.get('message', ''))
                return Response(result.get('response', {
                    'ResultCode': 1,
                    'ResultDesc': 'Failed'
                }))
                
        except Exception as e:
            logger.error(f"Error processing C2B validation: {str(e)}")
            return Response({
                'ResultCode': 1,
                'ResultDesc': f'Error: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get_client_ip(self, request):
        """Get client IP address."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class C2BConfirmationView(APIView):
    """
    Handle C2B confirmation callback from M-Pesa.
    """
    permission_classes = []
    parser_classes = [JSONParser]
    
    def post(self, request):
        """Process C2B confirmation callback."""
        try:
            callback_data = request.data
            logger.info(f"C2B Confirmation Callback: {callback_data}")
            
            # Create callback record
            callback = MpesaCallback.objects.create(
                callback_type='C2B_CONFIRMATION',
                callback_data=callback_data,
                ip_address=self.get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                headers=dict(request.headers)
            )
            
            # Process confirmation
            handler = CallbackHandler()
            result = handler.handle_c2b_confirmation(callback_data)
            
            if result.get('success', False):
                callback.mark_as_processed(result.get('message', ''))
                return Response({
                    'ResultCode': 0,
                    'ResultDesc': 'Success'
                })
            else:
                callback.mark_as_error(result.get('message', ''))
                return Response({
                    'ResultCode': 1,
                    'ResultDesc': 'Failed'
                })
                
        except Exception as e:
            logger.error(f"Error processing C2B confirmation: {str(e)}")
            return Response({
                'ResultCode': 1,
                'ResultDesc': f'Error: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class B2CResultView(APIView):
    """
    Handle B2C result callback from M-Pesa.
    """
    permission_classes = []
    parser_classes = [JSONParser]
    
    def post(self, request):
        """Process B2C result callback."""
        try:
            callback_data = request.data
            logger.info(f"B2C Result Callback: {callback_data}")
            
            # Create callback record
            callback = MpesaCallback.objects.create(
                callback_type='B2C_RESULT',
                callback_data=callback_data,
                ip_address=self.get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                headers=dict(request.headers)
            )
            
            # Process B2C result
            handler = CallbackHandler()
            result = handler.handle_b2c_result(callback_data)
            
            callback.mark_as_processed(result.get('message', ''))
            
            return Response({
                'ResultCode': 0,
                'ResultDesc': 'Success'
            })
            
        except Exception as e:
            logger.error(f"Error processing B2C result: {str(e)}")
            callback.mark_as_error(str(e))
            return Response({
                'ResultCode': 1,
                'ResultDesc': f'Error: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class B2CTimeoutView(APIView):
    """
    Handle B2C timeout callback from M-Pesa.
    """
    permission_classes = []
    parser_classes = [JSONParser]
    
    def post(self, request):
        """Process B2C timeout callback."""
        try:
            callback_data = request.data
            logger.info(f"B2C Timeout Callback: {callback_data}")
            
            # Create callback record
            callback = MpesaCallback.objects.create(
                callback_type='B2C_TIMEOUT',
                callback_data=callback_data,
                ip_address=self.get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                headers=dict(request.headers)
            )
            
            # Process B2C timeout
            handler = CallbackHandler()
            result = handler.handle_b2c_timeout(callback_data)
            
            callback.mark_as_processed(result.get('message', ''))
            
            return Response({
                'ResultCode': 0,
                'ResultDesc': 'Success'
            })
            
        except Exception as e:
            logger.error(f"Error processing B2C timeout: {str(e)}")
            callback.mark_as_error(str(e))
            return Response({
                'ResultCode': 1,
                'ResultDesc': f'Error: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ReversalResultView(APIView):
    """
    Handle reversal result callback from M-Pesa.
    """
    permission_classes = []
    parser_classes = [JSONParser]
    
    def post(self, request):
        """Process reversal result callback."""
        try:
            callback_data = request.data
            logger.info(f"Reversal Result Callback: {callback_data}")
            
            # Create callback record
            callback = MpesaCallback.objects.create(
                callback_type='REVERSAL_RESULT',
                callback_data=callback_data,
                ip_address=self.get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                headers=dict(request.headers)
            )
            
            # Process reversal result
            handler = CallbackHandler()
            result = handler.handle_reversal_result(callback_data)
            
            callback.mark_as_processed(result.get('message', ''))
            
            return Response({
                'ResultCode': 0,
                'ResultDesc': 'Success'
            })
            
        except Exception as e:
            logger.error(f"Error processing reversal result: {str(e)}")
            callback.mark_as_error(str(e))
            return Response({
                'ResultCode': 1,
                'ResultDesc': f'Error: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PaymentWebhookTestView(AuditMixin, APIView):
    """
    Test payment webhook endpoints.
    """
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    
    def post(self, request):
        """Test webhook with sample data."""
        webhook_type = request.data.get('type', 'stk_push')
        test_data = request.data.get('data', {})
        
        try:
            if webhook_type == 'stk_push':
                # Simulate STK push callback
                sample_data = {
                    'Body': {
                        'stkCallback': {
                            'MerchantRequestID': 'test-merchant-request-id',
                            'CheckoutRequestID': 'test-checkout-request-id',
                            'ResultCode': test_data.get('result_code', 0),
                            'ResultDesc': test_data.get('result_desc', 'The service request is processed successfully.'),
                            'CallbackMetadata': {
                                'Item': [
                                    {'Name': 'Amount', 'Value': test_data.get('amount', 100)},
                                    {'Name': 'MpesaReceiptNumber', 'Value': test_data.get('receipt_number', 'TEST123456')},
                                    {'Name': 'TransactionDate', 'Value': test_data.get('transaction_date', '20240101120000')},
                                    {'Name': 'PhoneNumber', 'Value': test_data.get('phone_number', '+254712345678')}
                                ]
                            }
                        }
                    }
                }
                
                # Create test callback
                callback = MpesaCallback.objects.create(
                    callback_type='STK_PUSH',
                    callback_data=sample_data,
                    ip_address='127.0.0.1',
                    user_agent='Test/1.0',
                    headers={'Test': 'True'}
                )
                
                # Process callback
                success = callback.process_callback()
                
                return Response({
                    'success': True,
                    'message': 'STK push webhook test completed',
                    'callback_processed': success,
                    'callback_id': callback.id
                })
            
            elif webhook_type == 'c2b_validation':
                # Simulate C2B validation
                sample_data = {
                    'TransType': 'Pay Bill',
                    'TransID': 'TEST123456',
                    'TransTime': '20240101120000',
                    'TransAmount': test_data.get('amount', 100),
                    'BusinessShortCode': '174379',
                    'BillRefNumber': test_data.get('account_reference', 'TESTREF'),
                    'InvoiceNumber': '',
                    'OrgAccountBalance': '50000',
                    'ThirdPartyTransID': '',
                    'MSISDN': test_data.get('phone_number', '254712345678'),
                    'FirstName': 'Test',
                    'MiddleName': '',
                    'LastName': 'User'
                }
                
                # Create test callback
                callback = MpesaCallback.objects.create(
                    callback_type='C2B_VALIDATION',
                    callback_data=sample_data,
                    ip_address='127.0.0.1',
                    user_agent='Test/1.0',
                    headers={'Test': 'True'}
                )
                
                return Response({
                    'success': True,
                    'message': 'C2B validation webhook test completed',
                    'callback_id': callback.id
                })
            
            else:
                return Response({
                    'success': False,
                    'error': f'Unsupported webhook type: {webhook_type}'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Error testing webhook: {str(e)}")
            return Response({
                'success': False,
                'error': 'Webhook test failed',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PaymentSummaryView(AuditMixin, APIView):
    """
    Get payment summary statistics.
    """
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    
    def get(self, request):
        """Get payment summary."""
        try:
            # Date range (default: last 30 days)
            days = int(request.query_params.get('days', 30))
            start_date = timezone.now() - timedelta(days=days)
            
            # Get payments in date range
            payments = MpesaPayment.objects.filter(initiated_at__gte=start_date)
            transactions = MpesaTransaction.objects.filter(created_at__gte=start_date)
            
            # Payment statistics
            total_payments = payments.count()
            successful_payments = payments.filter(status='SUCCESSFUL').count()
            pending_payments = payments.filter(status__in=['PENDING', 'PROCESSING']).count()
            failed_payments = payments.filter(status='FAILED').count()
            
            # Amount statistics
            total_amount = payments.aggregate(total=Sum('amount'))['total'] or 0
            successful_amount = payments.filter(status='SUCCESSFUL').aggregate(total=Sum('amount'))['total'] or 0
            average_amount = payments.aggregate(avg=Avg('amount'))['avg'] or 0
            
            # Transaction statistics
            total_transactions = transactions.count()
            reversed_transactions = transactions.filter(status='REVERSED').count()
            
            # Daily statistics for chart
            daily_stats = []
            for i in range(days):
                date = start_date + timedelta(days=i)
                day_payments = payments.filter(initiated_at__date=date.date())
                day_successful = day_payments.filter(status='SUCCESSFUL')
                
                daily_stats.append({
                    'date': date.date().isoformat(),
                    'total_payments': day_payments.count(),
                    'successful_payments': day_successful.count(),
                    'total_amount': float(day_payments.aggregate(total=Sum('amount'))['total'] or 0),
                    'successful_amount': float(day_successful.aggregate(total=Sum('amount'))['total'] or 0)
                })
            
            # Payment type distribution
            payment_type_stats = []
            for payment_type, label in MpesaPayment.PAYMENT_TYPE_CHOICES:
                type_payments = payments.filter(payment_type=payment_type)
                type_successful = type_payments.filter(status='SUCCESSFUL')
                
                payment_type_stats.append({
                    'type': payment_type,
                    'label': label,
                    'total': type_payments.count(),
                    'successful': type_successful.count(),
                    'amount': float(type_payments.aggregate(total=Sum('amount'))['total'] or 0)
                })
            
            return Response({
                'success': True,
                'summary': {
                    'period_days': days,
                    'start_date': start_date.date().isoformat(),
                    'end_date': timezone.now().date().isoformat(),
                    
                    'payment_statistics': {
                        'total_payments': total_payments,
                        'successful_payments': successful_payments,
                        'pending_payments': pending_payments,
                        'failed_payments': failed_payments,
                        'success_rate': (successful_payments / total_payments * 100) if total_payments > 0 else 0
                    },
                    
                    'amount_statistics': {
                        'total_amount': float(total_amount),
                        'successful_amount': float(successful_amount),
                        'average_amount': float(average_amount),
                        'currency': 'KES'
                    },
                    
                    'transaction_statistics': {
                        'total_transactions': total_transactions,
                        'reversed_transactions': reversed_transactions
                    }
                },
                
                'daily_statistics': daily_stats,
                'payment_type_distribution': payment_type_stats,
                
                'top_payments': MpesaPaymentSerializer(
                    payments.filter(status='SUCCESSFUL').order_by('-amount')[:10],
                    many=True
                ).data,
                
                'recent_transactions': MpesaTransactionSerializer(
                    transactions.order_by('-transaction_date')[:10],
                    many=True
                ).data
            })
            
        except Exception as e:
            logger.error(f"Error getting payment summary: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to get payment summary',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PaymentRetryView(AuditMixin, APIView):
    """
    Retry a failed payment.
    """
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    parser_classes = [JSONParser]
    
    def post(self, request, payment_id):
        """Retry failed payment."""
        try:
            payment = get_object_or_404(MpesaPayment, id=payment_id)
            
            # Check if payment can be retried
            if not payment.can_retry():
                return Response({
                    'success': False,
                    'error': 'Payment cannot be retried'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            serializer = PaymentRetrySerializer(data=request.data)
            if not serializer.is_valid():
                return Response({
                    'success': False,
                    'error': 'Invalid data',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get new phone number if provided
            new_phone_number = serializer.validated_data.get('phone_number')
            if new_phone_number:
                phone_number = new_phone_number
            else:
                phone_number = payment.phone_number
            
            # Initiate new STK push
            stk_service = STKPushService()
            response = stk_service.initiate_stk_push(
                phone_number=phone_number,
                amount=payment.amount,
                account_reference=payment.payment_reference,
                transaction_description=f"Retry: {payment.description}",
                customer=payment.customer,
                loan=payment.loan,
                repayment=payment.repayment,
                payment_type=payment.payment_type,
                request=request
            )
            
            if response.get('success', False):
                # Increment retry count on original payment
                payment.increment_retry()
                
                # Log the action
                self.audit_log(
                    action='UPDATE',
                    model_name='MpesaPayment',
                    object_id=payment.id,
                    user=request.user,
                    changes=f"Retried failed payment. New payment ID: {response.get('payment_id')}"
                )
                
                return Response({
                    'success': True,
                    'message': 'Payment retry initiated successfully',
                    'new_payment_id': response.get('payment_id'),
                    'new_payment_reference': response.get('payment_reference'),
                    'retry_count': payment.retry_count
                })
            else:
                return Response({
                    'success': False,
                    'error': 'Failed to retry payment',
                    'details': response.get('details', {})
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Error retrying payment: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to retry payment',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PaymentReversalView(AuditMixin, APIView):
    """
    Reverse a successful payment.
    """
    permission_classes = [permissions.IsAuthenticated, IsManager]
    parser_classes = [JSONParser]
    
    def post(self, request, receipt_number):
        """Reverse payment transaction."""
        try:
            transaction = get_object_or_404(MpesaTransaction, mpesa_receipt_number=receipt_number)
            
            # Check if transaction can be reversed
            if transaction.is_reversed:
                return Response({
                    'success': False,
                    'error': 'Transaction already reversed'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            serializer = PaymentReversalSerializer(data=request.data)
            if not serializer.is_valid():
                return Response({
                    'success': False,
                    'error': 'Invalid data',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            reason = serializer.validated_data.get('reason', '')
            
            # Reverse transaction
            success = transaction.reverse_transaction(reason)
            
            if success:
                # Log the action
                self.audit_log(
                    action='UPDATE',
                    model_name='MpesaTransaction',
                    object_id=transaction.id,
                    user=request.user,
                    changes=f"Reversed transaction. Reason: {reason}"
                )
                
                return Response({
                    'success': True,
                    'message': 'Transaction reversed successfully',
                    'transaction_id': transaction.transaction_id,
                    'receipt_number': transaction.mpesa_receipt_number,
                    'status': transaction.status
                })
            else:
                return Response({
                    'success': False,
                    'error': 'Failed to reverse transaction'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except MpesaTransaction.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Transaction not found'
            }, status=status.HTTP_404_NOT_FOUND)
            
        except Exception as e:
            logger.error(f"Error reversing payment: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to reverse payment',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)