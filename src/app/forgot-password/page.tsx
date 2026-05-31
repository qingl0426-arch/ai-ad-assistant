"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, ArrowLeft, Mail, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center space-y-1">
          <div className="flex justify-center mb-2">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-xl">找回密码</CardTitle>
          <CardDescription>输入邮箱，我们将发送重置链接</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {sent ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  重置链接已发送到 <span className="font-medium text-foreground">{email}</span>
                </p>
                <p className="text-xs text-center text-muted-foreground">
                  请检查收件箱（包括垃圾邮件），点击链接重置密码
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/login">返回登录</Link>
                </Button>
              </div>
            ) : (
              <>
                {error && (
                  <div className="p-2 text-sm rounded bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "发送中..." : "发送重置链接"}
                </Button>
                <Button variant="ghost" className="w-full" asChild>
                  <Link href="/login">
                    <ArrowLeft className="h-4 w-4 mr-2" />返回登录
                  </Link>
                </Button>
              </>
            )}
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
