# Starting the Frontend Development Server

## Quick Start

If you're getting PowerShell execution policy errors, use one of these methods:

### Method 1: Use npm.cmd (Recommended)
```powershell
cd frontend
npm.cmd run dev
```

### Method 2: Use the Batch File
Double-click `frontend/start-dev.bat` or run:
```powershell
cd frontend
.\start-dev.bat
```

### Method 3: Use the PowerShell Script
```powershell
cd frontend
.\start-dev.ps1
```

### Method 4: Bypass Execution Policy for Current Session
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
cd frontend
npm run dev
```

## What to Expect

After running the command, you should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

Then open your browser to: **http://localhost:3000**

## Troubleshooting

### "npm is not recognized"
- Make sure Node.js is installed
- Restart your terminal/IDE after installing Node.js

### "Port 3000 is already in use"
- Close the other application using port 3000
- Or change the port in `vite.config.ts`

### Still having execution policy issues?
- Use `npm.cmd` instead of `npm`
- Or use the batch file (`start-dev.bat`)




