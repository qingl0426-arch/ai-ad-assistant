import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await (supabase.from("user_profiles") as any)
    .select("plan, plan_updated_at, display_name, created_at")
    .eq("id", user.id)
    .single();

  return NextResponse.json({
    email: user.email,
    plan: profile?.plan || "free",
    planUpdatedAt: profile?.plan_updated_at || null,
    displayName: profile?.display_name || null,
    createdAt: user.created_at,
  });
}