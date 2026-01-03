"""
Utility functions for meeting management
"""
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from io import BytesIO
from .models import Meeting


def generate_agenda_pdf(meeting: Meeting) -> BytesIO:
    """
    Generate PDF agenda for a meeting.
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    story = []
    styles = getSampleStyleSheet()
    
    # Title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor='#0c4a6e',
        spaceAfter=30,
        alignment=TA_CENTER
    )
    story.append(Paragraph(meeting.title, title_style))
    story.append(Spacer(1, 0.2 * inch))
    
    # Meeting info
    info_style = ParagraphStyle(
        'Info',
        parent=styles['Normal'],
        fontSize=12,
        alignment=TA_CENTER
    )
    story.append(Paragraph(f"Date: {meeting.date}", info_style))
    story.append(Paragraph(f"Time: {meeting.time}", info_style))
    story.append(Paragraph(f"Location: {meeting.location}", info_style))
    story.append(Spacer(1, 0.3 * inch))
    
    # Agenda items
    if meeting.sections.exists():
        for section in meeting.sections.all().order_by('order'):
            section_style = ParagraphStyle(
                'Section',
                parent=styles['Heading2'],
                fontSize=16,
                textColor='#0369a1',
                spaceAfter=12
            )
            story.append(Paragraph(section.title, section_style))
            
            for item in section.items.all().order_by('order'):
                item_style = ParagraphStyle(
                    'Item',
                    parent=styles['Normal'],
                    fontSize=12,
                    leftIndent=0.5 * inch,
                    spaceAfter=6
                )
                item_text = f"<b>{item.number or item.order}. {item.title}</b>"
                story.append(Paragraph(item_text, item_style))
                if item.description:
                    desc_style = ParagraphStyle(
                        'Description',
                        parent=styles['Normal'],
                        fontSize=10,
                        leftIndent=0.7 * inch,
                        spaceAfter=12
                    )
                    story.append(Paragraph(item.description, desc_style))
    else:
        # No sections, list items directly
        for item in meeting.agenda_items.all().order_by('order'):
            item_style = ParagraphStyle(
                'Item',
                parent=styles['Normal'],
                fontSize=12,
                spaceAfter=12
            )
            item_text = f"<b>{item.number or item.order}. {item.title}</b>"
            story.append(Paragraph(item_text, item_style))
            if item.description:
                desc_style = ParagraphStyle(
                    'Description',
                    parent=styles['Normal'],
                    fontSize=10,
                    leftIndent=0.3 * inch,
                    spaceAfter=12
                )
                story.append(Paragraph(item.description, desc_style))
    
    doc.build(story)
    buffer.seek(0)
    return buffer





