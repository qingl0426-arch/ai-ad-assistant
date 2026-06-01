"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Mail, ArrowLeft, Loader2, Send } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (err) { setError(err.message); setLoading(false); }
    else { setSent(true); setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-indigo-500/[0.05] rounded-full blur-[130px] animate-glow-pulse" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-10 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">直播投流AI</span>
        </Link>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-2xl p-8 shadow-2xl shadow-black/20">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" /> 返回登录
          </Link>

          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-7 w-7 text-emerald-400" />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">邮件已发送</h2>
              <p className="text-sm text-slate-400">
                请查看 <span className="text-white font-medium">{email}</span> 的收件箱，点击链接重置密码。
              </p>
              <Link href="/login" className="inline-flex mt-6 text-sm text-indigo-400 hover:text-indigo-300 font-medium">
                返回登录
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">找回密码</h2>
                <p className="text-sm text-slate-400">输入注册邮箱，我们将发送重置链接</p>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-400 text-xs font-medium">邮箱地址</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="h-11"
                />
              </div>

              {error && (
                <div className="text-sm p-3.5 rounded-xl bg-red-500/[0.08] text-red-400 border border-red-500/[0.15]">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white h-12 font-semibold shadow-lg shadow-indigo-500/20 gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4" /> 发送重置链接</>}
              </Button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}