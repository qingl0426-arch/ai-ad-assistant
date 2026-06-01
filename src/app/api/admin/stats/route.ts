import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/* eslint-disable @typescript-eslint/no-explicit-any */

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());

function isAdmin(email: string | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export async function GET(_request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user || !isAdmin(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const adminClient = createAdminClient();

  // Total users
  const { data: { users: authUsers } } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 10000 });

  // Total revenue from paid orders
  const { data: paidOrders } = await (adminClient.from("alipay_orders") as any)
    .select("amount")
    .eq("status", "paid");

  const totalRevenue = paidOrders?.reduce((sum: number, o: any) => sum + (o.amount || 0), 0) || 0;

  // Orders by plan
  const planCounts: Record<string, number> = {};
  const planRevenue: Record<string, number> = {};
  if (paidOrders) {
    for (const o of paidOrders) {
      const plan = o.plan || "unknown";
      planCounts[plan] = (planCounts[plan] || 0) + 1;
      planRevenue[plan] = (planRevenue[plan] || 0) + (o.amount || 0);
    }
  }

  // Recent 7 days revenue
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: recentOrders } = await (adminClient.from("alipay_orders") as any)
    .select("amount, created_at, plan")
    .eq("status", "paid")
    .gte("created_at", sevenDaysAgo)
    .order("created_at", { ascending: true });

  const dailyRevenue: Record<string, number> = {};
  if (recentOrders) {
    for (const o of recentOrders) {
      const day = (o.created_at as string).slice(0, 10);
      dailyRevenue[day] = (dailyRevenue[day] || 0) + (o.amount || 0);
    }
  }

  // User plan breakdown
  const { data: profiles } = await (adminClient.from("user_profiles") as any).select("plan");
  const userPlanCounts: Record<string, number> = {};
  if (profiles) {
    for (const p of profiles) {
      const plan = p.plan || "free";
      userPlanCounts[plan] = (userPlanCounts[plan] || 0) + 1;
    }
  }

  return NextResponse.json({
    totalUsers: authUsers?.length || 0,
    totalRevenue,
    totalOrders: paidOrders?.length || 0,
    planCounts,
    planRevenue,
    userPlanCounts,
    dailyRevenue,
    recentOrders: (recentOrders || []).slice(-10),
  });
}
