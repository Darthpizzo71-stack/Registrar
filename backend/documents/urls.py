"""
URLs for documents app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AttachmentViewSet, DocumentSearchIndexViewSet

router = DefaultRouter()
router.register(r'attachments', AttachmentViewSet, basename='attachment')
router.register(r'search-index', DocumentSearchIndexViewSet, basename='document-search-index')

urlpatterns = [
    path('', include(router.urls)),
]





