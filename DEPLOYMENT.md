# Kairo Deployment Guide - DigitalOcean

This guide covers deploying Kairo Healthcare Management System to DigitalOcean.

## Prerequisites

- DigitalOcean account
- Domain name (optional but recommended)
- SSH key pair
- Docker and Docker Compose knowledge

## Quick Start

### 1. Create a DigitalOcean Droplet

1. Go to [DigitalOcean](https://www.digitalocean.com/)
2. Create a new Droplet:
   - **Image**: Ubuntu 22.04 LTS
   - **Size**: Minimum 2GB RAM / 2 vCPUs (recommended: 4GB RAM / 2 vCPUs)
   - **Region**: Choose closest to your users
   - **Authentication**: SSH Key (recommended)
   - **Hostname**: `kairo-server`

### 2. Initial Server Setup

SSH into your server:

```bash
ssh root@your_server_ip
```

Update the system:

```bash
apt update && apt upgrade -y
```

Install Docker:

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

Install Docker Compose:

```bash
apt install docker-compose-plugin -y
```

Create a non-root user:

```bash
adduser kairo
usermod -aG docker kairo
usermod -aG sudo kairo
```

### 3. Clone and Configure

Switch to the kairo user:

```bash
su - kairo
```

Clone the repository:

```bash
git clone https://github.com/yourusername/kairo.git
cd kairo
```

Create the environment file:

```bash
cp .env.example .env
nano .env
```

Update the following values in `.env`:

```env
# Generate secure passwords
POSTGRES_PASSWORD=<generate-secure-password>
JWT_SECRET=<generate-secure-secret>
NEXTAUTH_SECRET=<generate-secure-secret>

# Your domain
NEXTAUTH_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://your-domain.com/api
CORS_ORIGIN=https://your-domain.com
```

Generate secure secrets:

```bash
# For JWT_SECRET and NEXTAUTH_SECRET
openssl rand -base64 32

# For POSTGRES_PASSWORD
openssl rand -base64 24
```

### 4. SSL Certificate Setup (Let's Encrypt)

Create SSL directory:

```bash
mkdir -p nginx/ssl nginx/certbot
```

Update nginx configuration with your domain:

```bash
# Edit nginx/nginx.prod.conf
# Replace kairo.yourdomain.com with your actual domain
nano nginx/nginx.prod.conf
```

Get initial certificate (before starting nginx):

```bash
docker run -it --rm \
  -v $(pwd)/nginx/ssl:/etc/letsencrypt \
  -v $(pwd)/nginx/certbot:/var/www/certbot \
  -p 80:80 \
  certbot/certbot certonly \
  --standalone \
  -d your-domain.com \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email
```

### 5. Deploy

Build and start the containers:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Run database migrations:

```bash
docker exec kairo-api npx prisma migrate deploy
```

Seed initial data (optional):

```bash
docker exec kairo-api npx prisma db seed
```

### 6. Verify Deployment

Check container status:

```bash
docker compose -f docker-compose.prod.yml ps
```

Check logs:

```bash
docker compose -f docker-compose.prod.yml logs -f
```

Test the application:

```bash
curl https://your-domain.com/health
```

## DNS Configuration

Add these DNS records to your domain:

| Type | Name | Value |
|------|------|-------|
| A | @ | your_server_ip |
| A | www | your_server_ip |

## Firewall Setup

Configure UFW firewall:

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

## Maintenance

### View Logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f api
docker compose -f docker-compose.prod.yml logs -f web
```

### Restart Services

```bash
docker compose -f docker-compose.prod.yml restart
```

### Update Application

```bash
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build
docker exec kairo-api npx prisma migrate deploy
```

### Database Backup

```bash
# Create backup
docker exec kairo-db pg_dump -U kairo kairo > backup_$(date +%Y%m%d).sql

# Restore backup
docker exec -i kairo-db psql -U kairo kairo < backup_20260207.sql
```

### SSL Certificate Renewal

Certificates auto-renew via the certbot container. To manually renew:

```bash
docker compose -f docker-compose.prod.yml exec certbot certbot renew
docker compose -f docker-compose.prod.yml restart nginx
```

## Monitoring

### Resource Usage

```bash
docker stats
```

### Disk Space

```bash
df -h
docker system df
```

### Clean Up Docker

```bash
docker system prune -a
```

## Troubleshooting

### Container won't start

```bash
docker compose -f docker-compose.prod.yml logs <service-name>
```

### Database connection issues

```bash
# Check if postgres is healthy
docker exec kairo-db pg_isready -U kairo

# Check network connectivity
docker network inspect kairo_kairo-network
```

### Nginx issues

```bash
# Test nginx configuration
docker exec kairo-nginx nginx -t

# Reload nginx
docker exec kairo-nginx nginx -s reload
```

## Security Recommendations

1. **Enable fail2ban** for SSH protection
2. **Set up automatic security updates**
3. **Use DigitalOcean Firewall** in addition to UFW
4. **Enable DigitalOcean Monitoring**
5. **Set up automated backups**

```bash
# Install fail2ban
apt install fail2ban -y
systemctl enable fail2ban

# Enable automatic security updates
apt install unattended-upgrades -y
dpkg-reconfigure -plow unattended-upgrades
```

## Cost Estimate

| Resource | Monthly Cost |
|----------|-------------|
| Droplet (4GB/2vCPU) | ~$24 |
| Managed Database (optional) | ~$15 |
| Spaces (file storage) | ~$5 |
| Backups | ~$4 |
| **Total** | **~$48/month** |

## Support

For issues or questions:
- Create an issue on GitHub
- Email: support@kairosystems.com
