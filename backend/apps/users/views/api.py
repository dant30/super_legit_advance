# backend/apps/users/views/api.py
import logging
from django.utils import timezone
from django.contrib.auth import authenticate
from django.core.exceptions import ValidationError
from django.db import transaction
from rest_framework import status, viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken

from apps.core.mixins.api_mixins import APIResponseMixin, StandardViewSet
from apps.core.utils.helpers import SecurityHelper, DateHelper
from apps.core.utils.permissions import (
    IsAdmin, IsStaff, IsOwnerOrStaff, CanApproveLoans,
    CanManageCustomers, CanProcessPayments, CanGenerateReports
)
# Import all serializers explicitly
from apps.users.serializers.user import (
    UserSerializer, 
    UserCreateSerializer,
    UserUpdateSerializer,
    UserPasswordChangeSerializer,
    UserPasswordResetSerializer,
    UserPasswordResetConfirmSerializer,
    UserVerificationSerializer,
    LoginSerializer,
    TokenObtainPairResponseSerializer,
    TokenRefreshResponseSerializer,
    UserBasicSerializer,
)
from apps.users.serializers.staff import (
    StaffProfileSerializer,
    StaffProfileCreateSerializer,
    StaffProfileUpdateSerializer,
)
from apps.users.models import User, StaffProfile

logger = logging.getLogger(__name__)


class LoginView(TokenObtainPairView, APIResponseMixin):
    """Custom login view that returns user data along with tokens."""
    serializer_class = LoginSerializer
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        
        try:
            serializer.is_valid(raise_exception=True)
        except ValidationError as e:
            return Response(
                {'detail': str(e.detail)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f'Exception in LoginView: {str(e)}')
            return Response(
                {'detail': 'Login failed'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        user = serializer.validated_data.get('user')
        
        # Record successful login
        ip_address = self.get_client_ip(request)
        user.record_successful_login(ip_address)
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        response_data = {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class LogoutView(APIView, APIResponseMixin):
    """Logout view to blacklist refresh token."""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh") or request.COOKIES.get('refresh_token')
            
            if not refresh_token:
                return self.error("Refresh token is required", status_code=status.HTTP_400_BAD_REQUEST)
            
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            response = self.success(None, "Logout successful")
            response.delete_cookie('refresh_token')
            
            return response
            
        except TokenError as e:
            logger.error(f"Token error during logout: {str(e)}")
            return self.error("Invalid token", status_code=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Logout error: {str(e)}", exc_info=True)
            return self.error("Logout failed", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RefreshTokenView(APIView, APIResponseMixin):
    """Refresh access token using refresh token."""
    
    def post(self, request):
        refresh_token = request.data.get("refresh") or request.COOKIES.get('refresh_token')
        
        if not refresh_token:
            return self.error("Refresh token is required", status_code=status.HTTP_400_BAD_REQUEST)
        
        try:
            token = RefreshToken(refresh_token)
            access_token = str(token.access_token)
            
            response_data = {
                'access': access_token
            }
            
            return self.success(response_data, "Token refreshed successfully")
            
        except TokenError as e:
            logger.error(f"Token refresh error: {str(e)}")
            return self.error("Invalid or expired refresh token", status_code=status.HTTP_401_UNAUTHORIZED)


class UserViewSet(StandardViewSet):
    """ViewSet for user management."""
    queryset = User.objects.filter(is_deleted=False).select_related('created_by', 'updated_by')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    filter_fields = ['role', 'status', 'is_verified', 'is_active']
    search_fields = ['email', 'phone_number', 'first_name', 'last_name', 'id_number']
    ordering_fields = ['created_at', 'updated_at', 'last_login_at', 'first_name', 'last_name']
    
    def get_permissions(self):
        """Return appropriate permissions based on action."""
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.IsAuthenticated, IsStaff]
        elif self.action == 'create':
            permission_classes = [permissions.AllowAny]  # Allow registration
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, IsOwnerOrStaff]
        elif self.action in ['get_current_user', 'update_current_user', 'change_password']:
            permission_classes = [permissions.IsAuthenticated]
        elif self.action in ['verify_user', 'deactivate_user', 'activate_user', 'reset_password_admin', 'user_stats']:
            permission_classes = [permissions.IsAuthenticated, IsAdmin]
        else:
            permission_classes = [permissions.IsAuthenticated]
        
        return [permission() for permission in permission_classes]
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserSerializer
    
    def get_queryset(self):
        """Filter queryset based on user permissions."""
        queryset = super().get_queryset()
        user = self.request.user
        
        if not user.is_admin():
            queryset = queryset.filter(id=user.id)
        
        return queryset
    
    @action(detail=False, methods=['get'], url_path='me')
    def get_current_user(self, request):
        """Get current authenticated user's profile."""
        serializer = self.get_serializer(request.user)
        return self.success(serializer.data, "User profile retrieved")
    
    @action(detail=False, methods=['put'], url_path='me/update')
    def update_current_user(self, request):
        """Update current authenticated user's profile."""
        user = request.user
        serializer = UserUpdateSerializer(user, data=request.data, partial=True, context={'request': request})
        
        if serializer.is_valid():
            serializer.save()
            return self.success(serializer.data, "Profile updated successfully")
        
        return self.validation_error(serializer.errors)
    
    @action(detail=False, methods=['post'], url_path='change-password')
    def change_password(self, request):
        """Change current user's password."""
        user = request.user
        serializer = UserPasswordChangeSerializer(data=request.data, context={'user': user})
        
        if serializer.is_valid():
            user.set_password(serializer.validated_data['new_password'])
            user.last_password_change = timezone.now()
            user.save()
            
            try:
                from apps.notifications.services.email_service import EmailService
                EmailService.send_password_change_notification(user.email)
            except Exception as e:
                logger.error(f"Failed to send password change notification: {e}")
            
            return self.success(None, "Password changed successfully")
        
        return self.validation_error(serializer.errors)
    
    @action(detail=True, methods=['post'], url_path='verify')
    def verify_user(self, request, pk=None):
        """Verify a user (admin action)."""
        user = self.get_object()
        user.is_verified = True
        user.email_verified = True
        user.phone_verified = True
        user.save()
        
        try:
            from apps.notifications.services.email_service import EmailService
            EmailService.send_verification_confirmation(user.email, user.get_full_name())
        except Exception as e:
            logger.error(f"Failed to send verification confirmation: {e}")
        
        return self.success(self.get_serializer(user).data, "User verified successfully")
    
    @action(detail=True, methods=['post'], url_path='deactivate')
    def deactivate_user(self, request, pk=None):
        """Deactivate a user account."""
        user = self.get_object()
        user.is_active = False
        user.save()
        
        return self.success(None, "User deactivated successfully")
    
    @action(detail=True, methods=['post'], url_path='activate')
    def activate_user(self, request, pk=None):
        """Activate a deactivated user account."""
        user = self.get_object()
        user.is_active = True
        user.save()
        
        return self.success(None, "User activated successfully")
    
    @action(detail=False, methods=['post'], url_path='request-password-reset')
    def request_password_reset(self, request):
        """Request password reset."""
        serializer = UserPasswordResetSerializer(data=request.data)
        
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            try:
                user = User.objects.get(email=email, is_active=True, is_deleted=False)
                user.send_password_reset_email()
            except User.DoesNotExist:
                pass  # Don't reveal if user exists
            
            return self.success(None, "If an account exists, you will receive a password reset link.")
        
        return self.validation_error(serializer.errors)
    
    @action(detail=False, methods=['post'], url_path='reset-password-confirm')
    def reset_password_confirm(self, request):
        """Confirm password reset with token."""
        serializer = UserPasswordResetConfirmSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return self.success(None, "Password reset successfully.")
        
        return self.validation_error(serializer.errors)
    
    @action(detail=False, methods=['post'], url_path='verify-email')
    def verify_email(self, request):
        """Verify email with token."""
        serializer = UserVerificationSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.validated_data['user']
            user.verify_email()
            
            return self.success(None, "Email verified successfully.")
        
        return self.validation_error(serializer.errors)
    
    @action(detail=False, methods=['get'], url_path='stats')
    def user_stats(self, request):
        """Get user statistics (admin only)."""
        from django.db.models import Count
        
        total_users = User.objects.filter(is_deleted=False).count()
        active_users = User.objects.filter(is_active=True, is_deleted=False).count()
        verified_users = User.objects.filter(is_verified=True, is_deleted=False).count()
        
        roles_count = User.objects.filter(is_deleted=False).values('role').annotate(
            count=Count('id')
        )
        
        stats = {
            'total_users': total_users,
            'active_users': active_users,
            'verified_users': verified_users,
            'by_role': {item['role']: item['count'] for item in roles_count},
        }
        
        return self.success(stats, "User statistics retrieved")


class StaffProfileViewSet(StandardViewSet):
    """ViewSet for staff profile management."""
    queryset = StaffProfile.objects.filter(is_deleted=False).select_related(
        'user', 'supervisor', 'created_by', 'updated_by'
    )
    serializer_class = StaffProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaff]
    
    filter_fields = ['department', 'position', 'employment_type', 'is_available', 'can_approve_loans']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'employee_id', 'position']
    ordering_fields = ['user__last_name', 'hire_date', 'created_at']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'create':
            return StaffProfileCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return StaffProfileUpdateSerializer
        return StaffProfileSerializer
    
    def get_queryset(self):
        """Filter queryset based on user permissions."""
        queryset = super().get_queryset()
        user = self.request.user
        
        if not user.is_admin():
            queryset = queryset.filter(user=user)
        
        return queryset
    
    @action(detail=False, methods=['get'], url_path='me')
    def get_current_staff(self, request):
        """Get current staff member's profile."""
        try:
            staff_profile = StaffProfile.objects.get(user=request.user, is_deleted=False)
            serializer = self.get_serializer(staff_profile)
            return self.success(serializer.data, "Staff profile retrieved")
        except StaffProfile.DoesNotExist:
            return self.not_found("Staff profile not found")
    
    @action(detail=False, methods=['get'], url_path='available-officers')
    def get_available_officers(self, request):
        """Get list of available loan officers."""
        officers = self.get_queryset().filter(
            user__role='officer',
            is_available=True,
            user__is_active=True
        ).select_related('user')
        
        serializer = self.get_serializer(officers, many=True)
        return self.success(serializer.data, "Available officers retrieved")
    
    @action(detail=True, methods=['post'], url_path='assign-supervisor')
    def assign_supervisor(self, request, pk=None):
        """Assign supervisor to staff member."""
        staff = self.get_object()
        supervisor_id = request.data.get('supervisor_id')
        
        if not supervisor_id:
            return self.error("Supervisor ID is required", status_code=status.HTTP_400_BAD_REQUEST)
        
        try:
            supervisor = User.objects.get(id=supervisor_id, is_active=True, is_deleted=False)
            
            if not supervisor.is_staff_member():
                return self.error("Supervisor must be a staff member", status_code=status.HTTP_400_BAD_REQUEST)
            
            staff.supervisor = supervisor
            staff.save()
            
            return self.success(self.get_serializer(staff).data, "Supervisor assigned successfully")
            
        except User.DoesNotExist:
            return self.not_found("Supervisor not found")
    
    @action(detail=True, methods=['post'], url_path='update-performance')
    def update_performance(self, request, pk=None):
        """Update staff performance rating (admin only)."""
        staff = self.get_object()
        rating = request.data.get('rating')
        review_date = request.data.get('review_date')
        
        if rating is None:
            return self.error("Rating is required", status_code=status.HTTP_400_BAD_REQUEST)
        
        try:
            rating = float(rating)
            if not 0 <= rating <= 5:
                return self.error("Rating must be between 0 and 5", status_code=status.HTTP_400_BAD_REQUEST)
            
            staff.performance_rating = rating
            
            if review_date:
                from datetime import datetime
                staff.last_performance_review = datetime.strptime(review_date, '%Y-%m-%d').date()
            else:
                staff.last_performance_review = timezone.now().date()
            
            staff.save()
            
            return self.success(self.get_serializer(staff).data, "Performance updated successfully")
            
        except ValueError:
            return self.error("Invalid rating format", status_code=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        """Return basic staff statistics for admin UI."""
        from django.db.models import Count

        queryset = self.get_queryset()
        total = queryset.count()
        active = queryset.filter(user__is_active=True).count()
        inactive = queryset.filter(user__is_active=False).count()

        by_department = list(
            queryset.values('department').annotate(count=Count('id')).order_by('-count')
        )

        return self.success({
            'total_staff': total,
            'active_staff': active,
            'inactive_staff': inactive,
            'by_department': {item['department'] or 'Unknown': item['count'] for item in by_department},
        }, "Staff statistics retrieved")