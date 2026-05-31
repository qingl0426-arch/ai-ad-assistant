// 智能加投模块
// 规则: ROI>5 连续3天上涨 → 加投20%  |  ROI<2 连续3天下跌 → 减投30%

export interface StrategyInput {
  date: string;
  spend: number;
  gmv: number;
  roi: number;
  platform: string;
}

export type StrategyAction = "increase" | "decrease" | "hold";
export type StrategyReason =
  | "high_roi_rising"
  | "low_roi_falling"
  | "high_roi_stable"
  | "moderate_roi"
  | "none";

export interface StrategyResult {
  action: StrategyAction;
  actionLabel: string;
  reason: StrategyReason;
  reasonDetail: string;
  currentBudget: number;
  suggestedBudget: number;
  changePercent: number;
  trend: "up" | "down" | "stable";
  consecutiveDays: number;
  avgROI: number;
  confidence: number;
}

// ── Trend Detection ──
function detectTrend(roiValues: number[]): { trend: "up" | "down" | "stable"; consecutive: number } {
  if (roiValues.length < 2) return { trend: "stable", consecutive: 0 };

  let trend: "up" | "down" | "stable" = "stable";
  let consecutive = 1;

  for (let i = roiValues.length - 1; i > 0; i--) {
    const curr = roiValues[i]!;
    const prev = roiValues[i - 1]!;

    if (curr > prev * 1.05) {
      if (trend === "up" || trend === "stable") {
        trend = "up";
        consecutive++;
      } else break;
    } else if (curr < prev * 0.95) {
      if (trend === "down" || trend === "stable") {
        trend = "down";
        consecutive++;
      } else break;
    } else {
      break;
    }
  }

  return { trend, consecutive };
}

// ── Per-platform strategy ──
export function analyzeStrategy(inputs: StrategyInput[]): {
  overall: StrategyResult;
  platforms: Record<string, StrategyResult>;
  dailyAnalysis: Array<{ date: string; roi: number; action: StrategyAction }>;
} {
  if (inputs.length === 0) {
    return {
      overall: emptyResult(),
      platforms: {},
      dailyAnalysis: [],
    };
  }

  // Sort by date
  const sorted = [...inputs].sort((a, b) => a.date.localeCompare(b.date));
  const roiValues = sorted.map((i) => i.roi);
  const totalSpend = sorted.reduce((s, i) => s + i.spend, 0);
  const avgROI = roiValues.reduce((s, r) => s + r, 0) / roiValues.length;

  const { trend, consecutive } = detectTrend(roiValues);

  // Determine action
  let action: StrategyAction = "hold";
  let reason: StrategyReason = "none";
  let changePercent = 0;
  let confidence = 50;

  if (avgROI > 5 && trend === "up" && consecutive >= 3) {
    action = "increase";
    reason = "high_roi_rising";
    changePercent = 20;
    confidence = 90;
  } else if (avgROI < 2 && trend === "down" && consecutive >= 3) {
    action = "decrease";
    reason = "low_roi_falling";
    changePercent = -30;
    confidence = 90;
  } else if (avgROI > 5 && trend === "up" && consecutive >= 2) {
    action = "increase";
    reason = "high_roi_stable";
    changePercent = 10;
    confidence = 70;
  } else if (avgROI > 5) {
    action = "increase";
    reason = "high_roi_stable";
    changePercent = 10;
    confidence = 60;
  } else if (avgROI < 2 && trend === "down") {
    action = "decrease";
    reason = "low_roi_falling";
    changePercent = -15;
    confidence = 65;
  } else if (avgROI >= 2 && avgROI <= 5) {
    action = "hold";
    reason = "moderate_roi";
    confidence = 70;
  }

  const currentBudget = totalSpend;
  const suggestedBudget = Math.round(currentBudget * (1 + changePercent / 100));

  const overall: StrategyResult = {
    action,
    actionLabel: action === "increase" ? "加投" : action === "decrease" ? "减投" : "维持",
    reason,
    reasonDetail: buildReasonDetail(reason, avgROI, consecutive, trend),
    currentBudget,
    suggestedBudget,
    changePercent,
    trend,
    consecutiveDays: consecutive,
    avgROI,
    confidence,
  };

  // Per-platform analysis
  const platformMap: Record<string, StrategyInput[]> = {};
  for (const i of sorted) {
    const p = i.platform || "其他";
    if (!platformMap[p]) platformMap[p] = [];
    platformMap[p].push(i);
  }

  const platforms: Record<string, StrategyResult> = {};
  for (const [name, rows] of Object.entries(platformMap)) {
    const pRoiValues = rows.map((r) => r.roi);
    const pTotalSpend = rows.reduce((s, r) => s + r.spend, 0);
    const pAvgROI = pRoiValues.reduce((s, r) => s + r, 0) / pRoiValues.length;
    const pTrend = detectTrend(pRoiValues);

    let pAction: StrategyAction = "hold";
    let pChange = 0;

    if (pAvgROI > 5 && pTrend.trend === "up" && pTrend.consecutive >= 3) {
      pAction = "increase"; pChange = 25;
    } else if (pAvgROI < 2 && pTrend.trend === "down" && pTrend.consecutive >= 3) {
      pAction = "decrease"; pChange = -35;
    } else if (pAvgROI > 5) {
      pAction = "increase"; pChange = 15;
    } else if (pAvgROI < 2) {
      pAction = "decrease"; pChange = -20;
    }

    platforms[name] = {
      action: pAction,
      actionLabel: pAction === "increase" ? "加投" : pAction === "decrease" ? "减投" : "维持",
      reason: pAvgROI > 5 ? "high_roi_stable" : pAvgROI < 2 ? "low_roi_falling" : "moderate_roi",
      reasonDetail: `${name}: 平均ROI ${(pAvgROI * 100).toFixed(0)}%`,
      currentBudget: pTotalSpend,
      suggestedBudget: Math.round(pTotalSpend * (1 + pChange / 100)),
      changePercent: pChange,
      trend: pTrend.trend,
      consecutiveDays: pTrend.consecutive,
      avgROI: pAvgROI,
      confidence: pAvgROI > 5 ? 85 : pAvgROI < 2 ? 80 : 65,
    };
  }

  // Daily analysis
  const dailyAnalysis = sorted.map((d, i) => {
    let dailyAction: StrategyAction = "hold";
    if (i >= 2) {
      const last3 = sorted.slice(i - 2, i + 1).map((r) => r.roi);
      const trend3 = detectTrend(last3);
      const avg3 = last3.reduce((s, r) => s + r, 0) / 3;
      if (avg3 > 5 && trend3.trend === "up") dailyAction = "increase";
      else if (avg3 < 2 && trend3.trend === "down") dailyAction = "decrease";
    }
    return { date: d.date, roi: d.roi, action: dailyAction };
  });

  return { overall, platforms, dailyAnalysis };
}

function emptyResult(): StrategyResult {
  return {
    action: "hold", actionLabel: "维持", reason: "none", reasonDetail: "暂无数据",
    currentBudget: 0, suggestedBudget: 0, changePercent: 0,
    trend: "stable", consecutiveDays: 0, avgROI: 0, confidence: 0,
  };
}

function buildReasonDetail(reason: StrategyReason, avgROI: number, consecutive: number, trend: string): string {
  const roiStr = (avgROI * 100).toFixed(0);
  switch (reason) {
    case "high_roi_rising":
      return `ROI ${roiStr}% (优秀) 且连续${consecutive}天${trend === "up" ? "上涨" : "下跌"}，建议加投20%`;
    case "low_roi_falling":
      return `ROI ${roiStr}% (偏低) 且连续${consecutive}天${trend === "up" ? "上涨" : "下跌"}，建议减投30%`;
    case "high_roi_stable":
      return `ROI ${roiStr}% (优秀)，建议小幅加投10%`;
    case "moderate_roi":
      return `ROI ${roiStr}% (正常范围)，建议维持现有预算`;
    default:
      return "数据不足，无法给出建议";
  }
}
