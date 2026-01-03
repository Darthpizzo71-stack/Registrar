"""
Custom permissions for users app
"""
from rest_framework import permissions


class IsAdminOrSelf(permissions.BasePermission):
    """
    Permission to allow admins or the user themselves to access.
    """
    def has_object_permission(self, request, view, obj):
        # Admins can access any user
        if request.user.role in ['clerk', 'it_admin']:
            return True
        # Users can access their own data
        return obj == request.user





