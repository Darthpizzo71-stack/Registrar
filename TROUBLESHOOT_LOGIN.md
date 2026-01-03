# Troubleshooting Login Issues

## Common Issues and Solutions

### 1. "Network Error" or "Failed to fetch"

**Problem**: Frontend cannot reach the backend API.

**Solutions**:
- Make sure the backend server is running: `http://localhost:8000` or `https://localhost:8000`
- Check if you're using the correct protocol (HTTP vs HTTPS)
- Verify the API URL in browser console (F12 → Network tab)

### 2. "Invalid credentials" or "No active account found"

**Problem**: Username or password is incorrect.

**Solutions**:
- Default credentials: Username: `admin`, Password: `admin123`
- Check if user exists: Run `python manage.py shell` and check:
  ```python
  from users.models import User
  user = User.objects.get(username='admin')
  print(user.username, user.is_active)
  ```
- Reset password if needed (see below)

### 3. CORS Error

**Problem**: Browser blocks the request due to CORS policy.

**Solutions**:
- Make sure CORS is configured in `backend/escribe/settings.py`
- Check that frontend URL is in `CORS_ALLOWED_ORIGINS`
- If using HTTPS backend, add HTTPS origins to CORS settings

### 4. API URL Mismatch

**Problem**: Frontend is calling wrong API URL.

**Check**:
- Open browser console (F12)
- Look at Network tab when clicking Login
- Verify the request URL matches your backend

**Fix**:
- If backend is HTTPS: Update `frontend/.env`:
  ```
  VITE_API_URL=https://localhost:8000/api
  ```
- If backend is HTTP: Keep default or set:
  ```
  VITE_API_URL=http://localhost:8000/api
  ```

## Reset Admin Password

If you need to reset the admin password:

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python manage.py shell
```

Then in Python shell:
```python
from users.models import User
user = User.objects.get(username='admin')
user.set_password('admin123')
user.save()
print("Password reset successfully")
```

## Test Login Directly

1. Open browser console (F12)
2. Go to Network tab
3. Try to login
4. Check the request to `/api/auth/token/`
5. Look at:
   - Request URL
   - Request payload
   - Response status
   - Response body

## Verify Backend is Running

```powershell
# Check if port 8000 is in use
netstat -ano | findstr :8000

# Or test with curl
curl http://localhost:8000/api/auth/token/ -X POST -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

## Quick Checklist

- [ ] Backend server is running
- [ ] Frontend server is running
- [ ] Using correct credentials (admin/admin123)
- [ ] API URL matches backend protocol (http/https)
- [ ] CORS is configured correctly
- [ ] No browser console errors
- [ ] Network tab shows the request

## Still Having Issues?

1. Check browser console for errors
2. Check Network tab for failed requests
3. Verify backend logs for errors
4. Try accessing backend directly: `http://localhost:8000/admin`
5. Test API endpoint directly with curl or Postman



