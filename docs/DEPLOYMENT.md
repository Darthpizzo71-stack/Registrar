# Deployment Guide

## Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- pip and npm

## Backend Setup

1. **Create virtual environment:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. **Run migrations:**
```bash
python manage.py migrate
```

5. **Create superuser:**
```bash
python manage.py createsuperuser
```

6. **Collect static files:**
```bash
python manage.py collectstatic --noinput
```

7. **Run development server:**
```bash
python manage.py runserver
```

## Frontend Setup

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your API URL
```

3. **Run development server:**
```bash
npm run dev
```

## Production Deployment

### Backend (Django)

1. Set `DEBUG=False` in settings
2. Configure `ALLOWED_HOSTS`
3. Set up SSL/HTTPS
4. Use a production WSGI server (Gunicorn, uWSGI)
5. Configure reverse proxy (Nginx, Apache)
6. Set up database backups
7. Configure file storage (S3, Azure Blob, etc.)

### Frontend (React)

1. Build for production:
```bash
npm run build
```

2. Serve static files with Nginx or similar
3. Configure API proxy
4. Enable HTTPS

## Database Setup

1. Create PostgreSQL database:
```sql
CREATE DATABASE registrar;
CREATE USER registrar_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE registrar TO registrar_user;
```

2. Run migrations:
```bash
python manage.py migrate
```

## Security Checklist

- [ ] Change `SECRET_KEY` in production
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up MFA for admin users
- [ ] Configure file upload limits
- [ ] Set up regular backups
- [ ] Enable audit logging
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging

## Compliance

- Ensure Open Meetings Act posting deadlines are configured
- Set up public records retention policies
- Test WCAG 2.1 AA accessibility
- Configure audit log retention
- Set up FOIA request handling workflow


