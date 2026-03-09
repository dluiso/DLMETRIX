# DLMETRIX — VPS Deployment Guide

> Ubuntu 24.04 LTS · Nginx · PM2 · PostgreSQL 16 · Redis 7 · SSL (Let's Encrypt)

This guide walks you through deploying DLMETRIX on a fresh VPS from zero to a fully running production instance at **dlmetrix.com**.

---

## Table of Contents

1. [Server Requirements](#1-server-requirements)
2. [Initial Server Setup](#2-initial-server-setup)
3. [Install Node.js and pnpm](#3-install-nodejs-and-pnpm)
4. [Install and Configure PostgreSQL](#4-install-and-configure-postgresql)
5. [Install and Configure Redis](#5-install-and-configure-redis)
6. [Install Chromium for Puppeteer](#6-install-chromium-for-puppeteer)
7. [Clone and Configure DLMETRIX](#7-clone-and-configure-dlmetrix)
8. [Build the Application](#8-build-the-application)
9. [Configure Nginx](#9-configure-nginx)
10. [Obtain SSL Certificate](#10-obtain-ssl-certificate)
11. [Start with PM2](#11-start-with-pm2)
12. [Run the Setup Wizard](#12-run-the-setup-wizard)
13. [Verify Everything Works](#13-verify-everything-works)
14. [Ongoing Maintenance](#14-ongoing-maintenance)

---

## 1. Server Requirements

| Resource | Minimum | Recommended |
|---|---|---|
| CPU | 2 vCPU | 4 vCPU |
| RAM | 2 GB | 4 GB |
| Disk | 20 GB SSD | 40 GB SSD |
| OS | Ubuntu 24.04 LTS | Ubuntu 24.04 LTS |
| Port | 80, 443 open | 80, 443 open |

Before starting, make sure your domain **dlmetrix.com** (and optionally **www.dlmetrix.com**) is pointed to your server's IP address via an `A` DNS record. DNS changes may take up to 24 hours but usually propagate within 5–15 minutes.

---

## 2. Initial Server Setup

Connect to your server as root:

```bash
ssh root@YOUR_SERVER_IP
```

### Create a non-root user

```bash
adduser deploy
usermod -aG sudo deploy
```

### Copy SSH key to deploy user (run from your local machine)

```bash
ssh-copy-id deploy@YOUR_SERVER_IP
```

### Connect as deploy user

```bash
ssh deploy@YOUR_SERVER_IP
```

### Update the system

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git wget unzip build-essential ca-certificates gnupg lsb-release
```

### Configure UFW firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
sudo ufw status
```

---

## 3. Install Node.js and pnpm

```bash
# Install Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node -v    # should be v20.x.x
npm -v

# Install pnpm
npm install -g pnpm

# Install PM2 globally
npm install -g pm2
```

---

## 4. Install and Configure PostgreSQL

```bash
# Install PostgreSQL 16
sudo apt install -y postgresql postgresql-contrib

# Start and enable
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql <<EOF
CREATE USER dlmetrix WITH PASSWORD 'your_strong_db_password';
CREATE DATABASE dlmetrix OWNER dlmetrix;
GRANT ALL PRIVILEGES ON DATABASE dlmetrix TO dlmetrix;
EOF
```

> **Important:** Replace `your_strong_db_password` with a secure password. You will use this in the `.env` file.

### Verify connection

```bash
psql -U dlmetrix -d dlmetrix -h localhost -c "SELECT version();"
# Enter your password when prompted
```

---

## 5. Install and Configure Redis

```bash
# Install Redis 7
sudo apt install -y redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf
```

Make these changes in `redis.conf`:

```conf
# Bind only to localhost (security)
bind 127.0.0.1

# Set a password (recommended for production)
requirepass your_strong_redis_password

# Enable persistence (optional but recommended)
appendonly yes
```

```bash
# Restart and enable
sudo systemctl restart redis-server
sudo systemctl enable redis-server

# Test connection
redis-cli -a your_strong_redis_password ping
# Should respond: PONG
```

---

## 6. Install Chromium for Puppeteer

Puppeteer needs a real Chromium browser to run Lighthouse:

```bash
sudo apt install -y chromium-browser

# Verify
chromium-browser --version
# Should print: Chromium 12x.x.x...

# Find the path
which chromium-browser
# Usually: /usr/bin/chromium-browser
```

---

## 7. Clone and Configure DLMETRIX

```bash
# Clone repository
sudo mkdir -p /var/www
sudo chown deploy:deploy /var/www
git clone https://github.com/dluiso/DLMETRIX.git /var/www/dlmetrix
cd /var/www/dlmetrix

# Install dependencies
pnpm install --frozen-lockfile
```

### Create the API environment file

```bash
cp apps/api/.env.example apps/api/.env
nano apps/api/.env
```

Fill in your values:

```env
# ── App ───────────────────────────────────────────────────────────────────────
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://dlmetrix.com

# ── Database ──────────────────────────────────────────────────────────────────
DATABASE_URL=postgresql://dlmetrix:your_strong_db_password@localhost:5432/dlmetrix

# ── Redis ─────────────────────────────────────────────────────────────────────
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_strong_redis_password

# ── JWT (generate with: openssl rand -hex 32) ──────────────────────────────────
JWT_SECRET=paste_your_generated_secret_here
JWT_REFRESH_SECRET=paste_your_generated_refresh_secret_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ── Email (SMTP) ──────────────────────────────────────────────────────────────
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your@gmail.com
MAIL_PASS=your_gmail_app_password
MAIL_FROM=noreply@dlmetrix.com

# ── PayPal ────────────────────────────────────────────────────────────────────
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=live

# ── Chromium ──────────────────────────────────────────────────────────────────
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
PUPPETEER_HEADLESS=true

# ── Storage ───────────────────────────────────────────────────────────────────
REPORTS_DIR=./reports
UPLOADS_DIR=./uploads
```

> **Tip — generate JWT secrets:**
> ```bash
> openssl rand -hex 32   # Run twice, use one for JWT_SECRET, one for JWT_REFRESH_SECRET
> ```

### Create the Web environment file

```bash
cp apps/web/.env.example apps/web/.env.local
nano apps/web/.env.local
```

```env
NEXT_PUBLIC_API_URL=https://dlmetrix.com/api/v1
NEXT_PUBLIC_APP_URL=https://dlmetrix.com
NEXT_PUBLIC_WS_URL=https://dlmetrix.com
```

---

## 8. Build the Application

### Run database migrations

```bash
cd /var/www/dlmetrix/apps/api
pnpm prisma migrate deploy
pnpm prisma db seed
cd /var/www/dlmetrix
```

### Create storage directories

```bash
mkdir -p apps/api/reports apps/api/uploads
```

### Build all apps

```bash
pnpm build
```

This compiles both the NestJS API (TypeScript → JS) and the Next.js frontend (static + server components). Expect it to take 2–5 minutes.

---

## 9. Configure Nginx

### Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Create DLMETRIX site config

```bash
sudo nano /etc/nginx/sites-available/dlmetrix
```

Paste:

```nginx
# Redirect HTTP → HTTPS
server {
    listen 80;
    server_name dlmetrix.com www.dlmetrix.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name dlmetrix.com www.dlmetrix.com;

    # SSL certificates (filled in by Certbot)
    ssl_certificate     /etc/letsencrypt/live/dlmetrix.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dlmetrix.com/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN"            always;
    add_header X-Content-Type-Options "nosniff"        always;
    add_header Referrer-Policy "strict-origin"         always;
    add_header Permissions-Policy "geolocation=()"     always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    client_max_body_size 10M;

    # ── API (NestJS on port 3001) ──────────────────────────────────────────
    location /api/ {
        proxy_pass         http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 10s;
    }

    # ── WebSockets (Socket.io) ─────────────────────────────────────────────
    location /socket.io/ {
        proxy_pass         http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_read_timeout 86400s;
    }

    # ── Next.js Frontend (port 3000) ───────────────────────────────────────
    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # ── Static file caching ────────────────────────────────────────────────
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### Enable the site

```bash
sudo ln -s /etc/nginx/sites-available/dlmetrix /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t       # test config — should say "syntax is ok"
sudo systemctl reload nginx
```

---

## 10. Obtain SSL Certificate

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate (replace with your email)
sudo certbot --nginx -d dlmetrix.com -d www.dlmetrix.com --email your@email.com --agree-tos --non-interactive

# Test auto-renewal
sudo certbot renew --dry-run
```

Certbot automatically updates the Nginx config with the SSL paths and sets up a cron for renewal.

---

## 11. Start with PM2

Create a PM2 ecosystem file:

```bash
nano /var/www/dlmetrix/ecosystem.config.js
```

```js
module.exports = {
  apps: [
    {
      name: 'dlmetrix-api',
      cwd: '/var/www/dlmetrix/apps/api',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
      max_memory_restart: '512M',
      error_file: '/var/log/dlmetrix/api-error.log',
      out_file: '/var/log/dlmetrix/api-out.log',
      merge_logs: true,
      restart_delay: 3000,
    },
    {
      name: 'dlmetrix-web',
      cwd: '/var/www/dlmetrix/apps/web',
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
      max_memory_restart: '512M',
      error_file: '/var/log/dlmetrix/web-error.log',
      out_file: '/var/log/dlmetrix/web-out.log',
      merge_logs: true,
    },
  ],
};
```

```bash
# Create log directory
sudo mkdir -p /var/log/dlmetrix
sudo chown deploy:deploy /var/log/dlmetrix

# Start apps
cd /var/www/dlmetrix
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Configure PM2 to start on reboot
pm2 startup
# Copy and run the command it prints (starts with "sudo ...")
```

### Verify processes are running

```bash
pm2 status
pm2 logs dlmetrix-api --lines 30
pm2 logs dlmetrix-web --lines 30
```

---

## 12. Run the Setup Wizard

Open your browser and navigate to:

```
https://dlmetrix.com/setup
```

The wizard will guide you through three steps:

1. **Database** — click "Test Connection" to verify PostgreSQL is reachable. Should show a green confirmation.
2. **Cache** — enter your Redis host/port/password and click "Test Connection".
3. **Admin Account** — enter the name, email, and password for the first admin user.

Click **"Complete Setup"**. The wizard writes a `.setup-complete` flag file to the server, permanently blocking the `/setup` route for security.

After setup, log in at `https://dlmetrix.com/login` with your admin credentials.

---

## 13. Verify Everything Works

Run through this checklist after setup:

```bash
# API health check
curl https://dlmetrix.com/api/v1/system/health
# Expected: {"status":"ok","timestamp":"...","version":"1.0.0"}

# Setup should now be blocked
curl https://dlmetrix.com/api/v1/setup/status
# Expected: {"complete":true}

# Check PM2 is running
pm2 status

# Check Nginx is running
sudo systemctl status nginx

# Check PostgreSQL
sudo systemctl status postgresql

# Check Redis
sudo systemctl status redis-server
```

Browser checklist:
- [ ] Homepage loads at https://dlmetrix.com
- [ ] Can register a new account
- [ ] Email verification link arrives in inbox
- [ ] Can log in and access dashboard
- [ ] Can submit a URL and see the audit run in real-time
- [ ] Audit result page loads with score breakdown
- [ ] Admin panel accessible at https://dlmetrix.com/admin

---

## 14. Ongoing Maintenance

### Deploy updates

```bash
cd /var/www/dlmetrix
git pull origin main
pnpm install --frozen-lockfile

# If database schema changed:
cd apps/api && pnpm prisma migrate deploy && cd ../..

pnpm build
pm2 restart all
```

### View logs

```bash
pm2 logs                        # all logs
pm2 logs dlmetrix-api           # API only
pm2 logs dlmetrix-web           # Frontend only
sudo tail -f /var/log/nginx/error.log   # Nginx errors
```

### Database backup

```bash
# Manual backup
pg_dump -U dlmetrix -d dlmetrix -h localhost > backup_$(date +%Y%m%d).sql

# Restore
psql -U dlmetrix -d dlmetrix -h localhost < backup_20240101.sql
```

### Automated daily backup (optional)

```bash
crontab -e
```

Add:
```
0 3 * * * pg_dump -U dlmetrix -d dlmetrix -h localhost | gzip > /var/backups/dlmetrix_$(date +\%Y\%m\%d).sql.gz
# Keep last 30 days
0 4 * * * find /var/backups/ -name "dlmetrix_*.sql.gz" -mtime +30 -delete
```

### Monitor disk usage

```bash
df -h
du -sh /var/www/dlmetrix/apps/api/reports   # audit PDFs
```

---

## Troubleshooting

### PM2 app crashes immediately

```bash
pm2 logs dlmetrix-api --lines 50
```
Check for missing env variables or database connection errors.

### Nginx 502 Bad Gateway

The Node.js app is not running. Check:
```bash
pm2 status
pm2 restart dlmetrix-api
```

### Puppeteer / Chromium fails

```bash
# Test Chromium directly
chromium-browser --headless --no-sandbox --disable-gpu --dump-dom https://example.com
```

If it fails, add these args to `apps/api/src/audit-engine/audit-engine.service.ts` in the Puppeteer launch config:
```
--no-sandbox
--disable-setuid-sandbox
--disable-dev-shm-usage
```

### Database migration fails

```bash
cd /var/www/dlmetrix/apps/api
pnpm prisma migrate status    # see pending migrations
pnpm prisma migrate deploy    # apply them
```

### SSL certificate renewal

```bash
sudo certbot renew
sudo systemctl reload nginx
```

---

## Security Checklist

- [ ] `JWT_SECRET` and `JWT_REFRESH_SECRET` are unique, random, and at least 32 characters
- [ ] PostgreSQL password is strong and only accessible from localhost
- [ ] Redis password is set and only bound to `127.0.0.1`
- [ ] UFW firewall is enabled with only ports 22, 80, 443 open
- [ ] `.env` file has `chmod 600 apps/api/.env` permissions
- [ ] Setup wizard is disabled (`.setup-complete` file exists)
- [ ] SSH root login is disabled (`PermitRootLogin no` in `/etc/ssh/sshd_config`)
- [ ] SSL certificate is valid and auto-renewing

---

*DLMETRIX © 2024 — [GitHub](https://github.com/dluiso/DLMETRIX)*
