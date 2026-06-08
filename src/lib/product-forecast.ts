/**
 * 未来爆品预测引擎
 *
 * 基于当前趋势数据 + 规则引擎预测 7 天 / 30 天爆发概率。
 * 不依赖外部实时数据，纯规则 + AI 增强。
 */

import type { ProductTrendRow } from "@/types/database";

/* ================================================================
   类型
   ================================================================ */

export interface ProductForecast {
  product_name: string;
  category: string;
  price: number;
  current_hot_score: number;
  /** 未来 7 天爆发概率 0-100 */
  burst_7d_probability: number;
  /** 未来 30 天爆发概率 0-100 */
  burst_30d_probability: number;
  /** 7 天趋势 */
  trend_7d: "强爆发" | "上升" | "平稳" | "下降";
  /** 30 天趋势 */
  trend_30d: "强爆发" | "上升" | "平稳" | "下降";
  /** 建议备货量（件） */
  suggested_stock: number;
  /** 建议测试预算（元） */
  suggested_test_budget: number;
  /** 风险提示 */
  risks: string[];
  /** 加权分 */
  score: number;
}

export interface ForecastResult {
  forecasts: ProductForecast[];
  summary: string;
  generatedAt: string;
}

/* ================================================================
   预测规则
   ================================================================ */

/**
 * 计算 7 天爆发概率
 *
 * 因素：
 * - 销量增长率（权重 35%）
 * - GMV 增长率（权重 25%）
 * - 评论增长率（权重 15%）
 * - 收藏增长率（权重 10%）
 * - 竞争度（权重 10%，越低越好）
 * - 利润率（权重 5%）
 */
function calcBurst7d(p: ProductTrendRow): number {
  let score = 0;

  // 销量增长率
  if (p.sales_growth_rate >= 300) score += 35;
  else if (p.sales_growth_rate >= 200) score += 30;
  else if (p.sales_growth_rate >= 100) score += 23;
  else if (p.sales_growth_rate >= 50) score += 15;
  else if (p.sales_growth_rate >= 20) score += 8;
  else if (p.sales_growth_rate >= 0) score += 3;

  // GMV 增长率
  if (p.gmv_growth_rate >= 300) score += 25;
  else if (p.gmv_growth_rate >= 200) score += 21;
  else if (p.gmv_growth_rate >= 100) score += 16;
  else if (p.gmv_growth_rate >= 50) score += 10;
  else if (p.gmv_growth_rate >= 0) score += 4;

  // 评论增长率
  if (p.comment_growth_rate >= 200) score += 15;
  else if (p.comment_growth_rate >= 100) score += 12;
  else if (p.comment_growth_rate >= 50) score += 8;
  else if (p.comment_growth_rate >= 0) score += 3;

  // 收藏增长率
  if (p.favorite_growth_rate >= 200) score += 10;
  else if (p.favorite_growth_rate >= 100) score += 8;
  else if (p.favorite_growth_rate >= 50) score += 5;
  else if (p.favorite_growth_rate >= 0) score += 2;

  // 竞争度（越低越好）
  if (p.competition_level === "低") score += 10;
  else if (p.competition_level === "中") score += 5;

  // 利润率
  const margin = p.profit_margin_estimate || 0;
  if (margin >= 0.5) score += 5;
  else if (margin >= 0.3) score += 3;

  return Math.min(100, score);
}

/**
 * 计算 30 天爆发概率
 *
 * 相比 7 天，更看重：趋势稳定性、利润率、竞争度。
 * 短时爆发（7天高但评论/收藏跟不上）会被降权。
 */
function calcBurst30d(p: ProductTrendRow, burst7d: number): number {
  let score = burst7d * 0.6; // 基础分从 7 天继承 60%

  // 利润空间加分
  const margin = p.profit_margin_estimate || 0;
  if (margin >= 0.5) score += 12;
  else if (margin >= 0.3) score += 8;
  else if (margin >= 0.15) score += 4;

  // 竞争度
  if (p.competition_level === "低") score += 8;
  else if (p.competition_level === "中") score += 4;
  else score -= 5; // 高竞争长期风险

  // 趋势状态
  if (p.trend_status === "爆发") score += 10;
  else if (p.trend_status === "上升") score += 6;
  else if (p.trend_status === "下降") score -= 15;

  // 增长率持续性：如果评论/收藏增长也高，说明不是虚假繁荣
  if (p.comment_growth_rate >= 100 && p.favorite_growth_rate >= 100) score += 8;
  else if (p.comment_growth_rate < 30 || p.favorite_growth_rate < 30) score -= 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * 趋势判断
 */
function trendLabel(prob: number): "强爆发" | "上升" | "平稳" | "下降" {
  if (prob >= 85) return "强爆发";
  if (prob >= 60) return "上升";
  if (prob >= 30) return "平稳";
  return "下降";
}

/**
 * 建议备货量
 *
 * 根据近7天日均销量 × 趋势系数 × 安全系数
 */
function calcSuggestedStock(p: ProductTrendRow, burst7d: number, burst30d: number): number {
  const dailySales = p.sales_7d / 7;
  // 如果爆发概率高，按更高倍数备货
  const factor7d = burst7d >= 80 ? 14 : burst7d >= 60 ? 10 : 7;
  const factor30d = burst30d >= 70 ? 30 : burst30d >= 50 ? 20 : 10;
  // 取 7 天和 30 天的加权平均
  const stock = Math.round((dailySales * factor7d * 0.4 + dailySales * factor30d * 0.6));
  return Math.max(10, stock);
}

/**
 * 建议测试预算
 *
 * 按商品单价 × 建议测试件数（一般 10-50 件）
 */
function calcTestBudget(p: ProductTrendRow, burst7d: number): number {
  if (burst7d >= 80) return Math.round(p.price * 50);
  if (burst7d >= 60) return Math.round(p.price * 30);
  if (burst7d >= 30) return Math.round(p.price * 15);
  return Math.round(p.price * 5);
}

/**
 * 风险分析
 */
function analyzeRisks(p: ProductTrendRow): string[] {
  const risks: string[] = [];

  if (p.competition_level === "高") {
    risks.push("竞争激烈，需差异化策略或价格优势");
  }
  if (p.competition_level === "中") {
    risks.push("竞争中等，关注竞品动态");
  }
  if (p.trend_status === "下降") {
    risks.push("当前趋势下行，可能已过爆发期");
  }
  if (p.sales_growth_rate < 20 && p.sales_growth_rate >= 0) {
    risks.push("增速放缓，爆发窗口可能较窄");
  }
  if (p.comment_growth_rate < 0) {
    risks.push("评论增长停滞，用户反馈不足");
  }
  if ((p.profit_margin_estimate || 0) < 0.1) {
    risks.push("利润空间薄，需严格控制成本");
  }

  if (risks.length === 0) {
    risks.push("当前数据未发现明显风险");
  }

  return risks;
}

/* ================================================================
   主函数
   ================================================================ */

export function forecastProducts(products: ProductTrendRow[]): ForecastResult {
  if (!products || products.length === 0) {
    return {
      forecasts: [],
      summary: "暂无商品数据，无法生成预测",
      generatedAt: new Date().toISOString(),
    };
  }

  const forecasts: ProductForecast[] = products.map(p => {
    const burst_7d_probability = calcBurst7d(p);
    const burst_30d_probability = calcBurst30d(p, burst_7d_probability);
    const trend_7d = trendLabel(burst_7d_probability);
    const trend_30d = trendLabel(burst_30d_probability);
    const suggested_stock = calcSuggestedStock(p, burst_7d_probability, burst_30d_probability);
    const suggested_test_budget = calcTestBudget(p, burst_7d_probability);
    const risks = analyzeRisks(p);
    const score = Math.round(burst_7d_probability * 0.5 + burst_30d_probability * 0.5);

    return {
      product_name: p.product_name,
      category: p.category || "未分类",
      price: p.price,
      current_hot_score: p.hot_score,
      burst_7d_probability,
      burst_30d_probability,
      trend_7d,
      trend_30d,
      suggested_stock,
      suggested_test_budget,
      risks,
      score,
    };
  });

  // 按加权分降序
  forecasts.sort((a, b) => b.score - a.score);

  const highCount = forecasts.filter(f => f.score >= 70).length;
  const summary = `共分析${products.length}个商品，${highCount}个商品未来7-30天有较高爆发潜力。预测仅供经营参考。`;

  return {
    forecasts,
    summary,
    generatedAt: new Date().toISOString(),
  };
}
