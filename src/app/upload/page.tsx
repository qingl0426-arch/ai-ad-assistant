"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { UploadForm } from "@/components/upload/upload-form";
import { DataPreview } from "@/components/upload/data-preview";
import { Button } from "@/components/ui/button";
import { LogOut, BarChart3 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UploadPage() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-muted/40">加载中...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
        <div className="text-center space-y-4">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">请先登录</p>
          <Button asChild><Link href="/login">去登录</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="h-14 border-b bg-background flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <span className="font-semibold">AI Ad Assistant</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{user.email}</span>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-1" />退出
          </Button>
        </div>
      </header>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">数据上传</h1>
          <p className="text-muted-foreground text-sm mt-1">上传 CSV 文件，自动解析并保存到数据库</p>
        </div>
        <UploadForm />
        <DataPreview />
      </div>
    </div>
  );
}
