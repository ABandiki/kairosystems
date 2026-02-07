#!/bin/bash
# Kairo Remote Setup Script
# This runs ON the DigitalOcean server

set -e

echo "=========================================="
echo "  KAIRO - Remote Server Setup"
echo "=========================================="

# Clone repository
echo ""
echo "📦 Cloning repository..."
cd /root
rm -rf kairo 2>/dev/null || true
git clone https://github.com/ABandiki/kairosystems.git kairo
cd kairo

# Generate secure secrets
echo ""
echo "🔐 Generating secure secrets..."
JWT_SECRET=$(openssl rand -base64 32)
NEXTAUTH_SECRET=$(openssl rand -base64 32)
DB_PASSWORD=$(openssl rand -base64 24 | tr -d '/+=')

# Get server IP
SERVER_IP=$(curl -s ifconfig.me)

# Create .env file
echo ""
echo "📝 Creating environment file..."
cat > .env << EOF
# ===========================================
# KAIRO - Production Environment
# ===========================================

# Database Configuration
POSTGRES_USER=kairo
POSTGRES_PASSWORD=${DB_PASSWORD}
POSTGRES_DB=kairo
DATABASE_URL="postgresql://kairo:${DB_PASSWORD}@postgres:5432/kairo?schema=public"

# JWT Authentication
JWT_SECRET="${JWT_SECRET}"
JWT_EXPIRES_IN="7d"

# API Configuration
PORT=3001
NODE_ENV=production

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://${SERVER_IP}:3001
WEB_PORT=3000

# NextAuth Configuration
NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"
NEXTAUTH_URL=http://${SERVER_IP}:3000

# CORS Configuration
CORS_ORIGIN=http://${SERVER_IP}:3000
EOF

echo "✅ Environment configured for IP: ${SERVER_IP}"

# Build and deploy
echo ""
echo "🐳 Building and deploying with Docker..."
docker compose -f docker-compose.yml up -d --build

# Wait for services to start
echo ""
echo "⏳ Waiting for services to start..."
sleep 30

# Check status
echo ""
echo "📊 Checking container status..."
docker compose ps

# Configure firewall
echo ""
echo "🔒 Configuring firewall..."
ufw allow OpenSSH
ufw allow 3000/tcp
ufw allow 3001/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo ""
echo "=========================================="
echo "  ✅ DEPLOYMENT COMPLETE!"
echo "=========================================="
echo ""
echo "  🌐 Access your application at:"
echo ""
echo "     Frontend: http://${SERVER_IP}:3000"
echo "     API:      http://${SERVER_IP}:3001"
echo ""
echo "  🔑 Default Login:"
echo "     Email:    admin@kairo.zw"
echo "     Password: Password123!"
echo ""
echo "=========================================="
