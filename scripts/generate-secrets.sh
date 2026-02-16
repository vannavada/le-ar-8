#!/usr/bin/env bash
# Generate NEXTAUTH_SECRET and JWT_SECRET for .env
# Run: ./scripts/generate-secrets.sh

echo "# Add these to your .env file:"
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)"
echo "JWT_SECRET=$(openssl rand -base64 32)"
