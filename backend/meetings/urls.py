"""
URLs for meetings app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MeetingViewSet, AgendaSectionViewSet, AgendaItemViewSet,
    MinuteViewSet, VoteViewSet,
    EmailSubscriptionViewSet, ElectronicSignatureViewSet,
    AnalyticsViewSet, RSSFeedView
)

router = DefaultRouter()
router.register(r'meetings', MeetingViewSet, basename='meeting')
router.register(r'sections', AgendaSectionViewSet, basename='agenda-section')
router.register(r'items', AgendaItemViewSet, basename='agenda-item')
router.register(r'minutes', MinuteViewSet, basename='minute')
router.register(r'votes', VoteViewSet, basename='vote')
router.register(r'email-subscriptions', EmailSubscriptionViewSet, basename='email-subscription')
router.register(r'signatures', ElectronicSignatureViewSet, basename='signature')
router.register(r'analytics', AnalyticsViewSet, basename='analytics')

urlpatterns = [
    path('', include(router.urls)),
    path('rss/', RSSFeedView.as_view(), name='rss-feed'),
]





