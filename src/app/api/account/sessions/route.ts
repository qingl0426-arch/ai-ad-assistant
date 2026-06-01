import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  const { data: { session: currentSession } } = await supabase.auth.getSession();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Return current session info + basic device info from user agent
  const sessions: Array<{ id: string; isCurrent: boolean; createdAt: string; lastActive: string; userAgent: null; ip: null }> = [{
    id: currentSession?.access_token?.slice(0, 10) || "current",
    isCurrent: true,
    createdAt: user.created_at || new Date().toISOString(),
    lastActive: new Date().toISOString(),
    userAgent: null,
    ip: null,
  }];

  return NextResponse.json({ sessions, currentSessionId: sessions[0]?.id || "current" });
}

export async function DELETE(_request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Sign out globally (all sessions)
    await supabase.auth.signOut({ scope: "global" });
    // Then re-authenticate won't work without re-login, but that's expected
    return NextResponse.json({ success: true, message: "所有设备已退出，请重新登录" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
