"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Brain, ShieldAlert, AlertTriangle, CheckCircle2,
  Lightbulb, TrendingUp, TrendingDown, Target, Loader2,
  RefreshCw, ArrowLeft, Zap, Cpu, BarChart3, Send
} from "lucide-react";
import Link from "next/link";
import type { AISuggestionResult } from "@/lib/openai.service";

/* ── Risk badge ── */
function RiskBadge({ confidence }: { confidence: number }) {
  const isHigh = confidence >= 80;
  const isMid = confidence >= 50;
  const config = isHigh
    ? { label: "低风险", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: CheckCircle2 }
    : isMid
    ? { label: "中风险", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: AlertTriangle }
    : { label: "高风险", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", icon: ShieldAlert };
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${config.bg} ${config.color} ${config.border}`}>
      <Icon className="h-3.5 w-3.5" />
      {config.label} · 信心 {confidence}%
    </span>
  );
}

/* ── Gradient border card wrapper ── */
function GradientCard({ children, className = "", from = "from-indigo-500/20", to = "to-purple-500/20" }: {
  children: React.ReactNode; className?: string; from?: string; to?: string;
}) {
  return (
    <div className={`relative rounded-2xl p-[1px] bg-gradient-to-br ${from} ${to} ${className}`}>
      <div className="rounded-2xl bg-[#0d0d12] p-5 h-full">
        {children}
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function AIAnalysisPage() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AISuggestionResult | null>(null);
  const [error, setError] = useState("");
  const [hasData, setHasData] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  /* Auth check */
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (!data.user) { setLoading(false); return; }
      /* Check if user has data */
      fetch("/api/ai-suggest")
        .then(r => { setHasData(r.status !== 404); return r.json(); })
        .then(d => { if (d.summary) setResult(d); })
        .catch(() => {})
        .finally(() => setLoading(false));
    });
  }, []);

  /* Run analysis */
  const runAnalysis = useCallback(async () => {
    setAnalyzing(true);
    setError("");
    try {
      const res = await fetch("/api/ai-suggest");
      if (res.status === 401) { router.push("/login"); return; }
      if (res.status === 404) { setHasData(false); setAnalyzing(false); return; }
      const data = await res.json();
      if (data.error) { setError(data.error); setAnalyzing(false); return; }
      setResult(data);
      setHasData(true);
    } catch {
      setError("网络错误，请重试");
    } finally {
      setAnalyzing(false);
    }
  }, [router]);

  /* Login gate */
  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-5">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center mx-auto">
            <Brain className="h-8 w-8 text-indigo-400" />
          </div>
          <p className="text-slate-400 text-lg">请先登录</p>
          <Link href="/login"><Button className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600">去登录</Button></Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b]">
      <Navbar user={user} showAuth={false} onLogout={async () => { await supabase.auth.signOut(); router.push("/login"); }} />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 pt-24 pb-16">
        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" /> 返回数据大屏
          </Link>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-indigo-500/20 flex items-center justify-center">
              <Brain className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">AI 智能分析</h1>
              <p className="text-slate-400 text-sm mt-0.5">基于 GPT 的投放数据分析与建议</p>
            </div>
          </div>
        </motion.div>

        {/* ── No data state ── */}
        {!loading && !hasData && !result && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
            <div className="h-20 w-20 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="h-10 w-10 text-slate-600" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">暂无分析数据</h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">上传 CSV 投流数据后，AI 将自动分析并生成优化建议</p>
            <Link href="/upload">
              <Button className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/20 gap-2">
                <Send className="h-4 w-4" /> 上传数据
              </Button>
            </Link>
          </motion.div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div className="space-y-6 animate-pulse">
            <div className="h-32 bg-white/[0.03] rounded-2xl" />
            <div className="h-48 bg-white/[0.03] rounded-2xl" />
            <div className="h-40 bg-white/[0.03] rounded-2xl" />
          </div>
        )}

        {/* ── Analysis trigger (if has data but no result) ── */}
        {!loading && hasData && !result && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
            <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
              <Cpu className="h-8 w-8 text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">准备就绪</h3>
            <p className="text-slate-400 text-sm mb-6">已检测到你的投流数据，点击下方开始 AI 分析</p>
            <Button
              onClick={runAnalysis}
              disabled={analyzing}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/20 h-12 px-8 text-base font-semibold gap-2"
            >
              {analyzing ? <><Loader2 className="h-4 w-4 animate-spin" /> 分析中...</> : <><Sparkles className="h-4 w-4" /> 开始 AI 分析</>}
            </Button>
            {error && <p className="text-sm text-red-400 mt-4">{error}</p>}
          </motion.div>
        )}

        {/* ── Results ── */}
        <AnimatePresence>
          {result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Header bar with re-analyze */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/[0.06] border border-indigo-500/[0.15]">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-400" />
                    </span>
                    <span className="text-[11px] text-indigo-400 font-medium">AI 已分析</span>
                  </div>
                  <RiskBadge confidence={result.confidence} />
                </div>
                <Button variant="outline" size="sm" onClick={runAnalysis} disabled={analyzing} className="rounded-xl border-white/[0.08] text-slate-400 hover:text-white gap-1.5">
                  {analyzing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                  重新分析
                </Button>
              </div>

              {/* ── Summary Card ── */}
              <GradientCard from="from-indigo-500/20" to="to-purple-500/20">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                    <Sparkles className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">总体评估</p>
                    <p className="text-white text-base leading-relaxed font-medium">{result.summary}</p>
                  </div>
                </div>
              </GradientCard>

              {/* ── Risks Card ── */}
              {result.risks && result.risks.length > 0 && (
                <GradientCard from="from-amber-500/20" to="to-red-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                      <ShieldAlert className="h-4 w-4 text-amber-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-white">风险提示</h3>
                  </div>
                  <div className="space-y-2">
                    {result.risks.map((r, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-3 p-3 rounded-xl bg-red-500/[0.04] border border-red-500/[0.1]"
                      >
                        <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                        <p className="text-sm text-red-300/80">{r}</p>
                      </motion.div>
                    ))}
                  </div>
                </GradientCard>
              )}

              {/* ── Suggestions + Optimizations (2 col) ── */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Suggestions */}
                {result.suggestions && result.suggestions.length > 0 && (
                  <GradientCard from="from-emerald-500/20" to="to-teal-500/20">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                      </div>
                      <h3 className="text-sm font-semibold text-white">投流建议</h3>
                    </div>
                    <div className="space-y-2">
                      {result.suggestions.map((s, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all"
                        >
                          <div className="h-6 w-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                            <Zap className="h-3 w-3 text-emerald-400" />
                          </div>
                          <p className="text-sm text-slate-300">{s}</p>
                        </motion.div>
                      ))}
                    </div>
                  </GradientCard>
                )}

                {/* Optimizations */}
                {result.optimizations && result.optimizations.length > 0 && (
                  <GradientCard from="from-purple-500/20" to="to-pink-500/20">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-8 w-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                        <Lightbulb className="h-4 w-4 text-purple-400" />
                      </div>
                      <h3 className="text-sm font-semibold text-white">优化建议</h3>
                    </div>
                    <div className="space-y-2">
                      {result.optimizations.map((o, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all"
                        >
                          <div className="h-6 w-6 rounded-md bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                            <Target className="h-3 w-3 text-purple-400" />
                          </div>
                          <p className="text-sm text-slate-300">{o}</p>
                        </motion.div>
                      ))}
                    </div>
                  </GradientCard>
                )}
              </div>

              {/* ── Budget Advice ── */}
              {result.budgetAdvice && (
                <GradientCard from="from-indigo-500/20" to="to-amber-500/20">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                      <TrendingUp className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">预算建议</p>
                      <p className="text-white text-base leading-relaxed font-medium">{result.budgetAdvice}</p>
                      {/* Quick actions */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        {result.budgetAdvice.includes("追加") || result.budgetAdvice.includes("增加") ? (
                          <Button size="sm" className="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 h-8 text-xs">
                            <TrendingUp className="h-3 w-3" /> 执行加投
                          </Button>
                        ) : null}
                        {result.budgetAdvice.includes("缩减") || result.budgetAdvice.includes("减少") ? (
                          <Button size="sm" variant="outline" className="rounded-lg border-red-500/20 text-red-400 hover:bg-red-500/10 gap-1.5 h-8 text-xs">
                            <TrendingDown className="h-3 w-3" /> 执行减投
                          </Button>
                        ) : null}
                        <Button size="sm" variant="ghost" className="rounded-lg text-slate-400 gap-1.5 h-8 text-xs">
                          <BarChart3 className="h-3 w-3" /> 查看详情
                        </Button>
                      </div>
                    </div>
                  </div>
                </GradientCard>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
