# Render Deployment - Quick Start

## Prerequisites Checklist

- [ ] Code pushed to GitHub
- [ ] Render account created (https://render.com)
- [ ] GitHub repository connected to Render

## Quick Deploy Steps

### 1. Create PostgreSQL Database (2 minutes)

1. Render Dashboard → **New +** → **PostgreSQL**
2. Name: `escribe-db`
3. Database: `escribe`
4. Plan: **Free** (for testing)
5. Click **Create Database**
6. **Copy the Internal Database URL** (you'll need it)

### 2. Deploy Backend (5 minutes)

1. Render Dashboard → **New +** → **Web Service**
2. Connect your GitHub repo
3. Configure:
   - **Name**: `escribe-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput`
   - **Start Command**: `gunicorn escribe.wsgi:application`
4. Add Environment Variables:
   ```
   SECRET_KEY=<click-generate>
   DEBUG=False
   ALLOWED_HOSTS=escribe-backend.onrender.com
   DB_ENGINE=postgresql
   DATABASE_URL=<paste-internal-database-url-from-step-1>
   ```
5. Click **Create Web Service**

### 3. Deploy Frontend (3 minutes)

1. Render Dashboard → **New +** → **Static Site**
2. Connect your GitHub repo
3. Configure:
   - **Name**: `escribe-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add Environment Variable:
   ```
   VITE_API_URL=https://escribe-backend.onrender.com/api
   ```
   (Replace with your actual backend URL)
5. Click **Create Static Site**

### 4. Update CORS (1 minute)

1. Go to backend service → **Environment**
2. Add:
   ```
   CORS_ALLOWED_ORIGINS=https://escribe-frontend.onrender.com
   ```
   (Replace with your actual frontend URL)
3. Service will auto-redeploy

### 5. Create Superuser (2 minutes)

1. Backend service → **Shell** tab
2. Run:
   ```bash
   python manage.py createsuperuser
   ```
3. Follow prompts

## Your URLs

- **Frontend**: `https://escribe-frontend.onrender.com`
- **Backend API**: `https://escribe-backend.onrender.com/api/`
- **Admin Panel**: `https://escribe-backend.onrender.com/admin/`

## Troubleshooting

**Backend won't start?**
- Check logs for errors
- Verify `DATABASE_URL` is set correctly
- Ensure database is running

**Frontend can't connect?**
- Verify `VITE_API_URL` matches backend URL
- Check CORS settings in backend
- Look at browser console for errors

**Database connection failed?**
- Use Internal Database URL (not External)
- Verify database is running (free tier spins down)

## Next Steps

- [ ] Test login functionality
- [ ] Create test data
- [ ] Configure custom domain (optional)
- [ ] Set up file storage (S3 recommended)
- [ ] Enable monitoring

For detailed instructions, see `docs/RENDER_DEPLOYMENT.md`

