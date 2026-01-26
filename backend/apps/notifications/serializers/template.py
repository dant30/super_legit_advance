# backend/apps/notifications/serializers/template.py
from rest_framework import serializers
from apps.notifications.models import Template


class TemplateSerializer(serializers.ModelSerializer):
    """Serializer for notification templates."""
    
    template_type_display = serializers.CharField(
        source='get_template_type_display',
        read_only=True
    )
    category_display = serializers.CharField(
        source='get_category_display',
        read_only=True
    )
    language_display = serializers.CharField(
        source='get_language_display',
        read_only=True
    )
    sample_render = serializers.SerializerMethodField()
    stats = serializers.SerializerMethodField()
    
    class Meta:
        model = Template
        fields = [
            'id',
            'name',
            'template_type',
            'template_type_display',
            'category',
            'category_display',
            'language',
            'language_display',
            'subject',
            'content',
            'variables',
            'is_active',
            'character_limit',
            'usage_count',
            'last_used',
            'description',
            'sample_data',
            'sample_render',
            'stats',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['variables', 'usage_count', 'last_used', 'created_at', 'updated_at']
    
    def get_sample_render(self, obj):
        """Get sample rendering of the template."""
        return obj.get_sample_render()
    
    def get_stats(self, obj):
        """Get template usage statistics."""
        return obj.get_stats()


class TemplateCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating templates."""
    
    class Meta:
        model = Template
        fields = [
            'name',
            'template_type',
            'category',
            'language',
            'subject',
            'content',
            'character_limit',
            'description',
            'sample_data',
        ]
    
    def validate(self, data):
        """Validate template data."""
        template_type = data.get('template_type')
        content = data.get('content', '')
        
        # Validate SMS character limit
        if template_type == 'SMS':
            character_limit = data.get('character_limit', 160)
            if len(content) > character_limit:
                raise serializers.ValidationError({
                    'content': f'SMS content exceeds character limit of {character_limit}.'
                })
        
        # Validate required fields for email
        if template_type == 'EMAIL' and not data.get('subject'):
            raise serializers.ValidationError({
                'subject': 'Subject is required for email templates.'
            })
        
        return data
    
    def create(self, validated_data):
        """Create template and extract variables."""
        return Template.objects.create(**validated_data)


class TemplateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating templates."""
    
    class Meta:
        model = Template
        fields = [
            'name',
            'template_type',
            'category',
            'language',
            'subject',
            'content',
            'is_active',
            'character_limit',
            'description',
            'sample_data',
        ]
    
    def validate(self, data):
        """Validate update data."""
        template_type = data.get('template_type', self.instance.template_type)
        content = data.get('content', self.instance.content)
        character_limit = data.get('character_limit', self.instance.character_limit)
        
        # Validate SMS character limit
        if template_type == 'SMS':
            if len(content) > character_limit:
                raise serializers.ValidationError({
                    'content': f'SMS content exceeds character limit of {character_limit}.'
                })
        
        # Validate required fields for email
        if template_type == 'EMAIL' and not data.get('subject', self.instance.subject):
            raise serializers.ValidationError({
                'subject': 'Subject is required for email templates.'
            })
        
        return data