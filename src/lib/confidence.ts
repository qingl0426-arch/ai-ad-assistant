/**
 * AI 建议置信度计算工具
 *
 * 规则：
 * - 数据字段完整 + 历史天数足够 + 样本量足够 + 指标稳定 → 高 (≥80%)
 * - 数据只有1条或缺少关键字段 → 低 (<50%)
 * - 其余情况 → 中 (50%-79%)
 *
 * 少量数据场景：
 * - rowCount < 3 → 标记为少量数据，展示友好提示但不阻塞分析
 */

export type ConfidenceLevel = "高" | "中" | "低";
export type ConfidenceStyle = "high" | "medium" | "low";

export interface ConfidenceResult {
  /** 置信度百分比 0-100 */
  score: number;
  /** 置信度等级 */
  level: ConfidenceLevel;
  /** 样式标记 */
  style: ConfidenceStyle;
  /** 判断原因 */
  reasons: string[];
  /** 是否建议作为参考（低置信度时显示提示） */
  isReference: boolean;
  /** 提示文案 */
  hint?: string;
  /** 是否为少量数据场景（rowCount < 3） */
  isLowData: boolean;
  /** 少量数据专属提示文案 */
  lowDataHint?: string;
}

interface ConfidenceInput {
  /** 数据行数 */
  rowCount: number;
  /** 已识别字段数 */
  mappedFieldCount: number;
  /** 总期望字段数 */
  expectedFieldCount: number;
  /** 历史天数 */
  historyDays: number;
  /** 指标是否稳定（如ROI波动 < 30%） */
  isStable: boolean;
}

/**
 * 计算AI建议的置信度
 */
export function calculateConfidence(input: ConfidenceInput): ConfidenceResult {
  const { rowCount, mappedFieldCount, expectedFieldCount, historyDays, isStable } = input;

  const reasons: string[] = [];
  let score = 100; // 初始满分

  // ── 少量数据场景检测（不阻塞分析） ──
  const isLowData = rowCount < 3;
  let lowDataHint: string | undefined;
  if (isLowData) {
    lowDataHint = "当前数据较少，AI建议仅供参考，建议上传3天以上数据分析更准确";
  }

  // 规则1：数据量检查
  if (rowCount <= 1) {
    score -= 30;
    reasons.push("数据量仅1条，置信度较低");
  } else if (rowCount <= 5) {
    score -= 15;
    reasons.push("数据量较少（≤5条）");
  } else if (rowCount >= 30) {
    reasons.push("数据量充足");
  }

  // 规则2：字段完整度检查
  if (expectedFieldCount > 0) {
    const fieldRatio = mappedFieldCount / expectedFieldCount;
    if (fieldRatio < 0.5) {
      score -= 25;
      reasons.push(`关键字段缺失严重（${mappedFieldCount}/${expectedFieldCount}）`);
    } else if (fieldRatio < 0.8) {
      score -= 10;
      reasons.push(`部分字段缺失（${mappedFieldCount}/${expectedFieldCount}）`);
    } else {
      reasons.push("字段完整度高");
    }
  }

  // 规则3：历史天数检查
  if (historyDays <= 1) {
    score -= 15;
    reasons.push("历史数据仅1天，趋势不可靠");
  } else if (historyDays <= 3) {
    score -= 8;
    reasons.push("历史数据较少（≤3天）");
  } else if (historyDays >= 7) {
    reasons.push("历史数据充足（≥7天）");
  }

  // 规则4：指标稳定性检查
  if (!isStable) {
    score -= 15;
    reasons.push("指标波动较大，建议关注趋势");
  } else if (historyDays > 1) {
    reasons.push("指标稳定");
  }

  // 分数规范化
  score = Math.max(0, Math.min(100, Math.round(score)));

  // 判断等级
  let level: ConfidenceLevel;
  let style: ConfidenceStyle;
  let isReference = false;
  let hint: string | undefined;

  if (score >= 80) {
    level = "高";
    style = "high";
    reasons.unshift("置信度高");
  } else if (score >= 50) {
    level = "中";
    style = "medium";
    reasons.unshift("置信度中等");
  } else {
    level = "低";
    style = "low";
    isReference = true;
    hint = "当前数据较少，建议作为参考";
    reasons.unshift("置信度较低");
  }

  return { score, level, style, reasons, isReference, hint, isLowData, lowDataHint };
}

/**
 * 根据广告投流数据计算置信度
 */
export function getAdDataConfidence(rowCount: number, mappedFields: number): ConfidenceResult {
  return calculateConfidence({
    rowCount,
    mappedFieldCount: mappedFields,
    expectedFieldCount: 8, // date, spend, impressions, clicks, gmv, orders, roi, ctr
    historyDays: rowCount,
    isStable: rowCount >= 3,
  });
}

/**
 * 根据直播复盘数据计算置信度
 */
export function getLiveReviewConfidence(rowCount: number, mappedFields: number): ConfidenceResult {
  return calculateConfidence({
    rowCount,
    mappedFieldCount: mappedFields,
    expectedFieldCount: 9, // cover_url, live_room_name, live_time, live_duration, platform, live_gmv, gpm, refund_amount, violation_count
    historyDays: rowCount,
    isStable: rowCount >= 2,
  });
}

/**
 * 获取置信度对应的UI颜色类名
 */
export function getConfidenceColor(style: ConfidenceStyle): string {
  switch (style) {
    case "high":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "medium":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "low":
      return "bg-red-500/10 text-red-400 border-red-500/20";
  }
}
