"""
Serializers for meetings app
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Meeting, AgendaSection, AgendaItem, Minute, Vote

User = get_user_model()


class AgendaItemSerializer(serializers.ModelSerializer):
    """Serializer for AgendaItem."""
    submitted_by_name = serializers.CharField(source='submitted_by.get_full_name', read_only=True)
    minute = serializers.SerializerMethodField()
    
    class Meta:
        model = AgendaItem
        fields = ['id', 'meeting', 'section', 'title', 'description', 'order', 'number',
                  'submitted_by', 'submitted_by_name', 'department', 'priority',
                  'is_consent', 'requires_vote', 'created_at', 'updated_at', 'minute']
        read_only_fields = ['number', 'created_at', 'updated_at']
    
    def get_minute(self, obj):
        """Get associated minute if exists."""
        try:
            return MinuteSerializer(obj.minute).data
        except Minute.DoesNotExist:
            return None


class AgendaSectionSerializer(serializers.ModelSerializer):
    """Serializer for AgendaSection."""
    items = AgendaItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = AgendaSection
        fields = ['id', 'meeting', 'title', 'order', 'description', 'items']
        read_only_fields = ['id']


class MeetingSerializer(serializers.ModelSerializer):
    """Serializer for Meeting."""
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    sections = AgendaSectionSerializer(many=True, read_only=True)
    agenda_items = AgendaItemSerializer(many=True, read_only=True)
    item_count = serializers.IntegerField(source='agenda_items.count', read_only=True)
    
    class Meta:
        model = Meeting
        fields = ['id', 'title', 'meeting_type', 'status', 'date', 'time', 'location',
                  'description', 'published_at', 'posting_deadline', 'posted_at',
                  'created_by', 'created_by_name', 'created_at', 'updated_at',
                  'sections', 'agenda_items', 'item_count']
        read_only_fields = ['created_at', 'updated_at', 'published_at', 'posted_at']
    
    def validate_date(self, value):
        """Ensure date is not in the past for new meetings."""
        from django.utils import timezone
        if self.instance is None and value < timezone.now().date():
            raise serializers.ValidationError("Cannot create meetings in the past.")
        return value


class MeetingListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for meeting lists."""
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    item_count = serializers.IntegerField(source='agenda_items.count', read_only=True)
    
    class Meta:
        model = Meeting
        fields = ['id', 'title', 'meeting_type', 'status', 'date', 'time', 'location',
                  'published_at', 'created_by_name', 'item_count']


class MinuteSerializer(serializers.ModelSerializer):
    """Serializer for Minute."""
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    agenda_item_title = serializers.CharField(source='agenda_item.title', read_only=True)
    
    class Meta:
        model = Minute
        fields = ['id', 'agenda_item', 'agenda_item_title', 'text', 'status', 'version',
                  'approved_by', 'approved_by_name', 'approved_at',
                  'created_by', 'created_by_name', 'created_at', 'updated_at']
        read_only_fields = ['version', 'approved_at', 'created_at', 'updated_at']


class VoteSerializer(serializers.ModelSerializer):
    """Serializer for Vote."""
    official_name = serializers.CharField(source='official.get_full_name', read_only=True)
    
    class Meta:
        model = Vote
        fields = ['id', 'agenda_item', 'official', 'official_name', 'vote', 'recorded_at']
        read_only_fields = ['recorded_at']





