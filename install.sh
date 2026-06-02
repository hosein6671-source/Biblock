#!/bin/bash

# 🚀 Biblock V2Ray Sales Bot Installation Script

set -e

echo "════════════════════════════════════════"
echo "   🚀 Biblock Installation Script"
echo "════════════════════════════════════════"

# Check for required tools
echo "✅ Checking requirements..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed"
    exit 1
fi

# Create environment file
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration"
    echo "⚠️  Required: TELEGRAM_BOT_TOKEN, NOWPAYMENTS_API_KEY, X3UI_API_URL"
    exit 1
fi

# Build Docker images
echo "🔨 Building Docker images..."
docker-compose build

# Start services
echo "🚀 Starting services..."
docker-compose up -d

# Wait for database
echo "⏳ Waiting for database..."
sleep 10

# Run migrations
echo "🔄 Running database migrations..."
docker-compose exec -T backend npm run migrate

# Seed initial data
echo "🌱 Seeding initial plans..."
docker-compose exec -T backend npm run seed

echo ""
echo "════════════════════════════════════════"
echo "✅ Installation Complete!"
echo "════════════════════════════════════════"
echo ""
echo "📊 Services:"
echo "  - Backend API: http://localhost:3000"
echo "  - PostgreSQL: localhost:5432"
echo "  - Telegram Bot: Running in background"
echo ""
echo "📝 Next steps:"
echo "  1. Verify .env configuration"
echo "  2. Check logs: docker-compose logs -f"
echo "  3. Test API: curl http://localhost:3000/api/plans"
echo ""