@echo off
REM Batch file to start the Django development server
REM This activates the virtual environment and starts the server

cd /d %~dp0
call venv\Scripts\activate.bat
python manage.py runserver




