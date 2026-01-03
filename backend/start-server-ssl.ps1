# PowerShell script to start the Django development server with SSL/HTTPS
# This activates the virtual environment and starts the server with HTTPS support

cd $PSScriptRoot

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
Write-Host "Starting Django server with SSL/HTTPS..."
Write-Host "Server will be available at: https://localhost:8000/"
Write-Host "Note: Your browser may show a security warning. Click 'Advanced' and 'Proceed to localhost' to continue."
Write-Host ""
python manage.py runserver_plus --cert-file ssl/cert.pem --key-file ssl/key.pem 0.0.0.0:8000

