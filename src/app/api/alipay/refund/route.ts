import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAlipay } from "@/lib/alipay/server";
import { logPaymentEvent } from "@/lib/alipay/logger";

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json() as {
    out_trade_no: string; refund_amount?: number; reason?: string;
  };
  const { out_trade_no, refund_amount, reason = "用户申请退款" } = body;

  if (!out_trade_no) {
    return NextResponse.json({ error: "缺少订单号" }, { status: 400 });
  }

  const { data: orders } = await (supabase.from("alipay_orders") as any)
    .select("*").eq("out_trade_no", out_trade_no).eq("user_id", user.id).limit(1);

  const order = orders?.[0];
  if (!order) {
    await logPaymentEvent({
      event: "refund_error", out_trade_no, user_id: user.id, error: "订单不存在",
    });
    return NextResponse.json({ error: "订单不存在" }, { status: 404 });
  }

  if (order.status !== "paid") {
    await logPaymentEvent({
      event: "refund_error", out_trade_no, user_id: user.id,
      plan: order.plan, amount: order.amount,
      error: `订单状态不允许退款: ${order.status}`,
    });
    return NextResponse.json({
      error: `订单状态不允许退款，当前状态: ${order.status}`,
    }, { status: 400 });
  }

  const refundAmount = refund_amount ?? order.amount;
  const refundOutRequestNo = `${out_trade_no}_refund_${Date.now()}`;

  await (supabase.from("alipay_orders") as any)
    .update({
      status: "refunding", refund_no: refundOutRequestNo,
      refund_amount: refundAmount, refund_reason: reason,
    })
    .eq("out_trade_no", out_trade_no);

  await logPaymentEvent({
    event: "refund_create", out_trade_no, user_id: user.id,
    plan: order.plan, amount: refundAmount,
    payload: { reason, refund_out_request_no: refundOutRequestNo },
  });

  try {
    const alipay = getAlipay();
    const result = await alipay.exec("alipay.trade.refund", {
      bizContent: {
        out_trade_no,
        refund_amount: refundAmount.toFixed(2),
        refund_reason: reason,
        out_request_no: refundOutRequestNo,
      },
    });

    const fundChange = result.fundChange || result.fund_change;

    if (fundChange === "Y") {
      await (supabase.from("alipay_orders") as any)
        .update({ status: "refunded", refunded_at: new Date().toISOString() })
        .eq("out_trade_no", out_trade_no);

      await (supabase.from("user_profiles") as any).upsert({
        id: order.user_id, plan: "free", plan_updated_at: new Date().toISOString(),
      });

      await logPaymentEvent({
        event: "refund_success", out_trade_no, user_id: order.user_id,
        plan: order.plan, amount: refundAmount, result: JSON.stringify(result),
      });

      return NextResponse.json({
        success: true, message: "退款成功",
        refundAmount, refundTime: new Date().toISOString(),
      });
    }

    await logPaymentEvent({
      event: "refund_create", out_trade_no, user_id: order.user_id,
      plan: order.plan, amount: refundAmount, result: "退款处理中，请稍后查询",
    });

    return NextResponse.json({
      success: true, message: "退款申请已提交，处理中", refundAmount,
    });
  } catch (err: any) {
    const message = err?.message || "退款接口调用失败";

    await (supabase.from("alipay_orders") as any)
      .update({ status: "paid", refund_no: null, refund_amount: null, refund_reason: null })
      .eq("out_trade_no", out_trade_no);

    await logPaymentEvent({
      event: "refund_error", out_trade_no, user_id: user.id,
      plan: order.plan, amount: refundAmount, error: message,
    });

    console.error("Alipay refund error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}