# Registrar - Government Meeting Management System

A comprehensive system for managing meeting agendas, minutes, and supporting documents with full legal compliance for open meetings and public records laws.

## Features

### Core (MVP)
- **Agenda Management**: Create, manage, and publish meeting agendas
- **Minutes Management**: Draft, review, and approve meeting minutes
- **Document Management**: Secure file uploads with versioning
- **Public Portal**: Public-facing interface for viewing agendas and minutes
- **Search**: Full-text search across all documents
- **Compliance**: Audit logs, time-stamped publishing, revision tracking

### Legal Compliance
- Open Meetings Act compliance
- Public Records retention
- ADA / WCAG 2.1 AA accessibility
- FOIA searchability
- Immutable audit logs

## Technology Stack

- **Backend**: Django 4.x with Django REST Framework
- **Frontend**: React 18 with TypeScript
- **Database**: PostgreSQL
- **File Storage**: Configurable (local or cloud)

## Project Structure

```
Registrar/
├── backend/          # Django backend
├── frontend/         # React frontend
├── docs/            # Documentation
└── docker/          # Docker configuration
```

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- pip and npm

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## User Roles

- **Clerk/Admin**: Full system access
- **Department Staff**: Submit agenda items
- **Elected Officials**: Review and annotate
- **Public Users**: View-only access
- **IT Admin**: System management

## Key Features Implemented

### ✅ MVP Features
- User authentication and role-based access control
- Meeting creation and management
- Agenda item submission workflow
- Minutes drafting and approval
- Document upload and versioning
- Public portal for viewing agendas and minutes
- PDF agenda generation
- Full-text search infrastructure
- Audit logging (via django-auditlog)
- WCAG 2.1 AA accessibility features

### 🔄 Phase 2 (Future)
- Roll-call voting records
- Meeting video integration
- Electronic signatures
- Calendar integration (ICS)
- Automated posting deadlines
- Email notifications / RSS feeds

## Documentation

- [API Documentation](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Architecture Overview](docs/ARCHITECTURE.md)

## Compliance

This system is designed to comply with:
- Open Meetings Act requirements
- Public Records laws
- ADA / WCAG 2.1 AA accessibility standards
- FOIA searchability requirements

## Development Status

This is an MVP implementation with core features. Additional features and enhancements are planned for Phase 2.

## License

Proprietary - For government use

