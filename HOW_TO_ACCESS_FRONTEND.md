# How to Access the Frontend

## ❌ DON'T Do This

**Do NOT** open the HTML file directly:
- ❌ `file:///C:/Users/darth/Escribe/frontend/index.html` - This won't work!

## ✅ DO This Instead

The frontend is a **React application** that needs to be served by a development server.

### Step 1: Start the Frontend Server

Open PowerShell and run:

```powershell
cd frontend
npm.cmd run dev
```

Or use the batch file:
```powershell
.\frontend\start-dev.bat
```

### Step 2: Wait for Server to Start

You should see output like:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### Step 3: Open in Browser

Once the server is running, open your browser and go to:

**http://localhost:3000/**

## Why Can't I Open the HTML File Directly?

The frontend uses:
- **React** - Needs to be compiled/transpiled
- **TypeScript** - Needs to be converted to JavaScript
- **Vite** - Development server that processes files on-the-fly
- **ES Modules** - Requires a web server (not file:// protocol)
- **JSX** - Needs to be transformed to JavaScript

When you open `index.html` directly:
- The browser tries to load it via `file://` protocol
- React/TypeScript files can't be processed
- Module imports fail
- Nothing works!

## Quick Start Commands

### Start Frontend:
```powershell
cd frontend
npm.cmd run dev
```

### Start Backend:
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python manage.py runserver
```

### Or use the batch files:
- Frontend: Double-click `frontend/start-dev.bat`
- Backend: Double-click `backend/start-server.bat`

## Access URLs

Once both servers are running:
- **Frontend**: http://localhost:3000/
- **Backend**: http://localhost:8000/
- **Admin**: http://localhost:8000/admin

## Troubleshooting

### "Port 3000 is already in use"
- Another process is using port 3000
- Close it or change the port in `vite.config.ts`

### "Cannot find module"
- Run `npm.cmd install` in the frontend directory

### Still seeing errors?
- Make sure the dev server is actually running
- Check the terminal for error messages
- Verify Node.js is installed: `node --version`

