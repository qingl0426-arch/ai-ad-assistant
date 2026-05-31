import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAlipay } from "@/lib/alipay/server";

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const outTradeNo = request.nextUrl.searchParams.get("out_trade_no");
  if (!outTradeNo) return NextResponse.json({ error: "Missing out_trade_no" }, { status: 400 });

  const { data: orders } = await (supabase.from("alipay_orders") as any)
    .select("*").eq("out_trade_no", outTradeNo).eq("user_id", user.id).limit(1);

  const order = orders?.[0];
  if (order?.status === "paid") return NextResponse.json({ status: "paid", plan: order.plan });

  try {
    const alipay = getAlipay();
    const result = await alipay.exec("alipay.trade.query", {
      bizContent: { out_trade_no: outTradeNo },
    });

    if (result.tradeStatus === "TRADE_SUCCESS" || result.tradeStatus === "TRADE_FINISHED") {
      await (supabase.from("alipay_orders") as any)
        .update({ status: "paid", paid_at: new Date().toISOString(), trade_no: result.tradeNo })
        .eq("out_trade_no", outTradeNo);

      await (supabase.from("user_profiles") as any).upsert({
        id: user.id, plan: order?.plan || "pro", plan_updated_at: new Date().toISOString(),
      });
      return NextResponse.json({ status: "paid", plan: order?.plan });
    }
    return NextResponse.json({ status: order?.status || "pending" });
  } catch {
    return NextResponse.json({ status: order?.status || "pending" });
  }
}
