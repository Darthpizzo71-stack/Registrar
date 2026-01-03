# PowerShell script to start Django with SSL/HTTPS and PostgreSQL
# This activates the virtual environment and starts the server with HTTPS support

cd $PSScriptRoot

# Load environment variables from .env file if it exists
$envFile = "$PSScriptRoot\.env"
if (Test-Path $envFile) {
    Write-Host "Loading environment variables from .env file..."
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]*)\s*=\s*(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            Set-Item -Path "env:$key" -Value $value
        }
    }
    Write-Host "Environment variables loaded."
    Write-Host ""
}

# Check if SSL certificate exists
$certPath = "$PSScriptRoot\ssl\cert.pem"
$keyPath = "$PSScriptRoot\ssl\key.pem"

if (-not (Test-Path $certPath) -or -not (Test-Path $keyPath)) {
    Write-Host "SSL certificate not found. Generating..."
    Write-Host ""
    .\venv\Scripts\Activate.ps1
    python create-ssl-cert.py
    Write-Host ""
}

.\venv\Scripts\Activate.ps1
Write-Host "================================================"
Write-Host "Starting Django server with SSL/HTTPS"
Write-Host "================================================"
Write-Host ""
Write-Host "Server will be available at:"
Write-Host "  - https://localhost:8000/"
Write-Host "  - https://127.0.0.1:8000/"
Write-Host ""
Write-Host "Note: Your browser will show a security warning because this is a"
Write-Host "self-signed certificate. This is normal for development."
Write-Host ""
Write-Host "To proceed in your browser:"
Write-Host "  1. Click 'Advanced' or 'Show Details'"
Write-Host "  2. Click 'Proceed to localhost (unsafe)' or 'Continue to localhost'"
Write-Host ""
Write-Host "Press CTRL+C to stop the server"
Write-Host "================================================"
Write-Host ""

python manage.py runserver_plus --cert-file ssl/cert.pem --key-file ssl/key.pem 0.0.0.0:8000



