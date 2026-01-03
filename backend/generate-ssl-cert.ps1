# PowerShell script to generate a self-signed SSL certificate for development
# This creates a certificate that browsers will trust (after accepting the warning)

$certPath = "$PSScriptRoot\ssl"
if (-not (Test-Path $certPath)) {
    New-Item -ItemType Directory -Path $certPath | Out-Null
}

# Generate private key
openssl genrsa -out "$certPath\key.pem" 2048

# Generate certificate
openssl req -new -x509 -key "$certPath\key.pem" -out "$certPath\cert.pem" -days 365 -subj "/CN=localhost"

Write-Host "SSL certificate generated at: $certPath\cert.pem"
Write-Host "Private key at: $certPath\key.pem"



