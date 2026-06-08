/**
 * 爆品雷达 ↔ 利润增长联动推荐引擎
 *
 * 当广告/直播数据表现下降时，推荐可替换或可测试商品。
 */

import type { ProductTrendRow } from "@/types/database";

/* ================================================================
   类型
   ================================================================ */

export type RecommendScenario = "roi_decline" | "high_refund" | "growth_slowdown" | "general";

export interface ProductRecommendation {
  product_name: string;
  category: string;
  price: number;
  hot_score: number;
  estimated_profit_rate: number;
  competition: string;
  suggested_test_budget: number;
  action: "可立即测试" | "建议小批量测试" | "可关注备选";
  reason: string;
  scenario: RecommendScenario;
}

export interface RecommendationResult {
  scenario: RecommendScenario;
  scenarioLabel: string;
  scenarioHint: string;
  recommendations: ProductRecommendation[];
  totalAvailable: number;
}

/* ================================================================
   场景规则
   ================================================================ */

/**
 * 场景1：ROI 下降 → 推荐高爆款指数商品
 */
function recommendForRoiDecline(products: ProductTrendRow[]): ProductRecommendation[] {
  return products
    .filter(p => p.hot_score >= 70 && p.sales_growth_rate >= 0)
    .sort((a, b) => b.hot_score - a.hot_score)
    .slice(0, 5)
    .map(p => ({
      product_name: p.product_name,
      category: p.category || "未分类",
      price: p.price,
      hot_score: p.hot_score,
      estimated_profit_rate: Math.round((p.profit_margin_estimate || 0) * 100),
      competition: p.competition_level,
      suggested_test_budget: Math.round(p.price * 20),
      action: p.hot_score >= 85 ? "可立即测试" as const : "建议小批量测试" as const,
      reason: p.hot_score >= 85
        ? "爆款指数极高，当前ROI下行时可优先测试"
        : "爆款指数较高，可作为投流测试备选",
      scenario: "roi_decline" as const,
    }));
}

/**
 * 场景2：退款率高 → 推荐低退款风险商品
 */
function recommendForHighRefund(products: ProductTrendRow[]): ProductRecommendation[] {
  return products
    .filter(p => p.competition_level !== "高" && p.sales_growth_rate >= 20)
    .sort((a, b) => {
      // 优先低竞争 + 高增长的
      const aScore = (a.competition_level === "低" ? 3 : a.competition_level === "中" ? 1 : 0) + a.hot_score / 30;
      const bScore = (b.competition_level === "低" ? 3 : b.competition_level === "中" ? 1 : 0) + b.hot_score / 30;
      return bScore - aScore;
    })
    .slice(0, 5)
    .map(p => ({
      product_name: p.product_name,
      category: p.category || "未分类",
      price: p.price,
      hot_score: p.hot_score,
      estimated_profit_rate: Math.round((p.profit_margin_estimate || 0) * 100),
      competition: p.competition_level,
      suggested_test_budget: Math.round(p.price * 15),
      action: p.competition_level === "低" ? "可立即测试" as const : "建议小批量测试" as const,
      reason: p.competition_level === "低"
        ? "竞争低、增长稳定，退款风险相对可控"
        : "增长良好，可作为退款高风险商品的替代选择",
      scenario: "high_refund" as const,
    }));
}

/**
 * 场景3：品类增长放缓 → 推荐同类目高增长商品
 */
function recommendForGrowthSlowdown(products: ProductTrendRow[], targetCategory?: string): ProductRecommendation[] {
  let candidates = products;

  if (targetCategory) {
    const categoryMatch = products.filter(p => p.category === targetCategory);
    if (categoryMatch.length >= 3) {
      candidates = categoryMatch;
    }
  }

  return candidates
    .filter(p => p.sales_growth_rate >= 50 && p.trend_status !== "下降")
    .sort((a, b) => b.sales_growth_rate - a.sales_growth_rate)
    .slice(0, 5)
    .map(p => ({
      product_name: p.product_name,
      category: p.category || "未分类",
      price: p.price,
      hot_score: p.hot_score,
      estimated_profit_rate: Math.round((p.profit_margin_estimate || 0) * 100),
      competition: p.competition_level,
      suggested_test_budget: Math.round(p.price * 25),
      action: p.sales_growth_rate >= 100 ? "可立即测试" as const : "建议小批量测试" as const,
      reason: p.sales_growth_rate >= 100
        ? `同类目高增长（+${p.sales_growth_rate}%），值得切换测试`
        : "同类目中增长尚可，可作为备选观察",
      scenario: "growth_slowdown" as const,
    }));
}

/**
 * 场景4：通用推荐（无特定问题）
 */
function recommendGeneral(products: ProductTrendRow[]): ProductRecommendation[] {
  return products
    .filter(p => p.hot_score >= 60)
    .sort((a, b) => b.hot_score - a.hot_score)
    .slice(0, 5)
    .map(p => ({
      product_name: p.product_name,
      category: p.category || "未分类",
      price: p.price,
      hot_score: p.hot_score,
      estimated_profit_rate: Math.round((p.profit_margin_estimate || 0) * 100),
      competition: p.competition_level,
      suggested_test_budget: Math.round(p.price * 10),
      action: "可关注备选" as const,
      reason: "综合表现良好，可作为投流测试候选",
      scenario: "general" as const,
    }));
}

/* ================================================================
   场景检测
   ================================================================ */

export interface AdPerformance {
  /** 最近 ROI，null 表示无数据 */
  recentRoi?: number | null;
  /** 退款率 %，null 表示无数据 */
  refundRate?: number | null;
  /** 主品类 */
  mainCategory?: string;
}

export function detectScenario(perf: AdPerformance): {
  scenario: RecommendScenario;
  label: string;
  hint: string;
} {
  // 场景1：ROI < 1.5 或 ROI 下降
  if (perf.recentRoi != null && perf.recentRoi < 1.5) {
    return {
      scenario: "roi_decline",
      label: "当前 ROI 偏低",
      hint: "以下高爆款指数商品可能是更好的投流选择",
    };
  }

  // 场景2：退款率 > 12%
  if (perf.refundRate != null && perf.refundRate > 12) {
    return {
      scenario: "high_refund",
      label: "当前退款率偏高",
      hint: "以下低竞争、稳定增长商品退款风险相对较低",
    };
  }

  // 场景3 & 通用（这里简化为通用推荐）
  return {
    scenario: "general",
    label: "可测试商品推荐",
    hint: "以下商品综合表现良好，适合投流测试",
  };
}

/* ================================================================
   主函数
   ================================================================ */

export function recommendProducts(
  products: ProductTrendRow[],
  perf: AdPerformance,
  targetCategory?: string
): RecommendationResult {
  const scenarioResult = detectScenario(perf);
  let recommendations: ProductRecommendation[];

  switch (scenarioResult.scenario) {
    case "roi_decline":
      recommendations = recommendForRoiDecline(products);
      break;
    case "high_refund":
      recommendations = recommendForHighRefund(products);
      break;
    case "growth_slowdown":
      recommendations = recommendForGrowthSlowdown(products, targetCategory || perf.mainCategory);
      break;
    default:
      recommendations = recommendGeneral(products);
  }

  // 如果场景推荐结果不足，补通用推荐
  if (recommendations.length < 3) {
    const general = recommendGeneral(products).filter(
      g => !recommendations.some(r => r.product_name === g.product_name)
    );
    recommendations = [...recommendations, ...general].slice(0, 5);
  }

  return {
    scenario: scenarioResult.scenario,
    scenarioLabel: scenarioResult.label,
    scenarioHint: scenarioResult.hint,
    recommendations,
    totalAvailable: products.length,
  };
}
