// ROI Analysis Engine
// Rules: ROI > 4 = 优秀, ROI 2-4 = 正常, ROI < 2 = 需要优化

export type ROIGrade = "excellent" | "normal" | "poor";
export type TrendDirection = "up" | "down" | "stable";

export interface ROIAnalysisInput {
  spend: number;
  impressions: number;
  clicks: number;
  gmv: number;
  orders: number;
  roi: number;
  date: string;
  platform: string;
}

export interface ROIAnalysisResult {
  grade: ROIGrade;
  gradeLabel: string;
  roi: number;
  ctr: number;
  ctrLabel: string;
  conversionRate: number;
  conversionLabel: string;
  dealRate: number;
  dealLabel: string;
  costPerOrder: number;
  avgOrderValue: number;
  suggestion: string;
  score: number;
}

export interface BatchAnalysisResult {
  overall: {
    totalSpend: number;
    totalGMV: number;
    totalOrders: number;
    overallROI: number;
    avgCTR: number;
    avgConversionRate: number;
    avgDealRate: number;
    grade: ROIGrade;
    suggestion: string;
  };
  daily: ROIAnalysisResult[];
  platformAnalysis: PlatformResult[];
}

export interface PlatformResult {
  platform: string;
  spend: number;
  gmv: number;
  roi: number;
  orders: number;
  grade: ROIGrade;
}

// ── Grade thresholds ──
function getGrade(roi: number): ROIGrade {
  if (roi > 4) return "excellent";
  if (roi >= 2) return "normal";
  return "poor";
}

function getGradeLabel(grade: ROIGrade): string {
  switch (grade) {
    case "excellent": return "优秀";
    case "normal": return "正常";
    case "poor": return "需要优化";
  }
}

function getCTRLabel(ctr: number): string {
  if (ctr > 0.05) return "高";
  if (ctr > 0.02) return "中";
  return "低";
}

function getConversionLabel(rate: number): string {
  if (rate > 0.10) return "高";
  if (rate > 0.03) return "中";
  return "低";
}

function getDealLabel(rate: number): string {
  if (rate > 0.05) return "高";
  if (rate > 0.02) return "中";
  return "低";
}

// ── Analysis ──
export function analyzeSingle(input: ROIAnalysisInput): ROIAnalysisResult {
  const roi = input.roi;
  const ctr = input.impressions > 0 ? input.clicks / input.impressions : 0;
  const conversionRate = input.clicks > 0 ? input.orders / input.clicks : 0;
  const dealRate = input.impressions > 0 ? input.orders / input.impressions : 0;
  const costPerOrder = input.orders > 0 ? input.spend / input.orders : 0;
  const avgOrderValue = input.orders > 0 ? input.gmv / input.orders : 0;

  const grade = getGrade(roi);
  const suggestion = generateSuggestion(grade, ctr, conversionRate, input.platform);
  const score = calculateScore(grade, ctr, conversionRate, dealRate);

  return {
    grade,
    gradeLabel: getGradeLabel(grade),
    roi,
    ctr,
    ctrLabel: getCTRLabel(ctr),
    conversionRate,
    conversionLabel: getConversionLabel(conversionRate),
    dealRate,
    dealLabel: getDealLabel(dealRate),
    costPerOrder,
    avgOrderValue,
    suggestion,
    score,
  };
}

export function analyzeBatch(inputs: ROIAnalysisInput[]): BatchAnalysisResult {
  const daily = inputs.map(analyzeSingle);

  const totalSpend = inputs.reduce((s, i) => s + i.spend, 0);
  const totalGMV = inputs.reduce((s, i) => s + i.gmv, 0);
  const totalOrders = inputs.reduce((s, i) => s + i.orders, 0);
  const overallROI = totalSpend > 0 ? (totalGMV - totalSpend) / totalSpend : 0;
  const avgCTR = daily.length > 0 ? daily.reduce((s, d) => s + d.ctr, 0) / daily.length : 0;
  const avgConversionRate = daily.length > 0 ? daily.reduce((s, d) => s + d.conversionRate, 0) / daily.length : 0;
  const avgDealRate = daily.length > 0 ? daily.reduce((s, d) => s + d.dealRate, 0) / daily.length : 0;

  const grade = getGrade(overallROI);
  const suggestion = generateOverallSuggestion(grade, avgCTR, avgConversionRate);

  // Platform breakdown
  const platformMap: Record<string, { spend: number; gmv: number; orders: number }> = {};
  for (const i of inputs) {
    const p = i.platform || "其他";
    if (!platformMap[p]) platformMap[p] = { spend: 0, gmv: 0, orders: 0 };
    platformMap[p].spend += i.spend;
    platformMap[p].gmv += i.gmv;
    platformMap[p].orders += i.orders;
  }

  const platformAnalysis: PlatformResult[] = Object.entries(platformMap)
    .map(([platform, v]) => ({
      platform,
      spend: v.spend,
      gmv: v.gmv,
      roi: v.spend > 0 ? (v.gmv - v.spend) / v.spend : 0,
      orders: v.orders,
      grade: getGrade(v.spend > 0 ? (v.gmv - v.spend) / v.spend : 0),
    }))
    .sort((a, b) => b.roi - a.roi);

  return {
    overall: { totalSpend, totalGMV, totalOrders, overallROI, avgCTR, avgConversionRate, avgDealRate, grade, suggestion },
    daily,
    platformAnalysis,
  };
}

// ── Suggestions ──
function generateSuggestion(grade: ROIGrade, ctr: number, conversionRate: number, _platform: string): string {
  const parts: string[] = [];

  switch (grade) {
    case "excellent":
      parts.push("ROI 表现优秀，建议加量投放");
      break;
    case "normal":
      parts.push("ROI 处于正常水平，可维持或小幅加投");
      break;
    case "poor":
      parts.push("ROI 偏低，建议缩减预算并优化投放策略");
      break;
  }

  if (ctr < 0.02) parts.push("点击率偏低，建议优化创意素材");
  if (conversionRate < 0.03) parts.push("转化率不足，检查落地页或商品详情");
  if (grade === "poor" && ctr > 0.05) parts.push("点击率高但转化低，流量质量可能有问题");

  return parts.join("；") || "数据正常，保持当前策略";
}

function generateOverallSuggestion(grade: ROIGrade, avgCTR: number, avgConversion: number): string {
  switch (grade) {
    case "excellent":
      return "整体 ROI 优秀（>4），建议扩大投放规模，同时关注素材衰退。";
    case "normal":
      return "整体 ROI 正常（2-4），可持续优化素材和定向，稳步提升。";
    case "poor":
      return `整体 ROI 偏低（<2），${avgCTR < 0.02 ? "CTR" : ""}${avgCTR < 0.02 && avgConversion < 0.03 ? "和" : ""}${avgConversion < 0.03 ? "转化率" : ""}均需优化，建议暂停低效计划。`;
  }
}

function calculateScore(grade: ROIGrade, ctr: number, conversionRate: number, dealRate: number): number {
  let score = 0;
  score += grade === "excellent" ? 40 : grade === "normal" ? 20 : 0;
  score += ctr > 0.05 ? 20 : ctr > 0.02 ? 10 : 0;
  score += conversionRate > 0.10 ? 20 : conversionRate > 0.03 ? 10 : 0;
  score += dealRate > 0.05 ? 20 : dealRate > 0.02 ? 10 : 0;
  return Math.min(100, score);
}


