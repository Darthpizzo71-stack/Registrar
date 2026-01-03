"""
Serializers for documents app
"""
from rest_framework import serializers
from .models import Attachment, DocumentSearchIndex


class AttachmentSerializer(serializers.ModelSerializer):
    """Serializer for Attachment."""
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    file_url = serializers.SerializerMethodField()
    agenda_item_title = serializers.CharField(source='agenda_item.title', read_only=True)
    
    class Meta:
        model = Attachment
        fields = ['id', 'agenda_item', 'agenda_item_title', 'name', 'description',
                  'file', 'file_url', 'file_type', 'file_size', 'mime_type',
                  'version', 'is_current', 'uploaded_by', 'uploaded_by_name',
                  'uploaded_at', 'updated_at', 'public_url', 'is_public']
        read_only_fields = ['file_size', 'mime_type', 'version', 'uploaded_at', 'updated_at', 'public_url']
    
    def get_file_url(self, obj):
        """Get the file URL."""
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None


class AttachmentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating attachments."""
    
    class Meta:
        model = Attachment
        fields = ['agenda_item', 'name', 'description', 'file', 'is_public']
    
    def validate_file(self, value):
        """Validate file size (max 50MB)."""
        max_size = 50 * 1024 * 1024  # 50MB
        if value.size > max_size:
            raise serializers.ValidationError(f"File size cannot exceed 50MB. Current size: {value.size / 1024 / 1024:.2f}MB")
        return value


class DocumentSearchIndexSerializer(serializers.ModelSerializer):
    """Serializer for document search index."""
    attachment_name = serializers.CharField(source='attachment.name', read_only=True)
    
    class Meta:
        model = DocumentSearchIndex
        fields = ['id', 'attachment', 'attachment_name', 'content', 'indexed_at']
        read_only_fields = ['indexed_at']





