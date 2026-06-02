# Release Notes — V1.0.0

**Release Date:** 2026-06-02
**Code Name:** AI 投流总监

## Overview

AI 广告投放助手 V1.0 正式发布。面向直播电商投流场景，提供从数据导入、AI分析、到策略建议的全链路智能决策支持。

## What's New

### Core Features
| 功能 | 状态 | 说明 |
|------|------|------|
| 智能数据导入 | ✅ | CSV/Excel 多编码自动识别 |
| 数据大屏 | ✅ | 实时指标 + 趋势图表 |
| AI 投流总监 | ✅ | 9 大 AI 分析模块 |
| AI 运营助手 | ✅ | 流式对话投流顾问 |
| ROI 分析 | ✅ | 面积图 + 柱状图 |
| 会员系统 | ✅ | 免费/专业/企业 + 支付宝 |
| 个人中心 | ✅ | 资料/密码/日志/设备 |
| 管理员后台 | ✅ | 用户/订单/统计管理 |
| 报告中心 | ✅ | 日报/周报 |

### Technical Specs
- **Next.js 15.5** App Router + Server Actions
- **TypeScript** 全类型覆盖
- **Supabase** Auth + PostgreSQL
- **DeepSeek AI** (OpenAI 兼容)
- **PM2 Cluster** 生产部署

## Deployment

```bash
# Server: Alibaba Cloud ECS 47.86.97.218
# Domain: https://wqaihub.cn
# SSL: Let's Encrypt

ssh root@47.86.97.218
cd /opt/ai-ad-assistant
npm run build
chmod -R 755 .next/static
pm2 restart ai-ad-assistant --update-env
pm2 save
```

## Known Issues
- 支付宝沙箱环境配置需完善
- 部分页面 Tailwind v4 CSS 兼容需内联样式绕过
- AI 分析依赖 OPENAI_API_KEY 环境变量

## Next (V1.1)
- [ ] 自定义报告生成器
- [ ] 微信支付集成
- [ ] 邮件通知系统
- [ ] 多账号协作
