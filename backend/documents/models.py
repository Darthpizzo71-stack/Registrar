"""
Models for document management
"""
from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.core.validators import FileExtensionValidator
import os
import uuid

User = get_user_model()


def document_upload_path(instance, filename):
    """Generate upload path for documents."""
    # Organize by meeting and type
    meeting_id = instance.agenda_item.meeting.id if instance.agenda_item else 'general'
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return f"documents/{meeting_id}/{filename}"


class Attachment(models.Model):
    """
    Attachments to agenda items (PDFs, images, spreadsheets, etc.)
    """
    FILE_TYPES = [
        ('pdf', 'PDF'),
        ('image', 'Image'),
        ('spreadsheet', 'Spreadsheet'),
        ('document', 'Document'),
        ('other', 'Other'),
    ]
    
    agenda_item = models.ForeignKey(
        'meetings.AgendaItem',
        on_delete=models.CASCADE,
        related_name='attachments',
        null=True,
        blank=True
    )
    name = models.CharField(max_length=500)
    description = models.TextField(blank=True)
    file = models.FileField(
        upload_to=document_upload_path,
        validators=[FileExtensionValidator(allowed_extensions=['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'gif'])]
    )
    file_type = models.CharField(max_length=20, choices=FILE_TYPES)
    file_size = models.BigIntegerField()  # Size in bytes
    mime_type = models.CharField(max_length=100)
    
    # Versioning
    version = models.IntegerField(default=1)
    previous_version = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='next_versions')
    is_current = models.BooleanField(default=True)
    
    # Metadata
    uploaded_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='uploaded_attachments')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Public access
    public_url = models.CharField(max_length=500, blank=True)  # Permanent public URL
    is_public = models.BooleanField(default=True)  # Public records are public by default
    
    class Meta:
        db_table = 'attachments'
        ordering = ['-uploaded_at']
        indexes = [
            models.Index(fields=['agenda_item', 'is_current']),
            models.Index(fields=['file_type', 'is_public']),
        ]
    
    def __str__(self):
        return f"{self.name} (v{self.version})"
    
    def save(self, *args, **kwargs):
        """Set file metadata on save."""
        if self.file:
            if not self.file_size:
                self.file_size = self.file.size
            if not self.mime_type:
                # Infer from extension
                ext = os.path.splitext(self.file.name)[1].lower()
                mime_types = {
                    '.pdf': 'application/pdf',
                    '.doc': 'application/msword',
                    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    '.xls': 'application/vnd.ms-excel',
                    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    '.jpg': 'image/jpeg',
                    '.jpeg': 'image/jpeg',
                    '.png': 'image/png',
                    '.gif': 'image/gif',
                }
                self.mime_type = mime_types.get(ext, 'application/octet-stream')
                
                # Set file type
                if ext == '.pdf':
                    self.file_type = 'pdf'
                elif ext in ['.jpg', '.jpeg', '.png', '.gif']:
                    self.file_type = 'image'
                elif ext in ['.xls', '.xlsx']:
                    self.file_type = 'spreadsheet'
                elif ext in ['.doc', '.docx']:
                    self.file_type = 'document'
                else:
                    self.file_type = 'other'
        
        super().save(*args, **kwargs)
    
    def create_new_version(self, user, new_file):
        """Create a new version of the attachment."""
        # Mark current version as not current
        self.is_current = False
        self.save()
        
        # Create new version
        new_attachment = Attachment.objects.create(
            agenda_item=self.agenda_item,
            name=self.name,
            description=self.description,
            file=new_file,
            file_type=self.file_type,
            version=self.version + 1,
            previous_version=self,
            is_current=True,
            uploaded_by=user,
            is_public=self.is_public
        )
        return new_attachment


class DocumentSearchIndex(models.Model):
    """
    Full-text search index for documents (for PDF text extraction)
    """
    attachment = models.OneToOneField(Attachment, on_delete=models.CASCADE, related_name='search_index')
    content = models.TextField()  # Extracted text content
    indexed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'document_search_index'
    
    def __str__(self):
        return f"Search index for {self.attachment.name}"





