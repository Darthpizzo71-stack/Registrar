"""
Script to create a superuser non-interactively
Run: python manage.py shell < create_superuser.py
Or: python create_superuser.py

Environment Variables (optional):
- SUPERUSER_USERNAME: Username for superuser (default: 'admin')
- SUPERUSER_EMAIL: Email for superuser (default: 'admin@example.com')
- SUPERUSER_PASSWORD: Password for superuser (default: 'admin123')
- SUPERUSER_ROLE: Role for superuser (default: 'clerk')
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'escribe.settings')
django.setup()

from users.models import User

# Get superuser credentials from environment variables or use defaults
username = os.environ.get('SUPERUSER_USERNAME', 'admin')
email = os.environ.get('SUPERUSER_EMAIL', 'admin@example.com')
password = os.environ.get('SUPERUSER_PASSWORD', 'admin123')
role = os.environ.get('SUPERUSER_ROLE', 'clerk')

# Create superuser if it doesn't exist
if not User.objects.filter(username=username).exists():
    user = User.objects.create_superuser(
        username=username,
        email=email,
        password=password,
        role=role
    )
    print(f'Superuser created successfully!')
    print(f'Username: {username}')
    print(f'Email: {email}')
    print(f'Role: {user.role}')
    print(f'Password: {"*" * len(password)} (set via SUPERUSER_PASSWORD env var)')
else:
    print(f'User {username} already exists. Skipping creation.')
   



