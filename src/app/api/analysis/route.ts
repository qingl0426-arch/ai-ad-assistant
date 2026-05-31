import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeBatch, type ROIAnalysisInput } from "@/lib/roi-engine";

interface AdRow { spend: number; impressions: number; clicks: number; gmv: number; orders: number; roi: number; date: string; platform: string }

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("ad_traffic")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data || data.length === 0) return NextResponse.json({ error: "No data" }, { status: 404 });

  const rows = data as AdRow[];
  const inputs: ROIAnalysisInput[] = rows.map((r) => ({
    spend: r.spend,
    impressions: r.impressions,
    clicks: r.clicks,
    gmv: r.gmv,
    orders: r.orders,
    roi: r.roi,
    date: r.date,
    platform: r.platform || "其他",
  }));

  const result = analyzeBatch(inputs);
  return NextResponse.json(result);
}
