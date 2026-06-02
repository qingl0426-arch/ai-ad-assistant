import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  generateFullReport, generateAIInsight,
  generateDailyReport, generateWeeklyReport,
  type AdRow,
} from "@/lib/ai-director";

// ── GET /api/director?mode=full|daily|weekly ──

export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const mode = url.searchParams.get("mode") || "full";

  const { data, error } = await supabase
    .from("ad_traffic")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data || data.length === 0) {
    return NextResponse.json({ error: "No data", message: "请先上传广告投放数据" }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: AdRow[] = data.map((r: any) => ({
    date: String(r.date || ""),
    platform: String(r.platform || "其他"),
    spend: Number(r.spend) || 0,
    impressions: Number(r.impressions) || 0,
    clicks: Number(r.clicks) || 0,
    gmv: Number(r.gmv) || 0,
    orders: Number(r.orders) || 0,
    roi: Number(r.roi) || 0,
  }));

  try {
    switch (mode) {
      case "daily": {
        const report = generateDailyReport(rows);
        return NextResponse.json({ success: true, data: report });
      }
      case "weekly": {
        const report = generateWeeklyReport(rows);
        return NextResponse.json({ success: true, data: report });
      }
      case "full":
      default: {
        const aiInsight = await generateAIInsight(rows);
        const report = generateFullReport(rows, aiInsight);
        return NextResponse.json({ success: true, data: report });
      }
    }
  } catch (err) {
    console.error("Director API error:", err);
    return NextResponse.json({ error: "分析失败，请稍后重试" }, { status: 500 });
  }
}