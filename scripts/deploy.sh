#!/bin/bash

# Kairo Deployment Script
# Usage: ./scripts/deploy.sh [environment]
# Environments: development, production

set -e

ENVIRONMENT=${1:-development}
COMPOSE_FILE="docker-compose.yml"

echo "=========================================="
echo "  KAIRO - Healthcare Management System"
echo "  Deployment Script"
echo "=========================================="
echo ""
echo "Environment: $ENVIRONMENT"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Set compose file based on environment
if [ "$ENVIRONMENT" == "production" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    cp .env.example .env
    echo "📝 Please edit .env file with your configuration before continuing."
    echo "   Run: nano .env"
    exit 1
fi

echo "🐳 Building Docker images..."
docker compose -f $COMPOSE_FILE build

echo ""
echo "🚀 Starting containers..."
docker compose -f $COMPOSE_FILE up -d

echo ""
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run migrations
echo ""
echo "🔄 Running database migrations..."
docker exec kairo-api npx prisma migrate deploy || true

echo ""
echo "✅ Deployment complete!"
echo ""
echo "=========================================="
echo "  Access your application:"
echo "=========================================="
echo ""
echo "  Frontend: http://localhost:3000"
echo "  API:      http://localhost:3001"
echo ""
echo "  Default login:"
echo "  Email:    admin@kairo.zw"
echo "  Password: Password123!"
echo ""
echo "=========================================="
echo ""
echo "📋 Useful commands:"
echo "   View logs:    docker compose -f $COMPOSE_FILE logs -f"
echo "   Stop:         docker compose -f $COMPOSE_FILE down"
echo "   Restart:      docker compose -f $COMPOSE_FILE restart"
echo ""
