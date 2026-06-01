"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Lock, Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) { setError(err.message); setLoading(false); }
    else { setDone(true); setTimeout(() => router.push("/dashboard"), 1500); }
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-10">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">直播投流AI</span>
        </Link>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-2xl p-8 shadow-2xl shadow-black/20">
          {done ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <CheckCircle2 className="h-14 w-14 mx-auto text-emerald-400 mb-4" />
              <h2 className="text-lg font-bold text-white mb-2">密码已重置</h2>
              <p className="text-sm text-slate-400">即将跳转到数据大屏...</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">设置新密码</h2>
                <p className="text-sm text-slate-400">请输入新的登录密码</p>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-400 text-xs font-medium">新密码</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="至少 6 位字符"
                    required
                    minLength={6}
                    className="pl-10 h-11"
                  />
                </div>
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
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "重置密码"}
              </Button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}