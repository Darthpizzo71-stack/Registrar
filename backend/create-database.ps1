# PowerShell script to create PostgreSQL database for Escribe
# This reads credentials from .env file and creates the database

cd $PSScriptRoot

# Load environment variables from .env file
$envFile = "$PSScriptRoot\.env"
if (-not (Test-Path $envFile)) {
    Write-Host "Error: .env file not found!"
    Write-Host "Please run .\setup-postgresql.ps1 first"
    exit 1
}

# Read .env file
$envVars = @{}
Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]*)\s*=\s*(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        $envVars[$key] = $value
    }
}

$dbName = $envVars['DB_NAME']
$dbUser = $envVars['DB_USER']
$dbPassword = $envVars['DB_PASSWORD']
$dbHost = $envVars['DB_HOST']
$dbPort = $envVars['DB_PORT']

if (-not $dbName) { $dbName = "escribe" }
if (-not $dbUser) { $dbUser = "postgres" }
if (-not $dbHost) { $dbHost = "localhost" }
if (-not $dbPort) { $dbPort = "5432" }

Write-Host "Creating PostgreSQL database: $dbName"
Write-Host "User: $dbUser"
Write-Host "Host: $dbHost"
Write-Host "Port: $dbPort"
Write-Host ""

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Create database using psycopg
# Write Python script to temp file to avoid quote escaping issues
$pythonScriptPath = "$env:TEMP\create_db_escribe.py"
$pythonScript = @"
import psycopg
import sys

# Get connection parameters from command line
db_name = sys.argv[1]
db_user = sys.argv[2]
db_password = sys.argv[3] if len(sys.argv) > 3 and sys.argv[3] else ''
db_host = sys.argv[4] if len(sys.argv) > 4 else 'localhost'
db_port = sys.argv[5] if len(sys.argv) > 5 else '5432'

# Connect to PostgreSQL (to postgres database to create new database)
try:
    conn_string = f'host={db_host} port={db_port} user={db_user}'
    if db_password:
        conn_string += f' password={db_password}'
    conn_string += ' dbname=postgres'
    
    conn = psycopg.connect(conn_string)
    conn.autocommit = True
    cur = conn.cursor()
    
    # Check if database exists
    cur.execute('SELECT 1 FROM pg_database WHERE datname = %s', (db_name,))
    exists = cur.fetchone()
    
    if exists:
        print(f'Database {db_name} already exists.')
    else:
        # Create database - use proper SQL escaping
        cur.execute(f"CREATE DATABASE \"{db_name}\"")
        print(f'Database {db_name} created successfully!')
    
    conn.close()
    print('Database setup complete!')
except Exception as e:
    print(f'Error: {e}')
    sys.exit(1)
"@

Set-Content -Path $pythonScriptPath -Value $pythonScript

# Run the script with arguments
python $pythonScriptPath $dbName $dbUser $dbPassword $dbHost $dbPort

# Clean up
Remove-Item $pythonScriptPath -ErrorAction SilentlyContinue

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Database is ready! Now run migrations:"
    Write-Host "  python manage.py migrate"
} else {
    Write-Host ""
    Write-Host "Failed to create database. Please check:"
    Write-Host "1. PostgreSQL is running"
    Write-Host "2. Credentials in .env file are correct"
    Write-Host "3. User has permission to create databases"
}

