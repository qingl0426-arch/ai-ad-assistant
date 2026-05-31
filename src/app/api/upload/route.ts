import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseCSVContent } from "@/lib/csv-parser";
import { v4 as uuidv4 } from "uuid";

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!file.name.endsWith(".csv")) return NextResponse.json({ error: "仅支持 CSV 文件" }, { status: 400 });

    const content = await file.text();
    const { rows, errors } = parseCSVContent(content);
    if (rows.length === 0 && errors.length > 0) {
      return NextResponse.json({ error: errors[0]?.message || "解析失败" }, { status: 422 });
    }

    const batchId = uuidv4();
    const chunkSize = 500;
    let insertedCount = 0;

    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize).map((row) => ({
        user_id: user.id,
        date: row.date,
        spend: row.spend,
        impressions: row.impressions,
        clicks: row.clicks,
        gmv: row.gmv,
        orders: row.orders,
        roi: row.roi,
        platform: row.platform || "",
        campaign: row.campaign || "",
        batch_id: batchId,
      }));

      const { error: insertError } = await supabase.from("ad_traffic").insert(chunk as any);
      if (insertError) return NextResponse.json({ error: `数据库写入失败: ${insertError.message}` }, { status: 500 });
      insertedCount += chunk.length;
    }

    await supabase.from("upload_batches").insert({
      user_id: user.id,
      filename: file.name,
      row_count: insertedCount,
      status: errors.length > 0 ? "partial" : "success",
      errors: errors.length > 0 ? errors : [],
    } as any);

    return NextResponse.json({
      batchId, filename: file.name, totalRows: rows.length + errors.length,
      successCount: insertedCount, errorCount: errors.length, errors,
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "服务器错误" }, { status: 500 });
  }
}
