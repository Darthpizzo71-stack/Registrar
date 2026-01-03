"""
Custom permissions for documents app
"""
from rest_framework import permissions


class CanUploadDocuments(permissions.BasePermission):
    """Permission to upload documents."""
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        # Allow clerks, staff, and IT admins to upload
        return request.user.role in ['clerk', 'staff', 'it_admin']


class IsPublicOrAuthenticated(permissions.BasePermission):
    """Allow public read access or authenticated access."""
    def has_permission(self, request, view):
        # Allow GET requests for public
        if request.method in permissions.SAFE_METHODS:
            return True
        # Require authentication for write operations
        return request.user.is_authenticated





