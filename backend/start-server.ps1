# PowerShell script to start the Django development server
# This activates the virtual environment and starts the server

cd $PSScriptRoot
.\venv\Scripts\Activate.ps1
Write-Host "Starting Django development server..."
Write-Host "Server will be available at: http://localhost:8000/"
Write-Host ""
python manage.py runserver




