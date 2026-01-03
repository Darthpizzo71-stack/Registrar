# SSL/HTTPS Setup for Development

## ✅ SSL Certificate Created!

A self-signed SSL certificate has been generated for development use. You can now access the server via HTTPS.

## Quick Start with SSL

### Method 1: Use the Batch File (Easiest)
Double-click `backend/start-server-ssl.bat` or run:
```powershell
.\backend\start-server-ssl.bat
```

### Method 2: Use the PowerShell Script
```powershell
.\backend\start-server-ssl.ps1
```

### Method 3: Manual Command
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python manage.py runserver_plus --cert-file ssl/cert.pem --key-file ssl/key.pem 0.0.0.0:8000
```

## Accessing the Server

Once the server is running, access it at:
- **HTTPS**: https://localhost:8000/
- **HTTPS**: https://127.0.0.1:8000/

## Browser Security Warning

Since this is a self-signed certificate, your browser will show a security warning. This is normal for development.

### To Proceed:

1. **Chrome/Edge**: 
   - Click "Advanced" or "Show Details"
   - Click "Proceed to localhost (unsafe)" or "Continue to localhost"

2. **Firefox**:
   - Click "Advanced"
   - Click "Accept the Risk and Continue"

3. **Safari**:
   - Click "Show Details"
   - Click "visit this website"

The warning appears because the certificate isn't from a trusted Certificate Authority (CA). For development, this is safe to ignore.

## Regenerating the Certificate

If you need to regenerate the certificate:
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python create-ssl-cert.py
```

## Important Notes

- **Development Only**: This self-signed certificate is for development only
- **Production**: Use a proper SSL certificate from a trusted CA (Let's Encrypt, etc.)
- **Certificate Location**: `backend/ssl/cert.pem` and `backend/ssl/key.pem`
- **Certificate Validity**: 365 days

## Troubleshooting

### "Certificate not found" error
- Run `python create-ssl-cert.py` to generate the certificate

### "ModuleNotFoundError: No module named 'django_extensions'"
- Activate the virtual environment first
- Run: `pip install django-extensions pyOpenSSL`

### Browser still shows error after accepting
- Clear browser cache for localhost
- Try a different browser
- Make sure you're using `https://` (not `http://`)

## Files Created

- `backend/ssl/cert.pem` - SSL certificate
- `backend/ssl/key.pem` - Private key
- `backend/start-server-ssl.bat` - Batch file to start with SSL
- `backend/start-server-ssl.ps1` - PowerShell script to start with SSL
- `backend/create-ssl-cert.py` - Script to generate certificates



