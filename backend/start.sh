#!/usr/bin/env bash
# Startup script for Render deployment
# Runs migrations and starts Gunicorn
# This script should be run from the backend directory

set -o errexit  # Exit on error

echo "Running database migrations..."
python manage.py migrate --noinput

echo "Starting Gunicorn..."
exec gunicorn escribe.wsgi:application --bind 0.0.0.0:$PORT

