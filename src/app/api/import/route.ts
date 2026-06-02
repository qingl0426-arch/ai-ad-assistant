import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { v4 as uuidv4 } from "uuid";
import {
  decodeBuffer, parseCSVToRecords, autoMapFields,
  transformAndValidate,
  type InternalField,
} from "@/lib/data-importer";

export const runtime = "nodejs";

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const platform = (formData.get("platform") as string) || "csv";
    const mappingStr = formData.get("mapping") as string;

    if (!file) return NextResponse.json({ error: "未选择文件" }, { status: 400 });

    // 1. Read file buffer and decode
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const content = decodeBuffer(buffer);

    // 2. Parse CSV
    const records = parseCSVToRecords(content);
    if (records.length === 0) {
      return NextResponse.json({ error: "文件为空或无法解析" }, { status: 400 });
    }

    // 3. Build field mapping
    let fieldMap: Record<string, string>;
    if (mappingStr) {
      try {
        fieldMap = JSON.parse(mappingStr);
      } catch {
        return NextResponse.json({ error: "映射数据格式错误" }, { status: 400 });
      }
    } else {
      // Auto-map
      const headers = Object.keys(records[0]!);
      const autoMapped = autoMapFields(headers);
      fieldMap = {};
      autoMapped.forEach(m => { if (m.field) fieldMap[m.header] = m.field; });
    }

    if (Object.keys(fieldMap).length === 0) {
      return NextResponse.json({ error: "没有可用的字段映射" }, { status: 400 });
    }

    // Build FieldMapping array for transformAndValidate
    const mapping = Object.entries(fieldMap).map(([header, field]) => ({
      header,
      field: field as InternalField,
      confidence: "high" as const,
      sample: records[0]?.[header] || "",
    }));

    // 4. Transform and validate
    const { rows, errors } = transformAndValidate(records, mapping);

    // 5. Insert into ad_traffic
    const batchId = uuidv4();
    const chunkSize = 500;
    let insertedCount = 0;

    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize).map(row => ({
        user_id: user.id,
        date: row.date,
        spend: row.spend,
        impressions: row.impressions,
        clicks: row.clicks,
        gmv: row.gmv,
        orders: row.orders,
        roi: row.roi,
        platform: String(row.platform || platform),
        campaign: String(row.campaign || ""),
        batch_id: batchId,
      }));

      const { error: insertErr } = await (supabase.from("ad_traffic") as any).insert(chunk);
      if (insertErr) {
        return NextResponse.json({ error: `数据库写入失败：${insertErr.message}` }, { status: 500 });
      }
      insertedCount += chunk.length;
    }

    // 6. Record upload batch
    try {
      await (supabase.from("upload_batches") as any).insert({
        user_id: user.id,
        filename: file.name,
        row_count: insertedCount,
        status: "success",
        platform,
        batch_id: batchId,
        errors: errors.length > 0 ? JSON.stringify(errors.slice(0, 100)) : null,
      });
    } catch { /* non-critical */ }

    return NextResponse.json({
      batchId,
      filename: file.name,
      totalRows: rows.length,
      successCount: insertedCount,
      errors: errors.length,
      platform,
    }, { status: 201 });

  } catch (err) {
    console.error("Import error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "服务器内部错误" },
      { status: 500 }
    );
  }
}
