# Troubleshooting Guide

## Cannot View the Website

### Step 1: Install Frontend Dependencies

If you haven't installed dependencies yet:

```bash
cd frontend
npm install
```

### Step 2: Start the Development Server

```bash
cd frontend
npm run dev
```

You should see output like:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### Step 3: Check for Errors

#### Common Issues:

**1. Port 3000 already in use:**
```
Error: Port 3000 is already in use
```
**Solution:** Either:
- Stop the other process using port 3000
- Or change the port in `vite.config.ts`:
```typescript
server: {
  port: 3001, // Change to different port
}
```

**2. Module not found errors:**
```
Error: Cannot find module 'react'
```
**Solution:** Run `npm install` in the frontend directory

**3. TypeScript errors:**
```
Error: Cannot find name 'React'
```
**Solution:** Make sure all dependencies are installed:
```bash
cd frontend
npm install
```

**4. Vite config errors:**
If you see errors about `path` or `__dirname`:
- The config has been fixed to use ES module syntax
- Make sure you're using Node.js 18+ and the latest npm

### Step 4: Check Browser Console

Open your browser's developer console (F12) and check for errors:
- Red errors in the console
- Network tab showing failed requests
- Any CORS errors

### Step 5: Verify Backend is Running

The frontend expects the backend API at `http://localhost:8000/api`. 

**Start the backend:**
```bash
cd backend
python manage.py runserver
```

**Check backend is accessible:**
- Open `http://localhost:8000/api/` in your browser
- You should see a Django REST Framework page or API response

### Step 6: Check Environment Variables

Make sure the API URL is correct. The frontend uses:
- `VITE_API_URL` from `.env` file, or
- Defaults to `http://localhost:8000/api`

Create `frontend/.env` if needed:
```
VITE_API_URL=http://localhost:8000/api
```

### Step 7: Clear Cache and Reinstall

If nothing works:

```bash
cd frontend
# Remove node_modules and lock file
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json  # if exists
# Reinstall
npm install
# Try again
npm run dev
```

## Backend Issues

### Database Not Set Up

If you see database errors:

```bash
cd backend
python manage.py migrate
python manage.py createsuperuser
```

### Missing Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Port 8000 Already in Use

Change the port:
```bash
python manage.py runserver 8001
```

Then update frontend `.env`:
```
VITE_API_URL=http://localhost:8001/api
```

## Still Having Issues?

1. **Check Node.js version:** Should be 18+
   ```bash
   node --version
   ```

2. **Check Python version:** Should be 3.11+
   ```bash
   python --version
   ```

3. **Check if servers are running:**
   - Frontend: `http://localhost:3000`
   - Backend: `http://localhost:8000`

4. **Check firewall/antivirus:** May be blocking ports

5. **Try a different browser:** Clear cache and try again

## Quick Start Checklist

- [ ] Node.js 18+ installed
- [ ] Python 3.11+ installed
- [ ] PostgreSQL running (if using database)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Backend dependencies installed (`pip install -r requirements.txt`)
- [ ] Database migrated (`python manage.py migrate`)
- [ ] Backend server running (`python manage.py runserver`)
- [ ] Frontend server running (`npm run dev`)
- [ ] Browser opened to `http://localhost:3000`





