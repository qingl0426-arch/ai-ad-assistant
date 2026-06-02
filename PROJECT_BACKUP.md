# PROJECT_BACKUP.md — V1.0.0

> **快照时间:** 2026-06-02
> **版本号:** V1.0.0
> **版本名称:** AI直播智能投流助手正式版
> **代码仓库:** git@github.com:qingl0426-arch/ai-ad-assistant.git

---

## 一、已完成功能清单

| # | 功能模块 | 路由 | 状态 |
|---|---------|------|------|
| 1 | 登录注册 | `/login`, `/forgot-password`, `/reset-password` | ✅ |
| 2 | 会员系统 | `/pricing` (免费/专业/企业) | ✅ |
| 3 | 支付宝支付 | `/api/alipay/*` | ✅ |
| 4 | 数据上传 | `/upload` (CSV/Excel智能识别) | ✅ |
| 5 | CSV智能识别 | UTF-8/GBK/ANSI编码 + 字段映射 | ✅ |
| 6 | 数据大屏 | `/dashboard` (指标+图表+表格) | ✅ |
| 7 | ROI分析 | `/roi-analysis` (面积图+柱状图) | ✅ |
| 8 | AI投流总监 | `/ai-director` (9大分析模块) | ✅ |
| 9 | AI助手 | `/ai-assistant` (流式对话) | ✅ |
| 10 | 报告中心 | `/report` → AI投流总监日报/周报 | ✅ |
| 11 | 个人中心 | `/account` (资料/密码/日志/设备) | ✅ |
| 12 | 设备管理 | 登录设备列表 + 强制下线 | ✅ |
| 13 | 登录日志 | 登录时间/IP/设备/浏览器 | ✅ |
| 14 | 管理员后台 | `/admin` (用户/订单/统计/日志) | ✅ |
| 15 | 联系我们 | 导航栏入口 | ✅ |
| 16 | 首页 | `/` (Hero + 功能介绍) | ✅ |

---

## 二、项目目录结构

```
/opt/ai-ad-assistant/
├── package.json              # v1.0.0, Next.js 15.5
├── tsconfig.json
├── server.js                 # PM2 入口
├── .env                      # 环境变量 (不提交)
├── CHANGELOG.md
├── RELEASE.md
├── README.md
├── DEPLOY.md
├── DEPLOY_CHINA.md
│
├── src/
│   ├── middleware.ts          # Supabase Auth 中间件
│   │
│   ├── app/
│   │   ├── layout.tsx         # 根布局
│   │   ├── page.tsx           # 首页
│   │   ├── globals.css
│   │   ├── login/             # 登录
│   │   ├── forgot-password/   # 忘记密码
│   │   ├── reset-password/    # 重置密码
│   │   ├── dashboard/         # 数据大屏
│   │   ├── ai-director/       # AI投流总监 🆕
│   │   ├── ai-analysis/       # → 重定向到 ai-director
│   │   ├── ai-assistant/      # AI运营助手
│   │   ├── roi-analysis/      # ROI分析
│   │   ├── report/            # → 重定向到 ai-director
│   │   ├── upload/            # 数据上传
│   │   ├── pricing/           # 会员方案
│   │   ├── account/           # 个人中心
│   │   ├── admin/             # 管理员后台
│   │   ├── auth/callback/     # Supabase 回调
│   │   └── api/               # API 路由
│   │       ├── account/       # 个人中心 API
│   │       ├── admin/         # 管理后台 API
│   │       ├── ai-suggest/    # AI 建议
│   │       ├── alipay/        # 支付宝支付
│   │       ├── analysis/      # 数据分析
│   │       ├── chat/          # 聊天
│   │       ├── dashboard/     # 大屏数据
│   │       ├── director/      # AI投流总监 API 🆕
│   │       ├── import/        # 数据导入 🆕
│   │       ├── report/        # 报告
│   │       ├── strategy/      # 策略
│   │       ├── upload/        # 上传
│   │       └── user/          # 用户
│   │
│   ├── components/
│   │   ├── layout/navbar.tsx  # 导航栏
│   │   ├── auth/login-form.tsx
│   │   ├── dashboard/
│   │   │   ├── charts.tsx     # 图表组件
│   │   │   └── metric-cards.tsx
│   │   ├── analysis/          # AI面板组件
│   │   ├── upload/upload-form.tsx
│   │   └── ui/                # shadcn/ui 组件
│   │
│   ├── lib/
│   │   ├── ai-director.ts     # AI投流总监引擎 🆕
│   │   ├── roi-engine.ts      # ROI分析引擎
│   │   ├── ad-strategy.ts     # 广告策略引擎
│   │   ├── openai.service.ts  # OpenAI/DeepSeek 服务
│   │   ├── csv-parser.ts      # CSV解析
│   │   ├── data-importer.ts   # 智能导入 🆕
│   │   ├── permissions.ts     # 权限控制
│   │   ├── design-tokens.ts   # 设计系统
│   │   ├── utils.ts
│   │   ├── supabase/          # Supabase 客户端
│   │   └── alipay/            # 支付宝 SDK
│   │
│   └── types/database.ts      # 数据库类型
│
└── .next/                     # 构建产物 (不提交)
```

---

## 三、技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 15.5 (App Router) |
| 语言 | TypeScript |
| 样式 | TailwindCSS v4 + shadcn/ui |
| 动画 | Framer Motion |
| 图表 | Recharts |
| 数据库 | Supabase (PostgreSQL) |
| 认证 | Supabase Auth |
| AI | DeepSeek (OpenAI 兼容) |
| 支付 | 支付宝 (沙箱) |
| 部署 | PM2 Cluster + Nginx + SSL |
| 服务器 | 阿里云 ECS (47.86.97.218) |

---

## 四、数据库表

| 表名 | 说明 |
|------|------|
| `ad_traffic` | 广告投放数据 |
| `upload_batches` | 上传批次记录 |
| `user_profiles` | 用户资料 |
| `user_orders` | 用户订单 |
| `user_sessions` | 登录会话/设备 |

---

## 五、环境变量 (.env)

```
OPENAI_API_KEY=          # DeepSeek API Key
OPENAI_BASE_URL=         # API 地址
OPENAI_MODEL=deepseek-chat
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ALIPAY_APP_ID=
ALIPAY_PRIVATE_KEY=
ALIPAY_PUBLIC_KEY=
ADMIN_EMAILS=
```
