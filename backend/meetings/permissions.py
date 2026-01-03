"""
Custom permissions for meetings app
"""
from rest_framework import permissions


class CanCreateAgenda(permissions.BasePermission):
    """Permission to create and manage agendas."""
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.can_create_agenda()


class CanApproveMinutes(permissions.BasePermission):
    """Permission to approve minutes."""
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.can_approve_minutes()


class CanSubmitAgendaItems(permissions.BasePermission):
    """Permission to submit agenda items."""
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.can_submit_agenda_items()


class IsPublicOrAuthenticated(permissions.BasePermission):
    """Allow public read access or authenticated access."""
    def has_permission(self, request, view):
        # Allow GET requests for public
        if request.method in permissions.SAFE_METHODS:
            return True
        # Require authentication for write operations
        return request.user.is_authenticated





