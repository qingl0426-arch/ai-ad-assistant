/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const platform = searchParams.get("platform") || "";
    const category = searchParams.get("category") || "";
    const priceMin = searchParams.get("priceMin");
    const priceMax = searchParams.get("priceMax");
    const hotScoreMin = searchParams.get("hotScoreMin");
    const sortBy = searchParams.get("sortBy") || "hot_score";
    const sortDir = searchParams.get("sortDir") || "desc";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const tab = searchParams.get("tab") || "hot";

    let query = (supabase.from("product_trends") as any)
      .select("*", { count: "exact" })
      .eq("user_id", user.id);

    // 筛选
    if (platform) query = query.eq("platform", platform);
    if (category) query = query.ilike("category", `%${category}%`);
    if (priceMin) query = query.gte("price", parseFloat(priceMin));
    if (priceMax) query = query.lte("price", parseFloat(priceMax));
    if (hotScoreMin) query = query.gte("hot_score", parseInt(hotScoreMin));

    // Tab 筛选
    switch (tab) {
      case "rising":
        query = query.gte("sales_growth_rate", 50).order("sales_growth_rate", { ascending: false });
        break;
      case "profit":
        query = query.gte("profit_margin_estimate", 0.25).order("profit_margin_estimate", { ascending: false });
        break;
      case "risk":
        query = query.eq("trend_status", "下降").order("hot_score", { ascending: true });
        break;
      case "low_competition":
        query = query.eq("competition_level", "低").order("hot_score", { ascending: false });
        break;
      default: // hot
        query = query.order(sortBy, { ascending: sortDir === "asc" });
    }

    // 分页
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: rows, error: queryError, count } = await query;

    if (queryError) {
      console.error("product_trends query error:", queryError);
      return NextResponse.json({
        error: "查询商品数据失败",
        errorCode: queryError.code,
        errorHint: queryError.hint || "",
        errorDetails: queryError.message || "",
      }, { status: 500 });
    }

    // 聚合统计
    const { data: allRows } = await (supabase.from("product_trends") as any)
      .select("trend_status, competition_level, platform, category")
      .eq("user_id", user.id);

    const stats = {
      total: count || 0,
      bursting: (allRows || []).filter((r: any) => r.trend_status === "爆发").length,
      rising: (allRows || []).filter((r: any) => r.trend_status === "上升").length,
      risk: (allRows || []).filter((r: any) => r.trend_status === "下降").length,
      platforms: [...new Set((allRows || []).map((r: any) => r.platform).filter(Boolean))] as string[],
      categories: [...new Set((allRows || []).map((r: any) => r.category).filter(Boolean))] as string[],
    };

    return NextResponse.json({
      rows: rows || [],
      stats,
      page,
      limit,
      total: count || 0,
    });

  } catch (err) {
    console.error("Product trends fetch error:", err);
    return NextResponse.json({
      error: "服务器错误",
      errorDetails: err instanceof Error ? err.message : "",
    }, { status: 500 });
  }
}
