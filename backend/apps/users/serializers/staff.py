# backend/apps/users/serializers/staff.py

"""
Serializers for StaffProfile model.
"""
from rest_framework import serializers
from apps.core.utils.validators import validate_phone_number, validate_email
from ..models import StaffProfile, User


# =========================================================================
# READ SERIALIZER (Detail/List views)
# =========================================================================
class StaffProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for StaffProfile (read-only / detail views).
    Includes related user details and computed fields.
    """
    
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    user_details = serializers.SerializerMethodField()
    supervisor_details = serializers.SerializerMethodField()
    
    performance_level = serializers.CharField(
        source="get_performance_level",
        read_only=True,
        help_text="Computed performance level based on rating"
    )
    work_schedule_display = serializers.CharField(
        source="get_work_schedule_display",
        read_only=True,
        help_text="Human-readable work schedule"
    )
    
    bank_account_masked = serializers.SerializerMethodField(
        help_text="Last 4 digits of bank account, masked for security"
    )
    
    # Additional permission fields
    can_approve_loans = serializers.BooleanField(read_only=True)
    can_manage_customers = serializers.BooleanField(read_only=True)
    can_process_payments = serializers.BooleanField(read_only=True)
    can_generate_reports = serializers.BooleanField(read_only=True)
    max_loan_approval_amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True
    )
    
    class Meta:
        model = StaffProfile
        fields = [
            "id",
            "user",
            "user_details",
            "employee_id",
            "department",
            "position",
            "hire_date",
            "employment_type",
            "supervisor",
            "supervisor_details",
            "office_location",
            "work_phone",
            "work_email",
            "performance_rating",
            "performance_level",
            "last_performance_review",
            "approval_tier",
            "permissions",
            "work_schedule",
            "work_schedule_display",
            "is_available",
            "availability_note",
            "bank_name",
            "bank_account_masked",
            "bank_branch",
            "can_approve_loans",
            "can_manage_customers",
            "can_process_payments",
            "can_generate_reports",
            "max_loan_approval_amount",
            "emergency_contact_name",
            "emergency_contact_phone",
            "emergency_contact_relationship",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "user",
            "created_at",
            "updated_at",
            "bank_account_masked",
            "performance_level",
            "work_schedule_display",
        ]
    
    def get_user_details(self, obj):
        """Get related user details."""
        from .user import UserSerializer
        return UserSerializer(obj.user, context=self.context).data
    
    def get_supervisor_details(self, obj):
        """Get supervisor details if assigned."""
        if obj.supervisor:
            from .user import UserSerializer
            return UserSerializer(obj.supervisor, context=self.context).data
        return None
    
    def get_bank_account_masked(self, obj):
        """Return masked bank account number for security."""
        if obj.bank_account_number:
            return f"****{obj.bank_account_number[-4:]}"
        return None


# =========================================================================
# CREATE SERIALIZER
# =========================================================================
class StaffProfileCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating staff profiles.
    Validates that user is eligible to be staff member.
    """
    
    user_id = serializers.UUIDField(write_only=True)
    
    class Meta:
        model = StaffProfile
        fields = [
            "user_id",
            "employee_id",
            "department",
            "position",
            "hire_date",
            "employment_type",
            "supervisor",
            "office_location",
            "work_phone",
            "work_email",
            "approval_tier",
            "permissions",
            "work_schedule",
            "bank_name",
            "bank_account_number",
            "bank_branch",
            "emergency_contact_name",
            "emergency_contact_phone",
            "emergency_contact_relationship",
            "notes",
        ]
    
    def validate(self, attrs):
        """
        Validate staff profile creation.
        Ensures user exists, is a staff member, and doesn't already have a profile.
        """
        user_id = attrs.get("user_id")
        
        # Check user exists
        try:
            user = User.objects.get(id=user_id, is_deleted=False)
        except User.DoesNotExist:
            raise serializers.ValidationError({
                "user_id": "User not found."
            })
        
        # Check user is staff member
        if not user.is_staff_member():
            raise serializers.ValidationError({
                "user_id": "User must be a staff member (admin, staff, or officer)."
            })
        
        # Check profile doesn't already exist
        if StaffProfile.objects.filter(user=user, is_deleted=False).exists():
            raise serializers.ValidationError({
                "user_id": "Staff profile already exists for this user."
            })
        
        # Validate contacts
        self._validate_contacts(attrs)
        
        # Convert user_id to user instance
        attrs["user"] = user
        attrs.pop("user_id", None)
        
        return attrs
    
    def _validate_contacts(self, attrs):
        """Validate contact information."""
        if attrs.get("work_email"):
            validate_email(attrs["work_email"])
        
        if attrs.get("work_phone"):
            validate_phone_number(attrs["work_phone"])
        
        if attrs.get("emergency_contact_phone"):
            validate_phone_number(attrs["emergency_contact_phone"])
    
    def create(self, validated_data):
        """Create staff profile."""
        return StaffProfile.objects.create(**validated_data)


# =========================================================================
# UPDATE SERIALIZER
# =========================================================================
class StaffProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating staff profiles.
    """
    
    class Meta:
        model = StaffProfile
        fields = [
            "department",
            "position",
            "employment_type",
            "supervisor",
            "office_location",
            "work_phone",
            "work_email",
            "performance_rating",
            "last_performance_review",
            "approval_tier",
            "permissions",
            "work_schedule",
            "is_available",
            "availability_note",
            "bank_name",
            "bank_account_number",
            "bank_branch",
            "can_approve_loans",
            "can_manage_customers",
            "can_process_payments",
            "can_generate_reports",
            "max_loan_approval_amount",
            "emergency_contact_name",
            "emergency_contact_phone",
            "emergency_contact_relationship",
            "notes",
        ]
    
    def validate(self, attrs):
        """
        Validate update data.
        """
        # Validate email if provided
        if attrs.get("work_email"):
            validate_email(attrs["work_email"])
        
        # Validate phone if provided
        if attrs.get("work_phone"):
            validate_phone_number(attrs["work_phone"])
        
        if attrs.get("emergency_contact_phone"):
            validate_phone_number(attrs["emergency_contact_phone"])
        
        # Validate performance rating
        rating = attrs.get("performance_rating")
        if rating is not None:
            try:
                rating_float = float(rating)
                if not (0 <= rating_float <= 5):
                    raise serializers.ValidationError({
                        "performance_rating": "Rating must be between 0 and 5."
                    })
            except (TypeError, ValueError):
                raise serializers.ValidationError({
                    "performance_rating": "Rating must be a valid number."
                })
        
        # Validate max loan approval amount
        max_amount = attrs.get("max_loan_approval_amount")
        if max_amount is not None and max_amount < 0:
            raise serializers.ValidationError({
                "max_loan_approval_amount": "Maximum approval amount must be positive."
            })
        
        return attrs
