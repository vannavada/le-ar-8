#!/usr/bin/env bash
set -e

echo "Content Platform - Setup"
echo "========================"

# Check Node
if ! command -v node &> /dev/null; then
  echo "Node.js is required. Install from https://nodejs.org"
  exit 1
fi

echo "Node: $(node -v)"

# Copy env if missing
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example - please review and set secrets."
else
  echo ".env already exists"
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Start Docker services if docker is available
if command -v docker &> /dev/null; then
  echo "Starting Postgres and Redis with Docker..."
  docker compose up -d
  echo "Waiting for Postgres to be ready..."
  sleep 3
else
  echo "Docker not found. Ensure Postgres and Redis are running and DATABASE_URL / REDIS_URL are set."
fi

# Generate Prisma client and push schema
echo "Setting up database..."
npm run db:generate --workspace=@content-platform/database
npm run db:push --workspace=@content-platform/database
npm run db:seed --workspace=@content-platform/database

echo ""
echo "Setup complete. Run: npm run dev"
echo "  Web: http://localhost:3000"
echo "  API (standalone): http://localhost:4000 (optional; web uses built-in tRPC)"
echo ""
