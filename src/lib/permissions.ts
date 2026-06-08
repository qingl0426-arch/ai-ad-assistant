export type PlanTier = "free" | "professional" | "enterprise";

export interface PlanLimits {
  /** 每日 AI 分析次数 */
  aiAnalysisPerDay: number;
  /** CSV 最大行数 */
  maxRows: number;
  /** 每日可查看爆品数量 */
  productRadarPerDay: number;
  /** 每周 AI 选品分析次数 */
  aiProductAnalysisPerWeek: number;
  /** 是否支持未来 7 天爆品预测 */
  forecast7d: boolean;
  /** 是否支持未来 30 天爆品预测 */
  forecast30d: boolean;
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  free: {
    aiAnalysisPerDay: 1,
    maxRows: 100,
    productRadarPerDay: 3,
    aiProductAnalysisPerWeek: 1,
    forecast7d: false,
    forecast30d: false,
  },
  professional: {
    aiAnalysisPerDay: Infinity,
    maxRows: 10000,
    productRadarPerDay: 50,
    aiProductAnalysisPerWeek: Infinity,
    forecast7d: true,
    forecast30d: false,
  },
  enterprise: {
    aiAnalysisPerDay: Infinity,
    maxRows: Infinity,
    productRadarPerDay: Infinity,
    aiProductAnalysisPerWeek: Infinity,
    forecast7d: true,
    forecast30d: true,
  },
};

/**
 * 获取当前套餐中文名称
 */
export function getPlanLabel(plan: PlanTier): string {
  switch (plan) {
    case "free": return "免费版";
    case "professional": return "专业版";
    case "enterprise": return "企业版";
  }
}
