/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "avatars";
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 2MB)" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only images allowed" }, { status: 400 });
    }

    // Delete old avatar if exists
    const { data: oldFiles } = await supabase.storage.from(BUCKET).list(user.id);
    if (oldFiles && oldFiles.length > 0) {
      await supabase.storage.from(BUCKET).remove(oldFiles.map((f: { name: string }) => user.id + "/" + f.name));
    }

    // Upload new avatar
    const ext = file.name.split(".").pop() || "png";
    const path = user.id + "/avatar." + ext;
    const buffer = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: true });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
    const avatarUrl = urlData.publicUrl;

    // Update profile
    await supabase.from("user_profiles").upsert(
      { id: user.id, avatar_url: avatarUrl } as any,
      { onConflict: "id" } as any
    );

    return NextResponse.json({ success: true, avatarUrl });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
