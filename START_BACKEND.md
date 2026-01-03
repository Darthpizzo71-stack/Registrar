# Starting the Backend Server

## Quick Start

### Method 1: Use the Batch File (Easiest)
Double-click `backend/start-server.bat` or run:
```powershell
.\backend\start-server.bat
```

### Method 2: Use the PowerShell Script
```powershell
.\backend\start-server.ps1
```

### Method 3: Manual Activation
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python manage.py runserver
```

## Important Notes

**You MUST activate the virtual environment first!**

The error "ModuleNotFoundError: No module named 'django'" means the virtual environment is not activated. The virtual environment contains all the installed packages (including Django).

## What to Expect

After running the command, you should see:
```
Watching for file changes with StatReloader
Performing system checks...

System check identified no issues (0 silenced).
January XX, 2025 - XX:XX:XX
Django version 4.2.7, using settings 'escribe.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

The server will be available at: **http://localhost:8000**

## Troubleshooting

### "ModuleNotFoundError: No module named 'django'"
- **Solution**: Activate the virtual environment first
- Make sure you're in the `backend` directory
- Run: `.\venv\Scripts\Activate.ps1`

### "The term 'python' is not recognized"
- Python is not installed or not in PATH
- Install Python 3.11+ from https://www.python.org
- Make sure to check "Add Python to PATH" during installation

### Port 8000 already in use
- Another process is using port 8000
- Close that process or use a different port:
  ```powershell
  python manage.py runserver 8001
  ```

## Quick Reference

- **Backend URL**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin
- **API Root**: http://localhost:8000/api/
- **Login**: Username: `admin`, Password: `admin123`



