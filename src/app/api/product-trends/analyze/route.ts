/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeProductsWithAI } from "@/lib/ai-product-selector";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { data: products, error: queryError } = await (supabase.from("product_trends") as any)
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (queryError) {
      return NextResponse.json({
        error: "查询商品数据失败",
        errorDetails: queryError.message || "",
      }, { status: 500 });
    }

    if (!products || products.length === 0) {
      return NextResponse.json({
        summary: "暂无商品数据，请先上传商品趋势Excel",
        suggestions: [],
        generatedAt: new Date().toISOString(),
      });
    }

    const apiKey = process.env.OPENAI_API_KEY || "";

    // 调用分析（无 key 时自动走规则引擎兜底）
    const result = await analyzeProductsWithAI(products, apiKey);
    return NextResponse.json(result);

  } catch (err) {
    console.error("Product analysis error:", err);
    return NextResponse.json({
      error: "服务器错误",
      errorDetails: err instanceof Error ? err.message : "",
    }, { status: 500 });
  }
}
