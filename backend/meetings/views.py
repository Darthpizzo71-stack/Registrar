"""
Views for meetings app
"""
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Q
from .models import (
    Meeting, AgendaSection, AgendaItem, Minute, Vote,
    EmailSubscription, ElectronicSignature, MeetingAttendance, DocumentAccessLog
)
from .serializers import (
    MeetingSerializer, MeetingListSerializer,
    AgendaSectionSerializer, AgendaItemSerializer,
    MinuteSerializer, VoteSerializer,
    EmailSubscriptionSerializer, ElectronicSignatureSerializer
)
from .permissions import CanCreateAgenda, CanApproveMinutes, CanSubmitAgendaItems, IsPublicOrAuthenticated
from .services import send_meeting_notification, generate_rss_feed


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
    def agenda_packet(self, request, pk=None):
        """Generate complete agenda packet (PDF or DOCX)."""
        from django.http import HttpResponse
        from .utils import generate_agenda_packet
        
        meeting = self.get_object()
        format_type = request.query_params.get('format', 'pdf').lower()
        include_attachments = request.query_params.get('attachments', 'true').lower() == 'true'
        
        if format_type not in ['pdf', 'docx']:
            return Response(
                {'error': 'Format must be pdf or docx'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        packet_buffer = generate_agenda_packet(meeting, format=format_type, include_attachments=include_attachments)
        
        content_type = 'application/pdf' if format_type == 'pdf' else 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        extension = 'pdf' if format_type == 'pdf' else 'docx'
        
        response = HttpResponse(packet_buffer.read(), content_type=content_type)
        response['Content-Disposition'] = f'attachment; filename="agenda_packet_{meeting.id}.{extension}"'
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
    
    @action(detail=True, methods=['post'])
    def send_notification(self, request, pk=None):
        """Send email notification about meeting."""
        meeting = self.get_object()
        notification_type = request.data.get('type', 'published')
        
        if notification_type not in ['published', 'updated', 'reminder']:
            return Response(
                {'error': 'Invalid notification type'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        send_meeting_notification(meeting, notification_type)
        return Response({'message': 'Notifications sent'})


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


class EmailSubscriptionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing email subscriptions."""
    queryset = EmailSubscription.objects.all()
    serializer_class = EmailSubscriptionSerializer
    permission_classes = [AllowAny]  # Public can subscribe/unsubscribe
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['is_active', 'email']
    
    @action(detail=False, methods=['post'])
    def subscribe(self, request):
        """Subscribe to email notifications."""
        email = request.data.get('email')
        subscription_types = request.data.get('subscription_types', ['meeting_published'])
        
        if not email:
            return Response(
                {'error': 'Email is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        subscription, created = EmailSubscription.objects.get_or_create(
            email=email,
            defaults={'subscription_types': subscription_types}
        )
        
        if not created:
            # Update subscription types
            subscription.subscription_types = list(set(subscription.subscription_types + subscription_types))
            subscription.is_active = True
            subscription.save()
        
        serializer = self.get_serializer(subscription)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'])
    def unsubscribe(self, request):
        """Unsubscribe from email notifications."""
        token = request.data.get('token')
        email = request.data.get('email')
        
        if not token and not email:
            return Response(
                {'error': 'Token or email is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            if token:
                subscription = EmailSubscription.objects.get(unsubscribe_token=token)
            else:
                subscription = EmailSubscription.objects.get(email=email)
            
            subscription.is_active = False
            subscription.save()
            
            return Response({'message': 'Successfully unsubscribed'})
        except EmailSubscription.DoesNotExist:
            return Response(
                {'error': 'Subscription not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class ElectronicSignatureViewSet(viewsets.ModelViewSet):
    """ViewSet for managing electronic signatures."""
    queryset = ElectronicSignature.objects.all()
    serializer_class = ElectronicSignatureSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['document_type', 'document_id', 'signed_by', 'signature_type']
    
    def perform_create(self, serializer):
        """Create signature with user info."""
        serializer.save(
            signed_by=self.request.user,
            ip_address=self.request.META.get('REMOTE_ADDR'),
            user_agent=self.request.META.get('HTTP_USER_AGENT', '')[:500]
        )
    
    @action(detail=False, methods=['get'])
    def by_document(self, request):
        """Get all signatures for a document."""
        doc_type = request.query_params.get('document_type')
        doc_id = request.query_params.get('document_id')
        
        if not doc_type or not doc_id:
            return Response(
                {'error': 'document_type and document_id are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        signatures = ElectronicSignature.objects.filter(
            document_type=doc_type,
            document_id=doc_id
        )
        
        serializer = self.get_serializer(signatures, many=True)
        return Response(serializer.data)


class AnalyticsViewSet(viewsets.ViewSet):
    """ViewSet for analytics endpoints."""
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def meeting_stats(self, request):
        """Get statistics for meetings."""
        from django.db.models import Count, Avg
        from datetime import datetime, timedelta
        
        meeting_id = request.query_params.get('meeting_id')
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        
        queryset = Meeting.objects.all()
        
        if meeting_id:
            queryset = queryset.filter(id=meeting_id)
        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        if date_to:
            queryset = queryset.filter(date__lte=date_to)
        
        stats = {
            'total_meetings': queryset.count(),
            'published_meetings': queryset.filter(status='published').count(),
            'by_type': dict(queryset.values('meeting_type').annotate(count=Count('id')).values_list('meeting_type', 'count')),
            'attendance': {}
        }
        
        # Add attendance stats if meeting_id is provided
        if meeting_id:
            try:
                meeting = Meeting.objects.get(id=meeting_id)
                attendances = MeetingAttendance.objects.filter(meeting=meeting)
                stats['attendance'] = {
                    'total': attendances.count(),
                    'by_type': dict(attendances.values('attendance_type').annotate(count=Count('id')).values_list('attendance_type', 'count'))
                }
            except Meeting.DoesNotExist:
                pass
        
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def voting_stats(self, request):
        """Get voting statistics."""
        from django.db.models import Count
        
        meeting_id = request.query_params.get('meeting_id')
        
        queryset = Vote.objects.all()
        
        if meeting_id:
            queryset = queryset.filter(agenda_item__meeting_id=meeting_id)
        
        stats = {
            'total_votes': queryset.count(),
            'by_vote': dict(queryset.values('vote').annotate(count=Count('id')).values_list('vote', 'count')),
            'top_voters': list(
                queryset.values('official__username', 'official__first_name', 'official__last_name')
                .annotate(vote_count=Count('id'))
                .order_by('-vote_count')[:10]
            )
        }
        
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def document_access(self, request):
        """Get document access analytics."""
        from django.db.models import Count
        from datetime import datetime, timedelta
        
        doc_type = request.query_params.get('document_type')
        doc_id = request.query_params.get('document_id')
        days = int(request.query_params.get('days', 30))
        
        date_from = timezone.now() - timedelta(days=days)
        
        queryset = DocumentAccessLog.objects.filter(accessed_at__gte=date_from)
        
        if doc_type:
            queryset = queryset.filter(document_type=doc_type)
        if doc_id:
            queryset = queryset.filter(document_id=doc_id)
        
        stats = {
            'total_accesses': queryset.count(),
            'by_type': dict(queryset.values('access_type').annotate(count=Count('id')).values_list('access_type', 'count')),
            'by_document_type': dict(queryset.values('document_type').annotate(count=Count('id')).values_list('document_type', 'count')),
            'recent_accesses': list(
                queryset.order_by('-accessed_at')[:20].values(
                    'document_type', 'document_id', 'access_type', 'accessed_at'
                )
            )
        }
        
        return Response(stats)


# RSS Feed View
class RSSFeedView(APIView):
    """RSS feed endpoint for meetings."""
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Generate and return RSS feed."""
        base_url = request.build_absolute_uri('/')[:-1]
        rss_xml = generate_rss_feed(base_url=base_url)
        
        response = HttpResponse(rss_xml, content_type='application/rss+xml; charset=utf-8')
        return response

