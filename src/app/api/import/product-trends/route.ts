/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  detectProductTrendMode,
  autoMapProductFields,
  transformProductTrendRows,
  calculateProductTrendHotScore,
  getTrendStatus,
  type ProductTrendFieldMapping,
} from "@/lib/product-trend-importer";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "未选择文件" }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) {
      return NextResponse.json({ error: "文件为空或只有表头" }, { status: 400 });
    }

    const headers = parseCSVLine(lines[0]!);
    if (headers.length === 0) {
      return NextResponse.json({ error: "无法解析表头" }, { status: 400 });
    }

    const modeResult = detectProductTrendMode(headers);
    if (modeResult.mode !== "product_trend") {
      return NextResponse.json({
        error: "未识别为商品趋势数据",
        mode: modeResult.mode,
        confidence: modeResult.confidence,
        hint: "文件需包含：商品名称、价格、销量/GMV 等字段",
      }, { status: 400 });
    }

    const records: Record<string, string>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]!);
      if (values.length === 0) continue;
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => { row[h] = values[idx] || ""; });
      records.push(row);
    }

    if (records.length === 0) {
      return NextResponse.json({ error: "没有可导入的数据行" }, { status: 400 });
    }

    const mapping: ProductTrendFieldMapping[] = autoMapProductFields(headers, records.slice(0, 3));
    const mappedCount = mapping.filter(m => m.field).length;
    const confidence = Math.round((mappedCount / mapping.length) * 100);

    const { rows: productRows, errors } = transformProductTrendRows(records, mapping);

    if (productRows.length === 0) {
      return NextResponse.json({
        error: "数据标准化后无有效行",
        errors: errors.slice(0, 10),
      }, { status: 400 });
    }

    const insertRows = productRows.map(row => {
      const hotScore = calculateProductTrendHotScore(row);
      const trendStatus = getTrendStatus(hotScore, row.sales_growth_rate);
      return {
        user_id: user.id,
        product_name: row.product_name,
        category: row.category,
        price: row.price,
        sales_7d: Math.round(row.sales_7d),
        gmv_7d: row.gmv_7d,
        sales_growth_rate: row.sales_growth_rate,
        gmv_growth_rate: row.gmv_growth_rate,
        comment_growth_rate: row.comment_growth_rate,
        favorite_growth_rate: row.favorite_growth_rate,
        profit_margin_estimate: row.profit_margin_estimate,
        competition_level: row.competition_level,
        hot_score: hotScore,
        trend_status: trendStatus,
        platform: row.platform || "unknown",
        source: "import",
      };
    });

    const chunkSize = 200;
    let insertedCount = 0;

    for (let i = 0; i < insertRows.length; i += chunkSize) {
      const chunk = insertRows.slice(i, i + chunkSize);
      const { error: insertErr } = await (supabase.from("product_trends") as any).insert(chunk);
      if (insertErr) {
        console.error("product_trends insert error:", insertErr);
        return NextResponse.json({
          error: "商品数据写入失败",
          errorCode: insertErr.code,
          errorHint: insertErr.hint || "",
          errorDetails: insertErr.message || "",
        }, { status: 500 });
      }
      insertedCount += chunk.length;
    }

    return NextResponse.json({
      success: true,
      mode: "product_trend",
      confidence,
      mappedFields: mappedCount,
      totalFields: mapping.length,
      filename: file.name,
      totalRows: records.length,
      insertedCount,
      errorCount: errors.length,
      errors: errors.slice(0, 10),
      redirectUrl: "/product-radar",
    }, { status: 201 });

  } catch (err) {
    console.error("Product trend import error:", err);
    return NextResponse.json({
      error: err instanceof Error ? err.message : "服务器内部错误",
      errorCode: "UNKNOWN",
      errorHint: "导入过程中发生异常",
      errorDetails: err instanceof Error ? err.stack?.slice(0, 300) : "",
    }, { status: 500 });
  }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i]!;
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
  }
  result.push(current.trim());
  return result;
}
