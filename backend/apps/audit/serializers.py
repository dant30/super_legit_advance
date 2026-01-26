# backend/apps/audit/serializers.py
from rest_framework import serializers
from apps.audit.models import AuditLog
from apps.users.serializers import UserBasicSerializer
import json


class AuditLogSerializer(serializers.ModelSerializer):
    """Basic serializer for audit logs."""
    
    user = UserBasicSerializer(read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    user_display = serializers.CharField(read_only=True)
    object_display = serializers.CharField(read_only=True)
    changes_summary = serializers.CharField(read_only=True)
    duration_display = serializers.SerializerMethodField()
    timestamp_display = serializers.SerializerMethodField()
    
    class Meta:
        model = AuditLog
        fields = [
            'id',
            'timestamp',
            'timestamp_display',
            'action',
            'action_display',
            'severity',
            'severity_display',
            'status',
            'status_display',
            'user',
            'user_display',
            'user_ip',
            'model_name',
            'object_id',
            'object_display',
            'changes',
            'changes_summary',
            'request_method',
            'request_path',
            'response_status',
            'duration',
            'duration_display',
            'module',
            'feature',
            'error_message',
            'is_compliance_event',
            'tags',
            'notes',
        ]
        read_only_fields = [
            'id',
            'timestamp',
            'timestamp_display',
            'action',
            'action_display',
            'severity',
            'severity_display',
            'status',
            'status_display',
            'user',
            'user_display',
            'user_ip',
            'model_name',
            'object_id',
            'object_display',
            'changes',
            'changes_summary',
            'request_method',
            'request_path',
            'response_status',
            'duration',
            'duration_display',
            'module',
            'feature',
            'error_message',
            'is_compliance_event',
            'tags',
            'notes',
        ]
    
    def get_duration_display(self, obj):
        """Format duration for display."""
        if obj.duration:
            return f"{obj.duration:.2f}s"
        return None
    
    def get_timestamp_display(self, obj):
        """Format timestamp for display."""
        return obj.timestamp.strftime('%Y-%m-%d %H:%M:%S')


class AuditLogDetailSerializer(AuditLogSerializer):
    """Detailed serializer for audit logs with additional data."""
    
    previous_state_parsed = serializers.SerializerMethodField()
    new_state_parsed = serializers.SerializerMethodField()
    changes_parsed = serializers.SerializerMethodField()
    request_params_parsed = serializers.SerializerMethodField()
    user_agent_short = serializers.SerializerMethodField()
    
    class Meta:
        model = AuditLog
        fields = AuditLogSerializer.Meta.fields + [
            'previous_state',
            'previous_state_parsed',
            'new_state',
            'new_state_parsed',
            'changes_parsed',
            'request_params',
            'request_params_parsed',
            'user_agent',
            'user_agent_short',
            'session_key',
            'compliance_id',
            'retention_days',
            'is_archived',
            'archive_date',
            'error_traceback',
        ]
        read_only_fields = [
            'id',
            'timestamp',
            'timestamp_display',
            'action',
            'action_display',
            'severity',
            'severity_display',
            'status',
            'status_display',
            'user',
            'user_display',
            'user_ip',
            'model_name',
            'object_id',
            'object_display',
            'changes',
            'changes_summary',
            'request_method',
            'request_path',
            'response_status',
            'duration',
            'duration_display',
            'module',
            'feature',
            'error_message',
            'is_compliance_event',
            'tags',
            'notes',
            'previous_state',
            'previous_state_parsed',
            'new_state',
            'new_state_parsed',
            'changes_parsed',
            'request_params',
            'request_params_parsed',
            'user_agent',
            'user_agent_short',
            'session_key',
            'compliance_id',
            'retention_days',
            'is_archived',
            'archive_date',
            'error_traceback',
        ]
    
    def get_previous_state_parsed(self, obj):
        """Parse previous state JSON."""
        return obj.get_previous_state_dict()
    
    def get_new_state_parsed(self, obj):
        """Parse new state JSON."""
        return obj.get_new_state_dict()
    
    def get_changes_parsed(self, obj):
        """Parse changes JSON."""
        return obj.get_changes_dict()
    
    def get_request_params_parsed(self, obj):
        """Parse request params JSON."""
        if obj.request_params:
            try:
                return json.loads(obj.request_params) if isinstance(obj.request_params, str) else obj.request_params
            except:
                return {"raw": str(obj.request_params)}
        return {}
    
    def get_user_agent_short(self, obj):
        """Get shortened user agent."""
        if not obj.user_agent:
            return ""
        
        # Extract browser and OS info
        ua = obj.user_agent.lower()
        
        browsers = [
            ('chrome', 'Chrome'),
            ('firefox', 'Firefox'),
            ('safari', 'Safari'),
            ('edge', 'Edge'),
            ('opera', 'Opera'),
        ]
        
        for browser_key, browser_name in browsers:
            if browser_key in ua:
                return browser_name
        
        os_list = [
            ('windows', 'Windows'),
            ('mac', 'Mac OS'),
            ('linux', 'Linux'),
            ('android', 'Android'),
            ('iphone', 'iOS'),
            ('ipad', 'iOS'),
        ]
        
        for os_key, os_name in os_list:
            if os_key in ua:
                return os_name
        
        return "Unknown"


class AuditLogExportSerializer(serializers.ModelSerializer):
    """Serializer for audit log exports."""
    
    timestamp_formatted = serializers.CharField(source='timestamp', read_only=True)
    action_name = serializers.CharField(source='get_action_display', read_only=True)
    severity_name = serializers.CharField(source='get_severity_display', read_only=True)
    status_name = serializers.CharField(source='get_status_display', read_only=True)
    user_name = serializers.CharField(source='user_display', read_only=True)
    object_info = serializers.CharField(source='object_display', read_only=True)
    
    class Meta:
        model = AuditLog
        fields = [
            'id',
            'timestamp_formatted',
            'action',
            'action_name',
            'severity',
            'severity_name',
            'status',
            'status_name',
            'user_name',
            'user_ip',
            'model_name',
            'object_id',
            'object_info',
            'changes',
            'request_method',
            'request_path',
            'response_status',
            'duration',
            'module',
            'feature',
            'error_message',
            'is_compliance_event',
            'tags',
            'notes',
        ]
        read_only_fields = [
            'id',
            'timestamp_formatted',
            'action',
            'action_name',
            'severity',
            'severity_name',
            'status',
            'status_name',
            'user_name',
            'user_ip',
            'model_name',
            'object_id',
            'object_info',
            'changes',
            'request_method',
            'request_path',
            'response_status',
            'duration',
            'module',
            'feature',
            'error_message',
            'is_compliance_event',
            'tags',
            'notes',
        ]