import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAlipay, generateOutTradeNo } from "@/lib/alipay/server";
import { PLANS, type PlanTier } from "@/lib/alipay/config";
import { logPaymentEvent } from "@/lib/alipay/logger";

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json() as { plan: PlanTier; payType?: "page" | "qr" | "wap" };
  const { plan, payType = "qr" } = body;

  if (!plan || !PLANS[plan]) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  if (plan === "free") {
    await (supabase.from("user_profiles") as any).upsert({
      id: user.id, plan: "free", plan_updated_at: new Date().toISOString(),
    });

    await logPaymentEvent({
      event: "payment_success", user_id: user.id, plan: "free", amount: 0,
    });

    return NextResponse.json({ success: true, plan: "free" });
  }

  const planConfig = PLANS[plan];
  const outTradeNo = generateOutTradeNo();
  const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "https://wqaihub.cn";

  await (supabase.from("alipay_orders") as any).insert({
    out_trade_no: outTradeNo, user_id: user.id, plan,
    amount: planConfig.price, status: "pending",
  });

  await logPaymentEvent({
    event: "checkout_create", out_trade_no: outTradeNo,
    user_id: user.id, plan, amount: planConfig.price, payload: { payType },
  });

  const baseParams = {
    out_trade_no: outTradeNo,
    total_amount: planConfig.priceYuan,
    subject: `AI Ad Assistant - ${planConfig.name}`,
    body: `订阅${planConfig.name}套餐`,
  };

  const alipay = getAlipay();

  try {
    if (payType === "page") {
      const result = alipay.pageExec("alipay.trade.page.pay", {
        method: "GET",
        bizContent: { ...baseParams, product_code: "FAST_INSTANT_TRADE_PAY" },
        returnUrl: `${origin}/dashboard?alipay=success`,
        notifyUrl: `${origin}/api/alipay/notify`,
      });
      return NextResponse.json({ url: result });
    }

    if (payType === "wap") {
      const result = alipay.pageExec("alipay.trade.wap.pay", {
        method: "GET",
        bizContent: { ...baseParams, product_code: "QUICK_WAP_WAY", quit_url: `${origin}/pricing` },
        returnUrl: `${origin}/dashboard?alipay=success`,
        notifyUrl: `${origin}/api/alipay/notify`,
      });
      return NextResponse.json({ url: result });
    }

    const result = await alipay.exec("alipay.trade.precreate", {
      bizContent: baseParams,
      notifyUrl: `${origin}/api/alipay/notify`,
    });

    return NextResponse.json({ qrCode: result.qrCode || result.qr_code, outTradeNo });
  } catch (err: any) {
    const message = err?.message || "支付宝接口调用失败";
    console.error("Alipay error:", err);

    await logPaymentEvent({
      event: "checkout_error", out_trade_no: outTradeNo,
      user_id: user.id, plan, amount: planConfig.price, error: message,
    });

    return NextResponse.json({ error: message }, { status: 500 });
  }
}