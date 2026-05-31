# AI Ad Assistant — 中国部署方案

## 核心问题

| 服务 | 国内状态 |
|------|----------|
| Vercel | ❌ 域名被墙，部署 CLI 可使用 |
| Supabase | ❌ 国内访问极慢/不可用 |
| OpenAI API | ❌ 被墙 |
| DeepSeek API | ✅ 国内可用 |
| 支付宝 | ✅ 国内原生支持 |
| GitHub | ⚠️ 不稳定 |

---

## 推荐方案：阿里云部署

```
用户 → 阿里云 CDN → Next.js (ECS/SAE) → Supabase (香港)
                              ↓
                        DeepSeek API (国内)
                        支付宝 API (国内)
```

### 方案对比

| | 方案A：阿里云 ECS | 方案B：腾讯云 EdgeOne | 方案C：Vercel + 香港代理 |
|---|---|---|---|
| 成本 | ¥50-200/月 | ¥0-100/月 | ¥0-50/月 |
| 稳定性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| 备案 | 需要 | 需要 | 不需要 |
| Supabase | 需代理 | 需代理 | 直连 |
| 部署难度 | 中 | 低 | 低 |

---

## 方案A：阿里云 ECS + Docker（推荐）

### 1. 购买云服务器

```
阿里云 ECS
- 地域：香港（免备案）或上海（需备案）
- 配置：2核4G（¥70/月起）
- 系统：Ubuntu 22.04
- 带宽：按量付费 100Mbps
```

### 2. Dockerfile

创建 `Dockerfile`：

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --only=production

FROM base AS builder
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
```

### 3. next.config.ts 添加 standalone

```ts
const nextConfig: NextConfig = {
  output: "standalone",    // 新增：Docker 独立部署
  experimental: {
    serverActions: { bodySizeLimit: "2mb" },
  },
  serverExternalPackages: ["alipay-sdk"],
};
```

### 4. docker-compose.yml

```yaml
version: "3.8"
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - OPENAI_BASE_URL=${OPENAI_BASE_URL}
      - OPENAI_MODEL=${OPENAI_MODEL}
      - ALIPAY_APP_ID=${ALIPAY_APP_ID}
      - ALIPAY_PRIVATE_KEY=${ALIPAY_PRIVATE_KEY}
      - ALIPAY_PUBLIC_KEY=${ALIPAY_PUBLIC_KEY}
      - ALIPAY_GATEWAY=${ALIPAY_GATEWAY}
    restart: always
```

### 5. 部署命令

```bash
# 在服务器上
git clone https://github.com/你的用户名/ai-ad-assistant.git
cd ai-ad-assistant

# 创建 .env 文件
cp .env.example .env
# 编辑 .env 填入真实密钥

# 启动
docker compose up -d --build

# 查看日志
docker compose logs -f
```

### 6. Nginx 反向代理 + SSL

```bash
apt install nginx certbot python3-certbot-nginx

# /etc/nginx/sites-available/ai-ad-assistant
```

```nginx
server {
    listen 80;
    server_name app.你的域名.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/ai-ad-assistant /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# 免费 SSL 证书
certbot --nginx -d app.你的域名.com
```

---

## 方案B：腾讯云 EdgeOne Pages（零运维）

腾讯云版本的 Vercel，原生支持 Next.js。

### 步骤

1. 打开 https://console.cloud.tencent.com/edgeone
2. 创建站点 → 绑定域名
3. **Pages** → 新建 → 导入 Git 仓库
4. 框架预设选择 **Next.js**
5. 环境变量粘贴 `.env` 内容
6. 部署

EdgeOne 自动处理 CDN、HTTPS、自动部署。

> 限制：Edge Functions 可能不支持 `alipay-sdk`（含 Node.js 原生模块），需提前确认。

---

## 方案C：Vercel + 国内 CDN（轻量过渡）

Vercel 部署 + 国内访问优化：

### 1. 正常部署到 Vercel

```
vercel --prod
```

### 2. 绑定已在阿里云/腾讯云备案的域名

把域名的 CNAME 指向 `cname.vercel-dns.com`。

### 3. 国内 CDN 加速静态资源（可选）

在阿里云 CDN 配置回源到 Vercel 域名。

> **注意**：Vercel 服务器在海外，动态请求延迟 200-500ms，静态页面可通过 CDN 缓解。

---

## 数据库方案：Supabase 替代

### 推荐：Supabase 香港区域

Supabase 支持 AWS 香港区域部署 → 国内延迟 30-60ms

1. 创建新 Supabase 项目时选择 **ap-southeast-1 (Singapore)**
2. 或在现有项目 Settings → Database → 查看是否支持迁移区域

### 备选：国内 PostgreSQL

如果 Supabase 不可用，切换为：

| 服务 | 替代方案 |
|---|---|
| 数据库 | 阿里云 RDS PostgreSQL / 腾讯云 TencentDB |
| 认证 | NextAuth.js + 数据库 |
| 存储 | 阿里云 OSS / 腾讯云 COS |
| 实时 | 自建 WebSocket |

> **切换成本**：需重写所有 Supabase 相关代码，约 2-3 天工作量。

---

## 备案流程（如使用国内服务器）

1. 购买域名（阿里云/腾讯云）
2. 实名认证（1-3 天）
3. 提交 ICP 备案（7-20 天）
4. 备案通过后解析到服务器 IP

> 香港服务器**无需备案**，推荐初创项目优先使用香港节点。

---

## 检查清单

- [ ] 云服务器已购买
- [ ] Docker + Docker Compose 已安装
- [ ] 域名已解析到服务器 IP
- [ ] SSL 证书已配置（certbot）
- [ ] `.env` 环境变量已配置
- [ ] Supabase RLS 已在生产环境确认
- [ ] DeepSeek API 可正常调用
- [ ] 支付宝密钥已配置
- [ ] 数据库备份已设置
- [ ] 监控报警已配置（阿里云云监控）
