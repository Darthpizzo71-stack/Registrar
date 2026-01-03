"""
Admin configuration for users app
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserSession


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom admin for User model."""
    list_display = ['username', 'email', 'get_full_name', 'role', 'department', 'is_active', 'last_login']
    list_filter = ['role', 'is_active', 'is_staff', 'mfa_enabled']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Escribe Profile', {
            'fields': ('role', 'department', 'phone', 'mfa_enabled', 'mfa_secret', 'last_login_ip')
        }),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Escribe Profile', {
            'fields': ('role', 'department', 'phone')
        }),
    )


@admin.register(UserSession)
class UserSessionAdmin(admin.ModelAdmin):
    """Admin for user sessions."""
    list_display = ['user', 'ip_address', 'created_at', 'last_activity', 'expires_at']
    list_filter = ['created_at', 'expires_at']
    readonly_fields = ['user', 'session_key', 'ip_address', 'user_agent', 'created_at', 'last_activity']
    search_fields = ['user__username', 'user__email', 'ip_address']





