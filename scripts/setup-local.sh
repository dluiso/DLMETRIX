#!/bin/bash
# ──────────────────────────────────────────────────────────────
# DLMETRIX - Local Development Setup
# Usage: bash scripts/setup-local.sh
# ──────────────────────────────────────────────────────────────
set -e

echo ""
echo "🚀 DLMETRIX - Local Setup"
echo "─────────────────────────"

# Check dependencies
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required"; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "❌ pnpm is required (npm install -g pnpm)"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "⚠️  Docker not found - you'll need to set up PostgreSQL and Redis manually"; }

echo "✅ Node version: $(node -v)"
echo "✅ pnpm version: $(pnpm -v)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
pnpm install

# Setup env files
echo ""
echo "⚙️  Setting up environment files..."
if [ ! -f "apps/api/.env" ]; then
  cp apps/api/.env.example apps/api/.env
  echo "✅ Created apps/api/.env (edit it with your secrets)"
else
  echo "ℹ️  apps/api/.env already exists"
fi

if [ ! -f "apps/web/.env.local" ]; then
  cp apps/web/.env.example apps/web/.env.local
  echo "✅ Created apps/web/.env.local"
else
  echo "ℹ️  apps/web/.env.local already exists"
fi

# Start Docker services
if command -v docker &> /dev/null; then
  echo ""
  echo "🐳 Starting Docker services (PostgreSQL + Redis)..."
  docker compose up -d postgres redis
  echo "✅ Docker services started"
  sleep 3
fi

# Generate Prisma client
echo ""
echo "🗄️  Setting up database..."
pnpm db:generate

# Run migrations
pnpm --filter api exec prisma migrate dev --name init --skip-seed 2>/dev/null || \
pnpm --filter api exec prisma db push 2>/dev/null || true

# Seed database
echo ""
echo "🌱 Seeding database..."
pnpm db:seed

echo ""
echo "✨ Setup complete!"
echo ""
echo "Start development:"
echo "  pnpm dev"
echo ""
echo "URLs:"
echo "  Frontend:  http://localhost:3000"
echo "  API:       http://localhost:3001/api/v1"
echo "  API Docs:  http://localhost:3001/api/docs"
echo ""
echo "Default admin:"
echo "  Email:     admin@dlmetrix.com"
echo "  Password:  ChangeMe123!"
echo ""
