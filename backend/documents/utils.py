"""
Utility functions for document processing
"""
import os
from typing import Optional
from .models import Attachment, DocumentSearchIndex


def extract_text_from_pdf(file_path: str) -> Optional[str]:
    """
    Extract text content from PDF file.
    This is a placeholder - implement with PyPDF2 or pdfplumber.
    """
    try:
        # TODO: Implement PDF text extraction
        # Example with PyPDF2:
        # from PyPDF2 import PdfReader
        # reader = PdfReader(file_path)
        # text = ""
        # for page in reader.pages:
        #     text += page.extract_text()
        # return text
        return None
    except Exception:
        return None


def index_document(attachment: Attachment) -> None:
    """
    Create or update search index for a document.
    """
    if attachment.file_type == 'pdf':
        file_path = attachment.file.path
        content = extract_text_from_pdf(file_path)
        
        if content:
            DocumentSearchIndex.objects.update_or_create(
                attachment=attachment,
                defaults={'content': content}
            )





