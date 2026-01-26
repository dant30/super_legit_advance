from rest_framework import serializers
from apps.notifications.models import SMSLog


class SMSLogSerializer(serializers.ModelSerializer):
    """Serializer for SMS log listing."""
    
    provider_display = serializers.CharField(
        source='get_provider_display',
        read_only=True
    )
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )
    notification_type = serializers.CharField(
        source='notification.notification_type',
        read_only=True
    )
    notification_type_display = serializers.CharField(
        source='notification.get_notification_type_display',
        read_only=True
    )
    recipient_name = serializers.CharField(
        source='notification.recipient_name',
        read_only=True
    )
    delivery_time = serializers.SerializerMethodField()
    
    class Meta:
        model = SMSLog
        fields = [
            'id',
            'phone_number',
            'message',
            'message_id',
            'provider',
            'provider_display',
            'status',
            'status_display',
            'status_message',
            'units',
            'cost',
            'sent_at',
            'delivered_at',
            'network_code',
            'network_name',
            'notification_id',
            'notification_type',
            'notification_type_display',
            'recipient_name',
            'delivery_time',
            'created_at',
        ]
        read_only_fields = ['created_at']
    
    def get_delivery_time(self, obj):
        """Calculate delivery time in seconds."""
        return obj.delivery_time


class SMSLogDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for SMS logs."""
    
    provider_display = serializers.CharField(
        source='get_provider_display',
        read_only=True
    )
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )
    notification_info = serializers.SerializerMethodField()
    stats = serializers.SerializerMethodField()
    
    class Meta:
        model = SMSLog
        fields = [
            'id',
            'phone_number',
            'message',
            'message_id',
            'provider',
            'provider_display',
            'status',
            'status_display',
            'status_message',
            'units',
            'cost',
            'sent_at',
            'delivered_at',
            'network_code',
            'network_name',
            'metadata',
            'notification_info',
            'stats',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_notification_info(self, obj):
        """Get notification information."""
        if obj.notification:
            from apps.notifications.serializers.notification import NotificationSerializer
            return NotificationSerializer(obj.notification).data
        return None
    
    def get_stats(self, obj):
        """Get SMS statistics."""
        return obj.get_stats()