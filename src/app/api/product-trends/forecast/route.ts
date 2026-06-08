/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { forecastProducts } from "@/lib/product-forecast";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { data: products, error: queryError } = await (supabase.from("product_trends") as any)
      .select("*")
      .eq("user_id", user.id)
      .order("hot_score", { ascending: false })
      .limit(50);

    if (queryError) {
      return NextResponse.json({
        error: "查询商品数据失败",
        errorDetails: queryError.message || "",
      }, { status: 500 });
    }

    const result = forecastProducts(products || []);
    return NextResponse.json(result);

  } catch (err) {
    console.error("Forecast error:", err);
    return NextResponse.json({
      error: "服务器错误",
      errorDetails: err instanceof Error ? err.message : "",
    }, { status: 500 });
  }
}
