# backend/apps/users/models/staff.py
import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from apps.core.models import TimeStampedModel, SoftDeleteModel, AuditableModel
from .user import User


class StaffProfile(TimeStampedModel, SoftDeleteModel, AuditableModel):
    """
    Extended profile for staff members (admins, staff, loan officers).
    Links to User model and stores role-specific information.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # =====================================================================
    # USER RELATIONSHIP
    # =====================================================================
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='staff_profile',
        verbose_name=_("user"),
        help_text=_("The user associated with this staff profile.")
    )
    
    # =====================================================================
    # EMPLOYMENT DETAILS
    # =====================================================================
    employee_id = models.CharField(
        _("employee ID"),
        max_length=50,
        unique=True,
        db_index=True,
        help_text=_("Unique employee identification number.")
    )
    department = models.CharField(
        _("department"),
        max_length=100,
        blank=True,
        help_text=_("Department within the organization.")
    )
    position = models.CharField(
        _("position"),
        max_length=100,
        blank=True,
        help_text=_("Job title/position.")
    )
    hire_date = models.DateField(
        _("hire date"),
        null=True,
        blank=True,
        help_text=_("Date when the staff member was hired.")
    )
    employment_type = models.CharField(
        _("employment type"),
        max_length=50,
        choices=[
            ('full_time', _("Full Time")),
            ('part_time', _("Part Time")),
            ('contract', _("Contract")),
            ('intern', _("Intern")),
        ],
        default='full_time'
    )
    
    # =====================================================================
    # REPORTING STRUCTURE
    # =====================================================================
    supervisor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='subordinates',
        null=True,
        blank=True,
        verbose_name=_("supervisor"),
        help_text=_("Direct supervisor/manager.")
    )
    
    # =====================================================================
    # WORK DETAILS
    # =====================================================================
    office_location = models.CharField(
        _("office location"),
        max_length=200,
        blank=True,
        help_text=_("Physical office location.")
    )
    work_phone = models.CharField(
        _("work phone"),
        max_length=20,
        blank=True,
        help_text=_("Work telephone number.")
    )
    work_email = models.EmailField(
        _("work email"),
        blank=True,
        help_text=_("Work email address (if different from personal).")
    )
    
    # =====================================================================
    # PERFORMANCE METRICS
    # =====================================================================
    performance_rating = models.DecimalField(
        _("performance rating"),
        max_digits=3,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        help_text=_("Overall performance rating (0-5).")
    )
    last_performance_review = models.DateField(
        _("last performance review"),
        null=True,
        blank=True,
        help_text=_("Date of last performance review.")
    )
    
    # =====================================================================
    # PERMISSIONS & ACCESS CONTROL
    # =====================================================================
    can_approve_loans = models.BooleanField(
        _("can approve loans"),
        default=False,
        help_text=_("Can this staff member approve loan applications?")
    )
    can_manage_customers = models.BooleanField(
        _("can manage customers"),
        default=True,
        help_text=_("Can this staff member manage customer accounts?")
    )
    can_process_payments = models.BooleanField(
        _("can process payments"),
        default=True,
        help_text=_("Can this staff member process manual payments?")
    )
    can_generate_reports = models.BooleanField(
        _("can generate reports"),
        default=True,
        help_text=_("Can this staff member generate system reports?")
    )
    max_loan_approval_amount = models.DecimalField(
        _("max loan approval amount"),
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        help_text=_("Maximum loan amount this staff member can approve. None means unlimited.")
    )
    
    # =====================================================================
    # APPROVAL TIER (NEW)
    # =====================================================================
    approval_tier = models.CharField(
        _("approval tier"),
        max_length=50,
        choices=[
            ('junior', _('Junior Officer')),
            ('senior', _('Senior Officer')),
            ('manager', _('Manager')),
            ('director', _('Director')),
        ],
        default='junior',
        help_text=_("Approval authority level based on tier.")
    )
    
    # =====================================================================
    # CUSTOM PERMISSIONS (NEW)
    # =====================================================================
    permissions = models.JSONField(
        _("custom permissions"),
        default=dict,
        blank=True,
        help_text=_("Custom permissions in JSON format, e.g., {'export_reports': true}")
    )
    
    # =====================================================================
    # SCHEDULE & AVAILABILITY
    # =====================================================================
    work_schedule = models.JSONField(
        _("work schedule"),
        default=dict,
        blank=True,
        help_text=_("Weekly work schedule in JSON format.")
    )
    is_available = models.BooleanField(
        _("is available"),
        default=True,
        help_text=_("Is the staff member currently available for work?")
    )
    availability_note = models.TextField(
        _("availability note"),
        blank=True,
        help_text=_("Notes about availability (e.g., vacation, sick leave).")
    )
    
    # =====================================================================
    # BANKING DETAILS
    # =====================================================================
    bank_name = models.CharField(
        _("bank name"),
        max_length=100,
        blank=True,
        help_text=_("Name of bank for salary payments.")
    )
    bank_account_number = models.CharField(
        _("bank account number"),
        max_length=50,
        blank=True,
        help_text=_("Bank account number for salary payments.")
    )
    bank_branch = models.CharField(
        _("bank branch"),
        max_length=100,
        blank=True,
        help_text=_("Bank branch name.")
    )
    
    # =====================================================================
    # EMERGENCY CONTACT
    # =====================================================================
    emergency_contact_name = models.CharField(
        _("emergency contact name"),
        max_length=200,
        blank=True,
        help_text=_("Name of emergency contact person.")
    )
    emergency_contact_phone = models.CharField(
        _("emergency contact phone"),
        max_length=20,
        blank=True,
        help_text=_("Phone number of emergency contact.")
    )
    emergency_contact_relationship = models.CharField(
        _("emergency contact relationship"),
        max_length=50,
        blank=True,
        help_text=_("Relationship to emergency contact (e.g., spouse, parent).")
    )
    
    # =====================================================================
    # DOCUMENTS
    # =====================================================================
    id_document = models.FileField(
        _("ID document"),
        upload_to='staff/documents/id/',
        blank=True,
        null=True,
        help_text=_("Copy of national ID or passport.")
    )
    employment_contract = models.FileField(
        _("employment contract"),
        upload_to='staff/documents/contracts/',
        blank=True,
        null=True,
        help_text=_("Signed employment contract.")
    )
    other_documents = models.JSONField(
        _("other documents"),
        default=list,
        blank=True,
        help_text=_("List of other relevant documents.")
    )
    
    # =====================================================================
    # NOTES
    # =====================================================================
    notes = models.TextField(
        _("notes"),
        blank=True,
        help_text=_("Additional notes about the staff member.")
    )
    
    class Meta:
        verbose_name = _("staff profile")
        verbose_name_plural = _("staff profiles")
        ordering = ['user__last_name', 'user__first_name']
        indexes = [
            models.Index(fields=['employee_id']),
            models.Index(fields=['department']),
            models.Index(fields=['position']),
            models.Index(fields=['is_available']),
            models.Index(fields=['approval_tier']),
            models.Index(fields=['can_approve_loans']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['employee_id'],
                name='unique_employee_id',
                condition=models.Q(is_deleted=False)
            ),
        ]
    
    def __str__(self):
        return f"{self.user.get_full_name()} ({self.employee_id}) - {self.position}"
    
    def save(self, *args, **kwargs):
        """
        Override save to ensure user is a staff member.
        """
        # Validate that user is a staff member
        if not self.user.is_staff_member():
            raise ValidationError(
                _("Staff profile can only be created for staff users (admin, staff, or officer).")
            )
        
        super().save(*args, **kwargs)
    
    # =====================================================================
    # NAME METHODS
    # =====================================================================
    def get_full_name(self):
        """Get staff member's full name from related user."""
        return self.user.get_full_name()
    
    # =====================================================================
    # DEPARTMENT DISPLAY
    # =====================================================================
    def get_department_display(self):
        """Get formatted department name."""
        if not self.department:
            return _("N/A")
        
        departments = {
            'finance': _("Finance"),
            'operations': _("Operations"),
            'risk': _("Risk Management"),
            'compliance': _("Compliance"),
            'it': _("Information Technology"),
            'hr': _("Human Resources"),
            'marketing': _("Marketing"),
            'customer_service': _("Customer Service"),
        }
        
        return departments.get(self.department.lower(), self.department)
    
    # =====================================================================
    # APPROVAL METHODS
    # =====================================================================
    def can_approve_amount(self, amount):
        """
        Check if staff member can approve a loan of given amount.
        
        Args:
            amount: The loan amount to check
            
        Returns:
            bool: True if staff can approve this amount
        """
        # Must have approval permission
        if not self.can_approve_loans:
            return False
        
        # If no limit set, can approve any amount
        if self.max_loan_approval_amount is None:
            return True
        
        # Check against limit
        return amount <= self.max_loan_approval_amount
    
    # =====================================================================
    # SCHEDULE DISPLAY
    # =====================================================================
    def get_work_schedule_display(self):
        """Get formatted work schedule."""
        if not self.work_schedule:
            return _("Standard schedule")
        
        days = {
            'mon': _("Monday"),
            'tue': _("Tuesday"),
            'wed': _("Wednesday"),
            'thu': _("Thursday"),
            'fri': _("Friday"),
            'sat': _("Saturday"),
            'sun': _("Sunday"),
        }
        
        schedule = []
        for day, hours in self.work_schedule.items():
            day_name = days.get(day.lower(), day)
            schedule.append(f"{day_name}: {hours}")
        
        return "; ".join(schedule) if schedule else _("No schedule set")
    
    # =====================================================================
    # AVAILABILITY STATUS
    # =====================================================================
    def is_on_leave(self):
        """Check if staff member is currently on leave."""
        return not self.is_available and "leave" in self.availability_note.lower()
    
    # =====================================================================
    # PERFORMANCE LEVEL
    # =====================================================================
    def get_performance_level(self):
        """
        Get performance level based on rating.
        
        Returns:
            str: Performance level text
        """
        if self.performance_rating is None:
            return _("Not rated")
        
        rating = float(self.performance_rating)
        
        if rating >= 4.5:
            return _("Excellent")
        elif rating >= 4.0:
            return _("Very Good")
        elif rating >= 3.5:
            return _("Good")
        elif rating >= 3.0:
            return _("Satisfactory")
        else:
            return _("Needs Improvement")
    
    # =====================================================================
    # PERMISSION CHECK METHODS
    # =====================================================================
    def has_custom_permission(self, permission_key):
        """
        Check if staff member has a specific custom permission.
        
        Args:
            permission_key: The permission key to check
            
        Returns:
            bool: True if staff has the permission
        """
        if not self.permissions or not isinstance(self.permissions, dict):
            return False
        return self.permissions.get(permission_key, False)
    
    def grant_custom_permission(self, permission_key):
        """Grant a custom permission to this staff member."""
        if not self.permissions:
            self.permissions = {}
        self.permissions[permission_key] = True
        self.save(update_fields=['permissions'])
    
    def revoke_custom_permission(self, permission_key):
        """Revoke a custom permission from this staff member."""
        if self.permissions and permission_key in self.permissions:
            del self.permissions[permission_key]
            self.save(update_fields=['permissions'])
    
    # =====================================================================
    # SERIALIZATION
    # =====================================================================
    def to_dict(self):
        """
        Convert staff profile to dictionary for serialization.
        
        Returns:
            dict: Staff profile data
        """
        return {
            'id': str(self.id),
            'user_id': str(self.user.id),
            'employee_id': self.employee_id,
            'department': self.department,
            'department_display': self.get_department_display(),
            'position': self.position,
            'hire_date': self.hire_date.isoformat() if self.hire_date else None,
            'employment_type': self.employment_type,
            'supervisor_id': str(self.supervisor.id) if self.supervisor else None,
            'supervisor_name': self.supervisor.get_full_name() if self.supervisor else None,
            'performance_rating': float(self.performance_rating) if self.performance_rating else None,
            'performance_level': self.get_performance_level(),
            'approval_tier': self.approval_tier,
            'can_approve_loans': self.can_approve_loans,
            'can_manage_customers': self.can_manage_customers,
            'can_process_payments': self.can_process_payments,
            'can_generate_reports': self.can_generate_reports,
            'max_loan_approval_amount': float(self.max_loan_approval_amount) if self.max_loan_approval_amount else None,
            'is_available': self.is_available,
            'is_on_leave': self.is_on_leave(),
            'work_schedule': self.work_schedule,
            'work_schedule_display': self.get_work_schedule_display(),
            'permissions': self.permissions or {},
        }