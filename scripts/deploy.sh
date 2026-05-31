#!/bin/bash
# ============================================================
# AI Ad Assistant — 一键部署脚本
# 路径：/opt/deploy.sh
# 执行：bash /opt/deploy.sh
# ============================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()   { echo -e "${GREEN}[+]${NC} $1"; }
warn()  { echo -e "${YELLOW}[!]${NC} $1"; }
error() { echo -e "${RED}[x]${NC} $1"; }
separator() { echo "============================================"; }

PROJECT_DIR="/opt/ai-ad-assistant"
APP_NAME="ai-ad-assistant"
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")

separator
echo "  AI Ad Assistant — 生产部署"
echo "  时间: $TIMESTAMP"
separator

# ─── 1. 拉取最新代码 ─────────────────────
log "拉取最新代码..."
cd "$PROJECT_DIR"
git fetch origin main
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" = "$REMOTE" ]; then
    warn "代码已是最新，跳过拉取"
else
    git pull origin main
    log "代码已更新: ${REMOTE:0:8}"
fi

# ─── 2. 安装依赖 ────────────────────────
log "安装依赖..."
npm ci --only=production 2>&1 | tail -1

# ─── 3. 构建项目 ────────────────────────
log "构建项目..."
npm run build 2>&1 | tail -10

# ─── 4. 重启服务 ────────────────────────
log "重启服务..."
pm2 reload "$PROJECT_DIR/scripts/ecosystem.config.js" --update-env

# ─── 5. 健康检查 ────────────────────────
log "健康检查..."
sleep 3
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000 || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    log "健康检查通过 (HTTP $HTTP_CODE)"
else
    error "健康检查失败 (HTTP $HTTP_CODE)"
fi

# ─── 6. 状态输出 ────────────────────────
separator
echo "  部署完成!"
echo "  时间: $TIMESTAMP"
separator
pm2 status "$APP_NAME"
separator
echo ""
echo "  查看日志: pm2 logs $APP_NAME"
echo "  查看状态: pm2 status"
echo "  重启服务: pm2 restart $APP_NAME"
echo "  外网地址: http://47.86.97.218"
echo ""
