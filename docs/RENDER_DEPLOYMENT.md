# Render Deployment Guide for Escribe

This guide covers deploying the Django backend and React frontend to Render.com.

## Prerequisites

- GitHub account (Render deploys from Git repositories)
- Render account (sign up at https://render.com)
- Your code pushed to a GitHub repository

## Overview

You'll deploy:
1. **PostgreSQL Database** - Managed database service
2. **Backend Web Service** - Django API
3. **Frontend Static Site** - React application

## Step 1: Prepare Your Repository

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. Make sure your repository is public or connect it to Render (private repos require Render Pro)

## Step 2: Create PostgreSQL Database

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `escribe-db` (or your preferred name)
   - **Database**: `escribe`
   - **User**: `escribe_user` (or auto-generated)
   - **Region**: Choose closest to your users
   - **PostgreSQL Version**: 14 or 15
   - **Plan**: Free tier for testing (spins down after inactivity)
4. Click **"Create Database"**
5. **Important**: Copy the **Internal Database URL** - you'll need this later
   - Format: `postgresql://user:password@host:port/database`

## Step 3: Deploy Backend (Django)

1. In Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure the service:

   **Basic Settings:**
   - **Name**: `escribe-backend`
   - **Region**: Same as database
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt && python manage.py collectstatic --noinput`
   - **Start Command**: `gunicorn escribe.wsgi:application`

   **Environment Variables:**
   Add these environment variables (click "Add Environment Variable" for each):

   ```
   SECRET_KEY=<generate-a-strong-random-key>
   DEBUG=False
   ALLOWED_HOSTS=escribe-backend.onrender.com,your-custom-domain.com
   DB_ENGINE=postgresql
   DB_NAME=escribe
   DB_USER=<from-database-connection-string>
   DB_PASSWORD=<from-database-connection-string>
   DB_HOST=<from-database-connection-string>
   DB_PORT=5432
   ```

   **To get database credentials:**
   - Go to your PostgreSQL service
   - Click on it
   - Copy the "Internal Database URL"
   - Parse it: `postgresql://user:password@host:port/database`
   - Or use the individual connection fields shown in the database dashboard

   **Advanced Settings:**
   - **Auto-Deploy**: Yes (deploys on every push to main)
   - **Health Check Path**: `/api/` (optional)

4. Click **"Create Web Service"**

5. **After first deployment:**
   - Go to the service logs
   - Run migrations manually or add to build command:
     ```bash
     pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput
     ```
   - Or SSH into the service and run:
     ```bash
     python manage.py migrate
     python manage.py createsuperuser
     ```

## Step 4: Deploy Frontend (React)

1. In Render Dashboard, click **"New +"** → **"Static Site"**
2. Connect your GitHub repository
3. Configure:

   **Build Settings:**
   - **Name**: `escribe-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

   **Environment Variables:**
   Add this environment variable:
   ```
   VITE_API_URL=https://escribe-backend.onrender.com/api
   ```
   (Replace `escribe-backend` with your actual backend service name)

4. Click **"Create Static Site"**

## Step 5: Update CORS Settings

After deployment, update your backend's `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS`:

1. Go to your backend service → **Environment**
2. Update `ALLOWED_HOSTS`:
   ```
   ALLOWED_HOSTS=escribe-backend.onrender.com,your-frontend-url.onrender.com
   ```

3. Add environment variable for CORS (or update in settings.py):
   ```
   CORS_ALLOWED_ORIGINS=https://escribe-frontend.onrender.com
   ```

## Step 6: Run Database Migrations

1. Go to your backend service
2. Click **"Shell"** tab (or use SSH)
3. Run:
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```

## Step 7: Configure Custom Domains (Optional)

### Backend:
1. Go to backend service → **Settings** → **Custom Domains**
2. Add your domain (e.g., `api.yourdomain.com`)
3. Update DNS records as instructed
4. Update `ALLOWED_HOSTS` environment variable

### Frontend:
1. Go to frontend service → **Settings** → **Custom Domains**
2. Add your domain (e.g., `app.yourdomain.com`)
3. Update DNS records
4. Update `VITE_API_URL` to point to your backend domain

## Step 8: Environment Variables Reference

### Backend Required Variables:
```
SECRET_KEY=<strong-random-key>
DEBUG=False
ALLOWED_HOSTS=escribe-backend.onrender.com
DB_ENGINE=postgresql
DB_NAME=escribe
DB_USER=<database-user>
DB_PASSWORD=<database-password>
DB_HOST=<database-host>
DB_PORT=5432
```

### Frontend Required Variables:
```
VITE_API_URL=https://escribe-backend.onrender.com/api
```

## Step 9: File Storage (Media Files)

For production, configure cloud storage:

1. **Option 1: AWS S3** (Recommended)
   - Add to requirements: Already included (`django-storages`, `boto3`)
   - Configure in settings.py:
     ```python
     DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
     AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
     AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')
     AWS_STORAGE_BUCKET_NAME = os.environ.get('AWS_STORAGE_BUCKET_NAME')
     AWS_S3_REGION_NAME = os.environ.get('AWS_S3_REGION_NAME', 'us-east-1')
     ```

2. **Option 2: Render Disk** (Temporary, not persistent)
   - Files stored in `/opt/render/project/src/media`
   - **Warning**: Files are lost on redeploy
   - Only use for testing

## Step 10: Monitoring and Logs

- **View Logs**: Service → **Logs** tab
- **Metrics**: Service → **Metrics** tab
- **Health Checks**: Configured automatically

## Troubleshooting

### Backend won't start
- Check logs for errors
- Verify all environment variables are set
- Ensure database is accessible (use Internal Database URL)
- Check that `gunicorn` is in requirements.txt

### Database connection errors
- Verify database credentials in environment variables
- Use Internal Database URL for `DB_HOST`
- Check that database is running (free tier spins down)

### Frontend can't connect to backend
- Verify `VITE_API_URL` is set correctly
- Check CORS settings in backend
- Ensure backend URL includes `/api` at the end
- Check browser console for CORS errors

### Static files not loading
- Verify `collectstatic` ran during build
- Check `STATIC_ROOT` and `STATIC_URL` settings
- Ensure `whitenoise` middleware is enabled (included in settings)

### 502 Bad Gateway
- Check backend logs
- Verify start command is correct
- Ensure database is accessible
- Check that port binding is correct (Render uses PORT env var)

## Cost Estimate

**Free Tier (Testing):**
- PostgreSQL: Free (spins down after 90 days inactivity)
- Web Service: Free (spins down after 15 min inactivity)
- Static Site: Free
- **Total: $0/month** (with limitations)

**Starter Tier (Recommended for Production):**
- PostgreSQL: $7/month
- Web Service: $7/month
- Static Site: Free
- **Total: ~$14/month**

## Security Checklist

- [ ] Generate strong `SECRET_KEY`
- [ ] Set `DEBUG=False`
- [ ] Configure `ALLOWED_HOSTS`
- [ ] Set up CORS properly
- [ ] Use HTTPS (automatic on Render)
- [ ] Configure cloud storage for media files
- [ ] Set up database backups
- [ ] Enable monitoring and alerts
- [ ] Review and restrict CORS origins
- [ ] Set up custom domain with SSL

## Quick Deploy Checklist

- [ ] Code pushed to GitHub
- [ ] PostgreSQL database created
- [ ] Backend web service created with environment variables
- [ ] Frontend static site created with `VITE_API_URL`
- [ ] Database migrations run
- [ ] Superuser created
- [ ] CORS settings updated
- [ ] Test login and API endpoints
- [ ] Configure file storage (if needed)

## Support

- Render Docs: https://render.com/docs
- Render Community: https://community.render.com
- Django on Render: https://render.com/docs/deploy-django

