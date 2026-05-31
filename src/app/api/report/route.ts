import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeBatch, type ROIAnalysisInput } from "@/lib/roi-engine";
import { analyzeStrategy, type StrategyInput } from "@/lib/ad-strategy";
import { generateAISuggestions } from "@/lib/openai.service";

interface AdRow { spend: number; impressions: number; clicks: number; gmv: number; orders: number; roi: number; date: string; platform: string; campaign: string }

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
  if (!data?.length) return NextResponse.json({ error: "No data" }, { status: 404 });

  const rows = data as AdRow[];

  // ROI Analysis
  const roiInputs: ROIAnalysisInput[] = rows.map((r) => ({
    spend: r.spend, impressions: r.impressions, clicks: r.clicks,
    gmv: r.gmv, orders: r.orders, roi: r.roi, date: r.date, platform: r.platform || "其他",
  }));
  const roiAnalysis = analyzeBatch(roiInputs);

  // Strategy
  const strategyInputs: StrategyInput[] = rows.map((r) => ({
    date: r.date, spend: r.spend, gmv: r.gmv, roi: r.roi, platform: r.platform || "其他",
  }));
  const strategy = analyzeStrategy(strategyInputs);

  // AI Suggestions (async, may fail gracefully)
  let aiSuggestions = null;
  try {
    aiSuggestions = await generateAISuggestions(roiInputs);
  } catch { /* ignore */ }

  // Totals
  const totals = rows.reduce((a, r) => ({
    spend: a.spend + r.spend, impressions: a.impressions + r.impressions,
    clicks: a.clicks + r.clicks, gmv: a.gmv + r.gmv, orders: a.orders + r.orders,
  }), { spend: 0, impressions: 0, clicks: 0, gmv: 0, orders: 0 });

  const report = {
    generatedAt: new Date().toISOString(),
    overview: {
      totalDays: rows.length,
      dateRange: { from: rows[0]?.date, to: rows[rows.length - 1]?.date },
      ...totals,
      roi: totals.spend > 0 ? (totals.gmv - totals.spend) / totals.spend : 0,
      ctr: totals.impressions > 0 ? totals.clicks / totals.impressions : 0,
    },
    roiAnalysis,
    strategy,
    aiSuggestions,
    platforms: [...new Set(rows.map((r) => r.platform || "其他"))],
    campaigns: [...new Set(rows.map((r) => r.campaign).filter(Boolean))],
    dailyData: rows.map((r) => ({
      date: r.date, spend: r.spend, impressions: r.impressions,
      clicks: r.clicks, gmv: r.gmv, orders: r.orders, roi: r.roi, platform: r.platform || "其他",
    })),
  };

  return NextResponse.json(report);
}
