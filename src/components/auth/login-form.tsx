"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Mail, Lock, Eye, EyeOff, Loader2, Github, Chrome, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { toast } = useToast();
  const isSignUp = searchParams.get("signup") === "1";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (signUpError) throw signUpError;
        setError("__SUCCESS__注册成功！请查看邮箱确认链接。");
        toast("success", "注册成功！请查看邮箱确认链接。");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        toast("success", "登录成功");
        setTimeout(() => { window.location.href = "/dashboard"; }, 300);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "操作失败";
      if (msg.includes("Invalid login") || msg.includes("Invalid Login")) {
        setError("邮箱或密码错误");
      } else if (msg.includes("already")) {
        setError("该邮箱已注册，请直接登录");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  const isSuccess = error.startsWith("__SUCCESS__");

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.7, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-1/3 -left-1/4 w-[700px] h-[700px] bg-indigo-500/[0.07] rounded-full blur-[160px]"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-1/3 -right-1/4 w-[600px] h-[600px] bg-purple-500/[0.05] rounded-full blur-[140px]"
        />
        <motion.div
          animate={{ scale: [0.9, 1.05, 0.9], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-pink-500/[0.03] rounded-full blur-[120px]"
        />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)", backgroundSize: "40px 40px" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-[420px]"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-10 group">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 flex items-center justify-center"
          >
            <Sparkles className="h-5 w-5 text-white" />
          </motion.div>
          <span className="text-xl font-bold text-white tracking-tight">直播投流AI</span>
        </Link>

        {/* Glass card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="rounded-2xl border border-white/[0.08] bg-white/[0.015] backdrop-blur-2xl p-8 shadow-2xl shadow-black/30"
        >
          {/* Tab switcher */}
          <div className="flex mb-8 p-1 rounded-xl bg-white/[0.025] border border-white/[0.06] relative">
            <Link
              href="/login"
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold text-center transition-all duration-200 relative z-10 ${!isSignUp ? "text-white" : "text-slate-400 hover:text-white"}`}
            >
              登录
            </Link>
            <Link
              href="/login?signup=1"
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold text-center transition-all duration-200 relative z-10 ${isSignUp ? "text-white" : "text-slate-400 hover:text-white"}`}
            >
              注册
            </Link>
            {/* Sliding active indicator */}
            <motion.div
              layoutId="auth-tab"
              className="absolute top-1 bottom-1 rounded-lg bg-white/[0.08] shadow-sm z-0"
              style={{ width: "calc(50% - 4px)" }}
              animate={{ left: isSignUp ? "calc(50% + 2px)" : "2px" }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          </div>

          {/* Form content */}
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-6"
              >
                <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <svg className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <h2 className="text-lg font-bold text-white mb-1">注册成功！</h2>
                <p className="text-sm text-slate-400 max-w-xs mx-auto">请查看邮箱确认链接，完成账号激活后即可使用。</p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* Email */}
                <div className="space-y-2">
                  <Label className="text-slate-400 text-xs font-medium">邮箱地址</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="pl-10 h-11"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-400 text-xs font-medium">密码</Label>
                    {!isSignUp && (
                      <Link href="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                        忘记密码？
                      </Link>
                    )}
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <Input
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={isSignUp ? "至少 6 位字符" : "输入密码"}
                      required
                      minLength={6}
                      className="pl-10 pr-10 h-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      tabIndex={-1}
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && !isSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm p-3.5 rounded-xl bg-red-500/[0.06] text-red-400 border border-red-500/[0.12]"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={loading}
                  variant="gradient"
                  size="lg"
                  className="w-full gap-2"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      {isSignUp ? "创建账号" : "立即登录"} <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>

                {/* Divider */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-white/[0.06]" />
                  <span className="text-xs text-slate-600">or</span>
                  <div className="flex-1 h-px bg-white/[0.06]" />
                </div>

                {/* Social login */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => supabase.auth.signInWithOAuth({ provider: "github", options: { redirectTo: `${window.location.origin}/dashboard` } })}
                    className="flex items-center justify-center gap-2 h-11 rounded-xl border border-white/[0.08] bg-white/[0.02] text-sm font-medium text-slate-300 hover:bg-white/[0.05] hover:border-white/[0.12] transition-all"
                  >
                    <Github className="h-4 w-4" /> GitHub
                  </button>
                  <button
                    type="button"
                    onClick={() => supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/dashboard` } })}
                    className="flex items-center justify-center gap-2 h-11 rounded-xl border border-white/[0.08] bg-white/[0.02] text-sm font-medium text-slate-300 hover:bg-white/[0.05] hover:border-white/[0.12] transition-all"
                  >
                    <Chrome className="h-4 w-4" /> Google
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer link */}
        <p className="text-center text-xs text-slate-600 mt-6">
          {isSignUp ? "已有账号？" : "还没有账号？"} {" "}
          <Link
            href={isSignUp ? "/login" : "/login?signup=1"}
            className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
          >
            {isSignUp ? "去登录" : "免费注册"}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
