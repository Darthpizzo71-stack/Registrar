# Quick Start Guide

## Issue: Cannot View the Website

The website requires both the frontend and backend to be running. Follow these steps:

## Prerequisites Check

1. **Node.js** - Required for frontend
   - Check if installed: Open PowerShell and run `node --version`
   - If not installed: Download from https://nodejs.org (LTS version recommended)
   - After installing, restart your terminal/IDE

2. **Python** - Required for backend
   - Check if installed: `python --version` (should be 3.11+)
   - If not installed: Download from https://www.python.org

3. **PostgreSQL** - Required for database
   - Can be installed later if you want to test without database first

## Step-by-Step Setup

### 1. Install Frontend Dependencies

Open PowerShell or Command Prompt in the project root, then:

```powershell
cd frontend
npm install
```

**If you get "npm is not recognized":**
- Node.js is not installed or not in PATH
- Install Node.js from https://nodejs.org
- Restart your terminal/IDE after installation

### 2. Start Frontend Development Server

```powershell
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
```

**Open your browser to:** http://localhost:3000

### 3. (Optional) Start Backend Server

In a **new terminal window**:

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

The backend will run on: http://localhost:8000

## Common Issues

### "npm is not recognized"
- **Solution:** Install Node.js from https://nodejs.org
- Restart your terminal/IDE after installation

### "Port 3000 is already in use"
- **Solution:** Close the other application using port 3000, or change the port in `frontend/vite.config.ts`

### "Cannot find module" errors
- **Solution:** Make sure you ran `npm install` in the `frontend` directory

### Blank page or errors in browser
- **Solution:** 
  1. Open browser developer tools (F12)
  2. Check Console tab for errors
  3. Check Network tab for failed requests
  4. Make sure backend is running if you see API errors

### Frontend loads but shows errors
- The frontend can work without the backend for viewing the UI
- API calls will fail until backend is running
- This is normal - you can still see the interface

## Quick Test

1. **Just want to see the UI?**
   - Install frontend dependencies: `cd frontend && npm install`
   - Start frontend: `npm run dev`
   - Open http://localhost:3000
   - You'll see the interface (API calls will fail, but UI will load)

2. **Want full functionality?**
   - Follow all steps above
   - Make sure both frontend (port 3000) and backend (port 8000) are running

## Still Having Issues?

See `TROUBLESHOOTING.md` for detailed solutions.





