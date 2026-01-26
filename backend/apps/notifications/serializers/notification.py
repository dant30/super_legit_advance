# backend/apps/notifications/serializers/notification.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.notifications.models import Notification, Template
from apps.notifications.services.notification_service import NotificationService
from apps.core.utils.validators import validate_phone_number
from django.core.exceptions import ValidationError as DjangoValidationError

User = get_user_model()


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for notification listing."""
    
    notification_type_display = serializers.CharField(
        source='get_notification_type_display',
        read_only=True
    )
    channel_display = serializers.CharField(
        source='get_channel_display',
        read_only=True
    )
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )
    priority_display = serializers.CharField(
        source='get_priority_display',
        read_only=True
    )
    recipient_info = serializers.SerializerMethodField()
    sender_name = serializers.CharField(read_only=True)
    template_name = serializers.CharField(
        source='template.name',
        read_only=True
    )
    
    class Meta:
        model = Notification
        fields = [
            'id',
            'notification_type',
            'notification_type_display',
            'channel',
            'channel_display',
            'priority',
            'priority_display',
            'title',
            'message',
            'recipient_info',
            'sender_name',
            'status',
            'status_display',
            'scheduled_for',
            'sent_at',
            'delivered_at',
            'read_at',
            'delivery_attempts',
            'cost',
            'template_name',
            'created_at',
        ]
        read_only_fields = ['created_at', 'sent_at', 'delivered_at', 'read_at']
    
    def get_recipient_info(self, obj):
        """Get recipient information."""
        return obj.recipient_info


class NotificationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating notifications."""
    
    template_id = serializers.PrimaryKeyRelatedField(
        queryset=Template.objects.filter(is_active=True),
        required=False,
        write_only=True,
        help_text="Template ID to use for this notification"
    )
    template_context = serializers.JSONField(
        required=False,
        write_only=True,
        default=dict,
        help_text="Context data for template rendering"
    )
    
    class Meta:
        model = Notification
        fields = [
            'notification_type',
            'channel',
            'priority',
            'title',
            'message',
            'recipient',
            'recipient_name',
            'recipient_phone',
            'recipient_email',
            'scheduled_for',
            'related_object_type',
            'related_object_id',
            'metadata',
            'template_id',
            'template_context',
        ]
    
    def validate(self, data):
        """Validate notification data."""
        channel = data.get('channel')
        recipient_phone = data.get('recipient_phone')
        recipient_email = data.get('recipient_email')
        recipient = data.get('recipient')
        
        # Validate recipient information based on channel
        if channel == 'SMS':
            if not recipient_phone and (not recipient or not recipient.phone_number):
                raise serializers.ValidationError({
                    'recipient_phone': 'Phone number is required for SMS notifications.'
                })
            
            # Validate phone number format
            phone_to_validate = recipient_phone or (recipient.phone_number if recipient else None)
            if phone_to_validate:
                try:
                    validate_phone_number(phone_to_validate)
                except DjangoValidationError as e:
                    raise serializers.ValidationError({'recipient_phone': e.messages})
        
        elif channel == 'EMAIL':
            if not recipient_email and (not recipient or not recipient.email):
                raise serializers.ValidationError({
                    'recipient_email': 'Email address is required for email notifications.'
                })
        
        # Validate scheduled time is in the future
        scheduled_for = data.get('scheduled_for')
        if scheduled_for and scheduled_for <= timezone.now():
            raise serializers.ValidationError({
                'scheduled_for': 'Scheduled time must be in the future.'
            })
        
        # Check template usage
        template_id = data.get('template_id')
        template_context = data.get('template_context', {})
        
        if template_id and not template_context:
            raise serializers.ValidationError({
                'template_context': 'Template context is required when using a template.'
            })
        
        return data
    
    def create(self, validated_data):
        """Create notification, optionally using template."""
        template_id = validated_data.pop('template_id', None)
        template_context = validated_data.pop('template_context', {})
        
        if template_id:
            # Use template to create notification
            notification_service = NotificationService()
            try:
                notification = notification_service.create_notification_from_template(
                    template=template_id,
                    recipient=validated_data.get('recipient'),
                    recipient_name=validated_data.get('recipient_name'),
                    recipient_phone=validated_data.get('recipient_phone'),
                    recipient_email=validated_data.get('recipient_email'),
                    context=template_context,
                    sender=self.context['request'].user,
                    additional_data={
                        'notification_type': validated_data.get('notification_type'),
                        'priority': validated_data.get('priority'),
                        'scheduled_for': validated_data.get('scheduled_for'),
                        'related_object_type': validated_data.get('related_object_type'),
                        'related_object_id': validated_data.get('related_object_id'),
                        'metadata': validated_data.get('metadata', {}),
                    }
                )
                return notification
            except Exception as e:
                raise serializers.ValidationError({'template': str(e)})
        else:
            # Create notification directly
            return super().create(validated_data)


class NotificationDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for notifications."""
    
    notification_type_display = serializers.CharField(
        source='get_notification_type_display',
        read_only=True
    )
    channel_display = serializers.CharField(
        source='get_channel_display',
        read_only=True
    )
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )
    priority_display = serializers.CharField(
        source='get_priority_display',
        read_only=True
    )
    recipient_info = serializers.SerializerMethodField()
    sender_info = serializers.SerializerMethodField()
    template_info = serializers.SerializerMethodField()
    related_object_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id',
            'notification_type',
            'notification_type_display',
            'channel',
            'channel_display',
            'priority',
            'priority_display',
            'title',
            'message',
            'recipient',
            'recipient_info',
            'recipient_name',
            'recipient_phone',
            'recipient_email',
            'sender',
            'sender_info',
            'sender_name',
            'status',
            'status_display',
            'scheduled_for',
            'sent_at',
            'delivered_at',
            'read_at',
            'delivery_attempts',
            'delivery_error',
            'external_id',
            'cost',
            'related_object_type',
            'related_object_id',
            'related_object_info',
            'template',
            'template_info',
            'metadata',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_recipient_info(self, obj):
        """Get detailed recipient information."""
        info = obj.recipient_info
        
        # Add additional info if recipient is a user
        if obj.recipient:
            info.update({
                'user_id': obj.recipient.id,
                'username': obj.recipient.username,
                'is_staff': obj.recipient.is_staff,
                'is_customer': getattr(obj.recipient, 'is_customer', False),
            })
        
        return info
    
    def get_sender_info(self, obj):
        """Get sender information."""
        if obj.sender:
            return {
                'id': obj.sender.id,
                'name': obj.sender.get_full_name(),
                'email': obj.sender.email,
                'phone': getattr(obj.sender, 'phone_number', None),
                'is_staff': obj.sender.is_staff,
            }
        return None
    
    def get_template_info(self, obj):
        """Get template information."""
        if obj.template:
            return {
                'id': obj.template.id,
                'name': obj.template.name,
                'type': obj.template.template_type,
                'category': obj.template.category,
            }
        return None
    
    def get_related_object_info(self, obj):
        """Get related object information."""
        related_object = obj.get_related_object()
        if related_object:
            return {
                'type': obj.related_object_type,
                'id': obj.related_object_id,
                'str_representation': str(related_object),
            }
        return None


class SendNotificationSerializer(serializers.Serializer):
    """Serializer for sending notifications."""
    
    send_immediately = serializers.BooleanField(default=True)
    retry_failed = serializers.BooleanField(default=False)
    
    def validate(self, data):
        """Validate send options."""
        return data


class BulkNotificationSerializer(serializers.Serializer):
    """Serializer for bulk notifications."""
    
    template_id = serializers.PrimaryKeyRelatedField(
        queryset=Template.objects.filter(is_active=True),
        required=True
    )
    recipients = serializers.ListField(
        child=serializers.DictField(),
        required=True,
        help_text="List of recipient dictionaries"
    )
    context = serializers.JSONField(
        required=False,
        default=dict,
        help_text="Common context data for all recipients"
    )
    
    def validate_recipients(self, value):
        """Validate recipients list."""
        if not value:
            raise serializers.ValidationError("Recipients list cannot be empty.")
        
        for recipient in value:
            if not isinstance(recipient, dict):
                raise serializers.ValidationError("Each recipient must be a dictionary.")
            
            # Check required fields
            if 'name' not in recipient:
                raise serializers.ValidationError("Each recipient must have a 'name' field.")
            
            # Check channel-specific fields
            template_id = self.initial_data.get('template_id')
            if template_id:
                try:
                    template = Template.objects.get(id=template_id)
                    if template.template_type == 'SMS' and 'phone' not in recipient:
                        raise serializers.ValidationError(
                            "Phone number is required for SMS templates."
                        )
                    elif template.template_type == 'EMAIL' and 'email' not in recipient:
                        raise serializers.ValidationError(
                            "Email is required for email templates."
                        )
                except Template.DoesNotExist:
                    pass
        
        return value


# Add these at the end of the file

class SendNotificationSerializer(serializers.Serializer):
    """Serializer for sending notifications."""
    
    send_immediately = serializers.BooleanField(default=True)
    retry_failed = serializers.BooleanField(default=False)
    
    def validate(self, data):
        """Validate send options."""
        return data


class TestNotificationSerializer(serializers.Serializer):
    """Serializer for test notifications."""
    
    channel = serializers.ChoiceField(
        choices=['SMS', 'EMAIL', 'PUSH'],
        required=True
    )
    recipient_phone = serializers.CharField(
        required=False,
        allow_blank=True
    )
    recipient_email = serializers.EmailField(
        required=False,
        allow_blank=True
    )
    message = serializers.CharField(
        required=True,
        max_length=500
    )
    
    def validate(self, data):
        """Validate test notification data."""
        channel = data.get('channel')
        recipient_phone = data.get('recipient_phone')
        recipient_email = data.get('recipient_email')
        
        if channel == 'SMS' and not recipient_phone:
            raise serializers.ValidationError({
                'recipient_phone': 'Phone number is required for SMS test.'
            })
        
        if channel == 'EMAIL' and not recipient_email:
            raise serializers.ValidationError({
                'recipient_email': 'Email address is required for email test.'
            })
        
        return data