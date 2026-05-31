import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await (supabase.from("user_profiles") as any)
    .select("plan, stripe_subscription_id, plan_updated_at")
    .eq("id", user.id)
    .single();

  return NextResponse.json({
    email: user.email,
    plan: profile?.plan || "free",
    subscriptionId: profile?.stripe_subscription_id || null,
  });
}
