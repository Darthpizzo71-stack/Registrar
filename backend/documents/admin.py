"""
Admin configuration for documents app
"""
from django.contrib import admin
from .models import Attachment, DocumentSearchIndex


@admin.register(Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'agenda_item', 'file_type', 'version', 'is_current', 'uploaded_by', 'uploaded_at']
    list_filter = ['file_type', 'is_current', 'is_public', 'uploaded_at']
    search_fields = ['name', 'description']
    readonly_fields = ['file_size', 'mime_type', 'version', 'previous_version', 'uploaded_at', 'updated_at']


@admin.register(DocumentSearchIndex)
class DocumentSearchIndexAdmin(admin.ModelAdmin):
    list_display = ['attachment', 'indexed_at']
    search_fields = ['content', 'attachment__name']
    readonly_fields = ['indexed_at']





