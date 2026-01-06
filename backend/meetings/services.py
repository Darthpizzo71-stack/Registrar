"""
Services for meetings app - Email notifications, RSS feeds, etc.
"""
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from .models import Meeting, EmailSubscription, AgendaItem
from django.utils import timezone
from datetime import timedelta


def send_meeting_notification(meeting: Meeting, notification_type: str = 'published'):
    """
    Send email notification about a meeting.
    
    Args:
        meeting: Meeting instance
        notification_type: Type of notification ('published', 'updated', 'reminder')
    """
    if not hasattr(settings, 'EMAIL_HOST') or not settings.EMAIL_HOST:
        # Email not configured, skip
        return
    
    subscriptions = EmailSubscription.objects.filter(
        is_active=True,
        subscription_types__contains=[notification_type]
    )
    
    if not subscriptions.exists():
        return
    
    subject = f"Meeting {notification_type.title()}: {meeting.title}"
    
    # Create email content
    context = {
        'meeting': meeting,
        'notification_type': notification_type,
        'base_url': getattr(settings, 'FRONTEND_URL', 'https://escribe-frontend.onrender.com'),
    }
    
    # Try to render HTML email, fallback to plain text
    try:
        html_message = f"""
        <html>
        <body>
            <h2>{meeting.title}</h2>
            <p><strong>Date:</strong> {meeting.date}</p>
            <p><strong>Time:</strong> {meeting.time}</p>
            <p><strong>Location:</strong> {meeting.location}</p>
            <p><strong>Type:</strong> {meeting.get_meeting_type_display()}</p>
            {f'<p>{meeting.description}</p>' if meeting.description else ''}
            <p><a href="{context['base_url']}/meetings/{meeting.id}">View Meeting Details</a></p>
        </body>
        </html>
        """
        plain_message = strip_tags(html_message)
    except:
        plain_message = f"""
        Meeting {notification_type.title()}: {meeting.title}
        
        Date: {meeting.date}
        Time: {meeting.time}
        Location: {meeting.location}
        Type: {meeting.get_meeting_type_display()}
        """
        html_message = None
    
    # Send to all subscribers
    recipient_list = [sub.email for sub in subscriptions]
    
    if recipient_list:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@example.com'),
            recipient_list=recipient_list,
            html_message=html_message if html_message else None,
            fail_silently=True,  # Don't raise errors if email fails
        )


def generate_rss_feed(meetings=None, base_url='https://escribe-backend.onrender.com'):
    """
    Generate RSS feed XML for meetings.
    
    Args:
        meetings: QuerySet of meetings (defaults to published meetings)
        base_url: Base URL for the application
    
    Returns:
        RSS XML string
    """
    from xml.etree import ElementTree as ET
    from django.utils import timezone
    
    if meetings is None:
        meetings = Meeting.objects.filter(
            status='published',
            published_at__isnull=False
        ).order_by('-date', '-time')[:20]
    
    # Create RSS root
    rss = ET.Element('rss', version='2.0')
    channel = ET.SubElement(rss, 'channel')
    
    ET.SubElement(channel, 'title').text = 'Escribe Meeting Notifications'
    ET.SubElement(channel, 'link').text = base_url
    ET.SubElement(channel, 'description').text = 'Government meeting agendas and minutes'
    ET.SubElement(channel, 'language').text = 'en-us'
    ET.SubElement(channel, 'lastBuildDate').text = timezone.now().strftime('%a, %d %b %Y %H:%M:%S %z')
    
    for meeting in meetings:
        item = ET.SubElement(channel, 'item')
        ET.SubElement(item, 'title').text = meeting.title
        ET.SubElement(item, 'link').text = f'{base_url}/api/meetings/{meeting.id}/'
        ET.SubElement(item, 'description').text = meeting.description or f"{meeting.get_meeting_type_display()} on {meeting.date}"
        ET.SubElement(item, 'pubDate').text = (meeting.published_at or meeting.created_at).strftime('%a, %d %b %Y %H:%M:%S %z')
        ET.SubElement(item, 'guid', isPermaLink='false').text = f'meeting-{meeting.id}'
        
        # Add category
        category = ET.SubElement(item, 'category')
        category.text = meeting.get_meeting_type_display()
    
    return ET.tostring(rss, encoding='unicode', xml_declaration=True)



