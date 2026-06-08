/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 爆品数据 Excel 导入 — 字段映射 + 模式识别
 *
 * 与 ad_data / live_review 导入独立，不影响现有逻辑。
 */

/* ================================================================
   类型
   ================================================================ */

export type DataMode = "ad_data" | "live_review" | "product_trend" | "unknown";

export interface ProductTrendFieldMapping {
  header: string;
  field: string | null;
  confidence: "high" | "medium" | "low" | "none";
  sample: string;
}

export interface ProductTrendRow {
  product_name: string;
  category: string;
  price: number;
  sales_7d: number;
  gmv_7d: number;
  sales_growth_rate: number;
  gmv_growth_rate: number;
  comment_growth_rate: number;
  favorite_growth_rate: number;
  profit_margin_estimate: number;
  competition_level: "低" | "中" | "高";
  platform: string;
}

export interface ProductTrendImportPreview {
  headers: string[];
  mapping: ProductTrendFieldMapping[];
  rows: Record<string, string>[];
  totalRows: number;
  confidence: number;
  mode: DataMode;
}

/* ================================================================
   字段模式库（中文表头 → 内部字段）
   ================================================================ */

const PRODUCT_FIELD_PATTERNS: {
  field: string;
  exact: string[];
  contains: string[];
}[] = [
  {
    field: "product_name",
    exact: ["商品名称", "商品标题", "产品名称", "名称", "标题", "商品", "产品"],
    contains: ["商品名", "标题", "产品名"],
  },
  {
    field: "category",
    exact: ["类目", "商品类目", "品类", "分类", "商品分类", "一级类目", "二级类目"],
    contains: ["类目", "分类", "品类"],
  },
  {
    field: "price",
    exact: ["价格", "售价", "单价", "商品价格", "标价", "成交均价"],
    contains: ["价格", "售价", "单价"],
  },
  {
    field: "sales_7d",
    exact: ["销量", "近7天销量", "7天销量", "周销量", "近一周销量", "近7日销量", "销量(近7天)", "近7天销售", "支付件数"],
    contains: ["销量", "销售"],
  },
  {
    field: "gmv_7d",
    exact: ["GMV", "近7天GMV", "7天GMV", "成交金额", "近7天成交", "交易额", "支付金额", "成交额", "销售额", "近7天销售额", "gmv"],
    contains: ["gmv", "GMV", "成交", "交易", "销售"],
  },
  {
    field: "sales_growth_rate",
    exact: ["销量增长率", "销量增长", "销量环比", "销售增长率", "近7天销量增长率", "销量涨幅"],
    contains: ["销量增", "销售增"],
  },
  {
    field: "gmv_growth_rate",
    exact: ["GMV增长率", "GMV增长", "成交增长率", "交易额增长率", "近7天GMV增长率", "销售额增长率"],
    contains: ["GMV增", "gmv增", "成交增", "交易增"],
  },
  {
    field: "comment_growth_rate",
    exact: ["评论增长率", "评论增长", "评价增长率", "评论数增长率"],
    contains: ["评论增", "评价增"],
  },
  {
    field: "favorite_growth_rate",
    exact: ["收藏增长率", "收藏增长", "收藏数增长率", "加购增长率"],
    contains: ["收藏增", "加购增"],
  },
  {
    field: "profit_margin_estimate",
    exact: ["利润率", "毛利率", "利润率估算", "预估利润率", "利润空间"],
    contains: ["利润", "利率"],
  },
  {
    field: "competition_level",
    exact: ["竞争度", "竞争水平", "竞争强度", "竞争等级", "竞争"],
    contains: ["竞争"],
  },
  {
    field: "platform",
    exact: ["平台", "来源平台", "数据来源", "渠道", "销售平台"],
    contains: ["平台", "来源"],
  },
];

/* ================================================================
   模式识别
   ================================================================ */

/**
 * 检测数据模式：ad_data | live_review | product_trend
 */
export function detectProductTrendMode(headers: string[]): {
  mode: DataMode;
  confidence: number;
  matchedFields: string[];
} {
  const lowerHeaders = headers.map(h => h.toLowerCase().trim());

  // 检测 product_trend：商品名称 + 价格 + 销量
  const hasProductName = lowerHeaders.some(h =>
    h.includes("商品名") || h.includes("标题") || h.includes("产品名") || h === "名称"
  );
  const hasPrice = lowerHeaders.some(h =>
    h.includes("价格") || h.includes("售价") || h.includes("单价")
  );
  const hasSales = lowerHeaders.some(h =>
    h.includes("销量") || h.includes("销售") || h.includes("gmv")
  );
  const hasCategory = lowerHeaders.some(h =>
    h.includes("类目") || h.includes("分类") || h.includes("品类")
  );

  const productMatches: string[] = [];
  if (hasProductName) productMatches.push("商品名称");
  if (hasPrice) productMatches.push("价格");
  if (hasSales) productMatches.push("销量/GMV");
  if (hasCategory) productMatches.push("类目");

  // 强匹配：商品名称 + 价格 + (销量或GMV)
  if (hasProductName && hasPrice && hasSales) {
    let conf = 70;
    if (hasCategory) conf += 15;
    if (lowerHeaders.some(h => h.includes("增长率"))) conf += 10;
    return {
      mode: "product_trend",
      confidence: Math.min(100, conf),
      matchedFields: productMatches,
    };
  }

  // 中等匹配：商品标题 + 类目 + GMV
  if (hasProductName && hasCategory && hasSales) {
    return {
      mode: "product_trend",
      confidence: 60,
      matchedFields: productMatches,
    };
  }

  return { mode: "unknown", confidence: 0, matchedFields: [] };
}

/* ================================================================
   字段自动映射
   ================================================================ */

/**
 * 根据表头自动映射产品趋势字段
 */
export function autoMapProductFields(
  headers: string[],
  sampleRows: Record<string, string>[]
): ProductTrendFieldMapping[] {
  const lowerHeaders = headers.map((h, i) => ({ original: h, lower: h.toLowerCase().trim(), index: i }));

  const mapping: ProductTrendFieldMapping[] = headers.map((header, i) => ({
    header,
    field: null,
    confidence: "none",
    sample: sampleRows[0]?.[header] || "",
  }));

  for (const pattern of PRODUCT_FIELD_PATTERNS) {
    for (const entry of lowerHeaders) {
      if (mapping[entry.index]!.field) continue; // 已映射

      let mapped = false;
      // Exact match
      if (pattern.exact.some(e => e.toLowerCase() === entry.lower)) {
        mapped = true;
        mapping[entry.index] = {
          header: entry.original,
          field: pattern.field,
          confidence: "high",
          sample: sampleRows[0]?.[entry.original] || "",
        };
      }
      // Contains match
      if (!mapped && pattern.contains.some(c => entry.lower.includes(c.toLowerCase()))) {
        mapping[entry.index] = {
          header: entry.original,
          field: pattern.field,
          confidence: "medium",
          sample: sampleRows[0]?.[entry.original] || "",
        };
      }

      if (mapped) break;
    }
  }

  return mapping;
}

/* ================================================================
   数据标准化
   ================================================================ */

/**
 * 清理金额：去掉 ¥ ￥ 逗号 空格
 */
function cleanMoney(value: string): number {
  if (!value || !value.trim()) return 0;
  const cleaned = value.trim().replace(/[¥￥,$%\s，]/g, "");
  const num = Number(cleaned);
  return isNaN(num) || !isFinite(num) ? 0 : num;
}

/**
 * 清理百分比：17.58% → 17.58
 */
function cleanPercent(value: string): number {
  if (!value || !value.trim()) return 0;
  const cleaned = value.trim().replace(/[%\s]/g, "");
  const num = Number(cleaned);
  return isNaN(num) || !isFinite(num) ? 0 : num;
}

/**
 * 映射竞争度文本
 */
function mapCompetition(value: string): "低" | "中" | "高" {
  const v = value.trim().toLowerCase();
  if (v.includes("低") || v === "low" || v.includes("小")) return "低";
  if (v.includes("高") || v === "high" || v.includes("大")) return "高";
  return "中";
}

/**
 * 标准化产品趋势行数据
 */
export function transformProductTrendRows(
  records: Record<string, string>[],
  mapping: ProductTrendFieldMapping[]
): { rows: ProductTrendRow[]; errors: string[] } {
  const fieldMap = new Map<string, string>();
  for (const m of mapping) {
    if (m.field) fieldMap.set(m.header, m.field);
  }

  const rows: ProductTrendRow[] = [];
  const errors: string[] = [];

  for (let i = 0; i < records.length; i++) {
    const rec = records[i]!;
    const row: ProductTrendRow = {
      product_name: "",
      category: "",
      price: 0,
      sales_7d: 0,
      gmv_7d: 0,
      sales_growth_rate: 0,
      gmv_growth_rate: 0,
      comment_growth_rate: 0,
      favorite_growth_rate: 0,
      profit_margin_estimate: 0,
      competition_level: "中",
      platform: "",
    };

    for (const [header, value] of Object.entries(rec)) {
      const field = fieldMap.get(header);
      if (!field) continue;

      switch (field) {
        case "product_name":
        case "category":
        case "platform":
          row[field] = String(value || "").trim();
          break;
        case "price":
        case "sales_7d":
        case "gmv_7d":
          row[field] = cleanMoney(value);
          break;
        case "sales_growth_rate":
        case "gmv_growth_rate":
        case "comment_growth_rate":
        case "favorite_growth_rate":
          row[field] = cleanPercent(value);
          break;
        case "profit_margin_estimate":
          row.profit_margin_estimate = cleanPercent(value) / 100; // 存储为 0-1 小数
          break;
        case "competition_level":
          row.competition_level = mapCompetition(value);
          break;
      }
    }

    // 跳过空行
    if (!row.product_name) {
      continue;
    }

    rows.push(row);
  }

  return { rows, errors };
}

/**
 * 计算爆款指数
 */
export function calculateProductTrendHotScore(row: ProductTrendRow): number {
  let score = 0;

  // 销量增长率（30分）
  if (row.sales_growth_rate >= 300) score += 30;
  else if (row.sales_growth_rate >= 200) score += 25;
  else if (row.sales_growth_rate >= 100) score += 20;
  else if (row.sales_growth_rate >= 50) score += 15;
  else if (row.sales_growth_rate >= 0) score += 5;

  // GMV增长率（25分）
  if (row.gmv_growth_rate >= 300) score += 25;
  else if (row.gmv_growth_rate >= 200) score += 21;
  else if (row.gmv_growth_rate >= 100) score += 17;
  else if (row.gmv_growth_rate >= 50) score += 13;
  else if (row.gmv_growth_rate >= 0) score += 4;

  // 评论增长率（15分）
  if (row.comment_growth_rate >= 200) score += 15;
  else if (row.comment_growth_rate >= 100) score += 12;
  else if (row.comment_growth_rate >= 50) score += 9;
  else if (row.comment_growth_rate >= 0) score += 3;

  // 收藏增长率（10分）
  if (row.favorite_growth_rate >= 200) score += 10;
  else if (row.favorite_growth_rate >= 100) score += 8;
  else if (row.favorite_growth_rate >= 50) score += 6;
  else if (row.favorite_growth_rate >= 0) score += 2;

  // 利润空间（10分）
  if (row.profit_margin_estimate >= 0.6) score += 10;
  else if (row.profit_margin_estimate >= 0.4) score += 8;
  else if (row.profit_margin_estimate >= 0.25) score += 6;
  else if (row.profit_margin_estimate >= 0.1) score += 3;

  // 竞争度（10分，竞争越低分越高）
  if (row.competition_level === "低") score += 10;
  else if (row.competition_level === "中") score += 6;
  else score += 2;

  return Math.min(100, Math.max(0, score));
}

/**
 * 根据爆款指数判定趋势状态
 */
export function getTrendStatus(hotScore: number, salesGrowth: number): "爆发" | "上升" | "稳定" | "下降" {
  if (salesGrowth < 0) return "下降";
  if (hotScore >= 90 && salesGrowth >= 200) return "爆发";
  if (hotScore >= 80 || salesGrowth >= 100) return "上升";
  if (hotScore >= 60) return "稳定";
  return "下降";
}
