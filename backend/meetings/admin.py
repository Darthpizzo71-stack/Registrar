"""
Admin configuration for meetings app
"""
from django.contrib import admin
from .models import Meeting, AgendaSection, AgendaItem, Minute, Vote


@admin.register(Meeting)
class MeetingAdmin(admin.ModelAdmin):
    list_display = ['title', 'meeting_type', 'date', 'time', 'status', 'published_at', 'created_by']
    list_filter = ['status', 'meeting_type', 'date']
    search_fields = ['title', 'description']
    readonly_fields = ['created_at', 'updated_at', 'published_at', 'posted_at']
    date_hierarchy = 'date'


@admin.register(AgendaSection)
class AgendaSectionAdmin(admin.ModelAdmin):
    list_display = ['title', 'meeting', 'order']
    list_filter = ['meeting']
    ordering = ['meeting', 'order']


@admin.register(AgendaItem)
class AgendaItemAdmin(admin.ModelAdmin):
    list_display = ['number', 'title', 'meeting', 'section', 'order', 'submitted_by', 'department']
    list_filter = ['meeting', 'section', 'priority', 'is_consent', 'requires_vote']
    search_fields = ['title', 'description', 'department']
    ordering = ['meeting', 'order']


@admin.register(Minute)
class MinuteAdmin(admin.ModelAdmin):
    list_display = ['agenda_item', 'status', 'version', 'approved_by', 'approved_at', 'created_by']
    list_filter = ['status', 'approved_at']
    search_fields = ['agenda_item__title', 'text']
    readonly_fields = ['version', 'previous_version', 'created_at', 'updated_at', 'approved_at']


@admin.register(Vote)
class VoteAdmin(admin.ModelAdmin):
    list_display = ['agenda_item', 'official', 'vote', 'recorded_at']
    list_filter = ['vote', 'recorded_at']
    search_fields = ['agenda_item__title', 'official__username']





