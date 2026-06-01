import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/* eslint-disable @typescript-eslint/no-explicit-any */

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());

function isAdmin(email: string | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user || !isAdmin(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = request.nextUrl;
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const offset = (page - 1) * limit;
  const search = url.searchParams.get("search") || "";

  const adminClient = createAdminClient();

  // Get all auth users via admin API
  const { data: { users: authUsers }, error: authListError } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 10000,
  });

  if (authListError) {
    return NextResponse.json({ error: authListError.message }, { status: 500 });
  }

  // Get user profiles
  const { data: profiles } = await (adminClient.from("user_profiles") as any).select("*");

  const profileMap = new Map();
  if (profiles) {
    for (const p of profiles) {
      profileMap.set(p.id, p);
    }
  }

  let users = (authUsers || []).map((au: any) => {
    const profile = profileMap.get(au.id) || {};
    return {
      id: au.id,
      email: au.email,
      plan: profile.plan || "free",
      displayName: profile.display_name || null,
      createdAt: au.created_at,
      lastSignIn: au.last_sign_in_at,
      confirmed: au.email_confirmed_at ? true : false,
    };
  });

  // Filter by search
  if (search) {
    const s = search.toLowerCase();
    users = users.filter((u: any) => u.email?.toLowerCase().includes(s));
  }

  const total = users.length;
  const paged = users.slice(offset, offset + limit);

  return NextResponse.json({
    users: paged,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}
