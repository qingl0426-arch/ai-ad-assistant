#!/bin/bash
# ============================================================
# AI Ad Assistant — 阿里云 ECS 初始化脚本
# 系统：Ubuntu 24.04 LTS
# 执行：chmod +x init-server.sh && sudo ./init-server.sh
# ============================================================

set -e
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[+]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }

# ──────────────────────────────────────
# 1. 系统更新
# ──────────────────────────────────────
log "更新系统包..."
apt update && apt upgrade -y
apt install -y curl wget gnupg ca-certificates lsb-release build-essential unzip

# ──────────────────────────────────────
# 2. 安装 Node.js 22
# ──────────────────────────────────────
log "安装 Node.js 22..."
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs
log "Node.js $(node -v) | npm $(npm -v)"

# 全局工具
npm install -g pm2
log "PM2 $(pm2 -v)"

# ──────────────────────────────────────
# 3. 安装 Git
# ──────────────────────────────────────
log "安装 Git..."
apt install -y git
git config --global pull.rebase false
log "Git $(git --version | cut -d' ' -f3)"

# ──────────────────────────────────────
# 4. 安装 Nginx
# ──────────────────────────────────────
log "安装 Nginx..."
apt install -y nginx
systemctl enable nginx
systemctl start nginx
log "Nginx $(nginx -v 2>&1 | cut -d'/' -f2)"

# ──────────────────────────────────────
# 5. 安装 PostgreSQL 16
# ──────────────────────────────────────
log "安装 PostgreSQL 16..."
apt install -y postgresql postgresql-contrib
systemctl enable postgresql
systemctl start postgresql
log "PostgreSQL $(psql --version | cut -d' ' -f3)"

# 创建数据库和用户
log "配置 PostgreSQL..."
sudo -u postgres psql -c "CREATE USER aiadmin WITH PASSWORD 'ChangeMe123!' CREATEDB;" 2>/dev/null || warn "用户已存在"
sudo -u postgres psql -c "CREATE DATABASE ai_ad_assistant OWNER aiadmin;" 2>/dev/null || warn "数据库已存在"

# ──────────────────────────────────────
# 6. 安装防火墙 (ufw)
# ──────────────────────────────────────
log "配置防火墙..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp     # SSH
ufw allow 80/tcp     # HTTP
ufw allow 443/tcp    # HTTPS
ufw allow 3000/tcp   # Next.js (开发)
ufw --force enable
log "防火墙已启用："
ufw status numbered

# ──────────────────────────────────────
# 7. 安全加固
# ──────────────────────────────────────
log "安全加固..."

# 禁止 root SSH 密码登录
sed -i 's/^#PermitRootLogin.*/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
sed -i 's/^#PasswordAuthentication.*/PasswordAuthentication yes/' /etc/ssh/sshd_config
systemctl restart sshd

# 设置时区
timedatectl set-timezone Asia/Shanghai
log "时区：$(timedatectl | grep 'Time zone' | xargs)"

# 系统限制
cat >> /etc/security/limits.conf << 'EOF'
* soft nofile 65536
* hard nofile 65536
EOF

# ──────────────────────────────────────
# 8. 创建项目目录
# ──────────────────────────────────────
log "创建项目目录..."
mkdir -p /opt/ai-ad-assistant
mkdir -p /var/log/ai-ad-assistant

# ──────────────────────────────────────
# 9. Nginx 基础配置
# ──────────────────────────────────────
log "生成 Nginx 配置模板..."
cat > /etc/nginx/sites-available/ai-ad-assistant << 'NGINXCONF'
server {
    listen 80;
    server_name _;

    # 日志
    access_log /var/log/nginx/ai-ad-assistant-access.log;
    error_log /var/log/nginx/ai-ad-assistant-error.log;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # 反向代理到 Next.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
        proxy_buffering off;
    }

    # 静态资源直接由 Nginx 提供
    location /_next/static {
        alias /opt/ai-ad-assistant/.next/static;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }
}
NGINXCONF

ln -sf /etc/nginx/sites-available/ai-ad-assistant /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# ──────────────────────────────────────
# 10. PM2 进程管理配置
# ──────────────────────────────────────
log "生成 PM2 配置..."
cat > /opt/ai-ad-assistant/ecosystem.config.js << 'PM2CONF'
module.exports = {
  apps: [{
    name: "ai-ad-assistant",
    script: "node_modules/.bin/next",
    args: "start",
    cwd: "/opt/ai-ad-assistant",
    instances: 2,
    exec_mode: "cluster",
    env: {
      NODE_ENV: "production",
      PORT: "3000",
    },
    max_memory_restart: "1G",
    log_date_format: "YYYY-MM-DD HH:mm:ss",
    error_file: "/var/log/ai-ad-assistant/error.log",
    out_file: "/var/log/ai-ad-assistant/out.log",
    merge_logs: true,
  }]
};
PM2CONF

# ──────────────────────────────────────
# 11. 自动化脚本
# ──────────────────────────────────────
log "创建部署脚本..."
cat > /opt/deploy.sh << 'DEPLOY'
#!/bin/bash
set -e
cd /opt/ai-ad-assistant

echo "[+] 拉取最新代码..."
git pull origin main

echo "[+] 安装依赖..."
npm ci --only=production

echo "[+] 构建项目..."
npm run build

echo "[+] 重启服务..."
pm2 reload ecosystem.config.js

echo "[+] 部署完成"
pm2 status
DEPLOY
chmod +x /opt/deploy.sh

# ──────────────────────────────────────
# 12. 开机自启
# ──────────────────────────────────────
log "配置开机自启..."
pm2 startup systemd -u root --hp /root
env PATH=$PATH:/usr/bin pm2 save

# ──────────────────────────────────────
# 完成
# ──────────────────────────────────────
echo ""
echo "============================================"
echo -e "${GREEN}  服务器初始化完成${NC}"
echo "============================================"
echo ""
echo "  Node.js : $(node -v)"
echo "  npm     : $(npm -v)"
echo "  PM2     : $(pm2 -v)"
echo "  Nginx   : $(nginx -v 2>&1 | cut -d'/' -f2)"
echo "  Git     : $(git --version | cut -d' ' -f3)"
echo "  PG      : $(psql --version | cut -d' ' -f3)"
echo "  时区    : $(timedatectl | grep 'Time zone' | xargs)"
echo "  防火墙  : $(ufw status | head -1)"
echo ""
echo "  项目目录：/opt/ai-ad-assistant"
echo "  部署脚本：/opt/deploy.sh"
echo "  环境变量：/opt/ai-ad-assistant/.env"
echo ""
echo "  下一步："
echo "  1. 配置 .env 环境变量"
echo "  2. ssh-keygen + 添加 GitHub Deploy Key"
echo "  3. git clone 项目到 /opt/ai-ad-assistant"
echo "  4. 运行 /opt/deploy.sh"
echo ""
echo "  PostgreSQL：psql -U aiadmin -d ai_ad_assistant -h 127.0.0.1"
echo "============================================"
