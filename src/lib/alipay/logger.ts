import { createClient } from "@/lib/supabase/server";
import type { PaymentEventType, Json } from "@/types/database";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface LogEntry {
  event: PaymentEventType;
  out_trade_no?: string | null;
  user_id?: string | null;
  plan?: string | null;
  amount?: number | null;
  payload?: Json | null;
  result?: string | null;
  error?: string | null;
}

export async function logPaymentEvent(entry: LogEntry): Promise<void> {
  const timestamp = new Date().toISOString();
  const { event, out_trade_no, user_id, plan, amount, error } = entry;

  const emoji =
    event === "payment_success" ? "\u2705" :
    event === "refund_success" ? "\u{1F504}" :
    event.includes("error") || event === "payment_verify_fail" ? "\u274C" :
    "\u{1F4DD}";

  console.log(
    `[Payment] ${emoji} ${timestamp} | ${event} | ` +
    `trade=${out_trade_no || "-"} | user=${user_id || "-"} | ` +
    `plan=${plan || "-"} | amount=${amount ?? "-"} | ` +
    `error=${error || "-"}`
  );

  try {
    const supabase = await createClient();
    await (supabase.from("payment_logs") as any).insert({
      event: entry.event,
      out_trade_no: entry.out_trade_no ?? null,
      user_id: entry.user_id ?? null,
      plan: entry.plan ?? null,
      amount: entry.amount ?? null,
      payload: entry.payload ?? null,
      result: entry.result ?? null,
      error: entry.error ?? null,
    });
  } catch (dbErr) {
    console.error("[PaymentLogger] Failed to persist log:", dbErr);
  }
}

export async function getPaymentLogs(options: {
  userId?: string;
  outTradeNo?: string;
  event?: PaymentEventType;
  limit?: number;
  offset?: number;
}) {
  const supabase = await createClient();
  let query = (supabase.from("payment_logs") as any)
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (options.userId) query = query.eq("user_id", options.userId);
  if (options.outTradeNo) query = query.eq("out_trade_no", options.outTradeNo);
  if (options.event) query = query.eq("event", options.event);
  if (options.limit) query = query.limit(options.limit);
  if (options.offset) query = query.range(options.offset, options.offset + (options.limit || 20) - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { logs: data, total: count ?? 0 };
}