@echo off
REM Batch file to start Django server with SSL/HTTPS support
REM This uses django-extensions runserver_plus

cd /d %~dp0
call venv\Scripts\activate.bat

REM Check if SSL cert exists
if not exist "ssl\cert.pem" (
    echo SSL certificate not found!
    echo.
    echo To generate SSL certificate:
    echo 1. Install OpenSSL from https://slproweb.com/products/Win32OpenSSL.html
    echo 2. Run: .\generate-ssl-cert.ps1
    echo.
    echo Or use the Python method below...
    pause
    exit /b 1
)

python manage.py runserver_plus --cert-file ssl/cert.pem --key-file ssl/key.pem 0.0.0.0:8000



