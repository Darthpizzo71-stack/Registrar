"""
Create a self-signed SSL certificate for development
Run: python create-ssl-cert.py
"""
import os
import ipaddress
from pathlib import Path
from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from datetime import datetime, timedelta

# Create ssl directory if it doesn't exist
ssl_dir = Path(__file__).parent / 'ssl'
ssl_dir.mkdir(exist_ok=True)

# Generate private key
private_key = rsa.generate_private_key(
    public_exponent=65537,
    key_size=2048,
)

# Create certificate
subject = issuer = x509.Name([
    x509.NameAttribute(NameOID.COUNTRY_NAME, "US"),
    x509.NameAttribute(NameOID.STATE_OR_PROVINCE_NAME, "Development"),
    x509.NameAttribute(NameOID.LOCALITY_NAME, "Local"),
    x509.NameAttribute(NameOID.ORGANIZATION_NAME, "Registrar Development"),
    x509.NameAttribute(NameOID.COMMON_NAME, "localhost"),
])

cert = x509.CertificateBuilder().subject_name(
    subject
).issuer_name(
    issuer
).public_key(
    private_key.public_key()
).serial_number(
    x509.random_serial_number()
).not_valid_before(
    datetime.utcnow()
).not_valid_after(
    datetime.utcnow() + timedelta(days=365)
).add_extension(
    x509.SubjectAlternativeName([
        x509.DNSName("localhost"),
        x509.DNSName("127.0.0.1"),
        x509.IPAddress(ipaddress.IPv4Address("127.0.0.1")),
    ]),
    critical=False,
).sign(private_key, hashes.SHA256())

# Write private key
key_path = ssl_dir / 'key.pem'
with open(key_path, 'wb') as f:
    f.write(private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    ))

# Write certificate
cert_path = ssl_dir / 'cert.pem'
with open(cert_path, 'wb') as f:
    f.write(cert.public_bytes(serialization.Encoding.PEM))

print(f"SSL certificate created successfully!")
print(f"Certificate: {cert_path}")
print(f"Private Key: {key_path}")
print(f"\nYou can now use: python manage.py runserver_plus --cert-file ssl/cert.pem --key-file ssl/key.pem")

