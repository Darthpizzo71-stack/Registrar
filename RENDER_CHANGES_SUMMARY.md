# Render Deployment - Changes Made

This document summarizes all changes made to prepare the codebase for Render deployment.

## Files Created

1. **`docs/RENDER_DEPLOYMENT.md`** - Comprehensive deployment guide
2. **`RENDER_QUICK_START.md`** - Quick reference for deployment
3. **`render.yaml`** - Render configuration file for one-click deployment
4. **`backend/Procfile`** - Process file for Gunicorn (backup method)
5. **`backend/build.sh`** - Build script for Render

## Files Modified

### `backend/requirements.txt`
**Added:**
- `gunicorn>=21.2.0` - Production WSGI server for Render
- `whitenoise>=6.6.0` - Serves static files in production
- `dj-database-url>=2.1.0` - Parses Render's DATABASE_URL format

### `backend/escribe/settings.py`
**Changes:**

1. **Added WhiteNoise middleware** (for static file serving):
   ```python
   'whitenoise.middleware.WhiteNoiseMiddleware',
   ```
   Placed after SecurityMiddleware

2. **Updated static files configuration**:
   - Changed `STATIC_URL` from `'static/'` to `'/static/'`
   - Added WhiteNoise storage: `STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'`

3. **Enhanced database configuration**:
   - Added support for Render's `DATABASE_URL` format
   - Falls back to individual DB_* environment variables if DATABASE_URL not set
   - Uses `dj_database_url` to parse connection string

4. **Improved CORS configuration**:
   - Added support for `CORS_ALLOWED_ORIGINS` environment variable
   - Allows comma-separated list of origins from environment
   - Maintains localhost defaults for development

## Key Features for Render

### Automatic Database Connection
- Uses `DATABASE_URL` if provided (Render's format)
- Falls back to individual `DB_*` variables for local development
- Supports connection pooling with `conn_max_age=600`

### Static File Serving
- WhiteNoise middleware serves static files efficiently
- Compressed and cached for performance
- No need for separate static file service

### Environment-Based Configuration
- All sensitive settings read from environment variables
- CORS origins configurable via environment
- Database connection flexible (URL or individual vars)

### Production-Ready Settings
- Security headers enabled when `DEBUG=False`
- HTTPS enforcement in production
- Secure cookies in production mode

## Deployment Options

### Option 1: Using render.yaml (Recommended)
1. Push code to GitHub
2. In Render Dashboard → **New** → **Blueprint**
3. Connect GitHub repo
4. Render will read `render.yaml` and create all services automatically

### Option 2: Manual Setup
Follow the step-by-step guide in `docs/RENDER_DEPLOYMENT.md`

## Environment Variables Needed

### Backend:
- `SECRET_KEY` - Django secret key (Render can generate)
- `DEBUG=False` - Production mode
- `ALLOWED_HOSTS` - Your backend domain
- `DATABASE_URL` - From Render PostgreSQL service (or use DB_* vars)
- `CORS_ALLOWED_ORIGINS` - Your frontend URL(s)

### Frontend:
- `VITE_API_URL` - Your backend API URL (e.g., `https://escribe-backend.onrender.com/api`)

## Testing Locally

Before deploying, test that everything works:

```powershell
# Set environment variables
$env:DB_ENGINE="postgresql"
$env:DATABASE_URL="your-local-postgres-url"
$env:DEBUG="False"
$env:ALLOWED_HOSTS="localhost"

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Test with Gunicorn
gunicorn escribe.wsgi:application
```

## Next Steps

1. **Push to GitHub**: Commit and push all changes
2. **Deploy to Render**: Follow `RENDER_QUICK_START.md`
3. **Test**: Verify all endpoints work
4. **Configure**: Set up custom domains if needed
5. **Storage**: Configure S3 or other cloud storage for media files

## Notes

- The `Procfile` is included but Render will use `startCommand` from `render.yaml` if present
- `build.sh` is optional; Render can use inline build commands
- WhiteNoise handles static files, so no need for separate static file service
- Database migrations run automatically during build (configured in `render.yaml`)

