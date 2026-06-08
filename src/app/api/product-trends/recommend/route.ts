/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { recommendProducts, detectScenario, type AdPerformance } from "@/lib/product-recommend";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // 1. 读取广告/直播表现（从参数或查询最新数据）
    const perf: AdPerformance = {
      recentRoi: searchParams.get("roi") ? parseFloat(searchParams.get("roi")!) : null,
      refundRate: searchParams.get("refundRate") ? parseFloat(searchParams.get("refundRate")!) : null,
      mainCategory: searchParams.get("category") || undefined,
    };

    // 如果没有传入参数，尝试从数据库读取最新数据
    if (perf.recentRoi == null && perf.refundRate == null) {
      const { data: adData } = await (supabase.from("ad_traffic") as any)
        .select("roi")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      if (adData && adData.length > 0) {
        const avgRoi = adData.reduce((sum: number, r: any) => sum + (r.roi || 0), 0) / adData.length;
        perf.recentRoi = avgRoi;
      }

      const { data: liveData } = await (supabase.from("live_review_data") as any)
        .select("refund_rate, live_gmv, refund_amount")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      if (liveData && liveData.length > 0) {
        const avgRefundRate = liveData.reduce((sum: number, r: any) => sum + (r.refund_rate || 0), 0) / liveData.length;
        perf.refundRate = avgRefundRate * 100; // 转百分比
      }
    }

    // 2. 读取商品趋势
    const { data: products } = await (supabase.from("product_trends") as any)
      .select("*")
      .eq("user_id", user.id)
      .order("hot_score", { ascending: false })
      .limit(50);

    // 3. 生成推荐
    const result = recommendProducts(products || [], perf, perf.mainCategory);
    return NextResponse.json(result);

  } catch (err) {
    console.error("Recommend error:", err);
    return NextResponse.json({
      error: "服务器错误",
      errorDetails: err instanceof Error ? err.message : "",
    }, { status: 500 });
  }
}
