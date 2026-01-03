# Correct URLs to Access the Application

## ⚠️ IMPORTANT: Use HTTP, NOT HTTPS

The development server runs on **HTTP only**. Using HTTPS will cause connection errors.

## Backend URLs (Django)

✅ **CORRECT - Use these:**
- http://localhost:8000/
- http://127.0.0.1:8000/
- http://localhost:8000/admin
- http://localhost:8000/api/

❌ **WRONG - Don't use these:**
- https://localhost:8000/ (will cause Error -107)
- https://127.0.0.1:8000/ (will cause Error -107)

## Frontend URLs (React)

✅ **CORRECT - Use these:**
- http://localhost:3000/
- http://127.0.0.1:3000/

## Why the Error?

Error Code -107 means the browser cannot establish a secure (HTTPS) connection because:
- The development server only supports HTTP
- Your browser is trying to use HTTPS (secure connection)
- There's no SSL certificate configured for development

## Solution

**Always use `http://` (not `https://`) when accessing:**
- http://localhost:8000/
- http://localhost:3000/

## Quick Test

1. Open your browser
2. Type in the address bar: `http://localhost:8000/`
3. Press Enter
4. You should see the Django REST Framework page or API response

## If Your Browser Auto-Upgrades to HTTPS

Some browsers automatically try to upgrade HTTP to HTTPS. To fix this:

1. **Clear browser cache** for localhost
2. **Type the full URL** including `http://` explicitly
3. **Use a different browser** or incognito mode
4. **Disable HTTPS-only mode** in browser settings (if enabled)

## Production Note

In production, you would use HTTPS with a proper SSL certificate. But for local development, HTTP is standard and safe.



