"""
Views for users app
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, UserCreateSerializer, UserUpdateSerializer
from .permissions import IsAdminOrSelf

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing users.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            # Only admins can create users
            return [permissions.IsAuthenticated()]
        elif self.action in ['list', 'retrieve', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrSelf()]
        return super().get_permissions()
    
    def perform_create(self, serializer):
        """Only allow admins to create users."""
        if self.request.user.role not in ['clerk', 'it_admin']:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only administrators can create users.")
        serializer.save()
    
    def get_queryset(self):
        user = self.request.user
        if user.role in ['clerk', 'it_admin']:
            return User.objects.all()
        return User.objects.filter(id=user.id)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user's profile."""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def profile(self, request, pk=None):
        """Get user's profile by ID."""
        if str(request.user.id) != pk and request.user.role not in ['clerk', 'it_admin']:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        user = self.get_object()
        serializer = self.get_serializer(user)
        return Response(serializer.data)



