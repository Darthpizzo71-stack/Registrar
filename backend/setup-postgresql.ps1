# PowerShell script to set up PostgreSQL for Escribe
# This script helps configure the database connection

Write-Host "================================================"
Write-Host "PostgreSQL Setup for Escribe"
Write-Host "================================================"
Write-Host ""

# Check if .env file exists
$envFile = "$PSScriptRoot\.env"
if (-not (Test-Path $envFile)) {
    Write-Host "Creating .env file..."
    Write-Host ""
    Write-Host "Please enter your PostgreSQL credentials:"
    Write-Host ""
    
    $dbPassword = Read-Host "PostgreSQL password for user 'postgres' (press Enter if no password)"
    if ([string]::IsNullOrWhiteSpace($dbPassword)) {
        $dbPassword = ""
    }
    
    $dbName = Read-Host "Database name (default: escribe)" 
    if ([string]::IsNullOrWhiteSpace($dbName)) {
        $dbName = "escribe"
    }
    
    $dbUser = Read-Host "PostgreSQL username (default: postgres)"
    if ([string]::IsNullOrWhiteSpace($dbUser)) {
        $dbUser = "postgres"
    }
    
    $dbHost = Read-Host "PostgreSQL host (default: localhost)"
    if ([string]::IsNullOrWhiteSpace($dbHost)) {
        $dbHost = "localhost"
    }
    
    $dbPort = Read-Host "PostgreSQL port (default: 5432)"
    if ([string]::IsNullOrWhiteSpace($dbPort)) {
        $dbPort = "5432"
    }
    
    # Create .env file
    $envContent = @"
# Django Settings
SECRET_KEY=django-insecure-change-me-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database - PostgreSQL
DB_ENGINE=postgresql
DB_NAME=$dbName
DB_USER=$dbUser
DB_PASSWORD=$dbPassword
DB_HOST=$dbHost
DB_PORT=$dbPort
"@
    
    Set-Content -Path $envFile -Value $envContent
    Write-Host ""
    Write-Host ".env file created successfully!"
} else {
    Write-Host ".env file already exists. Skipping creation."
    Write-Host ""
}

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Check if psycopg is installed
Write-Host "Checking for psycopg..."
$psycopgInstalled = python -c "import psycopg" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Installing psycopg..."
    pip install psycopg[binary]
} else {
    Write-Host "psycopg is already installed."
}

Write-Host ""
Write-Host "================================================"
Write-Host "Next Steps:"
Write-Host "================================================"
Write-Host "1. Make sure PostgreSQL is running"
Write-Host "2. Create the database (if it doesn't exist):"
Write-Host "   Run: .\create-database.ps1"
Write-Host "3. Run migrations:"
Write-Host "   python manage.py migrate"
Write-Host "4. Create a superuser (optional):"
Write-Host "   python manage.py createsuperuser"
Write-Host ""
Write-Host "Then start your server with:"
Write-Host "   .\start-server-waitress.ps1"
Write-Host ""



