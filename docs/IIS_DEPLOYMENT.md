# IIS Deployment Guide for Escribe

This guide covers deploying the Django backend and React frontend to IIS on Windows Server.

## Prerequisites

- Windows Server with IIS installed
- Python 3.11+ installed
- Node.js 18+ installed (for building frontend)
- IIS HttpPlatformHandler module installed
- URL Rewrite module for IIS installed

## Step 1: Install Required IIS Modules

1. Open **Server Manager** → **Add Roles and Features**
2. Install **IIS** with these features:
   - Web Server (IIS)
   - Application Development → ASP.NET (if needed)
   - Management Tools → IIS Management Console

3. Install **HttpPlatformHandler**:
   - Download from: https://www.iis.net/downloads/microsoft/httpplatformhandler
   - Run the installer

4. Install **URL Rewrite Module**:
   - Download from: https://www.iis.net/downloads/microsoft/url-rewrite
   - Run the installer

## Step 2: Prepare Backend for Production

### 2.1 Install Waitress

```powershell
cd backend
.\venv\Scripts\Activate.ps1
pip install waitress
```

### 2.2 Update requirements.txt

Add `waitress` to `backend/requirements.txt`:
```
waitress>=2.1.2
```

### 2.3 Configure Environment Variables

Create `backend/.env` file:
```
SECRET_KEY=your-production-secret-key-here
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DB_ENGINE=postgresql
DB_NAME=escribe
DB_USER=escribe_user
DB_PASSWORD=your-secure-password
DB_HOST=localhost
DB_PORT=5432
```

### 2.4 Collect Static Files

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python manage.py collectstatic --noinput
```

This creates the `staticfiles` directory that IIS will serve.

### 2.5 Run Migrations

```powershell
python manage.py migrate
```

## Step 3: Configure IIS for Backend

### 3.1 Create IIS Application Pool

1. Open **IIS Manager**
2. Right-click **Application Pools** → **Add Application Pool**
3. Name: `EscribeBackend`
4. .NET CLR Version: **No Managed Code**
5. Managed Pipeline Mode: **Integrated**
6. Click **OK**

### 3.2 Configure Application Pool Settings

1. Select **EscribeBackend** pool
2. Click **Advanced Settings**
3. Set:
   - **Start Mode**: AlwaysRunning
   - **Idle Timeout**: 0 (or 20 minutes)
   - **Process Model → Identity**: ApplicationPoolIdentity (or custom account)

### 3.3 Create IIS Website

1. Right-click **Sites** → **Add Website**
2. Configure:
   - **Site name**: `EscribeBackend`
   - **Application pool**: `EscribeBackend`
   - **Physical path**: `C:\path\to\Escribe\backend`
   - **Binding**:
     - Type: `http` or `https`
     - IP address: `All Unassigned` or specific IP
     - Port: `8000` (or your preferred port)
     - Host name: (leave blank or set domain)

### 3.4 Configure web.config

Create `backend/web.config` (see Step 4 below)

### 3.5 Set Permissions

1. Right-click the backend folder → **Properties** → **Security**
2. Add **IIS_IUSRS** with **Read & Execute** permissions
3. Add **IIS AppPool\EscribeBackend** with **Read & Execute** permissions
4. Ensure the `media` and `staticfiles` folders have **Write** permissions for the app pool

## Step 4: Create web.config for Backend

Create `backend/web.config`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="httpPlatformHandler" path="*" verb="*" modules="httpPlatformHandler" resourceType="Unspecified" />
    </handlers>
    <httpPlatform processPath="C:\path\to\Escribe\backend\venv\Scripts\python.exe"
                  arguments="-m waitress --host=127.0.0.1 --port=%HTTP_PLATFORM_PORT% --threads=4 escribe.wsgi:application"
                  stdoutLogEnabled="true"
                  stdoutLogFile="C:\path\to\Escribe\backend\logs\stdout.log"
                  startupTimeLimit="60"
                  requestTimeout="00:04:00">
      <environmentVariables>
        <environmentVariable name="DJANGO_SETTINGS_MODULE" value="escribe.settings" />
        <environmentVariable name="PYTHONPATH" value="C:\path\to\Escribe\backend" />
        <environmentVariable name="SECRET_KEY" value="your-production-secret-key" />
        <environmentVariable name="DEBUG" value="False" />
        <environmentVariable name="ALLOWED_HOSTS" value="yourdomain.com,www.yourdomain.com" />
        <environmentVariable name="DB_ENGINE" value="postgresql" />
        <environmentVariable name="DB_NAME" value="escribe" />
        <environmentVariable name="DB_USER" value="escribe_user" />
        <environmentVariable name="DB_PASSWORD" value="your-password" />
        <environmentVariable name="DB_HOST" value="localhost" />
        <environmentVariable name="DB_PORT" value="5432" />
      </environmentVariables>
    </httpPlatform>
    
    <!-- URL Rewrite for static files -->
    <rewrite>
      <rules>
        <rule name="Static Files" stopProcessing="true">
          <match url="^static/(.*)$" />
          <action type="Rewrite" url="/staticfiles/{R:1}" />
        </rule>
        <rule name="Media Files" stopProcessing="true">
          <match url="^media/(.*)$" />
          <action type="Rewrite" url="/media/{R:1}" />
        </rule>
      </rules>
    </rewrite>
    
    <!-- Static file handling -->
    <staticContent>
      <mimeMap fileExtension=".json" mimeType="application/json" />
      <mimeMap fileExtension=".woff" mimeType="application/font-woff" />
      <mimeMap fileExtension=".woff2" mimeType="application/font-woff2" />
    </staticContent>
    
    <!-- Security headers -->
    <httpProtocol>
      <customHeaders>
        <add name="X-Content-Type-Options" value="nosniff" />
        <add name="X-Frame-Options" value="DENY" />
        <add name="X-XSS-Protection" value="1; mode=block" />
      </customHeaders>
    </httpProtocol>
  </system.webServer>
</configuration>
```

**Important**: Update all paths in `web.config` to match your actual installation paths.

### 3.6 Create Logs Directory

```powershell
mkdir backend\logs
```

## Step 5: Build and Deploy Frontend

### 5.1 Build Frontend

```powershell
cd frontend
npm install
npm run build
```

This creates a `dist` folder with production-ready files.

### 5.2 Create IIS Website for Frontend

1. Right-click **Sites** → **Add Website**
2. Configure:
   - **Site name**: `EscribeFrontend`
   - **Application pool**: Create new or use existing
   - **Physical path**: `C:\path\to\Escribe\frontend\dist`
   - **Binding**:
     - Type: `http` or `https`
     - Port: `80` (or `443` for HTTPS)
     - Host name: `yourdomain.com` (or leave blank)

### 5.3 Configure Frontend web.config

Create `frontend/dist/web.config`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <!-- URL Rewrite for React Router -->
    <rewrite>
      <rules>
        <rule name="React Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
            <add input="{REQUEST_URI}" pattern="^/api" negate="true" />
          </conditions>
          <action type="Rewrite" url="/index.html" />
        </rule>
        <!-- Proxy API requests to backend -->
        <rule name="API Proxy" stopProcessing="true">
          <match url="^api/(.*)$" />
          <action type="Rewrite" url="http://localhost:8000/api/{R:1}" />
          <serverVariables>
            <set name="HTTP_X_FORWARDED_HOST" value="{HTTP_HOST}" />
            <set name="HTTP_X_FORWARDED_PROTO" value="https" />
          </serverVariables>
        </rule>
      </rules>
    </rewrite>
    
    <!-- Static file caching -->
    <staticContent>
      <clientCache cacheControlMode="UseMaxAge" cacheControlMaxAge="365.00:00:00" />
    </staticContent>
  </system.webServer>
</configuration>
```

### 5.4 Update Frontend API URL

Before building, update `frontend/.env.production`:
```
VITE_API_URL=/api
```

Or if frontend and backend are on different domains:
```
VITE_API_URL=https://api.yourdomain.com/api
```

## Step 6: Configure SSL/HTTPS

### 6.1 Install SSL Certificate

1. Obtain SSL certificate (Let's Encrypt, commercial CA, or self-signed for testing)
2. In IIS Manager, select your site
3. Click **Bindings** → **Add**
4. Select **https**, port **443**
5. Select your SSL certificate
6. Click **OK**

### 6.2 Force HTTPS Redirect

Add to `web.config` in the `<rewrite><rules>` section:

```xml
<rule name="HTTP to HTTPS redirect" stopProcessing="true">
  <match url="(.*)" />
  <conditions>
    <add input="{HTTPS}" pattern="off" ignoreCase="true" />
  </conditions>
  <action type="Redirect" url="https://{HTTP_HOST}/{R:1}" redirectType="Permanent" />
</rule>
```

## Step 7: Test Deployment

1. **Test Backend API**:
   - Visit: `http://yourdomain.com:8000/api/` (or your configured port)
   - Should return API response or 404 (not connection error)

2. **Test Frontend**:
   - Visit: `http://yourdomain.com`
   - Should load the React app
   - Try logging in

3. **Check Logs**:
   - Backend logs: `backend\logs\stdout.log`
   - IIS logs: `C:\inetpub\logs\LogFiles\`

## Step 8: Performance Tuning

### 8.1 Application Pool Settings

- **Idle Timeout**: 0 (always running) or 20 minutes
- **Start Mode**: AlwaysRunning
- **Maximum Worker Processes**: 1 (default) or increase for load balancing

### 8.2 Waitress Threads

Adjust in `web.config`:
```xml
arguments="-m waitress --host=127.0.0.1 --port=%HTTP_PLATFORM_PORT% --threads=8 escribe.wsgi:application"
```

### 8.3 Static File Compression

Enable in IIS:
1. Select server node → **Compression**
2. Enable **Dynamic Content Compression**
3. Enable **Static Content Compression**

## Troubleshooting

### Backend Not Starting

1. Check `backend\logs\stdout.log` for errors
2. Verify Python path in `web.config` is correct
3. Verify virtual environment is activated correctly
4. Check IIS Application Pool is running
5. Verify environment variables are set correctly

### Static Files Not Loading

1. Verify `collectstatic` was run
2. Check `staticfiles` folder permissions
3. Verify URL rewrite rules in `web.config`
4. Check IIS static file handler is enabled

### CORS Errors

1. Update `CORS_ALLOWED_ORIGINS` in Django settings
2. Add your frontend domain to the list
3. Restart IIS application pool

### Database Connection Errors

1. Verify PostgreSQL is running
2. Check database credentials in environment variables
3. Verify firewall allows connections
4. Test connection: `psql -U escribe_user -d escribe`

## Security Checklist

- [ ] Change `SECRET_KEY` to a strong random value
- [ ] Set `DEBUG=False` in production
- [ ] Configure `ALLOWED_HOSTS` with your domain
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Set up regular database backups
- [ ] Enable Windows Firewall
- [ ] Configure IIS request filtering
- [ ] Set up monitoring and alerting
- [ ] Enable audit logging

## Maintenance

### Updating the Application

1. Stop IIS application pool
2. Pull latest code
3. Activate virtual environment
4. Run `pip install -r requirements.txt`
5. Run `python manage.py migrate`
6. Run `python manage.py collectstatic`
7. Start IIS application pool

### Viewing Logs

- Backend: `backend\logs\stdout.log`
- IIS: `C:\inetpub\logs\LogFiles\W3SVC{site-id}\`
- Windows Event Viewer: Application logs

