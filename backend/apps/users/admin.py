# backend/apps/users/admin.py
# backend/apps/users/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from django.urls import reverse
from django.core.exceptions import ValidationError
from import_export.admin import ImportExportModelAdmin
from import_export import resources, fields
from import_export.widgets import ForeignKeyWidget

from .models import User, StaffProfile
from apps.core.constants import ROLE_ADMIN, ROLE_STAFF, ROLE_OFFICER, ROLE_CUSTOMER


class UserResource(resources.ModelResource):
    """Resource for importing/exporting users."""
    
    class Meta:
        model = User
        import_id_fields = ['email']
        fields = [
            'id', 'email', 'phone_number', 'first_name', 'last_name',
            'id_number', 'date_of_birth', 'gender', 'marital_status',
            'role', 'status', 'is_verified', 'is_active',
            'created_at', 'updated_at'
        ]
        export_order = fields
    
    def before_import_row(self, row, **kwargs):
        """Validate data before import."""
        # Ensure required fields
        required_fields = ['email', 'phone_number', 'first_name', 'last_name']
        for field in required_fields:
            if not row.get(field):
                raise ValueError(f"{field} is required")
        
        # Set default values if not provided
        if not row.get('role'):
            row['role'] = ROLE_CUSTOMER
        if not row.get('status'):
            row['status'] = 'active'
        
        # Ensure phone number format
        phone = row.get('phone_number')
        if phone and not phone.startswith('+'):
            row['phone_number'] = f'+{phone}'


class StaffProfileResource(resources.ModelResource):
    """Resource for importing/exporting staff profiles."""
    user = fields.Field(
        column_name='user',
        attribute='user',
        widget=ForeignKeyWidget(User, 'email')
    )
    supervisor = fields.Field(
        column_name='supervisor',
        attribute='supervisor',
        widget=ForeignKeyWidget(User, 'email')
    )
    
    class Meta:
        model = StaffProfile
        import_id_fields = ['employee_id']
        fields = [
            'user', 'employee_id', 'department', 'position', 'hire_date',
            'employment_type', 'supervisor', 'office_location', 'work_phone',
            'work_email', 'performance_rating', 'last_performance_review',
            'can_approve_loans', 'can_manage_customers', 'can_process_payments',
            'can_generate_reports', 'max_loan_approval_amount', 'is_available',
            'availability_note', 'bank_name', 'bank_account_number', 'bank_branch',
            'emergency_contact_name', 'emergency_contact_phone',
            'emergency_contact_relationship', 'notes'
        ]
        export_order = fields
    
    def before_import_row(self, row, **kwargs):
        """Validate data before import."""
        # Check if user exists
        user_email = row.get('user')
        if user_email:
            try:
                user = User.objects.get(email=user_email)
                # Check if user is staff
                if not user.is_staff_member():
                    raise ValueError(f"User {user_email} is not a staff member")
            except User.DoesNotExist:
                raise ValueError(f"User {user_email} not found")


class StaffProfileInline(admin.StackedInline):
    """Inline admin for StaffProfile."""
    model = StaffProfile
    can_delete = False
    verbose_name_plural = 'Staff Profile'
    fk_name = 'user'
    fields = [
        'employee_id', 'department', 'position', 'hire_date', 'employment_type',
        'supervisor', 'office_location', 'work_phone', 'work_email',
        'performance_rating', 'last_performance_review',
        'can_approve_loans', 'max_loan_approval_amount', 'is_available',
        'availability_note'
    ]
    readonly_fields = ['created_at', 'updated_at']
    
    def get_queryset(self, request):
        """Only show staff profiles for staff users."""
        qs = super().get_queryset(request)
        return qs.filter(user__role__in=[ROLE_ADMIN, ROLE_STAFF, ROLE_OFFICER])


class UserAdmin(ImportExportModelAdmin):
    """Admin interface for User model."""
    resource_class = UserResource
    
    # List display
    list_display = [
        'email', 'get_full_name', 'phone_number', 'role',
        'status', 'is_verified', 'created_at', 'admin_actions'
    ]
    
    # Readonly fields
    readonly_fields = ['created_at', 'updated_at', 'last_login', 'last_login_at']
    list_display_links = ['email', 'get_full_name']
    list_filter = [
        'role', 'status', 'is_verified', 'is_active', 'gender',
        'marital_status', 'created_at', 'last_login_at'
    ]
    search_fields = [
        'email', 'phone_number', 'first_name', 'last_name', 
        'id_number'
    ]
    ordering = ['-created_at']
    list_per_page = 50
    
    # Inline for staff profiles
    inlines = [StaffProfileInline]
    
    # Fieldsets for add/edit forms
    fieldsets = (
        (None, {'fields': ('email', 'phone_number', 'password')}),
        (_('Personal Information'), {
            'fields': (
                'first_name', 'last_name', 'id_number', 'date_of_birth',
                'gender', 'marital_status', 'profile_picture', 'bio'
            )
        }),
        (_('Role & Status'), {
            'fields': ('role', 'status', 'is_verified', 'is_active')
        }),
        (_('Verification'), {
            'fields': ('email_verified', 'phone_verified', 'kyc_completed'),
            'classes': ('collapse',)
        }),
        (_('Security'), {
            'fields': (
                'two_factor_enabled', 'two_factor_method',
                'last_login_ip', 'last_login_at', 
                'failed_login_attempts', 'locked_until',
                'last_password_change'
            ),
            'classes': ('collapse',)
        }),
        (_('Preferences'), {
            'fields': ('language', 'notifications_enabled', 'marketing_emails'),
            'classes': ('collapse',)
        }),
        (_('Permissions'), {
            'fields': ('is_staff', 'is_superuser', 'groups', 'user_permissions'),
            'classes': ('collapse',)
        }),
        (_('Terms & Dates'), {
            'fields': (
                'terms_accepted', 'privacy_policy_accepted',
                'created_at', 'updated_at', 'last_login', 'date_joined'
            ),
            'classes': ('collapse',)
        }),
    )
    
    # Fieldsets for add form
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'email', 'phone_number', 'first_name', 'last_name',
                'password1', 'password2', 'role', 'is_active'
            ),
        }),
    )
    
    # Custom methods for list display
    def get_full_name(self, obj):
        return obj.get_full_name()
    get_full_name.short_description = _('Full Name')
    get_full_name.admin_order_field = 'last_name'
    
    def role_badge(self, obj):
        colors = {
            ROLE_ADMIN: 'red',
            ROLE_STAFF: 'blue',
            ROLE_OFFICER: 'green',
            ROLE_CUSTOMER: 'gray',
        }
        color = colors.get(obj.role, 'gray')
        return format_html(
            '<span class="badge" style="background-color: {}; color: white; padding: 2px 8px; border-radius: 10px;">{}</span>',
            color, obj.get_role_display_name()
        )
    role_badge.short_description = _('Role')
    role_badge.admin_order_field = 'role'
    
    def status_badge(self, obj):
        colors = {
            'active': 'green',
            'inactive': 'gray',
            'pending': 'orange',
            'suspended': 'red',
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span class="badge" style="background-color: {}; color: white; padding: 2px 8px; border-radius: 10px;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = _('Status')
    status_badge.admin_order_field = 'status'
    
    def admin_actions(self, obj):
        """Display action links in admin list view."""
        links = []
        
        # View link
        view_url = reverse('admin:users_user_change', args=[obj.id])
        links.append(f'<a href="{view_url}">View</a>')
        
        # Activate/Deactivate
        if obj.is_active:
            deactivate_url = reverse('admin:users_user_deactivate', args=[obj.id])
            links.append(f'<a href="{deactivate_url}" style="color: orange;">Deactivate</a>')
        else:
            activate_url = reverse('admin:users_user_activate', args=[obj.id])
            links.append(f'<a href="{activate_url}" style="color: green;">Activate</a>')
        
        # Verify
        if not obj.is_verified:
            verify_url = reverse('admin:users_user_verify', args=[obj.id])
            links.append(f'<a href="{verify_url}" style="color: blue;">Verify</a>')
        
        return format_html(' | '.join(links))
    admin_actions.short_description = _('Actions')
    
    # Custom admin actions (these go in the actions dropdown)
    actions = ['activate_users', 'deactivate_users', 'verify_users', 'export_selected']
    
    def activate_users(self, request, queryset):
        """Admin action to activate selected users."""
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} user(s) activated successfully.')
    activate_users.short_description = _('Activate selected users')
    
    def deactivate_users(self, request, queryset):
        """Admin action to deactivate selected users."""
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} user(s) deactivated successfully.')
    deactivate_users.short_description = _('Deactivate selected users')
    
    def verify_users(self, request, queryset):
        """Admin action to verify selected users."""
        updated = queryset.update(
            is_verified=True,
            email_verified=True,
            phone_verified=True
        )
        self.message_user(request, f'{updated} user(s) verified successfully.')
    verify_users.short_description = _('Verify selected users')
    
    # Custom admin views
    def get_urls(self):
        """Add custom URLs to user admin."""
        from django.urls import path
        
        urls = super().get_urls()
        custom_urls = [
            path(
                '<uuid:user_id>/deactivate/',
                self.admin_site.admin_view(self.deactivate_user_view),
                name='users_user_deactivate'
            ),
            path(
                '<uuid:user_id>/activate/',
                self.admin_site.admin_view(self.activate_user_view),
                name='users_user_activate'
            ),
            path(
                '<uuid:user_id>/verify/',
                self.admin_site.admin_view(self.verify_user_view),
                name='users_user_verify'
            ),
        ]
        return custom_urls + urls
    
    def deactivate_user_view(self, request, user_id):
        """Custom view to deactivate a user."""
        from django.shortcuts import redirect
        from django.contrib import messages
        
        try:
            user = User.objects.get(id=user_id)
            user.is_active = False
            user.save()
            messages.success(request, f'User {user.email} deactivated successfully.')
        except User.DoesNotExist:
            messages.error(request, 'User not found.')
        
        return redirect('admin:users_user_changelist')
    
    def activate_user_view(self, request, user_id):
        """Custom view to activate a user."""
        from django.shortcuts import redirect
        from django.contrib import messages
        
        try:
            user = User.objects.get(id=user_id)
            user.is_active = True
            user.save()
            messages.success(request, f'User {user.email} activated successfully.')
        except User.DoesNotExist:
            messages.error(request, 'User not found.')
        
        return redirect('admin:users_user_changelist')
    
    def verify_user_view(self, request, user_id):
        """Custom view to verify a user."""
        from django.shortcuts import redirect
        from django.contrib import messages
        
        try:
            user = User.objects.get(id=user_id)
            user.is_verified = True
            user.email_verified = True
            user.phone_verified = True
            user.save()
            messages.success(request, f'User {user.email} verified successfully.')
        except User.DoesNotExist:
            messages.error(request, 'User not found.')
        
        return redirect('admin:users_user_changelist')
    
    # Custom save method
    def save_model(self, request, obj, form, change):
        """Custom save logic for user admin."""
        if not change:  # Creating new user
            obj.set_password(form.cleaned_data['password'])
        
        # Role will automatically set is_staff via save() method
        super().save_model(request, obj, form, change)
    
    # Custom queryset for optimization
    def get_queryset(self, request):
        """Optimize queryset with select_related and prefetch_related."""
        qs = super().get_queryset(request)
        qs = qs.select_related('staff_profile')
        qs = qs.prefetch_related('groups', 'user_permissions')
        return qs


class StaffProfileAdmin(ImportExportModelAdmin):
    """Admin interface for StaffProfile model."""
    resource_class = StaffProfileResource
    
    # List display
    list_display = [
        'employee_id', 'user_link', 'department', 'position',
        'employment_type', 'supervisor_link', 'performance_rating',
        'can_approve_loans', 'is_available', 'hire_date', 'admin_actions'
    ]
    list_display_links = ['employee_id', 'user_link']
    list_filter = [
        'department', 'position', 'employment_type', 
        'can_approve_loans', 'is_available', 'hire_date'
    ]
    search_fields = [
        'employee_id', 'user__email', 'user__first_name', 
        'user__last_name', 'department', 'position'
    ]
    ordering = ['employee_id']
    readonly_fields = ['created_at', 'updated_at', 'full_name', 'bank_account_masked']
    list_per_page = 50
    
    # Custom method to show masked bank account
    def bank_account_masked(self, obj):
        if obj.bank_account_number:
            return f"****{obj.bank_account_number[-4:]}"
        return "-"
    bank_account_masked.short_description = _('Bank Account')
    
    # Custom methods
    def full_name(self, obj):
        return obj.user.get_full_name()
    full_name.short_description = _('Full Name')
    
    def user_link(self, obj):
        url = reverse('admin:users_user_change', args=[obj.user.id])
        return format_html('<a href="{}">{}</a>', url, obj.user.get_full_name())
    user_link.short_description = _('User')
    user_link.admin_order_field = 'user__last_name'
    
    def supervisor_link(self, obj):
        if obj.supervisor:
            url = reverse('admin:users_user_change', args=[obj.supervisor.id])
            return format_html('<a href="{}">{}</a>', url, obj.supervisor.get_full_name())
        return '-'
    supervisor_link.short_description = _('Supervisor')
    supervisor_link.admin_order_field = 'supervisor__last_name'
    
    def admin_actions(self, obj):
        view_url = reverse('admin:users_staffprofile_change', args=[obj.id])
        return format_html('<a href="{}">View/Edit</a>', view_url)
    admin_actions.short_description = _('Actions')
    
    # Fieldsets
    fieldsets = (
        (None, {'fields': ('user', 'employee_id')}),
        (_('Employment Details'), {
            'fields': (
                'department', 'position', 'hire_date', 'employment_type',
                'supervisor', 'office_location'
            )
        }),
        (_('Contact Information'), {
            'fields': ('work_phone', 'work_email'),
            'classes': ('collapse',)
        }),
        (_('Performance'), {
            'fields': ('performance_rating', 'last_performance_review'),
            'classes': ('collapse',)
        }),
        (_('Permissions'), {
            'fields': (
                'can_approve_loans', 'can_manage_customers',
                'can_process_payments', 'can_generate_reports',
                'max_loan_approval_amount'
            )
        }),
        (_('Schedule & Availability'), {
            'fields': ('work_schedule', 'is_available', 'availability_note'),
            'classes': ('collapse',)
        }),
        (_('Banking Details'), {
            'fields': ('bank_name', 'bank_account_number', 'bank_branch', 'bank_account_masked'),
            'classes': ('collapse',)
        }),
        (_('Emergency Contact'), {
            'fields': (
                'emergency_contact_name', 'emergency_contact_phone',
                'emergency_contact_relationship'
            ),
            'classes': ('collapse',)
        }),
        (_('Documents'), {
            'fields': ('id_document', 'employment_contract', 'other_documents'),
            'classes': ('collapse',)
        }),
        (_('Metadata'), {
            'fields': ('notes', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    # Custom admin actions (dropdown)
    actions = ['make_available', 'make_unavailable', 'grant_approval_permission']
    
    def make_available(self, request, queryset):
        """Mark selected staff as available."""
        updated = queryset.update(is_available=True)
        self.message_user(request, f'{updated} staff member(s) marked as available.')
    make_available.short_description = _('Mark as available')
    
    def make_unavailable(self, request, queryset):
        """Mark selected staff as unavailable."""
        updated = queryset.update(is_available=False)
        self.message_user(request, f'{updated} staff member(s) marked as unavailable.')
    make_unavailable.short_description = _('Mark as unavailable')
    
    def grant_approval_permission(self, request, queryset):
        """Grant loan approval permission to selected staff."""
        updated = queryset.update(can_approve_loans=True)
        self.message_user(request, f'{updated} staff member(s) granted loan approval permission.')
    grant_approval_permission.short_description = _('Grant loan approval permission')
    
    # Form customization
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        """Limit supervisor choices to staff users."""
        if db_field.name == "supervisor":
            kwargs["queryset"] = User.objects.filter(
                role__in=[ROLE_ADMIN, ROLE_STAFF, ROLE_OFFICER],
                is_active=True,
                is_deleted=False
            ).order_by('last_name', 'first_name')
        elif db_field.name == "user":
            kwargs["queryset"] = User.objects.filter(
                role__in=[ROLE_ADMIN, ROLE_STAFF, ROLE_OFFICER],
                is_active=True,
                is_deleted=False
            ).order_by('last_name', 'first_name')
        return super().formfield_for_foreignkey(db_field, request, **kwargs)
    
    # Custom save method
    def save_model(self, request, obj, form, change):
        """Custom save logic for staff profile admin."""
        # Ensure user is staff
        if not obj.user.role in [ROLE_ADMIN, ROLE_STAFF, ROLE_OFFICER]:
            raise ValidationError("User must be a staff member (admin, staff, or officer).")
        
        super().save_model(request, obj, form, change)
    
    # Custom queryset for optimization
    def get_queryset(self, request):
        """Optimize queryset with select_related."""
        qs = super().get_queryset(request)
        qs = qs.select_related('user', 'supervisor')
        return qs


# Register models with admin site
admin.site.register(User, UserAdmin)
admin.site.register(StaffProfile, StaffProfileAdmin)

# Custom admin site header
admin.site.site_header = "Super Legit Advance Administration"
admin.site.site_title = "SLA Admin Portal"
admin.site.index_title = "User Management"