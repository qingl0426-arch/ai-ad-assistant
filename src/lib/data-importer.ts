// ── 智能数据导入引擎 v2 ──
// 编码检测 · 字段映射 · 日期解析 · 数据校验

import Papa from "papaparse";
import iconv from "iconv-lite";

// ── 类型定义 ──

export type Platform =
  | "juliang" | "qianchuan" | "douyin" | "shipinhao"
  | "kuaishou" | "tencent" | "alibaba" | "csv";

export type InternalField = "date" | "spend" | "impressions" | "clicks" | "gmv" | "orders" | "roi" | "platform" | "campaign";

export interface PlatformInfo {
  id: Platform; name: string; icon: string; description: string;
}

export interface FieldMapping {
  header: string;          // 原始表头
  field: InternalField | null;  // 映射到的内部字段
  confidence: "high" | "medium" | "low" | "none";
  sample: string;          // 样本数据
}

export interface ImportPreview {
  headers: string[];
  mapping: FieldMapping[];
  rows: Record<string, string>[];
  totalRows: number;
  detectedPlatform: Platform;
  detectedEncoding: string;
  warnings: string[];
}

export interface ValidationError {
  row: number; field: string; value: string; message: string;
}

export interface StandardRow {
  date: string; spend: number; impressions: number; clicks: number;
  gmv: number; orders: number; roi: number; platform: string; campaign: string;
}

// ── 平台信息 ──

export const PLATFORMS: PlatformInfo[] = [
  { id: "juliang", name: "巨量引擎", icon: "📊", description: "字节跳动广告投放平台" },
  { id: "qianchuan", name: "千川", icon: "🚀", description: "抖音电商广告投放" },
  { id: "douyin", name: "抖音直播", icon: "🎬", description: "抖音直播数据看板" },
  { id: "shipinhao", name: "视频号", icon: "📱", description: "微信视频号直播" },
  { id: "kuaishou", name: "快手磁力", icon: "⚡", description: "快手磁力引擎" },
  { id: "tencent", name: "腾讯广告", icon: "💼", description: "腾讯广告投放平台" },
  { id: "alibaba", name: "阿里巴巴", icon: "🛒", description: "阿里巴巴/万相台" },
  { id: "csv", name: "通用导入", icon: "📄", description: "CSV / Excel 通用格式" },
];

// ── 字段模式库：中文表头 → 内部字段 ──

const FIELD_PATTERNS: { field: InternalField; patterns: RegExp[] }[] = [
  {
    field: "date",
    patterns: [
      /^(日期|推广日期|统计日期|时间|创建时间|投放日期|直播日期|消耗日期|报表日期|数据日期)$/,
      /^(date|day|time|日期|时间)$/i,
    ],
  },
  {
    field: "spend",
    patterns: [
      /^(消耗|花费|总消耗|广告花费|现金消耗|投放消耗|消耗\(元\)|花费\(元\)|总花费|投放金额|广告消耗)$/,
      /^(spend|cost|消耗|花费)$/i,
    ],
  },
  {
    field: "impressions",
    patterns: [
      /^(曝光|展示|展示次数|曝光量|展现量|曝光次数|展示量|展现次数|观看次数|观看量|观看人数|曝光人数)$/,
      /^(impression|impressions|展示|曝光)$/i,
    ],
  },
  {
    field: "clicks",
    patterns: [
      /^(点击|点击数|点击次数|点击量|互动次数|互动|评论数|点赞)$/,
      /^(click|clicks|点击)$/i,
    ],
  },
  {
    field: "gmv",
    patterns: [
      /^(成交金额|支付金额|GMV|销售额|成交额|总成交金额|转化金额|交易额|下单金额|直接成交金额|直播GMV|支付金额|总支付金额)$/,
      /^(gmv|revenue|amount|金额|成交)$/i,
    ],
  },
  {
    field: "orders",
    patterns: [
      /^(订单数|支付订单数|成交订单数|支付笔数|订单量|成交单数|成交订单|成交笔数|下单量|转化数|成交单量)$/,
      /^(order|orders|订单)$/i,
    ],
  },
  {
    field: "roi",
    patterns: [
      /^(ROI|投产比|投入产出比|支付ROI|下单ROI|产出比)$/,
      /^(roi|投产)$/i,
    ],
  },
  {
    field: "platform",
    patterns: [
      /^(平台|推广平台|投放平台|来源平台|广告平台)$/,
      /^(platform|平台)$/i,
    ],
  },
  {
    field: "campaign",
    patterns: [
      /^(广告计划|计划名称|推广计划|广告组|广告名称|计划|广告|推广)$/,
      /^(campaign|计划)$/i,
    ],
  },
];

// ── 编码检测 ──

export function detectEncoding(buffer: Buffer): string {
  // Check BOM
  if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
    return "utf8-bom";
  }
  if (buffer[0] === 0xFF && buffer[1] === 0xFE) return "utf16-le";
  if (buffer[0] === 0xFE && buffer[1] === 0xFF) return "utf16-be";

  // Try UTF-8 first
  try {
    const utf8 = buffer.toString("utf8");
    // Check if it looks like valid UTF-8 by testing round-trip
    const back = Buffer.from(utf8, "utf8");
    if (back.equals(buffer)) return "utf8";
  } catch { /* fall through */ }

  // Try GBK family — use heuristic: if many bytes are in GBK range, it"s likely GBK
  let gbkScore = 0;
  let total = 0;
  for (let i = 0; i < buffer.length; i++) {
    const b = buffer[i];
    if (b === undefined) continue;
    total++;
    if (b > 0x7F) {
      // High byte: likely multi-byte in GBK
      const next = buffer[i + 1];
      if (next !== undefined && next >= 0x40 && next <= 0xFE) {
        gbkScore++;
        i++; // skip next byte
      }
    }
  }
  if (total > 0 && gbkScore / total > 0.02) return "gbk";

  return "utf8";
}

export function decodeBuffer(buffer: Buffer): string {
  const enc = detectEncoding(buffer);
  if (enc === "utf8-bom") return buffer.slice(3).toString("utf8");
  if (enc.startsWith("utf16")) return buffer.toString(enc as BufferEncoding);
  if (enc === "gbk" || enc === "gb2312" || enc === "gb18030") {
    return iconv.decode(buffer, "gbk");
  }
  return buffer.toString("utf8");
}

// ── CSV 解析 ──

export function parseCSV(content: string) {
  const result = Papa.parse<string[]>(content, {
    skipEmptyLines: true,
  });

  if (result.errors.length > 0) {
    // Non-fatal errors logged but we continue
    console.warn("CSV parse warnings:", result.errors.slice(0, 3));
  }

  return result;
}

export function parseCSVToRecords(content: string): Record<string, string>[] {
  const parsed = Papa.parse<string[]>(content, {
    skipEmptyLines: true,
  });

  if (parsed.data.length < 2) return [];

  const headers = parsed.data[0]!.map(h => h.trim()).filter(h => h.length > 0);
  if (headers.length === 0) return [];

  return parsed.data.slice(1)
    .filter(row => row.some(cell => (cell || "").trim()))
    .map(row => {
      const rec: Record<string, string> = {};
      headers.forEach((h, i) => {
        rec[h] = (row[i] || "").trim();
      });
      return rec;
    });
}

// ── 日期解析 ──

export function parseDate(value: string): string | null {
  if (!value || !value.trim()) return null;
  const v = value.trim();

  // Already ISO-like: 2025-06-01 or 2025-06-01 22:00 or 2025-06-01 22:00:00
  const isoMatch = v.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/);
  if (isoMatch) {
    const [, y, m, d, hh = "00", mm = "00", ss = "00"] = isoMatch;
    if (y && m && d) return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
  }

  // Slash format: 2025/06/01 or 2025/06/01 22:00
  const slashMatch = v.match(/^(\d{4})\/(\d{2})\/(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/);
  if (slashMatch) {
    const [, y, m, d, hh = "00", mm = "00", ss = "00"] = slashMatch;
    if (y && m && d) return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
  }

  // Chinese format: 2025年06月01日
  const cnMatch = v.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日$/);
  if (cnMatch) {
    const [, y, m, d] = cnMatch;
    if (y && m && d) return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")} 00:00:00`;
  }

  // Try native Date parsing as fallback
  const dt = new Date(v);
  if (!isNaN(dt.getTime())) {
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const d = String(dt.getDate()).padStart(2, "0");
    const hh = String(dt.getHours()).padStart(2, "0");
    const mm = String(dt.getMinutes()).padStart(2, "0");
    const ss = String(dt.getSeconds()).padStart(2, "0");
    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
  }

  return null;
}

// ── 字段自动映射 ──

export function autoMapFields(headers: string[]): FieldMapping[] {
  return headers.map((header) => {
    const clean = header.trim();
    let bestField: InternalField | null = null;
    let bestConfidence: FieldMapping["confidence"] = "none";

    for (const { field, patterns } of FIELD_PATTERNS) {
      for (const pattern of patterns) {
        if (pattern.test(clean)) {
          bestField = field;
          // Exact match = high, regex match = medium
          bestConfidence = pattern.source.startsWith("^(") && pattern.source.includes(clean)
            ? "high" : "medium";
          break;
        }
      }
      if (bestField) break;
    }

    return {
      header: clean,
      field: bestField,
      confidence: bestConfidence,
      sample: "",
    };
  });
}

// ── 平台检测 ──

export function detectPlatform(headers: string[]): Platform {
  const platformSignatures: { platform: Platform; keywords: string[] }[] = [
    { platform: "qianchuan", keywords: ["千川", "巨量千川", "千川广告"] },
    { platform: "juliang", keywords: ["巨量引擎", "巨量广告", "字节跳动"] },
    { platform: "douyin", keywords: ["抖音", "抖店", "直播数据"] },
    { platform: "kuaishou", keywords: ["快手", "磁力引擎", "磁力金牛"] },
    { platform: "tencent", keywords: ["腾讯广告", "广点通", "微信广告"] },
    { platform: "alibaba", keywords: ["阿里巴巴", "万相台", "直通车", "引力魔方"] },
    { platform: "shipinhao", keywords: ["视频号", "微信视频号"] },
  ];

  let bestScore = 0;
  let bestPlatform: Platform = "csv";

  for (const { platform, keywords } of platformSignatures) {
    let score = 0;
    for (const kw of keywords) {
      if (headers.some(h => h.includes(kw))) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      bestPlatform = platform;
    }
  }

  return bestPlatform;
}

// ── 完整预览生成 ──

export function generatePreview(
  buffer: Buffer,
  _filename: string
): { preview: ImportPreview; error?: string } {
  try {
    // 1. Decode
    const encoding = detectEncoding(buffer);
    const content = decodeBuffer(buffer);

    // 2. Parse
    const records = parseCSVToRecords(content);
    if (records.length === 0) {
      return { preview: {} as ImportPreview, error: "文件为空或无法解析，请检查文件格式" };
    }

    const headers = Object.keys(records[0]!);

    // 3. Auto-map fields
    const mapping = autoMapFields(headers);
    const samples = records.slice(0, 10).map(row =>
      headers.map(h => row[h] || "")
    );

    // Add samples to mapping
    const mappingWithSamples = mapping.map((m, i) => ({
      ...m,
      sample: samples[0]?.[i] || "",
    }));

    // 4. Detect platform
    const detectedPlatform = detectPlatform(headers);

    // 5. Generate warnings
    const warnings: string[] = [];
    const requiredFields: InternalField[] = ["date", "spend", "gmv"];
    for (const field of requiredFields) {
      if (!mapping.some(m => m.field === field)) {
        warnings.push(`缺少必填字段映射：${field === "date" ? "日期" : field === "spend" ? "消耗" : "成交金额"}，请手动指定`);
      }
    }

    // Check for encoding hints
    if (encoding === "gbk") {
      warnings.push("检测到 GBK 编码，已自动转换为 UTF-8");
    }
    if (encoding === "utf8-bom") {
      warnings.push("检测到 UTF-8 BOM 头，已自动处理");
    }

    return {
      preview: {
        headers,
        mapping: mappingWithSamples,
        rows: records.slice(0, 10),
        totalRows: records.length,
        detectedPlatform,
        detectedEncoding: encoding,
        warnings,
      },
    };
  } catch (err) {
    return {
      preview: {} as ImportPreview,
      error: `解析文件失败：${err instanceof Error ? err.message : "未知错误"}`,
    };
  }
}

// ── 数据转换与校验 ──

export function transformAndValidate(
  records: Record<string, string>[],
  mapping: FieldMapping[],
): { rows: StandardRow[]; errors: ValidationError[] } {
  // Build lookup: header → internal field
  const fieldMap = new Map<string, InternalField>();
  for (const m of mapping) {
    if (m.field) fieldMap.set(m.header, m.field);
  }

  const rows: StandardRow[] = [];
  const errors: ValidationError[] = [];

  for (let i = 0; i < records.length; i++) {
    const rec = records[i]!;
    const row: StandardRow = {
      date: "",
      spend: 0,
      impressions: 0,
      clicks: 0,
      gmv: 0,
      orders: 0,
      roi: 0,
      platform: "",
      campaign: "",
    };

    for (const [header, value] of Object.entries(rec)) {
      const field = fieldMap.get(header);
      if (!field) continue;

      switch (field) {
        case "date": {
          const parsed = parseDate(value);
          if (parsed) row.date = parsed;
          else errors.push({ row: i + 2, field: header, value, message: "日期格式无法识别" });
          break;
        }
        case "spend":
        case "impressions":
        case "clicks":
        case "gmv":
        case "orders":
        case "roi":
          row[field] = parseNumber(value);
          break;
        case "platform":
        case "campaign":
          row[field] = value;
          break;
      }
    }

    // Skip rows with no date (likely header rows in data)
    if (!row.date) {
      // Only error if we have a date field mapped
      if (fieldMap.size > 0 && [...fieldMap.values()].some(v => v === "date")) {
        // Row without date is acceptable — use default
        row.date = new Date().toISOString().slice(0, 10) + " 00:00:00";
      }
    }

    rows.push(row);
  }

  return { rows, errors };
}

function parseNumber(value: string): number {
  if (!value || !value.trim()) return 0;
  const cleaned = value.trim().replace(/[,，￥¥$%\s]/g, "");
  const num = Number(cleaned);
  return isNaN(num) ? 0 : num;
}
