import type { CSVParsedRow, UploadError } from "@/types/database";

const REQUIRED_HEADERS = ["日期", "消耗", "曝光", "点击", "成交金额", "订单数", "ROI"];
const HEADER_MAP: Record<string, string> = {
  "日期": "date",
  "消耗": "spend",
  "曝光": "impressions",
  "点击": "clicks",
  "成交金额": "gmv",
  "订单数": "orders",
  "ROI": "roi",
  "平台": "platform",
  "计划": "campaign",
};

export interface ParsedCSV {
  rows: CSVParsedRow[];
  errors: UploadError[];
}

export function parseCSVContent(content: string): ParsedCSV {
  const rows: CSVParsedRow[] = [];
  const errors: UploadError[] = [];

  // Split and clean lines
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    return { rows, errors: [{ row: 0, message: "CSV 文件为空或只有表头" }] };
  }

  // Parse header
  const headers = parseCSVLine(lines[0]!);
  const headerIndex: Record<string, number> = {};

  for (let i = 0; i < headers.length; i++) {
    const h = headers[i]!.trim();
    const key = HEADER_MAP[h];
    if (key) headerIndex[key] = i;
  }

  // Validate required headers
  const missingHeaders = REQUIRED_HEADERS.filter((h) => !(HEADER_MAP[h]! in headerIndex));
  if (missingHeaders.length > 0) {
    return {
      rows,
      errors: [{ row: 0, message: `缺少必要列: ${missingHeaders.join(", ")}` }],
    };
  }

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]!);
    try {
      const row = parseRow(values, headerIndex, i + 1);
      if (row) rows.push(row);
    } catch (err) {
      errors.push({
        row: i + 1,
        message: err instanceof Error ? err.message : "解析失败",
      });
    }
  }

  return { rows, errors };
}

function parseRow(values: string[], headerIndex: Record<string, number>, rowNum: number): CSVParsedRow | null {
  const get = (key: string): string => {
    const idx = headerIndex[key];
    if (idx === undefined || idx >= values.length) return "";
    return values[idx]!.trim();
  };

  const dateStr = get("date");
  const spendStr = get("spend");
  const impressionsStr = get("impressions");
  const clicksStr = get("clicks");
  const gmvStr = get("gmv");
  const ordersStr = get("orders");
  const roiStr = get("roi");

  if (!dateStr) return null; // skip empty rows

  const spend = parseNumber(spendStr);
  const impressions = parseInt(impressionsStr, 10);
  const clicks = parseInt(clicksStr, 10);
  const gmv = parseNumber(gmvStr);
  const orders = parseInt(ordersStr, 10);
  const roi = parseNumber(roiStr);

  if (isNaN(spend) || isNaN(gmv)) {
    throw new Error(`第 ${rowNum} 行: 消耗或成交金额格式无效`);
  }

  // Validate date
  const dateRegex = /^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/;
  if (!dateRegex.test(dateStr)) {
    throw new Error(`第 ${rowNum} 行: 日期格式无效 (应为 YYYY-MM-DD)`);
  }

  const normalizedDate = dateStr.replace(/\//g, "-");

  return {
    date: normalizedDate,
    spend,
    impressions: isNaN(impressions) ? 0 : impressions,
    clicks: isNaN(clicks) ? 0 : clicks,
    gmv,
    orders: isNaN(orders) ? 0 : orders,
    roi: isNaN(roi) ? (spend > 0 ? (gmv - spend) / spend : 0) : roi,
    platform: get("platform") || undefined,
    campaign: get("campaign") || undefined,
  };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        result.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
  }
  result.push(current);
  return result;
}

function parseNumber(value: string): number {
  if (!value) return NaN;
  // Remove ¥, commas, spaces
  const cleaned = value.replace(/[¥￥,\s]/g, "");
  const num = parseFloat(cleaned);
  return num;
}
