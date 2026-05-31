"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import Link from "next/link";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center space-y-1">
        <div className="flex justify-center mb-2">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-primary-foreground" />
          </div>
        </div>
        <CardTitle className="text-xl">{isSignUp ? "创建账户" : "登录"}</CardTitle>
        <CardDescription>AI Ad Assistant</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && <div className="p-2 text-sm rounded bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400">{error}</div>}
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input id="email" type="email" placeholder="admin@test.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">密码</Label>
              {!isSignUp && (
                <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                  忘记密码？
                </Link>
              )}
            </div>
            <Input id="password" type="password" placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "处理中..." : isSignUp ? "注册" : "登录"}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            {isSignUp ? "已有账户？" : "没有账户？"}
            <button type="button" className="ml-1 text-primary hover:underline" onClick={() => { setIsSignUp(!isSignUp); setError(""); }}>
              {isSignUp ? "去登录" : "去注册"}
            </button>
          </p>
        </CardContent>
      </form>
    </Card>
  );
}
