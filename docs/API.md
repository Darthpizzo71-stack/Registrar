# API Documentation

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Endpoints

#### POST /api/auth/token/
Obtain JWT access and refresh tokens.

**Request:**
```json
{
  "username": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### POST /api/auth/token/refresh/
Refresh access token.

**Request:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

## Meetings

### GET /api/meetings/meetings/
List meetings (public or authenticated).

**Query Parameters:**
- `status`: Filter by status (draft, published, completed, archived)
- `meeting_type`: Filter by type (regular, special, workshop, hearing, emergency)
- `date`: Filter by date
- `search`: Search in title and description
- `ordering`: Order by field (-date, -created_at, etc.)
- `page`: Page number

### GET /api/meetings/meetings/{id}/
Get meeting details.

### POST /api/meetings/meetings/
Create a new meeting (requires clerk/admin role).

**Request:**
```json
{
  "title": "City Council Meeting",
  "meeting_type": "regular",
  "date": "2024-01-15",
  "time": "19:00:00",
  "location": "City Hall",
  "description": "Regular monthly meeting"
}
```

### PATCH /api/meetings/meetings/{id}/
Update meeting (requires clerk/admin role).

### POST /api/meetings/meetings/{id}/publish/
Publish meeting agenda (requires clerk/admin role).

### GET /api/meetings/meetings/{id}/agenda_pdf/
Generate PDF agenda (requires clerk/admin role).

## Agenda Items

### GET /api/meetings/items/
List agenda items.

**Query Parameters:**
- `meeting`: Filter by meeting ID
- `section`: Filter by section ID
- `priority`: Filter by priority
- `search`: Search in title and description

### POST /api/meetings/items/
Create agenda item (requires staff/clerk role).

**Request:**
```json
{
  "meeting": 1,
  "section": 1,
  "title": "Budget Approval",
  "description": "Approve annual budget",
  "department": "Finance",
  "priority": "high"
}
```

## Minutes

### GET /api/meetings/minutes/
List minutes.

**Query Parameters:**
- `agenda_item`: Filter by agenda item ID
- `status`: Filter by status (draft, review, approved)
- `search`: Search in text

### POST /api/meetings/minutes/
Create minutes.

**Request:**
```json
{
  "agenda_item": 1,
  "text": "The board discussed and approved the budget."
}
```

### POST /api/meetings/minutes/{id}/approve/
Approve minutes (requires clerk/admin role).

### POST /api/meetings/minutes/{id}/create_version/
Create new version of minutes.

## Documents

### GET /api/documents/attachments/
List attachments.

**Query Parameters:**
- `agenda_item`: Filter by agenda item ID
- `file_type`: Filter by file type

### POST /api/documents/attachments/
Upload attachment (multipart/form-data).

**Form Data:**
- `file`: File to upload
- `agenda_item`: Agenda item ID
- `name`: Document name
- `description`: Optional description

### GET /api/documents/attachments/search/?q=query
Search documents by content.

## Users

### GET /api/users/me/
Get current user profile.

### GET /api/users/
List users (admin only).

### POST /api/users/
Create user (admin only).





