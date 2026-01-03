"""
User models for Escribe
"""
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    """
    Custom user model with role-based access control.
    """
    ROLE_CHOICES = [
        ('clerk', 'Clerk/Admin'),
        ('staff', 'Department Staff'),
        ('official', 'Elected Official'),
        ('public', 'Public User'),
        ('it_admin', 'IT Admin'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='public')
    department = models.CharField(max_length=200, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True)
    mfa_enabled = models.BooleanField(default=False)
    mfa_secret = models.CharField(max_length=32, blank=True)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users'
        ordering = ['last_name', 'first_name']
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.get_role_display()})"
    
    def can_create_agenda(self):
        """Check if user can create agendas."""
        return self.role in ['clerk', 'it_admin']
    
    def can_approve_minutes(self):
        """Check if user can approve minutes."""
        return self.role in ['clerk', 'it_admin']
    
    def can_submit_agenda_items(self):
        """Check if user can submit agenda items."""
        return self.role in ['clerk', 'staff', 'it_admin']
    
    def can_view_all_meetings(self):
        """Check if user can view all meetings (including drafts)."""
        return self.role in ['clerk', 'official', 'it_admin']


class UserSession(models.Model):
    """
    Track user sessions for security and audit purposes.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions')
    session_key = models.CharField(max_length=40, unique=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        db_table = 'user_sessions'
        ordering = ['-last_activity']
    
    def __str__(self):
        return f"{self.user.username} - {self.ip_address}"





