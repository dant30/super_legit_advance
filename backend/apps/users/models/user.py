# backend/apps/users/models/user.py
import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.core.validators import validate_email, MinValueValidator, MaxValueValidator
from phonenumber_field.modelfields import PhoneNumberField
from apps.core.models import TimeStampedModel, SoftDeleteModel, AuditableModel
from apps.core.constants import (
    ROLE_CHOICES, ROLE_CUSTOMER,
    GENDER_CHOICES, MARITAL_STATUS_CHOICES,
    STATUS_CHOICES, STATUS_ACTIVE
)
from apps.core.utils.validators import validate_phone_number, validate_id_number


class UserManager(BaseUserManager):
    """
    Custom user manager for creating users and superusers.
    """
    
    def create_user(self, email, phone_number, password=None, **extra_fields):
        """
        Create and save a regular user with the given email, phone and password.
        """
        if not email:
            raise ValueError(_("The Email field must be set"))
        if not phone_number:
            raise ValueError(_("The Phone Number field must be set"))
        
        email = self.normalize_email(email)
        user = self.model(email=email, phone_number=phone_number, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, phone_number, password=None, **extra_fields):
        """
        Create and save a SuperUser with the given email, phone and password.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_verified', True)
        extra_fields.setdefault('email_verified', True)
        extra_fields.setdefault('phone_verified', True)
        extra_fields.setdefault('role', 'admin')
        extra_fields.setdefault('status', 'active')
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        
        return self.create_user(email, phone_number, password, **extra_fields)
    
    def get_by_natural_key(self, username):
        """
        Allow login with either email or phone number.
        This method is called by Django's authentication system.
        """
        try:
            return self.get(email=username)
        except self.model.DoesNotExist:
            pass
        
        raise self.model.DoesNotExist(
            f"User with email or phone '{username}' does not exist."
        )


class User(AbstractBaseUser, PermissionsMixin, TimeStampedModel, SoftDeleteModel, AuditableModel):
    """
    Custom User model for Super Legit Advance.
    Implements comprehensive user management with role-based access control.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # =====================================================================
    # LOGIN CREDENTIALS
    # =====================================================================
    email = models.EmailField(
        _("email address"),
        unique=True,
        db_index=True,
        validators=[validate_email],
        help_text=_("Required. Must be a valid email address.")
    )
    phone_number = PhoneNumberField(
        _("phone number"),
        unique=True,
        db_index=True,
        help_text=_("Required. Format: +254712345678")
    )
    
    # =====================================================================
    # PERSONAL INFORMATION
    # =====================================================================
    first_name = models.CharField(
        _("first name"),
        max_length=150,
        blank=True
    )
    last_name = models.CharField(
        _("last name"),
        max_length=150,
        blank=True
    )
    id_number = models.CharField(
        _("ID number"),
        max_length=20,
        blank=True,
        null=True,
        db_index=True,
        help_text=_("National ID or Passport number")
    )
    date_of_birth = models.DateField(
        _("date of birth"),
        null=True,
        blank=True
    )
    gender = models.CharField(
        _("gender"),
        max_length=10,
        choices=GENDER_CHOICES,
        blank=True,
        null=True
    )
    marital_status = models.CharField(
        _("marital status"),
        max_length=20,
        choices=MARITAL_STATUS_CHOICES,
        blank=True,
        null=True
    )
    
    # =====================================================================
    # ROLE & STATUS
    # =====================================================================
    role = models.CharField(
        _("role"),
        max_length=20,
        choices=ROLE_CHOICES,
        default=ROLE_CUSTOMER,
        db_index=True,
        help_text=_("User role determines access level and permissions.")
    )
    status = models.CharField(
        _("status"),
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_ACTIVE,
        db_index=True,
        help_text=_("Current status of the user account.")
    )
    
    # =====================================================================
    # VERIFICATION FLAGS
    # =====================================================================
    is_verified = models.BooleanField(
        _("verified"),
        default=False,
        help_text=_("Designates whether the user has verified their email and phone.")
    )
    email_verified = models.BooleanField(
        _("email verified"),
        default=False
    )
    phone_verified = models.BooleanField(
        _("phone verified"),
        default=False
    )
    kyc_completed = models.BooleanField(
        _("KYC completed"),
        default=False,
        help_text=_("Know Your Customer verification completed.")
    )
    
    # =====================================================================
    # DJANGO AUTH FIELDS
    # =====================================================================
    is_staff = models.BooleanField(
        _("staff status"),
        default=False,
        help_text=_("Designates whether the user can log into the admin site. Synced with role.")
    )
    is_active = models.BooleanField(
        _("active"),
        default=True,
        help_text=_("Designates whether this user should be treated as active.")
    )
    
    # =====================================================================
    # SECURITY FIELDS
    # =====================================================================
    last_login_ip = models.GenericIPAddressField(
        _("last login IP"),
        blank=True,
        null=True
    )
    last_login_at = models.DateTimeField(
        _("last login at"),
        blank=True,
        null=True
    )
    failed_login_attempts = models.PositiveIntegerField(
        _("failed login attempts"),
        default=0,
        help_text=_("Incremented on failed login, reset on success.")
    )
    locked_until = models.DateTimeField(
        _("locked until"),
        blank=True,
        null=True,
        help_text=_("Account is locked until this timestamp after too many failed attempts.")
    )
    
    # =====================================================================
    # TWO-FACTOR AUTHENTICATION
    # =====================================================================
    two_factor_enabled = models.BooleanField(
        _("2FA enabled"),
        default=False
    )
    two_factor_method = models.CharField(
        _("2FA method"),
        max_length=20,
        choices=[('sms', 'SMS'), ('email', 'Email'), ('app', 'Authenticator App')],
        blank=True,
        null=True
    )
    
    # =====================================================================
    # PROFILE FIELDS
    # =====================================================================
    profile_picture = models.ImageField(
        _("profile picture"),
        upload_to='profiles/',
        blank=True,
        null=True,
        help_text=_("Upload a profile picture (max 2MB)")
    )
    bio = models.TextField(
        _("biography"),
        blank=True
    )
    
    # =====================================================================
    # PREFERENCES
    # =====================================================================
    language = models.CharField(
        _("language"),
        max_length=10,
        default='en',
        choices=[('en', 'English'), ('sw', 'Swahili')]
    )
    notifications_enabled = models.BooleanField(
        _("notifications enabled"),
        default=True
    )
    marketing_emails = models.BooleanField(
        _("marketing emails"),
        default=False
    )
    
    # =====================================================================
    # METADATA
    # =====================================================================
    last_password_change = models.DateTimeField(
        _("last password change"),
        auto_now_add=True
    )
    terms_accepted = models.BooleanField(
        _("terms accepted"),
        default=False
    )
    privacy_policy_accepted = models.BooleanField(
        _("privacy policy accepted"),
        default=False
    )
    
    # =====================================================================
    # MANAGER & CONFIGURATION
    # =====================================================================
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['phone_number', 'first_name', 'last_name']
    
    class Meta:
        verbose_name = _("user")
        verbose_name_plural = _("users")
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['phone_number']),
            models.Index(fields=['role']),
            models.Index(fields=['role', 'status']),
            models.Index(fields=['role', 'status', 'is_active']),
            models.Index(fields=['created_at']),
            models.Index(fields=['is_active', 'is_verified']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['email'],
                name='unique_email',
                condition=models.Q(is_deleted=False)
            ),
            models.UniqueConstraint(
                fields=['phone_number'],
                name='unique_phone',
                condition=models.Q(is_deleted=False)
            ),
        ]
    
    def __str__(self):
        return self.get_full_name() or self.email
    
    # =====================================================================
    # NAME METHODS
    # =====================================================================
    def get_full_name(self):
        """
        Return the first_name plus the last_name, with a space in between.
        Falls back to email if no names are set.
        """
        full_name = f"{self.first_name} {self.last_name}".strip()
        return full_name if full_name else self.email
    
    def get_short_name(self):
        """Return the short name for the user."""
        return self.first_name or self.email.split('@')[0]
    
    # =====================================================================
    # VALIDATION METHODS
    # =====================================================================
    def clean(self):
        """Custom validation for the user model."""
        super().clean()
        
        # Validate age if date of birth is provided
        if self.date_of_birth:
            from datetime import date
            age = (date.today() - self.date_of_birth).days // 365
            if age < 18:
                raise ValidationError({
                    'date_of_birth': _("User must be at least 18 years old.")
                })
        
        # Validate email
        if self.email:
            try:
                validate_email(self.email)
            except ValidationError:
                raise ValidationError({'email': _("Enter a valid email address.")})
    
    def save(self, *args, **kwargs):
        """
        Override save to:
        - Normalize email
        - Sync is_staff with role
        - Run validation if requested
        """
        # Normalize email
        if self.email:
            self.email = self.__class__.objects.normalize_email(self.email)
        
        # Sync is_staff with role (single source of truth)
        self.is_staff = self.role in ['admin', 'staff', 'officer']
        
        # Run validation if requested (skip for performance in some cases)
        validate = kwargs.pop('validate', True)
        if validate:
            self.full_clean()
        
        super().save(*args, **kwargs)
    
    # =====================================================================
    # ACCOUNT LOCKING METHODS
    # =====================================================================
    def is_locked(self):
        """Check if user account is currently locked."""
        if self.locked_until:
            return timezone.now() < self.locked_until
        return False
    
    def lock_account(self, minutes=30):
        """Lock user account for specified minutes."""
        self.locked_until = timezone.now() + timezone.timedelta(minutes=minutes)
        self.save(update_fields=['locked_until'], validate=False)
    
    def unlock_account(self):
        """Unlock user account and reset failed login attempts."""
        self.locked_until = None
        self.failed_login_attempts = 0
        self.save(
            update_fields=['locked_until', 'failed_login_attempts'],
            validate=False
        )
    
    # =====================================================================
    # LOGIN TRACKING METHODS
    # =====================================================================
    def record_failed_login(self):
        """
        Record a failed login attempt.
        Lock account if threshold (5) is reached.
        """
        self.failed_login_attempts += 1
        
        if self.failed_login_attempts >= 5:
            self.lock_account(minutes=30)
        
        self.save(
            update_fields=['failed_login_attempts', 'locked_until'],
            validate=False
        )
    
    def record_successful_login(self, ip_address=None):
        """
        Record a successful login.
        Reset failed attempts and lock status.
        """
        self.last_login_ip = ip_address
        self.last_login_at = timezone.now()
        self.failed_login_attempts = 0
        self.locked_until = None
        
        self.save(
            update_fields=[
                'last_login_ip',
                'last_login_at',
                'failed_login_attempts',
                'locked_until'
            ],
            validate=False
        )
    
    # =====================================================================
    # VERIFICATION METHODS
    # =====================================================================
    def verify_email(self):
        """Mark email as verified."""
        self.email_verified = True
        self.check_verification_status()
        self.save(
            update_fields=['email_verified', 'is_verified'],
            validate=False
        )
    
    def verify_phone(self):
        """Mark phone as verified."""
        self.phone_verified = True
        self.check_verification_status()
        self.save(
            update_fields=['phone_verified', 'is_verified'],
            validate=False
        )
    
    def check_verification_status(self):
        """
        Check if user is fully verified.
        Updates is_verified if both email and phone are verified.
        """
        if self.email_verified and self.phone_verified:
            self.is_verified = True
    
    # =====================================================================
    # ROLE & PERMISSION CHECK METHODS
    # =====================================================================
    def is_admin(self):
        """Check if user is an admin."""
        return self.role == 'admin'
    
    def is_staff_member(self):
        """Check if user is staff (admin, staff, or officer)."""
        return self.role in ['admin', 'staff', 'officer']
    
    def is_customer(self):
        """Check if user is a customer."""
        return self.role == 'customer'
    
    def can_access_admin(self):
        """
        Check if user can access the admin site.
        Must be staff, active, and verified.
        """
        return self.is_staff and self.is_active and self.is_verified
    
    def get_role_display_name(self):
        """Get the display name for the user's role."""
        return dict(ROLE_CHOICES).get(self.role, self.role)
    
    # =====================================================================
    # EMAIL NOTIFICATION METHODS
    # =====================================================================
    def send_verification_email(self):
        """Send email verification link."""
        from apps.notifications.services.email_service import EmailService
        from django.urls import reverse
        from django.utils.encoding import force_bytes
        from django.utils.http import urlsafe_base64_encode
        from .tokens import email_verification_token
        
        uid = urlsafe_base64_encode(force_bytes(self.pk))
        token = email_verification_token.make_token(self)
        
        verification_url = reverse(
            'users:verify-email',
            kwargs={'uidb64': uid, 'token': token}
        )
        
        try:
            EmailService.send_verification_email(self.email, verification_url)
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to send verification email to {self.email}: {e}")
    
    def send_welcome_email(self):
        """Send welcome email to new user."""
        from apps.notifications.services.email_service import EmailService
        
        try:
            EmailService.send_welcome_email(self.email, self.get_full_name())
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to send welcome email to {self.email}: {e}")
    
    def send_password_reset_email(self):
        """Send password reset email."""
        from apps.notifications.services.email_service import EmailService
        from django.urls import reverse
        from django.utils.encoding import force_bytes
        from django.utils.http import urlsafe_base64_encode
        from .tokens import password_reset_token
        
        uid = urlsafe_base64_encode(force_bytes(self.pk))
        token = password_reset_token.make_token(self)
        
        reset_url = reverse(
            'users:password-reset-confirm',
            kwargs={'uidb64': uid, 'token': token}
        )
        
        try:
            EmailService.send_password_reset_email(self.email, reset_url)
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to send password reset email to {self.email}: {e}")
    
    # =====================================================================
    # SERIALIZATION METHODS
    # =====================================================================
    def to_dict(self):
        """Convert user to dictionary for serialization."""
        return {
            'id': str(self.id),
            'email': self.email,
            'phone_number': str(self.phone_number),
            'first_name': self.first_name,
            'last_name': self.last_name,
            'full_name': self.get_full_name(),
            'role': self.role,
            'role_display': self.get_role_display_name(),
            'status': self.status,
            'is_verified': self.is_verified,
            'is_active': self.is_active,
            'is_staff': self.is_staff,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'profile_picture': self.profile_picture.url if self.profile_picture else None,
        }
    
    def to_audit_dict(self):
        """Convert user to dictionary for audit logging."""
        return {
            'id': str(self.id),
            'email': self.email,
            'phone_number': str(self.phone_number),
            'full_name': self.get_full_name(),
            'role': self.role,
            'status': self.status,
            'is_active': self.is_active,
        }