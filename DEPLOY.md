# AI Ad Assistant — 生产环境部署方案

> Next.js 15 · TypeScript · PM2 · Nginx · Ubuntu 24.04

---

## 一、环境要求

| 组件 | 版本 |
|------|------|
| Ubuntu | 24.04 LTS |
| Node.js | 22.x |
| npm | 10.x |
| PM2 | 5.x |
| Nginx | 1.24+ |
| Git | 2.x |

---

## 二、首次服务器初始化

```bash
# 复制 init-server.sh 到服务器
bash scripts/init-server.sh
```

此脚本自动完成：系统更新、Node.js、Git、Nginx、PostgreSQL、防火墙、时区设置。

---

## 三、首次部署（5 步）

### 1. 创建日志目录

```bash
mkdir -p /var/log/ai-ad-assistant
```

### 2. 克隆项目

```bash
git clone https://github.com/qingl0426-arch/ai-ad-assistant.git /opt/ai-ad-assistant
cd /opt/ai-ad-assistant
```

### 3. 配置环境变量

```bash
cat > /opt/ai-ad-assistant/.env << EOF
NEXT_PUBLIC_SUPABASE_URL=https://yfnzrvhwnliviqehmoeq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_l5Jjg8aGr2zOQy_h7SyAVA_rlC13qUf
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DEEPSEEK_API_KEY=your_deepseek_api_key
JWT_SECRET=liveflow-jwt-secret-prod-2026
NEXT_PUBLIC_APP_URL=http://47.86.97.218
EOF
```

### 4. 安装依赖 + 构建

```bash
cd /opt/ai-ad-assistant
npm ci --only=production
npm run build
```

### 5. 启动服务

```bash
pm2 start scripts/ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root
```

---

## 四、Nginx 配置

```bash
# 安装配置
cp scripts/nginx-prod.conf /etc/nginx/sites-available/ai-ad-assistant
ln -sf /etc/nginx/sites-available/ai-ad-assistant /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

---

## 五、日志轮转

```bash
cp scripts/logrotate.conf /etc/logrotate.d/ai-ad-assistant
logrotate -d /etc/logrotate.d/ai-ad-assistant  # 测试
```

---

## 六、日常更新部署

### 方式 1：一键脚本

```bash
bash /opt/deploy.sh
```

### 方式 2：手动步骤

```bash
cd /opt/ai-ad-assistant
git pull origin main
npm ci --only=production
npm run build
pm2 reload scripts/ecosystem.config.js
```

### 方式 3：零停机热重载

```bash
cd /opt/ai-ad-assistant
git pull origin main
npm ci --only=production
npm run build
pm2 reload ai-ad-assistant
```

---

## 七、PM2 日常管理命令

```bash
pm2 status                  # 查看所有进程
pm2 logs ai-ad-assistant    # 实时日志
pm2 logs --lines 50         # 最近 50 行
pm2 monit                   # 实时监控面板
pm2 restart ai-ad-assistant # 重启
pm2 stop ai-ad-assistant    # 停止
pm2 delete ai-ad-assistant  # 删除进程
pm2 flush                   # 清空日志
pm2 reloadLogs              # 刷新日志文件
```

---

## 八、日志文件位置

| 日志类型 | 路径 |
|----------|------|
| PM2 输出 | /var/log/ai-ad-assistant/out.log |
| PM2 错误 | /var/log/ai-ad-assistant/error.log |
| Nginx 访问 | /var/log/nginx/ai-ad-assistant-access.log |
| Nginx 错误 | /var/log/nginx/ai-ad-assistant-error.log |

---

## 九、健康检查

```bash
# 本地检查
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000
# 预期输出: 200

# Nginx 检查
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:80
# 预期输出: 200

# 外网检查
curl -s -o /dev/null -w "%{http_code}" http://47.86.97.218
# 预期输出: 200
```

---

## 十、故障排查

```bash
# 检查进程
pm2 status && netstat -tlnp | grep 3000

# 查看错误日志
pm2 logs ai-ad-assistant --err --lines 30

# 检查 Nginx
nginx -t && systemctl status nginx

# 检查防火墙
ufw status verbose

# 检查磁盘
df -h /opt

# 检查内存
free -m
```

---

## 十一、安全加固

- [x] 防火墙仅开放 22/80/443
- [x] Nginx 响应头安全加固
- [x] PM2 非 root 用户运行（可选）
- [x] 定期日志轮转
- [ ] 配置 HTTPS (Let"s Encrypt)
- [ ] 配置 Fail2ban
- [ ] 定期 `apt update && apt upgrade`

---

## 十二、HTTPS 配置（可选）

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d your-domain.com
certbot renew --dry-run  # 测试自动续期
```
