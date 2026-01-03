# PowerShell script to create a superuser for PostgreSQL setup
# This loads environment variables and creates a superuser

cd $PSScriptRoot

Write-Host "================================================"
Write-Host "Create Superuser for PostgreSQL"
Write-Host "================================================"
Write-Host ""

# Check if .env file exists
$envFile = "$PSScriptRoot\.env"
if (-not (Test-Path $envFile)) {
    Write-Host "Error: .env file not found!"
    Write-Host "Please run .\setup-postgresql.ps1 first"
    exit 1
}

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Load environment variables from .env file
Write-Host "Loading environment variables from .env file..."
Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]*)\s*=\s*(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        # Set environment variable for this session
        Set-Item -Path "env:$key" -Value $value
        if ($key -eq 'DB_PASSWORD') {
            if ([string]::IsNullOrWhiteSpace($value)) {
                Write-Host "  WARNING: $key is empty!" -ForegroundColor Yellow
            } else {
                Write-Host "  $key = (set, length: $($value.Length))"
            }
        } else {
            Write-Host "  $key = $value"
        }
    }
}

# Ensure DB_ENGINE is set to postgresql
$env:DB_ENGINE = "postgresql"

Write-Host ""
Write-Host "Creating superuser..."
Write-Host "You will be prompted to enter username, email, and password."
Write-Host ""

# Run createsuperuser
python manage.py createsuperuser

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Superuser created successfully!"
} else {
    Write-Host ""
    Write-Host "Failed to create superuser. Please check the error messages above."
}



