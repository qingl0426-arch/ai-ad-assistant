# Changelog

All notable changes to the AI Ad Assistant project.

## [V1.0.0] — 2026-06-02

### 🚀 核心功能
- **数据上传** — CSV/Excel 智能导入，自动识别编码(UTF-8/GBK/ANSI)，字段自动映射
- **数据大屏** — 核心指标卡片(消耗/GMV/ROI/订单)，ROI 趋势图，平台柱状图，数据明细表
- **AI 投流总监** — 全维度智能投放分析：
  - AI 数据分析（平台分布、关键发现）
  - AI 投流策略（优先级、预期效果）
  - AI 预算优化（当前 vs 优化分配对比）
  - AI 素材诊断（CTR/CVR/ROI 三维评分）
  - AI 异常检测（ROI 骤降、CTR 异常）
  - AI 趋势预测（未来7天预测）
  - AI 加投/减投建议（具体金额、紧急操作）
  - AI 运营日报/周报
- **AI 运营助手** — ChatGPT 风格对话，流式输出，历史记录，快捷问题
- **AI 智能分析** — DeepSeek 驱动，合并至 AI 投流总监
- **ROI 分析** — ROI 趋势面积图，平台 ROI 柱状图，每日 ROI 明细
- **会员中心** — 免费/专业/企业三档套餐，支付宝支付
- **个人中心** — 个人资料、修改密码、登录日志、设备管理
- **管理员后台** — 用户管理、订单管理、AI 调用统计、收入统计
- **报告中心** — 日报/周报整合至 AI 投流总监

### 🎨 UI/UX
- 深色主题 (#09090b)，渐变光效，毛玻璃效果
- 参考 Linear/Stripe/Vercel 设计风格
- Framer Motion 动画系统
- shadcn/ui 组件库 + TailwindCSS v4
- 响应式布局，移动端适配

### 🛠 技术栈
- Next.js 15.5 (App Router)
- TypeScript
- TailwindCSS v4
- shadcn/ui + Radix UI
- Supabase (Auth + Database)
- DeepSeek AI (OpenAI 兼容接口)
- Framer Motion
- Recharts
- PM2 Cluster 部署
- Nginx 反向代理 + SSL

### 🔧 基础设施
- PM2 Cluster 双实例部署
- Nginx HTTPS 反向代理
- Supabase 数据库 (ad_traffic, upload_batches, user_profiles)
- 支付宝支付集成
- 环境变量配置 (.env)

### 📦 部署
- 服务器: 阿里云 ECS (47.86.97.218)
- 域名: wqaihub.cn (HTTPS)
- 部署脚本: `npm run build && pm2 restart`

---

## Version Format

This project follows [Semantic Versioning](https://semver.org/):
- **MAJOR** — incompatible API changes
- **MINOR** — new functionality (backward compatible)
- **PATCH** — bug fixes (backward compatible)
