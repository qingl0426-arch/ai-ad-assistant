/**
 * 爆品指数评分规则引擎
 *
 * 纯规则计算，不依赖 AI 或外部实时数据。
 * 评分范围：0–100
 */

/* ================================================================
   类型定义
   ================================================================ */

/** 评分等级 */
export type HotScoreLevel = "爆款潜力极高" | "高潜力" | "可观察" | "普通";

/** 评分输入 */
export interface HotProductInput {
  /** 销量增长率（百分比，如 320 表示 +320%） */
  salesGrowth: number;
  /** GMV 增长率（百分比） */
  gmvGrowth: number;
  /** 评论增长率（百分比），无数据时传 0 */
  reviewGrowth: number;
  /** 收藏增长率（百分比），无数据时传 0 */
  favoriteGrowth: number;
  /** 价格（元） */
  price: number;
  /** 同类目均价（元），无数据时传 price */
  categoryAvgPrice: number;
  /** 毛利率估算（0-1，如 0.4 表示 40%） */
  estimatedMargin: number;
}

/** 评分输出 */
export interface HotProductResult {
  /** 总分 0–100 */
  hotScore: number;
  /** 等级 */
  scoreLevel: HotScoreLevel;
  /** 各项得分明细 */
  breakdown: {
    salesGrowthScore: number;
    gmvGrowthScore: number;
    reviewGrowthScore: number;
    favoriteGrowthScore: number;
    priceCompetitivenessScore: number;
    profitMarginScore: number;
  };
  /** 一句话原因 */
  reason: string;
}

/* ================================================================
   子评分函数
   ================================================================ */

/**
 * 销量增长率评分（满分 30）
 *
 * ≥300% → 30
 * ≥200% → 25
 * ≥100% → 20
 * ≥50%  → 15
 * ≥20%  → 10
 * ≥0%   → 5
 * <0%   → 0
 */
function scoreSalesGrowth(growth: number): number {
  if (growth >= 300) return 30;
  if (growth >= 200) return 25;
  if (growth >= 100) return 20;
  if (growth >= 50) return 15;
  if (growth >= 20) return 10;
  if (growth >= 0) return 5;
  return 0;
}

/**
 * GMV 增长率评分（满分 25）
 *
 * ≥300% → 25
 * ≥200% → 21
 * ≥100% → 17
 * ≥50%  → 13
 * ≥20%  → 8
 * ≥0%   → 4
 * <0%   → 0
 */
function scoreGmvGrowth(growth: number): number {
  if (growth >= 300) return 25;
  if (growth >= 200) return 21;
  if (growth >= 100) return 17;
  if (growth >= 50) return 13;
  if (growth >= 20) return 8;
  if (growth >= 0) return 4;
  return 0;
}

/**
 * 评论增长率评分（满分 15）
 *
 * ≥200% → 15
 * ≥100% → 12
 * ≥50%  → 9
 * ≥20%  → 6
 * ≥0%   → 3
 * <0%   → 0
 */
function scoreReviewGrowth(growth: number): number {
  if (growth >= 200) return 15;
  if (growth >= 100) return 12;
  if (growth >= 50) return 9;
  if (growth >= 20) return 6;
  if (growth >= 0) return 3;
  return 0;
}

/**
 * 收藏增长率评分（满分 10）
 *
 * ≥200% → 10
 * ≥100% → 8
 * ≥50%  → 6
 * ≥20%  → 4
 * ≥0%   → 2
 * <0%   → 0
 */
function scoreFavoriteGrowth(growth: number): number {
  if (growth >= 200) return 10;
  if (growth >= 100) return 8;
  if (growth >= 50) return 6;
  if (growth >= 20) return 4;
  if (growth >= 0) return 2;
  return 0;
}

/**
 * 价格竞争力评分（满分 10）
 *
 * 低于均价 30%+ → 10
 * 低于均价 15%+ → 8
 * 与均价接近   → 6
 * 高于均价 15%+ → 3
 * 高于均价 30%+ → 1
 */
function scorePriceCompetitiveness(price: number, avgPrice: number): number {
  if (avgPrice <= 0) return 6; // 无参考数据时默认中等
  const ratio = price / avgPrice;
  if (ratio <= 0.7) return 10;
  if (ratio <= 0.85) return 8;
  if (ratio <= 1.15) return 6;
  if (ratio <= 1.3) return 3;
  return 1;
}

/**
 * 利润率潜力评分（满分 10）
 *
 * ≥60% → 10
 * ≥40% → 8
 * ≥25% → 6
 * ≥10% → 3
 * <10% → 1
 */
function scoreProfitMargin(margin: number): number {
  if (margin >= 0.6) return 10;
  if (margin >= 0.4) return 8;
  if (margin >= 0.25) return 6;
  if (margin >= 0.1) return 3;
  return 1;
}

/**
 * 分数 → 等级
 */
function getScoreLevel(score: number): HotScoreLevel {
  if (score >= 90) return "爆款潜力极高";
  if (score >= 80) return "高潜力";
  if (score >= 60) return "可观察";
  return "普通";
}

/**
 * 生成原因说明文案
 */
function generateReason(result: HotProductResult): string {
  const { breakdown: b, hotScore } = result;
  const parts: string[] = [];

  if (b.salesGrowthScore >= 25) parts.push("销量爆发式增长");
  else if (b.salesGrowthScore >= 15) parts.push("销量增长良好");
  else if (b.salesGrowthScore === 0) parts.push("销量下滑");

  if (b.gmvGrowthScore >= 21) parts.push("GMV高速增长");
  else if (b.gmvGrowthScore >= 13) parts.push("GMV稳步增长");

  if (b.priceCompetitivenessScore >= 8) parts.push("价格优势明显");
  if (b.profitMarginScore >= 8) parts.push("利润空间大");

  if (hotScore >= 90) parts.unshift("综合评分极高，");
  else if (hotScore >= 80) parts.unshift("综合表现优秀，");
  else if (hotScore >= 60) parts.unshift("有一定潜力，");
  else parts.unshift("表现一般，");

  return parts.join("") || "数据不足，无法评估";
}

/* ================================================================
   主函数
   ================================================================ */

/**
 * 计算爆品指数
 *
 * @example
 * calculateHotProductScore({
 *   salesGrowth: 320,
 *   gmvGrowth: 315,
 *   reviewGrowth: 200,
 *   favoriteGrowth: 180,
 *   price: 29.9,
 *   categoryAvgPrice: 45,
 *   estimatedMargin: 0.5,
 * });
 * // → { hotScore: 93, scoreLevel: "爆款潜力极高", ... }
 */
export function calculateHotProductScore(input: HotProductInput): HotProductResult {
  const salesGrowthScore = scoreSalesGrowth(input.salesGrowth);
  const gmvGrowthScore = scoreGmvGrowth(input.gmvGrowth);
  const reviewGrowthScore = scoreReviewGrowth(input.reviewGrowth);
  const favoriteGrowthScore = scoreFavoriteGrowth(input.favoriteGrowth);
  const priceCompetitivenessScore = scorePriceCompetitiveness(input.price, input.categoryAvgPrice);
  const profitMarginScore = scoreProfitMargin(input.estimatedMargin);

  const hotScore = Math.min(100, Math.max(0,
    salesGrowthScore +
    gmvGrowthScore +
    reviewGrowthScore +
    favoriteGrowthScore +
    priceCompetitivenessScore +
    profitMarginScore
  ));

  const scoreLevel = getScoreLevel(hotScore);
  const breakdown = {
    salesGrowthScore,
    gmvGrowthScore,
    reviewGrowthScore,
    favoriteGrowthScore,
    priceCompetitivenessScore,
    profitMarginScore,
  };
  const reason = generateReason({ hotScore, scoreLevel, breakdown, reason: "" });

  return { hotScore, scoreLevel, breakdown, reason };
}
