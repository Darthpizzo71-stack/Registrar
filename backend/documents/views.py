"""
Views for documents app
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Attachment, DocumentSearchIndex
from .serializers import AttachmentSerializer, AttachmentCreateSerializer, DocumentSearchIndexSerializer
from .permissions import CanUploadDocuments, IsPublicOrAuthenticated


class AttachmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing attachments.
    """
    queryset = Attachment.objects.filter(is_current=True)
    permission_classes = [IsPublicOrAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['agenda_item', 'file_type', 'is_public']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return AttachmentCreateSerializer
        return AttachmentSerializer
    
    def get_queryset(self):
        user = self.request.user
        queryset = Attachment.objects.filter(is_current=True).select_related('agenda_item', 'uploaded_by')
        
        # Public users can only see public attachments from published meetings
        if not user.is_authenticated or user.role == 'public':
            queryset = queryset.filter(
                is_public=True,
                agenda_item__meeting__status='published',
                agenda_item__meeting__published_at__isnull=False
            )
        
        return queryset
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsPublicOrAuthenticated()]
        return [IsAuthenticated(), CanUploadDocuments()]
    
    def perform_create(self, serializer):
        """Set uploaded_by to current user."""
        serializer.save(uploaded_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def create_version(self, request, pk=None):
        """Create a new version of an attachment."""
        attachment = self.get_object()
        new_file = request.FILES.get('file')
        if not new_file:
            return Response({'error': 'File is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        new_attachment = attachment.create_new_version(request.user, new_file)
        serializer = self.get_serializer(new_attachment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Full-text search across documents."""
        query = request.query_params.get('q', '')
        if not query:
            return Response({'error': 'Search query is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Search in document search index
        search_results = DocumentSearchIndex.objects.filter(
            content__icontains=query
        ).select_related('attachment')
        
        # Filter by permissions
        user = request.user
        if not user.is_authenticated or user.role == 'public':
            search_results = search_results.filter(
                attachment__is_public=True,
                attachment__agenda_item__meeting__status='published'
            )
        
        attachments = [result.attachment for result in search_results]
        serializer = self.get_serializer(attachments, many=True)
        return Response(serializer.data)


class DocumentSearchIndexViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for document search index (admin only)."""
    queryset = DocumentSearchIndex.objects.all()
    serializer_class = DocumentSearchIndexSerializer
    permission_classes = [IsAuthenticated]





