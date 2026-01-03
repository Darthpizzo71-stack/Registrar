# PowerShell script to start Django with Waitress (Production WSGI Server)
# This is suitable for production use on Windows

cd $PSScriptRoot

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Load environment variables from .env file if it exists
$envFile = "$PSScriptRoot\.env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]*)\s*=\s*(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            Set-Item -Path "env:$key" -Value $value
        }
    }
}

# Check if Waitress is installed
$waitressInstalled = python -c "import waitress" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Waitress not found. Installing..."
    pip install waitress
}

# Get configuration from environment or use defaults
$waitressHost = $env:WAITRESS_HOST
if (-not $waitressHost) { $waitressHost = "127.0.0.1" }

$waitressPort = $env:WAITRESS_PORT
if (-not $waitressPort) { $waitressPort = "8000" }

$waitressThreads = $env:WAITRESS_THREADS
if (-not $waitressThreads) { $waitressThreads = "4" }

Write-Host "Starting Django with Waitress (Production Server)..."
Write-Host "Host: $waitressHost"
Write-Host "Port: $waitressPort"
Write-Host "Threads: $waitressThreads"
Write-Host ""
Write-Host "Server will be available at: http://$waitressHost`:$waitressPort/"
Write-Host "Press CTRL+C to stop the server"
Write-Host ""

# Start Waitress
python -m waitress `
    --host=$waitressHost `
    --port=$waitressPort `
    --threads=$waitressThreads `
    escribe.wsgi:application

