# System Architecture

## Overview

Registrar is a full-stack government meeting management system built with Django (backend) and React/TypeScript (frontend).

## Technology Stack

### Backend
- **Framework**: Django 4.2.7
- **API**: Django REST Framework
- **Database**: PostgreSQL
- **Authentication**: JWT (djangorestframework-simplejwt)
- **File Storage**: Django FileField (configurable for cloud storage)
- **PDF Generation**: ReportLab
- **Audit Logging**: django-auditlog

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router
- **HTTP Client**: Axios

## Database Schema

### Core Models

#### User
- Custom user model extending AbstractUser
- Role-based access control (clerk, staff, official, public, it_admin)
- MFA support fields
- Session tracking

#### Meeting
- Meeting information (date, time, location, type)
- Status workflow (draft → published → completed → archived)
- Compliance tracking (posting deadlines, published timestamps)
- Links to agenda sections and items

#### AgendaSection
- Organizes agenda items into sections
- Ordered within meetings

#### AgendaItem
- Individual agenda items
- Auto-numbering system
- Links to minutes and attachments
- Submission tracking

#### Minute
- Linked to agenda items (OneToOne)
- Version history support
- Approval workflow (draft → review → approved)

#### Attachment
- File uploads with versioning
- Full-text search index support
- Public/private access control
- Multiple file types (PDF, images, spreadsheets, documents)

## Security

### Authentication
- JWT-based authentication
- Token refresh mechanism
- Session tracking

### Authorization
- Role-based permissions
- Custom permission classes
- Public read access for published content
- Authenticated write access with role checks

### Data Protection
- HTTPS enforcement in production
- Secure file uploads
- Input validation
- SQL injection protection (Django ORM)
- XSS protection (React escaping)

## Compliance Features

### Open Meetings Act
- Posting deadline tracking
- Publication timestamping
- Public access to published agendas

### Public Records
- Immutable audit logs (django-auditlog)
- Document versioning
- Retention tracking
- Public URL generation

### Accessibility (WCAG 2.1 AA)
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus indicators
- High contrast support
- Screen reader compatibility

### FOIA
- Full-text search across documents
- Searchable document index
- Public access to approved minutes

## API Design

### RESTful Endpoints
- `/api/meetings/` - Meeting management
- `/api/meetings/items/` - Agenda items
- `/api/meetings/minutes/` - Minutes
- `/api/documents/attachments/` - Document management
- `/api/users/` - User management
- `/api/auth/token/` - Authentication

### Response Format
- Paginated lists
- Consistent error responses
- JSON serialization

## Frontend Architecture

### Component Structure
```
src/
├── components/        # Reusable components
│   ├── Layout.tsx
│   ├── ProtectedRoute.tsx
│   └── dashboard/    # Dashboard-specific components
├── contexts/          # React contexts (Auth)
├── pages/            # Page components
├── services/         # API service layer
└── types/            # TypeScript type definitions
```

### State Management
- React Query for server state
- Context API for auth state
- Local state for UI state

### Routing
- Public routes (Home, Meetings, Meeting Detail)
- Protected routes (Dashboard)
- Role-based route access

## File Storage

### Current Implementation
- Local file storage (Django FileField)
- Organized by meeting ID
- UUID-based filenames

### Production Recommendations
- AWS S3 / Azure Blob Storage
- CDN for public files
- Backup strategy
- Retention policies

## Search Functionality

### Implementation
- Full-text search via DocumentSearchIndex
- PDF text extraction (placeholder)
- Search across document content
- Filtered by permissions

### Future Enhancements
- Elasticsearch integration
- Advanced search operators
- Search result ranking
- Search analytics

## Deployment Considerations

### Backend
- WSGI server (Gunicorn)
- Reverse proxy (Nginx)
- Database connection pooling
- Static file serving
- Media file serving

### Frontend
- Static file hosting
- CDN for assets
- API proxy configuration
- Environment variables

### Monitoring
- Application logs
- Error tracking
- Performance monitoring
- Audit log review

## Scalability

### Database
- Indexed queries
- Connection pooling
- Query optimization
- Read replicas (if needed)

### Application
- Stateless design
- Horizontal scaling capability
- Caching strategy (Redis recommended)
- Background tasks (Celery recommended)

## Backup & Recovery

### Database
- Daily automated backups
- Point-in-time recovery
- Backup retention policy

### Files
- Regular file backups
- Version control for documents
- Disaster recovery plan

## Future Enhancements (Phase 2)

- Roll-call voting records
- Meeting video integration
- Agenda packet auto-generation
- Electronic signatures
- Calendar integration (ICS)
- Automated posting deadlines
- Email notifications / RSS feeds
- Advanced analytics


