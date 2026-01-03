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
        
        # Auto-calculate posting deadline if not set
        if not meeting.posting_deadline:
            meeting.posting_deadline = meeting.calculate_posting_deadline()
        
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
    
    @action(detail=True, methods=['get'])
    def ics_export(self, request, pk=None):
        """Export meeting as ICS (iCalendar) file."""
        from django.http import HttpResponse
        from .utils import generate_meeting_ics
        
        meeting = self.get_object()
        
        # Get base URL from request
        base_url = request.build_absolute_uri('/')[:-1]
        
        ics_content = generate_meeting_ics(meeting, base_url)
        
        response = HttpResponse(ics_content, content_type='text/calendar')
        response['Content-Disposition'] = f'attachment; filename="meeting_{meeting.id}.ics"'
        return response
    
    @action(detail=True, methods=['get'])
    def deadline_status(self, request, pk=None):
        """Get posting deadline status for a meeting."""
        meeting = self.get_object()
        
        # Auto-calculate deadline if not set
        if not meeting.posting_deadline:
            meeting.posting_deadline = meeting.calculate_posting_deadline()
            meeting.save()
        
        status_info = {
            'posting_deadline': meeting.posting_deadline,
            'posted_at': meeting.posted_at,
            'status': meeting.get_deadline_status(),
            'is_met': meeting.is_posting_deadline_met(),
            'meeting_datetime': timezone.make_aware(
                timezone.datetime.combine(meeting.date, meeting.time)
            )
        }
        
        return Response(status_info)


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
    
    def get_queryset(self):
        """Filter votes based on user permissions."""
        queryset = Vote.objects.select_related('agenda_item', 'official', 'agenda_item__meeting')
        user = self.request.user
        
        # Public users can only see votes from published meetings
        if not user.is_authenticated or user.role == 'public':
            queryset = queryset.filter(
                agenda_item__meeting__status='published',
                agenda_item__meeting__published_at__isnull=False
            )
        
        return queryset
    
    def perform_create(self, serializer):
        """Record vote - ensure official can only vote for themselves."""
        user = self.request.user
        
        # Only officials can vote
        if user.role not in ['official', 'clerk', 'it_admin']:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only elected officials can vote.")
        
        # Ensure user is voting as themselves
        official = serializer.validated_data.get('official')
        if official != user:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("You can only record votes for yourself.")
        
        serializer.save(official=user)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get vote summary for an agenda item."""
        agenda_item_id = request.query_params.get('agenda_item')
        if not agenda_item_id:
            return Response(
                {'error': 'agenda_item parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            from .models import AgendaItem
            agenda_item = AgendaItem.objects.get(id=agenda_item_id)
        except AgendaItem.DoesNotExist:
            return Response(
                {'error': 'Agenda item not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        votes = Vote.objects.filter(agenda_item=agenda_item)
        
        summary = {
            'agenda_item': agenda_item.id,
            'agenda_item_title': agenda_item.title,
            'total_votes': votes.count(),
            'yes': votes.filter(vote='yes').count(),
            'no': votes.filter(vote='no').count(),
            'abstain': votes.filter(vote='abstain').count(),
            'absent': votes.filter(vote='absent').count(),
            'votes': VoteSerializer(votes, many=True).data
        }
        
        return Response(summary)
    
    @action(detail=False, methods=['get'])
    def by_meeting(self, request):
        """Get all votes for a meeting."""
        meeting_id = request.query_params.get('meeting')
        if not meeting_id:
            return Response(
                {'error': 'meeting parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            meeting = Meeting.objects.get(id=meeting_id)
        except Meeting.DoesNotExist:
            return Response(
                {'error': 'Meeting not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get all agenda items for the meeting
        agenda_items = meeting.agenda_items.filter(requires_vote=True)
        votes = Vote.objects.filter(agenda_item__in=agenda_items)
        
        # Group by agenda item
        result = {}
        for item in agenda_items:
            item_votes = votes.filter(agenda_item=item)
            result[item.id] = {
                'agenda_item': item.id,
                'agenda_item_title': item.title,
                'total_votes': item_votes.count(),
                'yes': item_votes.filter(vote='yes').count(),
                'no': item_votes.filter(vote='no').count(),
                'abstain': item_votes.filter(vote='abstain').count(),
                'absent': item_votes.filter(vote='absent').count(),
                'votes': VoteSerializer(item_votes, many=True).data
            }
        
        return Response(result)

