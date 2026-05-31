import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateAISuggestions } from "@/lib/openai.service";

interface AdRow { spend: number; impressions: number; clicks: number; gmv: number; orders: number; roi: number; date: string; platform: string }

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OpenAI API Key 未配置，请在 .env.local 中设置 OPENAI_API_KEY" }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("ad_traffic")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data || data.length === 0) return NextResponse.json({ error: "No data" }, { status: 404 });

  const rows = data as AdRow[];
  const inputs = rows.map((r) => ({
    spend: r.spend,
    impressions: r.impressions,
    clicks: r.clicks,
    gmv: r.gmv,
    orders: r.orders,
    roi: r.roi,
    date: r.date,
    platform: r.platform || "其他",
  }));

  try {
    const result = await generateAISuggestions(inputs);
    return NextResponse.json(result);
  } catch (err) {
    console.error("AI suggest error:", err);
    return NextResponse.json({ error: "AI 分析失败，请稍后重试" }, { status: 500 });
  }
}
