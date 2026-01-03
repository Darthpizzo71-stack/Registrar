# PowerShell script to migrate from SQLite to PostgreSQL
# This runs migrations on the PostgreSQL database

cd $PSScriptRoot

Write-Host "================================================"
Write-Host "Migrating to PostgreSQL"
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

# Load environment variables from .env file and set them
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
Write-Host ""

# Ensure DB_ENGINE is set to postgresql
$env:DB_ENGINE = "postgresql"

Write-Host ""
Write-Host "Running migrations on PostgreSQL database..."
Write-Host ""

# Run migrations
python manage.py migrate

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "================================================"
    Write-Host "Migration complete!"
    Write-Host "================================================"
    Write-Host ""
    Write-Host "Your database is now using PostgreSQL."
    Write-Host ""
    Write-Host "Note: Your existing SQLite data (if any) is not automatically migrated."
    Write-Host "If you need to migrate data, you'll need to export from SQLite and import to PostgreSQL."
    Write-Host ""
    Write-Host "You can now start the server with:"
    Write-Host "  .\start-server-waitress.ps1"
} else {
    Write-Host ""
    Write-Host "Migration failed. Please check the error messages above."
}

