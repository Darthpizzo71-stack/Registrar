"""
Script to create a user non-interactively
Run: python create_user.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'escribe.settings')
django.setup()

from users.models import User

# Create user
username = 'jpizzo'  # Using username format based on name
first_name = 'Jude'
last_name = 'Pizzo'
email = 'jude.pizzo@example.com'
password = 'Welcome1'
role = 'clerk'  # Set role to clerk for full access

if not User.objects.filter(username=username).exists():
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
        role=role,
        is_staff=True,  # Allow access to admin panel
    )
    print(f'User created successfully!')
    print(f'Username: {username}')
    print(f'Full Name: {first_name} {last_name}')
    print(f'Password: {password}')
    print(f'Role: {user.role}')
else:
    print(f'User {username} already exists.')
    # Update password if user exists
    user = User.objects.get(username=username)
    user.set_password(password)
    user.first_name = first_name
    user.last_name = last_name
    user.email = email
    user.role = role
    user.is_staff = True
    user.save()
    print(f'User {username} updated with new password and details.')



