#!/bin/bash
# ──────────────────────────────────────────────────────────────
# DLMETRIX - VPS Production Deployment (Ubuntu 24.04)
# Usage: bash scripts/deploy-vps.sh
# Run as: sudo bash scripts/deploy-vps.sh
# ──────────────────────────────────────────────────────────────
set -e

APP_DIR="/var/www/dlmetrix"
APP_USER="dlmetrix"
NODE_VERSION="20"

echo ""
echo "🚀 DLMETRIX - VPS Production Deployment"
echo "─────────────────────────────────────────"

# ── System packages ──────────────────────────────────────────
echo "📦 Installing system packages..."
apt-get update -qq
apt-get install -y -qq \
  curl wget git nginx certbot python3-certbot-nginx \
  chromium-browser \
  build-essential

# ── Node.js ──────────────────────────────────────────────────
if ! command -v node &> /dev/null; then
  echo "📦 Installing Node.js ${NODE_VERSION}..."
  curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
  apt-get install -y nodejs
fi

# ── pnpm ─────────────────────────────────────────────────────
if ! command -v pnpm &> /dev/null; then
  echo "📦 Installing pnpm..."
  npm install -g pnpm
fi

# ── Redis ─────────────────────────────────────────────────────
if ! command -v redis-server &> /dev/null; then
  echo "📦 Installing Redis..."
  apt-get install -y redis-server
  sed -i 's/^# requirepass.*/requirepass dlmetrix_redis_prod/' /etc/redis/redis.conf
  systemctl enable redis-server
  systemctl restart redis-server
fi

# ── App user ─────────────────────────────────────────────────
if ! id "$APP_USER" &>/dev/null; then
  useradd -r -s /bin/bash -m -d /home/$APP_USER $APP_USER
  echo "✅ Created user: $APP_USER"
fi

# ── Clone / update repo ───────────────────────────────────────
if [ -d "$APP_DIR" ]; then
  echo "📦 Updating repository..."
  cd $APP_DIR
  sudo -u $APP_USER git pull
else
  echo "📦 Cloning repository..."
  sudo -u $APP_USER git clone https://github.com/dluiso/DLMETRIX.git $APP_DIR
  cd $APP_DIR
fi

# ── Install dependencies ───────────────────────────────────────
echo "📦 Installing dependencies..."
sudo -u $APP_USER pnpm install --frozen-lockfile

# ── Environment files ─────────────────────────────────────────
if [ ! -f "$APP_DIR/apps/api/.env" ]; then
  echo ""
  echo "⚠️  IMPORTANT: Create the env file before proceeding:"
  echo "    cp $APP_DIR/apps/api/.env.example $APP_DIR/apps/api/.env"
  echo "    nano $APP_DIR/apps/api/.env"
  echo ""
  exit 1
fi

# ── Database ──────────────────────────────────────────────────
echo "🗄️  Running database migrations..."
cd $APP_DIR
sudo -u $APP_USER pnpm db:generate
sudo -u $APP_USER pnpm --filter api exec prisma migrate deploy
sudo -u $APP_USER pnpm db:seed

# ── Build ─────────────────────────────────────────────────────
echo "🔨 Building for production..."
sudo -u $APP_USER pnpm build

# ── PM2 ───────────────────────────────────────────────────────
if ! command -v pm2 &> /dev/null; then
  npm install -g pm2
fi

cat > $APP_DIR/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'dlmetrix-api',
      cwd: '/var/www/dlmetrix/apps/api',
      script: 'dist/main.js',
      instances: 2,
      exec_mode: 'cluster',
      env: { NODE_ENV: 'production' },
      max_memory_restart: '512M',
      error_file: '/var/log/dlmetrix/api-error.log',
      out_file: '/var/log/dlmetrix/api-out.log',
    },
    {
      name: 'dlmetrix-web',
      cwd: '/var/www/dlmetrix/apps/web',
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      instances: 1,
      env: { NODE_ENV: 'production' },
      error_file: '/var/log/dlmetrix/web-error.log',
      out_file: '/var/log/dlmetrix/web-out.log',
    },
  ],
};
EOF

mkdir -p /var/log/dlmetrix
chown -R $APP_USER:$APP_USER /var/log/dlmetrix

pm2 delete all 2>/dev/null || true
sudo -u $APP_USER pm2 start $APP_DIR/ecosystem.config.js
pm2 save
pm2 startup systemd -u $APP_USER --hp /home/$APP_USER | tail -1 | bash

# ── Nginx ─────────────────────────────────────────────────────
cat > /etc/nginx/sites-available/dlmetrix << 'NGINXEOF'
server {
    listen 80;
    server_name dlmetrix.com www.dlmetrix.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # WebSocket
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    # Static uploads
    location /uploads/ {
        alias /var/www/dlmetrix/apps/api/uploads/;
        expires 7d;
    }
}
NGINXEOF

ln -sf /etc/nginx/sites-available/dlmetrix /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

echo ""
echo "✨ Deployment complete!"
echo ""
echo "Next steps:"
echo "  1. Point your domain DNS to this server's IP"
echo "  2. Run: certbot --nginx -d dlmetrix.com -d www.dlmetrix.com"
echo "  3. Check status: pm2 status"
echo ""
