import { NextRequest, NextResponse } from "next/server";
import { getAlipay } from "@/lib/alipay/server";
import { createClient } from "@/lib/supabase/server";

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const formData = await request.formData();
  const params: Record<string, string> = {};
  formData.forEach((value, key) => { params[key] = value.toString(); });

  const alipay = getAlipay();
  if (!alipay.checkNotifySign(params)) {
    return new NextResponse("fail", { status: 400 });
  }

  const tradeStatus = params.trade_status;
  const outTradeNo = params.out_trade_no;

  if (tradeStatus === "TRADE_SUCCESS" || tradeStatus === "TRADE_FINISHED") {
    const { data: orders } = await (supabase.from("alipay_orders") as any)
      .select("*").eq("out_trade_no", outTradeNo).limit(1);

    const order = orders?.[0];
    if (!order) return new NextResponse("fail", { status: 404 });
    if (order.status === "paid") return new NextResponse("success");

    await (supabase.from("alipay_orders") as any)
      .update({ status: "paid", paid_at: new Date().toISOString(), trade_no: params.trade_no })
      .eq("out_trade_no", outTradeNo);

    await (supabase.from("user_profiles") as any).upsert({
      id: order.user_id, plan: order.plan, plan_updated_at: new Date().toISOString(),
    });
  }

  return new NextResponse("success");
}
