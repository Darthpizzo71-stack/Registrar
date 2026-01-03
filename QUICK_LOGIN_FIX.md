# Quick Login Fix Guide

## Step 1: Check Backend is Running

Make sure the backend server is running:
- **HTTP**: http://localhost:8000
- **HTTPS**: https://localhost:8000

Test by opening: http://localhost:8000/admin (or https://localhost:8000/admin)

## Step 2: Check API URL Configuration

The frontend needs to know which URL to use. Check:

1. **If backend is HTTP** (default):
   - No changes needed, uses: `http://localhost:8000/api`

2. **If backend is HTTPS**:
   - Create `frontend/.env` file:
     ```
     VITE_API_URL=https://localhost:8000/api
     ```
   - Restart the frontend dev server

## Step 3: Verify Credentials

Default credentials:
- **Username**: `admin`
- **Password**: `admin123`

## Step 4: Check Browser Console

1. Open browser Developer Tools (F12)
2. Go to **Console** tab
3. Try to login
4. Look for any red error messages
5. Go to **Network** tab
6. Look for the request to `/api/auth/token/`
7. Check:
   - Status code (should be 200)
   - Response body
   - Request URL

## Step 5: Common Issues

### Issue: "Network Error" or "Failed to fetch"
- Backend server is not running
- Wrong API URL (HTTP vs HTTPS mismatch)
- CORS blocking the request

### Issue: "Invalid credentials"
- Wrong username or password
- User account is inactive
- Password was changed

### Issue: CORS Error
- Backend CORS settings need to include frontend URL
- Check `backend/escribe/settings.py` CORS_ALLOWED_ORIGINS

## Step 6: Reset Password (if needed)

If you need to reset the admin password:

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python manage.py shell
```

Then:
```python
from users.models import User
user = User.objects.get(username='admin')
user.set_password('admin123')
user.save()
print("Password reset to: admin123")
exit()
```

## Step 7: Test API Directly

Open browser console and run:
```javascript
fetch('http://localhost:8000/api/auth/token/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'admin123' })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

This will show you the exact error from the API.



