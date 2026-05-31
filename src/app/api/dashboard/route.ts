import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface AdRow { date: string; spend: number; impressions: number; clicks: number; gmv: number; orders: number; roi: number; platform: string }
interface TotalsAcc { spend: number; impressions: number; clicks: number; gmv: number; orders: number }

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
  if (!data || data.length === 0) return NextResponse.json({ totals: null, daily: [], platforms: [] });

  const rows = data as AdRow[];

  const totals: TotalsAcc = { spend: 0, impressions: 0, clicks: 0, gmv: 0, orders: 0 };
  for (const r of rows) {
    totals.spend += r.spend;
    totals.impressions += r.impressions;
    totals.clicks += r.clicks;
    totals.gmv += r.gmv;
    totals.orders += r.orders;
  }

  const daily = rows.map((r) => ({
    date: r.date,
    spend: r.spend,
    gmv: r.gmv,
    roi: r.roi,
    orders: r.orders,
    impressions: r.impressions,
    clicks: r.clicks,
  }));

  const platformMap: Record<string, TotalsAcc> = {};
  for (const r of rows) {
    const p = r.platform || "其他";
    if (!platformMap[p]) platformMap[p] = { spend: 0, impressions: 0, clicks: 0, gmv: 0, orders: 0 };
    platformMap[p].spend += r.spend;
    platformMap[p].gmv += r.gmv;
    platformMap[p].orders += r.orders;
  }

  const platforms = Object.entries(platformMap).map(([name, v]) => ({
    name,
    spend: v.spend,
    gmv: v.gmv,
    roi: v.spend > 0 ? (v.gmv - v.spend) / v.spend : 0,
    orders: v.orders,
  }));

  const roi = totals.spend > 0 ? (totals.gmv - totals.spend) / totals.spend : 0;
  const ctr = totals.impressions > 0 ? totals.clicks / totals.impressions : 0;

  return NextResponse.json({
    totals: { spend: totals.spend, impressions: totals.impressions, clicks: totals.clicks, gmv: totals.gmv, orders: totals.orders, roi, ctr },
    daily,
    platforms,
  });
}
