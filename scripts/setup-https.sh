#!/bin/bash
# ============================================================
# AI Ad Assistant — Let's Encrypt HTTPS 一键部署
# 前提：域名已解析到服务器 IP，Nginx 已安装运行
# 用法：chmod +x setup-https.sh && sudo bash setup-https.sh
# ============================================================
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[+]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[X]${NC} $1"; exit 1; }

# ═══════════════════════════════════════
# 0. 检查参数
# ═══════════════════════════════════════
DOMAIN="${1:-}"
EMAIL="${2:-admin@${DOMAIN}}"

if [ -z "$DOMAIN" ]; then
  echo "用法: sudo bash setup-https.sh <你的域名> [邮箱]"
  echo "示例: sudo bash setup-https.sh aiad.example.com admin@example.com"
  exit 1
fi

log "域名: ${DOMAIN}"
log "邮箱: ${EMAIL}"

# ═══════════════════════════════════════
# 1. 安装 Certbot + Nginx 插件
# ═══════════════════════════════════════
log "安装 Certbot + Nginx 插件..."
apt update -qq
apt install -y certbot python3-certbot-nginx

# ═══════════════════════════════════════
# 2. 生成 Nginx HTTPS 配置
# ═══════════════════════════════════════
log "生成 Nginx HTTPS 配置..."

cat > /etc/nginx/sites-available/ai-ad-assistant << NGINXCONF
# ──────────────────────────────────────
# HTTP → HTTPS 强制跳转
# ──────────────────────────────────────
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};

    # Certbot 验证专用路径 (ACME challenge)
    location ^~ /.well-known/acme-challenge/ {
        root /var/www/certbot;
        default_type text/plain;
    }

    # 其他全部跳转 HTTPS
    location / {
        return 301 https://\$host\$request_uri;
    }
}

# ──────────────────────────────────────
# HTTPS 主站
# ──────────────────────────────────────
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${DOMAIN};

    # SSL 证书 (Certbot 自动管理)
    ssl_certificate     /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/${DOMAIN}/chain.pem;

    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;

    # HSTS (强制 HTTPS, 2 年)
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

    # 安全响应头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()" always;

    # 日志
    access_log /var/log/nginx/ai-ad-assistant-access.log combined buffer=16k flush=5s;
    error_log  /var/log/nginx/ai-ad-assistant-error.log warn;

    # 请求限制
    client_max_body_size 50M;
    client_body_buffer_size 128k;
    client_header_timeout 30s;
    client_body_timeout 30s;
    send_timeout 30s;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_min_length 1000;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml image/svg+xml font/woff2 font/woff;

    # 静态资源缓存
    location /_next/static {
        alias /opt/ai-ad-assistant/.next/static;
        expires 365d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    location /public {
        alias /opt/ai-ad-assistant/public;
        expires 30d;
        add_header Cache-Control "public";
        access_log off;
    }

    location ~* \.(ico|svg|woff2?|ttf|eot)$ {
        expires 180d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    location ~* \.(jpg|jpeg|png|webp|gif|avif)$ {
        expires 90d;
        add_header Cache-Control "public";
        access_log off;
    }

    # API 路由 (禁用缓存)
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 60s;
        proxy_buffering off;
        add_header Cache-Control "no-store, no-cache, must-revalidate" always;
    }

    # 反向代理到 Next.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 60s;
        proxy_connect_timeout 5s;
        proxy_send_timeout 30s;
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 32k;
        proxy_busy_buffers_size 64k;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINXCONF

# ═══════════════════════════════════════
# 3. 创建 ACME 验证目录
# ═══════════════════════════════════════
mkdir -p /var/www/certbot

# ═══════════════════════════════════════
# 4. 启用 HTTP 配置 + 重载 Nginx
# ═══════════════════════════════════════
ln -sf /etc/nginx/sites-available/ai-ad-assistant /etc/nginx/sites-enabled/ai-ad-assistant
rm -f /etc/nginx/sites-enabled/default

log "测试 Nginx 配置..."
nginx -t || err "Nginx 配置测试失败，请检查"

systemctl reload nginx
log "Nginx HTTP 配置已生效"

# ═══════════════════════════════════════
# 5. 申请 Let's Encrypt 证书
# ═══════════════════════════════════════
log "申请 Let's Encrypt 证书..."
certbot certonly --webroot \
  -w /var/www/certbot \
  -d ${DOMAIN} \
  --non-interactive \
  --agree-tos \
  --email ${EMAIL} \
  --keep-until-expiring \
  --force-renewal \
  || err "证书申请失败，请确认域名 ${DOMAIN} 已解析到本服务器"

# ═══════════════════════════════════════
# 6. 重载 Nginx (HTTPS 生效)
# ═══════════════════════════════════════
nginx -t && systemctl reload nginx
log "HTTPS 已启用: https://${DOMAIN}"

# ═══════════════════════════════════════
# 7. 自动续期配置
# ═══════════════════════════════════════
log "配置自动续期..."

# certbot renew 钩子：续期成功后自动重载 Nginx
HOOK_FILE="/etc/letsencrypt/renewal-hooks/deploy/nginx-reload.sh"
mkdir -p "$(dirname "$HOOK_FILE")"

cat > "$HOOK_FILE" << 'HOOK'
#!/bin/bash
# Certbot 续期成功 → 自动重载 Nginx
set -e
echo "[$(date '+%F %T')] Certificate renewed, reloading Nginx..." >> /var/log/certbot-renewal.log
nginx -t && systemctl reload nginx
echo "[$(date '+%F %T')] Nginx reloaded successfully" >> /var/log/certbot-renewal.log
HOOK

chmod +x "$HOOK_FILE"

# 测试续期流程
log "测试证书续期 (dry-run)..."
certbot renew --dry-run --deploy-hook "$HOOK_FILE"

# ═══════════════════════════════════════
# 8. 添加 cron 定时续期 (每天 03:00)
# ═══════════════════════════════════════
CRON_JOB="0 3 * * * root certbot renew --quiet --deploy-hook /etc/letsencrypt/renewal-hooks/deploy/nginx-reload.sh"
CRON_FILE="/etc/cron.d/certbot-renewal"

echo "$CRON_JOB" > "$CRON_FILE"
chmod 644 "$CRON_FILE"

log "Cron 续期任务已添加 (/etc/cron.d/certbot-renewal)"

# ═══════════════════════════════════════
# 9. 防火墙
# ═══════════════════════════════════════
ufw allow 443/tcp 2>/dev/null || log "跳过防火墙 (ufw 未启用)"

# ═══════════════════════════════════════
# 10. 更新应用环境变量
# ═══════════════════════════════════════
if [ -f /opt/ai-ad-assistant/.env ]; then
  sed -i "s|NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=https://${DOMAIN}|" /opt/ai-ad-assistant/.env
  log "已更新 NEXT_PUBLIC_APP_URL → https://${DOMAIN}"
fi

# ═══════════════════════════════════════
# 完成
# ═══════════════════════════════════════
echo ""
echo "============================================"
echo -e "${GREEN}  HTTPS 部署完成${NC}"
echo "============================================"
echo ""
echo "  域名:     https://${DOMAIN}"
echo "  证书路径: /etc/letsencrypt/live/${DOMAIN}/"
echo "  自动续期: 每天 03:00 cron"
echo "  续期日志: /var/log/certbot-renewal.log"
echo ""
echo "  验证: curl -I https://${DOMAIN}"
echo "  评分: https://www.ssllabs.com/ssltest/analyze.html?d=${DOMAIN}"
echo "============================================"