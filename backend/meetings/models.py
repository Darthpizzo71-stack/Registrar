"""
Models for meetings, agendas, and minutes
"""
from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator

User = get_user_model()


class Meeting(models.Model):
    """
    Represents a meeting (city council, board, etc.)
    """
    MEETING_TYPES = [
        ('regular', 'Regular Meeting'),
        ('special', 'Special Meeting'),
        ('workshop', 'Workshop'),
        ('hearing', 'Public Hearing'),
        ('emergency', 'Emergency Meeting'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('completed', 'Completed'),
        ('archived', 'Archived'),
    ]
    
    title = models.CharField(max_length=200)
    meeting_type = models.CharField(max_length=20, choices=MEETING_TYPES, default='regular')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    date = models.DateField()
    time = models.TimeField()
    location = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    # Compliance tracking
    published_at = models.DateTimeField(null=True, blank=True)
    posting_deadline = models.DateTimeField(null=True, blank=True)  # Legal posting deadline
    posted_at = models.DateTimeField(null=True, blank=True)  # Actual posting time
    
    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='created_meetings')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'meetings'
        ordering = ['-date', '-time']
        indexes = [
            models.Index(fields=['date', 'status']),
            models.Index(fields=['status', 'published_at']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.date}"
    
    def publish(self):
        """Publish the meeting agenda."""
        if self.status == 'draft':
            self.status = 'published'
            self.published_at = timezone.now()
            self.posted_at = timezone.now()
            self.save()
    
    def is_published(self):
        """Check if meeting is published."""
        return self.status == 'published' and self.published_at is not None


class AgendaSection(models.Model):
    """
    Sections within an agenda (Consent, Public Hearing, etc.)
    """
    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE, related_name='sections')
    title = models.CharField(max_length=200)
    order = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    description = models.TextField(blank=True)
    
    class Meta:
        db_table = 'agenda_sections'
        ordering = ['order', 'id']
        unique_together = [['meeting', 'order']]
    
    def __str__(self):
        return f"{self.meeting.title} - {self.title}"


class AgendaItem(models.Model):
    """
    Individual items on a meeting agenda
    """
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('normal', 'Normal'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE, related_name='agenda_items')
    section = models.ForeignKey(AgendaSection, on_delete=models.SET_NULL, null=True, blank=True, related_name='items')
    title = models.CharField(max_length=500)
    description = models.TextField()
    order = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    number = models.CharField(max_length=20, blank=True)  # Auto-generated item number
    
    # Submission tracking
    submitted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='submitted_items')
    department = models.CharField(max_length=200, blank=True)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='normal')
    
    # Status
    is_consent = models.BooleanField(default=False)  # Part of consent agenda
    requires_vote = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'agenda_items'
        ordering = ['order', 'id']
        indexes = [
            models.Index(fields=['meeting', 'order']),
            models.Index(fields=['meeting', 'section']),
        ]
    
    def __str__(self):
        return f"{self.number or self.order}: {self.title}"
    
    def save(self, *args, **kwargs):
        """Auto-generate item number if not set."""
        if not self.number:
            # Generate number based on section and order
            if self.section:
                section_items = AgendaItem.objects.filter(
                    meeting=self.meeting,
                    section=self.section
                ).exclude(id=self.id).count()
                self.number = f"{self.section.order + 1}.{section_items + 1}"
            else:
                items = AgendaItem.objects.filter(meeting=self.meeting).exclude(id=self.id).count()
                self.number = str(items + 1)
        super().save(*args, **kwargs)


class Minute(models.Model):
    """
    Meeting minutes linked to agenda items
    """
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('review', 'Under Review'),
        ('approved', 'Approved'),
    ]
    
    agenda_item = models.OneToOneField(AgendaItem, on_delete=models.CASCADE, related_name='minute')
    text = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Approval tracking
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_minutes')
    approved_at = models.DateTimeField(null=True, blank=True)
    
    # Version tracking
    version = models.IntegerField(default=1)
    previous_version = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='next_versions')
    
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='created_minutes')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'minutes'
        ordering = ['agenda_item__order']
    
    def __str__(self):
        return f"Minutes for {self.agenda_item.title}"
    
    def approve(self, user):
        """Approve the minutes."""
        if self.status != 'approved':
            self.status = 'approved'
            self.approved_by = user
            self.approved_at = timezone.now()
            self.save()
    
    def create_new_version(self, user, new_text):
        """Create a new version of the minutes."""
        new_minute = Minute.objects.create(
            agenda_item=self.agenda_item,
            text=new_text,
            status='draft',
            version=self.version + 1,
            previous_version=self,
            created_by=user
        )
        return new_minute


class Vote(models.Model):
    """
    Roll-call voting records (Phase 2 feature, but model included for future use)
    """
    VOTE_CHOICES = [
        ('yes', 'Yes'),
        ('no', 'No'),
        ('abstain', 'Abstain'),
        ('absent', 'Absent'),
    ]
    
    agenda_item = models.ForeignKey(AgendaItem, on_delete=models.CASCADE, related_name='votes')
    official = models.ForeignKey(User, on_delete=models.CASCADE, related_name='votes')
    vote = models.CharField(max_length=10, choices=VOTE_CHOICES)
    recorded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'votes'
        unique_together = [['agenda_item', 'official']]
    
    def __str__(self):
        return f"{self.official} - {self.get_vote_display()} on {self.agenda_item.title}"





