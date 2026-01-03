"""
Views for meetings app
"""
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Q
from .models import Meeting, AgendaSection, AgendaItem, Minute, Vote
from .serializers import (
    MeetingSerializer, MeetingListSerializer,
    AgendaSectionSerializer, AgendaItemSerializer,
    MinuteSerializer, VoteSerializer
)
from .permissions import CanCreateAgenda, CanApproveMinutes, CanSubmitAgendaItems, IsPublicOrAuthenticated


class MeetingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing meetings.
    """
    queryset = Meeting.objects.all()
    permission_classes = [IsPublicOrAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'meeting_type', 'date']
    search_fields = ['title', 'description']
    ordering_fields = ['date', 'created_at', 'published_at']
    ordering = ['-date', '-time']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return MeetingListSerializer
        return MeetingSerializer
    
    def get_queryset(self):
        user = self.request.user
        queryset = Meeting.objects.all()
        
        # Public users can only see published meetings
        if not user.is_authenticated or user.role == 'public':
            queryset = queryset.filter(status='published', published_at__isnull=False)
        # Staff can see published and their own drafts
        elif user.role == 'staff':
            queryset = queryset.filter(
                Q(status='published') | 
                Q(status='draft', created_by=user)
            )
        
        return queryset.select_related('created_by').prefetch_related('agenda_items', 'sections')
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsPublicOrAuthenticated()]
        return [IsAuthenticated(), CanCreateAgenda()]
    
    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        """Publish a meeting agenda."""
        meeting = self.get_object()
        if not request.user.can_create_agenda():
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        meeting.publish()
        serializer = self.get_serializer(meeting)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def agenda_pdf(self, request, pk=None):
        """Generate PDF of agenda."""
        from django.http import HttpResponse
        from .utils import generate_agenda_pdf
        
        meeting = self.get_object()
        pdf_buffer = generate_agenda_pdf(meeting)
        
        response = HttpResponse(pdf_buffer.read(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="agenda_{meeting.id}.pdf"'
        return response


class AgendaSectionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing agenda sections."""
    queryset = AgendaSection.objects.all()
    serializer_class = AgendaSectionSerializer
    permission_classes = [IsAuthenticated, CanCreateAgenda]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['meeting']


class AgendaItemViewSet(viewsets.ModelViewSet):
    """ViewSet for managing agenda items."""
    queryset = AgendaItem.objects.all()
    serializer_class = AgendaItemSerializer
    permission_classes = [IsPublicOrAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['meeting', 'section', 'priority', 'is_consent']
    search_fields = ['title', 'description', 'department']
    ordering_fields = ['order', 'created_at']
    ordering = ['order']
    
    def get_queryset(self):
        user = self.request.user
        queryset = AgendaItem.objects.select_related('meeting', 'section', 'submitted_by')
        
        # Public users can only see items from published meetings
        if not user.is_authenticated or user.role == 'public':
            queryset = queryset.filter(meeting__status='published', meeting__published_at__isnull=False)
        
        return queryset
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsPublicOrAuthenticated()]
        elif self.action == 'create':
            return [IsAuthenticated(), CanSubmitAgendaItems()]
        return [IsAuthenticated(), CanCreateAgenda()]
    
    def perform_create(self, serializer):
        """Set submitted_by to current user."""
        serializer.save(submitted_by=self.request.user)


class MinuteViewSet(viewsets.ModelViewSet):
    """ViewSet for managing minutes."""
    queryset = Minute.objects.all()
    serializer_class = MinuteSerializer
    permission_classes = [IsPublicOrAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['agenda_item', 'status']
    search_fields = ['text', 'agenda_item__title']
    
    def get_queryset(self):
        user = self.request.user
        queryset = Minute.objects.select_related('agenda_item', 'created_by', 'approved_by')
        
        # Public users can only see approved minutes from published meetings
        if not user.is_authenticated or user.role == 'public':
            queryset = queryset.filter(
                status='approved',
                agenda_item__meeting__status='published'
            )
        
        return queryset
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsPublicOrAuthenticated()]
        return [IsAuthenticated()]
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve minutes."""
        minute = self.get_object()
        if not request.user.can_approve_minutes():
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        minute.approve(request.user)
        serializer = self.get_serializer(minute)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def create_version(self, request, pk=None):
        """Create a new version of minutes."""
        minute = self.get_object()
        new_text = request.data.get('text')
        if not new_text:
            return Response({'error': 'Text is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        new_minute = minute.create_new_version(request.user, new_text)
        serializer = self.get_serializer(new_minute)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class VoteViewSet(viewsets.ModelViewSet):
    """ViewSet for managing votes (Phase 2)."""
    queryset = Vote.objects.all()
    serializer_class = VoteSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['agenda_item', 'official', 'vote']

