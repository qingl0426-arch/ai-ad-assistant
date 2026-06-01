import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: Record<string, unknown> = await request.json();
  const { displayName } = body;

  if (displayName !== undefined && typeof displayName !== "string") {
    return NextResponse.json({ error: "Invalid display name" }, { status: 400 });
  }

  const { error } = await (supabase.from("user_profiles") as any)
    .upsert({ id: user.id, display_name: displayName || null }, { onConflict: "id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, displayName });
}
