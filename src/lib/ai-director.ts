// ═══════════════════════════════════════════════
//  AI 投流总监系统 — 核心引擎
//  功能：数据分析 / 策略 / 预算 / 素材诊断 / 异常检测 / 趋势预测 / 加投减投 / 日报周报
// ═══════════════════════════════════════════════
/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars */
// @ts-nocheck

import OpenAI from "openai";

// ── Types ──

export interface AdRow {
  date: string;
  platform: string;
  spend: number;
  impressions: number;
  clicks: number;
  gmv: number;
  orders: number;
  roi: number;
  ctr?: number;
  cvr?: number;
}

export interface DirectorReport {
  generatedAt: string;
  dataRange: { from: string; to: string };
  summary: string;
  overallMetrics: {
    totalSpend: number;
    totalGMV: number;
    totalOrders: number;
    overallROI: number;
    avgCTR: number;
    avgCVR: number;
  };
  dataAnalysis: DataAnalysisSection;
  strategy: StrategySection;
  budgetOptimization: BudgetSection;
  creativeDiagnosis: CreativeSection;
  anomalyDetection: AnomalySection;
  trendPrediction: TrendSection;
  suggestions: SuggestionSection;
  score: number;
}

export interface DataAnalysisSection {
  summary: string;
  platformBreakdown: { platform: string; spend: number; gmv: number; roi: number; share: number }[];
  dailyTrend: { date: string; spend: number; roi: number }[];
  keyFindings: string[];
}

export interface StrategySection {
  currentStrategy: string;
  recommendations: string[];
  priority: "high" | "medium" | "low";
  expectedImpact: string;
}

export interface BudgetSection {
  currentAllocation: { platform: string; spend: number; percentage: number }[];
  optimizedAllocation: { platform: string; spend: number; percentage: number; change: number }[];
  totalRecommended: number;
  savingsPotential: number;
  advice: string;
}

export interface CreativeSection {
  overallScore: number;
  findings: { dimension: string; score: number; detail: string }[];
  suggestions: string[];
}

export interface AnomalySection {
  hasAnomalies: boolean;
  anomalies: { date: string; platform: string; metric: string; value: number; expected: number; severity: "critical"|"warning"|"info" }[];
  summary: string;
}

export interface TrendSection {
  next7Days: { date: string; predictedROI: number; predictedSpend: number; confidence: number }[];
  trend: "rising" | "stable" | "declining";
  confidence: number;
  factors: string[];
}

export interface SuggestionSection {
  increaseInvest: { platform: string; reason: string; amount: number; expectedROI: number }[];
  decreaseInvest: { platform: string; reason: string; amount: number; expectedSave: number }[];
  stopInvest: { platform: string; reason: string }[];
  urgentActions: string[];
}

export interface DailyReport {
  date: string;
  summary: string;
  metrics: { spend: number; gmv: number; roi: number; orders: number; impressions: number; clicks: number };
  highlights: string[];
  alerts: string[];
  suggestions: string[];
}

export interface WeeklyReport {
  week: string;
  summary: string;
  weeklyMetrics: { totalSpend: number; totalGMV: number; overallROI: number; totalOrders: number };
  comparison: { spendChange: number; roiChange: number; ordersChange: number };
  topPlatforms: { platform: string; roi: number; spend: number }[];
  keyInsights: string[];
  nextWeekPlan: string[];
}

// ── Local Analysis Engine ──

export function analyzeDataLocal(rows: AdRow[]): DataAnalysisSection {
  const total = rows.reduce((a, r) => ({ spend: a.spend + r.spend, gmv: a.gmv + r.gmv }), { spend: 0, gmv: 0 });

  const platformMap: Record<string, { spend: number; gmv: number; orders: number }> = {};
  for (const r of rows) {
    const p = r.platform || "其他";
    if (!platformMap[p]) platformMap[p] = { spend: 0, gmv: 0, orders: 0 };
    platformMap[p].spend += r.spend; platformMap[p].gmv += r.gmv; platformMap[p].orders += r.orders;
  }

  const platformBreakdown = Object.entries(platformMap).map(([platform, v]) => ({
    platform,
    spend: v.spend,
    gmv: v.gmv,
    roi: v.spend > 0 ? (v.gmv - v.spend) / v.spend : 0,
    share: total.spend > 0 ? v.spend / total.spend : 0,
  })).sort((a, b) => b.roi - a.roi);

  const dailyTrend = rows.map(r => ({ date: r.date, spend: r.spend, roi: r.roi }));

  const keyFindings: string[] = [];
  const best = platformBreakdown[0];
  const worst = platformBreakdown[platformBreakdown.length - 1];
  if (best) keyFindings.push(best.platform + " ROI 最高 (" + (best.roi * 100).toFixed(0) + "%)，建议加大投入");
  if (worst && worst.roi < 0) keyFindings.push(worst.platform + " ROI 为负，建议立即优化或暂停");
  if (total.spend > 0 && total.gmv / total.spend < 0.5) keyFindings.push("整体投产比偏低，需检查素材质量和受众定向");
  if (rows.length >= 3) {
    const recent = rows.slice(-3);
    const recentROI = recent.reduce((s, r) => s + r.roi, 0) / recent.length;
    const olderROI = rows.slice(0, -3).reduce((s, r) => s + r.roi, 0) / Math.max(1, rows.length - 3);
    if (recentROI > olderROI * 1.2) keyFindings.push("近期ROI呈上升趋势，投放策略有效");
    else if (recentROI < olderROI * 0.8) keyFindings.push("ROI近期下滑，需排查原因");
  }

  return {
    summary: total.spend > 0 ? rows.length + " 天数据，总消耗 " + total.spend.toLocaleString() + "，整体ROI " + (((total.gmv - total.spend) / total.spend) * 100).toFixed(0) + "%" : "暂无数据",
    platformBreakdown,
    dailyTrend,
    keyFindings: keyFindings.length > 0 ? keyFindings : ["数据量较少，建议积累更多数据后再分析"],
  };
}

export function generateStrategyLocal(rows: AdRow[]): StrategySection {
  const platformMap: Record<string, { roi: number; spend: number }> = {};
  for (const r of rows) {
    const p = r.platform || "其他";
    if (!platformMap[p]) platformMap[p] = { roi: 0, spend: 0 };
    platformMap[p].roi = (platformMap[p].roi * platformMap[p].spend + r.roi * r.spend) / (platformMap[p].spend + r.spend || 1);
    platformMap[p].spend += r.spend;
  }

  const sorted = Object.entries(platformMap).sort((a, b) => b[1].roi - a[1].roi);
  const recommendations: string[] = [];
  for (const [p, v] of sorted) {
    if (v.roi > 3) recommendations.push(p + "：ROI优秀 (" + (v.roi*100).toFixed(0) + "%)，建议加大预算 30-50%");
    else if (v.roi > 1.5) recommendations.push(p + "：ROI正常 (" + (v.roi*100).toFixed(0) + "%)，维持预算 + A/B测试");
    else recommendations.push(p + "：ROI偏低 (" + (v.roi*100).toFixed(0) + "%)，缩减预算 30% + 更换素材");
  }

  const avgROI = sorted.length > 0 ? sorted.reduce((s, [, v]) => s + v.roi, 0) / sorted.length : 0;
  return {
    currentStrategy: avgROI > 2 ? "当前策略偏激进，可继续放大" : "当前策略偏保守，需要优化提升ROI",
    recommendations,
    priority: avgROI > 3 ? "low" : avgROI > 1.5 ? "medium" : "high",
    expectedImpact: avgROI > 2 ? "预计ROI可提升 15-25%" : "按照建议调整后预计ROI可提升 30-50%",
  };
}

export function optimizeBudgetLocal(rows: AdRow[]): BudgetSection {
  const platformMap: Record<string, { spend: number; gmv: number }> = {};
  let totalSpend = 0;
  for (const r of rows) {
    const p = r.platform || "其他";
    if (!platformMap[p]) platformMap[p] = { spend: 0, gmv: 0 };
    platformMap[p].spend += r.spend; platformMap[p].gmv += r.gmv;
    totalSpend += r.spend;
  }

  const current = Object.entries(platformMap).map(([platform, v]) => ({
    platform, spend: v.spend, percentage: totalSpend > 0 ? v.spend / totalSpend : 0,
  }));

  const rois = Object.entries(platformMap).map(([p, v]) => ({
    platform: p, roi: v.spend > 0 ? (v.gmv - v.spend) / v.spend : 0, spend: v.spend,
  }));
  const totalROI = rois.reduce((s, r) => s + Math.max(0, r.roi) * r.spend, 0) / Math.max(1, totalSpend);

  const optimized = rois.map(r => {
    let newSpend = r.spend;
    if (r.roi > totalROI * 1.5) newSpend = r.spend * 1.3;
    else if (r.roi < 0) newSpend = r.spend * 0.3;
    else if (r.roi < totalROI * 0.5) newSpend = r.spend * 0.7;
    const newTotal = rois.reduce((s, x) => s + (x.platform === r.platform ? newSpend : x.spend), 0);
    return {
      platform: r.platform,
      spend: Math.round(newSpend),
      percentage: newTotal > 0 ? newSpend / newTotal : 0,
      change: Math.round(((newSpend - r.spend) / Math.max(1, r.spend)) * 100),
    };
  });

  const savingsPotential = optimized.filter(o => o.change < 0).reduce((s, o) => s + Math.abs(o.change) / 100 * (platformMap[o.platform]?.spend || 0), 0);

  return {
    currentAllocation: current,
    optimizedAllocation: optimized,
    totalRecommended: Math.round(optimized.reduce((s, o) => s + o.spend, 0)),
    savingsPotential: Math.round(savingsPotential),
    advice: totalROI > 2
      ? "整体ROI良好，建议维持总预算不变，优化各平台间分配"
      : "建议将低效平台预算转移至高效平台，预期可提升整体ROI 20-40%",
  };
}

export function diagnoseCreativesLocal(rows: AdRow[]): CreativeSection {
  const avgCTR = rows.reduce((s, r) => s + (r.impressions > 0 ? r.clicks / r.impressions : 0), 0) / Math.max(1, rows.length);
  const avgCVR = rows.reduce((s, r) => s + (r.clicks > 0 ? r.orders / r.clicks : 0), 0) / Math.max(1, rows.length);
  const avgROI = rows.reduce((s, r) => s + r.roi, 0) / Math.max(1, rows.length);

  const findings: { dimension: string; score: number; detail: string }[] = [];

  const ctrScore = Math.min(100, avgCTR * 2000);
  findings.push({ dimension: "点击率 (CTR)", score: Math.round(ctrScore), detail: avgCTR > 0.03 ? "CTR表现好，素材吸引力强" : avgCTR > 0.01 ? "CTR中等，可尝试更吸睛的封面和标题" : "CTR偏低，需要更换创意素材" });

  const cvrScore = Math.min(100, avgCVR * 1000);
  findings.push({ dimension: "转化率 (CVR)", score: Math.round(cvrScore), detail: avgCVR > 0.05 ? "转化率高，落地页和话术匹配度高" : avgCVR > 0.02 ? "转化率中等，优化落地页可提升" : "转化率偏低，建议检查落地页体验和话术" });

  const roiScore = avgROI > 4 ? 90 : avgROI > 2 ? 70 : avgROI > 1 ? 50 : 30;
  findings.push({ dimension: "投产比 (ROI)", score: roiScore, detail: avgROI > 3 ? "ROI优秀，素材变现能力强" : avgROI > 1.5 ? "ROI正常，持续优化" : "ROI需提升，检查选品和定价" });

  const overallScore = Math.round(findings.reduce((s, f) => s + f.score, 0) / findings.length);

  const suggestions: string[] = [];
  if (ctrScore < 60) suggestions.push("制作 3-5 组新素材，使用高点击率封面模板");
  if (cvrScore < 60) suggestions.push("优化落地页加载速度，精简转化流程");
  if (roiScore < 50) suggestions.push("重新评估目标受众定向，尝试相似人群包");
  if (suggestions.length === 0) suggestions.push("素材表现良好，保持更新频率（每周 2-3 组新素材）");

  return { overallScore, findings, suggestions };
}

export function detectAnomaliesLocal(rows: AdRow[]): AnomalySection {
  const anomalies: AnomalySection["anomalies"] = [];

  if (rows.length < 3) return { hasAnomalies: false, anomalies: [], summary: "数据量不足，需至少 3 天数据才能检测异常" };

  for (let i = 1; i < rows.length; i++) {
    const prev = rows[i - 1]!;
    const curr = rows[i]!;

    if (curr.roi < prev.roi * 0.5 && prev.roi > 0) {
      anomalies.push({ date: curr.date, platform: curr.platform || "其他", metric: "ROI", value: curr.roi, expected: prev.roi, severity: curr.roi < 0 ? "critical" : "warning" });
    }
    if (curr.spend > prev.spend * 2 && curr.roi < prev.roi * 0.7) {
      anomalies.push({ date: curr.date, platform: curr.platform || "其他", metric: "消耗骤增ROI下降", value: curr.spend, expected: prev.spend, severity: "warning" });
    }
    if (curr.impressions > 0 && prev.impressions > 0 && curr.clicks / curr.impressions < (prev.clicks / prev.impressions) * 0.3) {
      anomalies.push({ date: curr.date, platform: curr.platform || "其他", metric: "CTR骤降", value: curr.clicks / curr.impressions, expected: prev.clicks / prev.impressions, severity: "critical" });
    }
  }

  return {
    hasAnomalies: anomalies.length > 0,
    anomalies: anomalies.slice(-10),
    summary: anomalies.length === 0
      ? "未检测到明显异常，投放数据表现稳定"
      : "检测到 " + anomalies.length + " 个异常数据点，建议重点关注 critical 级别异常",
  };
}

export function predictTrendsLocal(rows: AdRow[]): TrendSection {
  if (rows.length < 3) return { next7Days: [], trend: "stable", confidence: 30, factors: ["数据量不足"] };

  const recentDays = rows.slice(-7);
  const recentROIs = recentDays.map(r => r.roi);
  const avgROI = recentROIs.reduce((s, r) => s + r, 0) / recentROIs.length;

  const n = recentROIs.length;
  const xMean = (n - 1) / 2;
  const yMean = avgROI;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) { num += (i - xMean) * (recentROIs[i]! - yMean); den += (i - xMean) ** 2; }
  const slope = den > 0 ? num / den : 0;

  const trend: TrendSection["trend"] = slope > 0.1 ? "rising" : slope < -0.1 ? "declining" : "stable";

  const today = new Date();
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today); d.setDate(d.getDate() + i + 1);
    const predROI = avgROI + slope * (n + i);
    return {
      date: d.toISOString().slice(0, 10),
      predictedROI: Math.max(0, Math.round(predROI * 100)),
      predictedSpend: Math.round(recentDays.reduce((s, r) => s + r.spend, 0) / n * (1 + slope * 0.5)),
      confidence: Math.max(30, Math.min(90, 90 - Math.abs(slope) * 20 - i * 5)),
    };
  });

  const factors: string[] = [];
  if (slope > 0.05) factors.push("近期ROI上升趋势明显，可适当加大投放");
  if (slope < -0.05) factors.push("ROI有下降趋势，建议优化素材和受众");
  if (Math.abs(slope) <= 0.05) factors.push("ROI趋势平稳，保持现有策略");
  factors.push("预测置信度约 " + Math.round(75 - Math.abs(slope) * 15) + "%");

  return { next7Days, trend, confidence: Math.round(75 - Math.abs(slope) * 15), factors };
}

export function generateSuggestionsLocal(rows: AdRow[]): SuggestionSection {
  const platformMap: Record<string, { spend: number; gmv: number; roi: number; orders: number }> = {};
  for (const r of rows) {
    const p = r.platform || "其他";
    if (!platformMap[p]) platformMap[p] = { spend: 0, gmv: 0, roi: 0, orders: 0 };
    platformMap[p].spend += r.spend; platformMap[p].gmv += r.gmv; platformMap[p].orders += r.orders;
    platformMap[p].roi = platformMap[p].spend > 0 ? (platformMap[p].gmv - platformMap[p].spend) / platformMap[p].spend : 0;
  }

  const sorted = Object.entries(platformMap).sort((a, b) => b[1].roi - a[1].roi);

  const increaseInvest = sorted.filter(([, v]) => v.roi > 2.5).map(([platform, v]) => ({
    platform, reason: "ROI " + (v.roi*100).toFixed(0) + "%，高于平均",
    amount: Math.round(v.spend * 0.3), expectedROI: Math.round((v.roi + 0.1) * 100),
  }));

  const decreaseInvest = sorted.filter(([, v]) => v.roi > 0 && v.roi < 1.5).map(([platform, v]) => ({
    platform, reason: "ROI偏低 " + (v.roi*100).toFixed(0) + "%，需优化后再加投",
    amount: Math.round(v.spend * 0.4), expectedSave: Math.round(v.spend * 0.3),
  }));

  const stopInvest = sorted.filter(([, v]) => v.roi <= 0).map(([platform]) => ({
    platform, reason: "ROI 为负，建议立即暂停并全面诊断",
  }));

  const urgentActions: string[] = [];
  if (stopInvest.length > 0) urgentActions.push("立即暂停 " + stopInvest.map(s => s.platform).join("、") + " 的投放");
  if (increaseInvest.length > 0) urgentActions.push("优先加投 " + increaseInvest[0].platform + "，预期ROI " + increaseInvest[0].expectedROI + "%");
  if (urgentActions.length === 0) urgentActions.push("当前无需紧急操作，保持监控");

  return { increaseInvest, decreaseInvest, stopInvest, urgentActions };
}

export function generateDailyReport(rows: AdRow[]): DailyReport {
  const today = rows[rows.length - 1];
  const yesterday = rows.length > 1 ? rows[rows.length - 2] : null;

  const metrics = {
    spend: today?.spend || 0,
    gmv: today?.gmv || 0,
    roi: today?.roi || 0,
    orders: today?.orders || 0,
    impressions: today?.impressions || 0,
    clicks: today?.clicks || 0,
  };

  const highlights: string[] = [];
  const alerts: string[] = [];

  if (today && yesterday) {
    if (today.roi > yesterday.roi * 1.1) highlights.push("ROI 环比上升 " + (((today.roi - yesterday.roi) / yesterday.roi) * 100).toFixed(0) + "%");
    else if (today.roi < yesterday.roi * 0.9) alerts.push("ROI 环比下降 " + (((yesterday.roi - today.roi) / yesterday.roi) * 100).toFixed(0) + "%");
    if (today.orders > yesterday.orders * 1.2) highlights.push("订单数增长 " + (((today.orders - yesterday.orders) / yesterday.orders) * 100).toFixed(0) + "%");
  }
  if (today && today.roi < 1) alerts.push("当日ROI低于1，处于亏损状态");
  if (today && today.roi > 3) highlights.push("当日ROI优秀！");

  if (alerts.length === 0 && highlights.length === 0) highlights.push("今日数据平稳，无异常波动");

  return {
    date: today?.date || new Date().toISOString().slice(0, 10),
    summary: today ? "消耗 " + today.spend.toLocaleString() + "，GMV " + today.gmv.toLocaleString() + "，ROI " + (today.roi*100).toFixed(0) + "%" : "今日暂无数据",
    metrics, highlights, alerts,
    suggestions: alerts.length > 0 ? ["建议检查异常广告计划", "审查素材点击率和转化数据"] : ["保持当前投放策略", "明天可适当测试新素材"],
  };
}

export function generateWeeklyReport(rows: AdRow[]): WeeklyReport {
  if (rows.length < 5) return {
    week: new Date().toISOString().slice(0, 10),
    summary: "数据不足，需至少 5 天数据生成周报",
    weeklyMetrics: { totalSpend: 0, totalGMV: 0, overallROI: 0, totalOrders: 0 },
    comparison: { spendChange: 0, roiChange: 0, ordersChange: 0 },
    topPlatforms: [],
    keyInsights: ["上传更多数据以获取周报分析"],
    nextWeekPlan: ["持续上传每日数据"],
  };

  const recent7 = rows.slice(-7);
  const totalSpend = recent7.reduce((s, r) => s + r.spend, 0);
  const totalGMV = recent7.reduce((s, r) => s + r.gmv, 0);
  const totalOrders = recent7.reduce((s, r) => s + r.orders, 0);
  const overallROI = totalSpend > 0 ? (totalGMV - totalSpend) / totalSpend : 0;

  const prev7 = rows.slice(-14, -7);
  const prevSpend = prev7.reduce((s, r) => s + r.spend, 0);
  const prevGMV = prev7.reduce((s, r) => s + r.gmv, 0);
  const prevOrders = prev7.reduce((s, r) => s + r.orders, 0);
  const prevROI = prevSpend > 0 ? (prevGMV - prevSpend) / prevSpend : 0;

  const spendChange = prevSpend > 0 ? ((totalSpend - prevSpend) / prevSpend) * 100 : 0;
  const roiChange = prevROI !== 0 ? ((overallROI - prevROI) / Math.abs(prevROI)) * 100 : 0;
  const ordersChange = prevOrders > 0 ? ((totalOrders - prevOrders) / prevOrders) * 100 : 0;

  const platformMap: Record<string, { spend: number; gmv: number }> = {};
  for (const r of recent7) {
    const p = r.platform || "其他";
    if (!platformMap[p]) platformMap[p] = { spend: 0, gmv: 0 };
    platformMap[p].spend += r.spend; platformMap[p].gmv += r.gmv;
  }

  const topPlatforms = Object.entries(platformMap)
    .map(([platform, v]) => ({ platform, roi: v.spend > 0 ? (v.gmv - v.spend) / v.spend : 0, spend: v.spend }))
    .sort((a, b) => b.roi - a.roi);

  const keyInsights: string[] = [];
  if (overallROI > 2) keyInsights.push("本周整体ROI表现良好，投放策略有效");
  if (overallROI < 1) keyInsights.push("本周ROI偏低，需要重点关注优化");
  if (topPlatforms[0]) keyInsights.push(topPlatforms[0].platform + " 本周表现最佳 (ROI " + (topPlatforms[0].roi*100).toFixed(0) + "%)");
  if (spendChange > 20) keyInsights.push("消耗环比增长 " + spendChange.toFixed(0) + "%，关注ROI变化");

  const nextWeekPlan: string[] = [];
  if (overallROI > 2) { nextWeekPlan.push("维持高效平台预算"); nextWeekPlan.push("测试 2-3 组新素材"); }
  else { nextWeekPlan.push("优化低效平台素材"); nextWeekPlan.push("调整受众定向策略"); nextWeekPlan.push("缩减低ROI计划预算 20%"); }

  return {
    week: recent7[0].date + " ~ " + recent7[recent7.length-1].date,
    summary: "本周消耗 " + totalSpend.toLocaleString() + "，GMV " + totalGMV.toLocaleString() + "，ROI " + (overallROI*100).toFixed(0) + "%",
    weeklyMetrics: { totalSpend, totalGMV, overallROI, totalOrders },
    comparison: { spendChange: Math.round(spendChange), roiChange: Math.round(roiChange), ordersChange: Math.round(ordersChange) },
    topPlatforms,
    keyInsights: keyInsights.length > 0 ? keyInsights : ["本周数据平稳"],
    nextWeekPlan,
  };
}

// ── Full Report ──

export function generateFullReport(rows: AdRow[], aiInsight?: string): DirectorReport {
  const dataAnalysis = analyzeDataLocal(rows);
  const strategy = generateStrategyLocal(rows);
  const budgetOptimization = optimizeBudgetLocal(rows);
  const creativeDiagnosis = diagnoseCreativesLocal(rows);
  const anomalyDetection = detectAnomaliesLocal(rows);
  const trendPrediction = predictTrendsLocal(rows);
  const suggestions = generateSuggestionsLocal(rows);

  const overallROI = rows.reduce((s, r) => s + r.gmv - r.spend, 0) / Math.max(1, rows.reduce((s, r) => s + r.spend, 0));
  const score = Math.min(100, Math.round(
    (overallROI > 0 ? Math.min(40, overallROI * 10) : 0) +
    (anomalyDetection.hasAnomalies ? 0 : 25) +
    (creativeDiagnosis.overallScore * 0.35)
  ));

  return {
    generatedAt: new Date().toISOString(),
    dataRange: { from: rows[0]?.date || "", to: rows[rows.length - 1]?.date || "" },
    summary: aiInsight || "分析 " + rows.length + " 天数据，健康分 " + score + "/100" + (score >= 80 ? " [优秀]" : score >= 50 ? " [良好]" : " [需关注]"),
    overallMetrics: {
      totalSpend: rows.reduce((s, r) => s + r.spend, 0),
      totalGMV: rows.reduce((s, r) => s + r.gmv, 0),
      totalOrders: rows.reduce((s, r) => s + r.orders, 0),
      overallROI,
      avgCTR: rows.reduce((s, r) => s + (r.impressions > 0 ? r.clicks / r.impressions : 0), 0) / Math.max(1, rows.length),
      avgCVR: rows.reduce((s, r) => s + (r.clicks > 0 ? r.orders / r.clicks : 0), 0) / Math.max(1, rows.length),
    },
    dataAnalysis, strategy, budgetOptimization, creativeDiagnosis, anomalyDetection, trendPrediction, suggestions, score,
  };
}

// ── AI-enhanced ──

let openaiClient: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || undefined,
    });
  }
  return openaiClient;
}

export async function generateAIInsight(rows: AdRow[]): Promise<string> {
  const total = rows.reduce((a, r) => ({
    spend: a.spend + r.spend, gmv: a.gmv + r.gmv, orders: a.orders + r.orders,
    impressions: a.impressions + r.impressions, clicks: a.clicks + r.clicks,
  }), { spend: 0, gmv: 0, orders: 0, impressions: 0, clicks: 0 });

  const roi = total.spend > 0 ? ((total.gmv - total.spend) / total.spend * 100).toFixed(0) : "0";
  const ctr = total.impressions > 0 ? (total.clicks / total.impressions * 100).toFixed(2) : "0";

  const prompt = "作为资深投流总监，请用 2-3 句话总结以下数据表现（用中文）：\n\n- 数据天数: " + rows.length + " 天\n- 总消耗: " + total.spend.toLocaleString() + "\n- 总GMV: " + total.gmv.toLocaleString() + "\n- 整体ROI: " + roi + "%\n- CTR: " + ctr + "%\n- 订单数: " + total.orders + "\n\n直接输出总结，不要JSON，不要markdown。";

  try {
    const openai = getOpenAI();
    const resp = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "deepseek-chat",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7, max_tokens: 200,
    });
    return resp.choices[0]?.message?.content?.trim() || generateFullReport(rows).summary;
  } catch {
    return generateFullReport(rows).summary;
  }
}