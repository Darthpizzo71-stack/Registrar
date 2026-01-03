"""
Script to create a superuser non-interactively
Run: python manage.py shell < create_superuser.py
Or: python create_superuser.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'escribe.settings')
django.setup()

from users.models import User

# Create superuser if it doesn't exist
username = 'admin'
email = 'admin@example.com'
password = 'admin123'  # Change this in production!

if not User.objects.filter(username=username).exists():
    user = User.objects.create_superuser(
        username=username,
        email=email,
        password=password,
        role='clerk'  # Set role to clerk for full access
    )
    print(f'Superuser created successfully!')
    print(f'Username: {username}')
    print(f'Password: {password}')
    print(f'Role: {user.role}')
else:
    print(f'User {username} already exists.')




