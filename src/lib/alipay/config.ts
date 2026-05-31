export const PLANS = {
  free: {
    name: "免费版",
    price: 0,
    priceYuan: "0.00",
    features: ["每日分析 1 次", "基础数据大屏", "CSV 上传（单次100行）", "基础 ROI 分析"],
    limits: { dailyUploads: 1, csvRows: 100, aiAnalysis: 1, historyDays: 7 },
  },
  pro: {
    name: "专业版",
    price: 299,
    priceYuan: "299.00",
    features: ["无限数据分析", "AI 智能投流建议", "实时数据大屏", "CSV 批量上传（单次1000行）", "自动报告下载", "30天历史数据"],
    limits: { dailyUploads: 10, csvRows: 1000, aiAnalysis: 10, historyDays: 30 },
  },
  enterprise: {
    name: "企业版",
    price: 999,
    priceYuan: "999.00",
    features: ["全部专业版功能", "无限 AI 分析", "API 接口访问", "多平台数据聚合", "专属数据看板", "90天历史数据", "优先客服支持"],
    limits: { dailyUploads: -1, csvRows: 5000, aiAnalysis: -1, historyDays: 90 },
  },
} as const;

export type PlanTier = keyof typeof PLANS;
