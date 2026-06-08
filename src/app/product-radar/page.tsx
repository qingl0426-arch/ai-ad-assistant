/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  TrendingUp, Zap, AlertTriangle, Package, Upload, Sparkles, Crown,
  ArrowUp, ArrowDown, Minus, Flame, DollarSign, Shield, Search, Loader2, RefreshCw, Brain, ChevronRight, Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductTrendRow } from "@/types/database";
import type { AIProductAnalysisResult } from "@/lib/ai-product-selector";
import type { ForecastResult } from "@/lib/product-forecast";
import { PLAN_LIMITS, getPlanLabel, type PlanTier } from "@/lib/permissions";

/* ================================================================
   工具函数
   ================================================================ */

function getTrendColor(t: string) { switch (t) { case "爆发": return "text-rose-400 bg-rose-500/10 border-rose-500/20"; case "上升": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"; case "稳定": return "text-slate-400 bg-slate-500/10 border-slate-500/20"; case "下降": return "text-red-400 bg-red-500/10 border-red-500/20"; default: return "text-slate-400 bg-slate-500/10 border-slate-500/20"; } }
function getTrendIcon(t: string) { switch (t) { case "爆发": return <Flame className="h-3.5 w-3.5" />; case "上升": return <ArrowUp className="h-3.5 w-3.5" />; case "稳定": return <Minus className="h-3.5 w-3.5" />; case "下降": return <ArrowDown className="h-3.5 w-3.5" />; default: return <Minus className="h-3.5 w-3.5" />; } }
function getCompColor(c: string) { switch (c) { case "低": return "text-emerald-400 bg-emerald-500/10"; case "中": return "text-amber-400 bg-amber-500/10"; case "高": return "text-red-400 bg-red-500/10"; default: return "text-slate-400 bg-slate-500/10"; } }
function getScoreBar(s: number) { if (s >= 90) return "bg-rose-500"; if (s >= 80) return "bg-amber-500"; if (s >= 60) return "bg-indigo-500"; return "bg-slate-500"; }
function getActionCol(a: string) { switch (a) { case "立即跟进": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"; case "小批量测试": return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"; case "暂时观察": return "bg-amber-500/10 text-amber-400 border-amber-500/20"; case "不建议跟品": return "bg-red-500/10 text-red-400 border-red-500/20"; default: return "bg-slate-500/10 text-slate-400 border-slate-500/20"; } }
function getRiskCol(r: string) { switch (r) { case "低": return "text-emerald-400"; case "中": return "text-amber-400"; case "高": return "text-red-400"; default: return "text-slate-400"; } }
function getLvl(s: number) { if (s >= 90) return { l: "爆款潜力极高", c: "bg-rose-500/10 text-rose-400 border-rose-500/20" }; if (s >= 80) return { l: "高潜力", c: "bg-amber-500/10 text-amber-400 border-amber-500/20" }; if (s >= 60) return { l: "可观察", c: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" }; return { l: "普通", c: "bg-slate-500/10 text-slate-400 border-slate-500/20" }; }
function fm(v: number) { if (v >= 10000) return `¥${(v / 10000).toFixed(1)}万`; return `¥${v.toLocaleString()}`; }
function fc(v: number) { if (v >= 10000) return `${(v / 10000).toFixed(1)}万`; return v.toLocaleString(); }

interface Stats { total: number; bursting: number; rising: number; risk: number; platforms: string[]; categories: string[]; }

export default function ProductRadarPage() {
  const router = useRouter(); const supabase = createClient();
  const [_user, setUser] = useState<{ email?: string } | null>(null);
  const [userPlan, setUserPlan] = useState<PlanTier>("free");
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ProductTrendRow[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, bursting: 0, rising: 0, risk: 0, platforms: [], categories: [] });
  const [activeTab, setActiveTab] = useState<"hot" | "rising" | "profit" | "risk" | "low_competition">("hot");
  const [sortBy, setSortBy] = useState("hot_score"); const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [fp, setFp] = useState(""); const [fc2, setFc2] = useState(""); const [fpl, setFpl] = useState(""); const [fph, setFph] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [aiResult, setAiResult] = useState<AIProductAnalysisResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false); const [aiError, setAiError] = useState("");
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [forecastLoading, setForecastLoading] = useState(false); const [showForecast, setShowForecast] = useState(false);

  const limits = PLAN_LIMITS[userPlan];
  const visibleRows = userPlan === "free" ? rows.slice(0, limits.productRadarPerDay) : rows;
  const truncated = userPlan === "free" && rows.length > limits.productRadarPerDay;

  const tabs = [
    { key: "hot" as const, label: "今日爆品榜", icon: Flame }, { key: "rising" as const, label: "高增长商品", icon: TrendingUp },
    { key: "profit" as const, label: "高利润潜力", icon: DollarSign }, { key: "low_competition" as const, label: "低竞争机会", icon: Shield },
    { key: "risk" as const, label: "风险商品", icon: AlertTriangle },
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams(); p.set("tab", activeTab); p.set("sortBy", sortBy); p.set("sortDir", sortDir); p.set("limit", "50");
      if (fp) p.set("platform", fp); if (fc2) p.set("category", fc2); if (fpl) p.set("priceMin", fpl); if (fph) p.set("priceMax", fph);
      const r = await fetch(`/api/product-trends?${p.toString()}`); const d = await r.json();
      if (r.ok) { setRows(d.rows || []); setStats(d.stats || { total: 0, bursting: 0, rising: 0, risk: 0, platforms: [], categories: [] }); }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [activeTab, sortBy, sortDir, fp, fc2, fpl, fph]);

  const runAi = async () => { setAiLoading(true); setAiError(""); try { const r = await fetch("/api/product-trends/analyze", { method: "POST" }); const d = await r.json(); if (r.ok) setAiResult(d); else setAiError(d.error || "失败"); } catch { setAiError("网络错误"); } finally { setAiLoading(false); } };
  const fetchForecast = async () => { setForecastLoading(true); try { const r = await fetch("/api/product-trends/forecast"); const d = await r.json(); if (r.ok) { setForecast(d); setShowForecast(true); } } catch (e) { console.error(e); } finally { setForecastLoading(false); } };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) { fetch("/api/user").then(r => r.json()).then(u => { if (u.plan) setUserPlan(u.plan); }).catch(() => {}); }
    });
  }, []);
  useEffect(() => { fetchData(); }, [fetchData]);

  const hasData = rows.length > 0;

  return (
    <div className="min-h-screen bg-[#09090b]">
      <Navbar showAuth={false} />
      <main className="mx-auto max-w-7xl px-6 pt-20 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div><div className="flex items-center gap-3 mb-2"><div className="h-8 w-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center"><Zap className="h-4 w-4 text-rose-400" /></div><h1 className="text-2xl font-bold text-white tracking-tight">爆品雷达</h1></div><p className="text-slate-400 text-sm">发现潜力爆品，抢占先机 · {getPlanLabel(userPlan)}</p></div>
          <div className="flex items-center gap-2"><Button variant="outline" size="sm" onClick={fetchData} disabled={loading} className="rounded-xl border-white/[0.08] text-slate-400 hover:text-white gap-1.5">{loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}刷新</Button><Button size="sm" onClick={() => router.push("/upload")} className="rounded-xl bg-indigo-600 hover:bg-indigo-500 gap-1.5"><Upload className="h-3.5 w-3.5" /> 上传商品数据</Button></div>
        </div>

        {/* 概览 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[{ label: "监测商品", value: stats.total, icon: Package, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },{ label: "爆发商品", value: stats.bursting, icon: Flame, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },{ label: "上升商品", value: stats.rising, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },{ label: "风险商品", value: stats.risk, icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" }].map((c, i) => (
            <motion.div key={c.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className={cn("rounded-2xl border p-4", c.border, c.bg)}><div className="flex items-center justify-between mb-2"><span className="text-xs text-slate-400">{c.label}</span><c.icon className={cn("h-4 w-4", c.color)} /></div><p className={cn("text-2xl font-bold", c.color)}>{c.value}</p></motion.div>
          ))}
          <motion.button initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} onClick={runAi} disabled={aiLoading || stats.total === 0} className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/[0.05] to-indigo-500/[0.05] p-4 text-left hover:border-purple-500/30 transition-all disabled:opacity-50"><div className="flex items-center justify-between mb-2"><span className="text-xs text-slate-400">AI选品分析</span>{aiLoading ? <Loader2 className="h-4 w-4 text-purple-400 animate-spin" /> : <Brain className="h-4 w-4 text-purple-400" />}</div><p className="text-sm text-purple-300 font-medium">{aiLoading ? "分析中..." : aiResult ? "已分析" : "开始分析"}</p></motion.button>
        </div>

        {/* AI 分析结果 */}
        {aiResult && aiResult.suggestions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/[0.04] to-indigo-500/[0.04] p-6">
            <div className="flex items-center gap-2 mb-1"><div className="h-7 w-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center"><Sparkles className="h-3.5 w-3.5 text-purple-400" /></div><h3 className="text-sm font-medium text-white">AI选品分析</h3><span className="text-[11px] text-slate-500 ml-auto">{new Date(aiResult.generatedAt).toLocaleTimeString("zh-CN")}</span></div>
            <p className="text-sm text-purple-300/80 mt-2 mb-4">{aiResult.summary}</p>
            <div className="space-y-3">{aiResult.suggestions.slice(0, 6).map((s, i) => (
              <div key={i} className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-4 hover:bg-white/[0.04] transition-colors">
                <div className="flex items-start justify-between gap-4"><div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-1.5"><span className="text-sm font-semibold text-white">{s.product_name}</span><span className={cn("text-[11px] px-2 py-0.5 rounded-full border", getActionCol(s.action))}>{s.action}</span></div><p className="text-xs text-slate-400 mb-2">{s.reason}</p><div className="flex items-center gap-4 text-xs"><span><span className="text-slate-500">爆款概率：</span><span className="text-white font-medium">{s.burst_probability}%</span></span><span><span className="text-slate-500">利润率：</span><span className="text-white font-medium">{s.estimated_profit_rate}%</span></span><span><span className="text-slate-500">风险：</span><span className={cn("font-medium", getRiskCol(s.risk_level))}>{s.risk_level}</span></span></div></div><div className="shrink-0 text-center"><div className={cn("h-12 w-12 rounded-full border-2 flex items-center justify-center text-sm font-bold", s.burst_probability >= 80 ? "border-emerald-500/30 text-emerald-400" : s.burst_probability >= 50 ? "border-amber-500/30 text-amber-400" : "border-red-500/30 text-red-400")}>{s.burst_probability}</div><span className="text-[10px] text-slate-500 mt-0.5 block">爆款概率</span></div></div>
                {s.risk_detail && <p className="text-[11px] text-slate-500 mt-2">{s.risk_detail}</p>}
              </div>))}</div></motion.div>
        )}
        {aiError && <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/5 border border-red-500/10 text-red-400 text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 shrink-0" />{aiError}</div>}

        {/* 未来爆品预测 —— 权限控制 */}
        {stats.total > 0 && !showForecast && (
          limits.forecast7d ? (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
              <button onClick={fetchForecast} disabled={forecastLoading} className="w-full rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/[0.04] to-orange-500/[0.04] p-5 text-left hover:border-amber-500/30 transition-all">
                <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">{forecastLoading ? <Loader2 className="h-5 w-5 text-amber-400 animate-spin" /> : <Calendar className="h-5 w-5 text-amber-400" />}</div><div><p className="text-sm font-semibold text-white">未来爆品预测</p><p className="text-xs text-slate-400 mt-0.5">预测未来7天和30天可能爆发的商品</p></div><div className="ml-auto text-slate-500"><ChevronRight className="h-5 w-5" /></div></div>
              </button>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
              <div className="rounded-2xl border border-amber-500/10 bg-amber-500/[0.02] p-5">
                <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center"><Calendar className="h-5 w-5 text-amber-500/50" /></div><div className="flex-1"><p className="text-sm font-semibold text-slate-500">未来爆品预测</p><p className="text-xs text-slate-600 mt-0.5">升级专业版解锁未来7天爆品预测，企业版解锁30天</p></div><Button size="sm" onClick={() => router.push("/pricing")} className="rounded-xl bg-amber-600 hover:bg-amber-500 gap-1.5 text-xs"><Crown className="h-3 w-3" />升级</Button></div>
              </div>
            </motion.div>
          )
        )}

        {/* 预测结果 */}
        {showForecast && forecast && forecast.forecasts.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.04] to-orange-500/[0.04] p-6">
            <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2"><div className="h-7 w-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center"><Calendar className="h-3.5 w-3.5 text-amber-400" /></div><h3 className="text-sm font-medium text-white">未来爆品预测</h3></div><button onClick={() => setShowForecast(false)} className="text-xs text-slate-500 hover:text-white transition-colors">收起</button></div>
            <p className="text-xs text-slate-500 mb-1">{forecast.summary}</p><p className="text-[10px] text-slate-600 mb-4">⚠ 预测仅供经营参考</p>
            <div className="space-y-3">{forecast.forecasts.slice(0, 8).map((f, i) => (
              <div key={i} className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-4">
                <div className="flex items-start justify-between gap-4 mb-3"><div className="flex-1"><div className="flex items-center gap-2 mb-1"><span className="text-sm font-semibold text-white">{f.product_name}</span><span className="text-[11px] text-slate-500">{f.category} · ¥{f.price}</span></div><div className="flex items-center gap-6 mt-3">
                  <div><p className="text-[11px] text-slate-500 mb-1">7天爆发概率</p><div className="flex items-center gap-2"><div className="w-20 h-2 rounded-full bg-white/[0.06] overflow-hidden"><div className={cn("h-full rounded-full", f.burst_7d_probability >= 80 ? "bg-rose-500" : f.burst_7d_probability >= 60 ? "bg-amber-500" : "bg-slate-500")} style={{ width: `${f.burst_7d_probability}%` }} /></div><span className="text-sm font-bold text-white">{f.burst_7d_probability}%</span><span className={cn("text-[10px] px-1.5 py-0.5 rounded", f.trend_7d === "强爆发" ? "bg-rose-500/10 text-rose-400" : f.trend_7d === "上升" ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-500/10 text-slate-400")}>{f.trend_7d}</span></div></div>
                  {limits.forecast30d ? (
                    <div><p className="text-[11px] text-slate-500 mb-1">30天爆发概率</p><div className="flex items-center gap-2"><div className="w-20 h-2 rounded-full bg-white/[0.06] overflow-hidden"><div className={cn("h-full rounded-full", f.burst_30d_probability >= 70 ? "bg-amber-500" : "bg-slate-500")} style={{ width: `${f.burst_30d_probability}%` }} /></div><span className="text-sm font-bold text-white">{f.burst_30d_probability}%</span><span className={cn("text-[10px] px-1.5 py-0.5 rounded", f.trend_30d === "强爆发" ? "bg-rose-500/10 text-rose-400" : f.trend_30d === "上升" ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-500/10 text-slate-400")}>{f.trend_30d}</span></div></div>
                  ) : (
                    <div className="text-center"><p className="text-[11px] text-slate-600 mb-1">30天预测</p><Button variant="outline" size="sm" onClick={() => router.push("/pricing")} className="rounded-lg border-amber-500/20 text-amber-400 text-[10px] h-7 px-2">企业版解锁</Button></div>
                  )}
                </div></div>
                <div className="shrink-0 grid grid-cols-2 gap-2 text-center"><div className="bg-white/[0.03] rounded-xl px-3 py-2"><p className="text-[10px] text-slate-500">建议备货</p><p className="text-sm font-bold text-white">{f.suggested_stock}件</p></div><div className="bg-white/[0.03] rounded-xl px-3 py-2"><p className="text-[10px] text-slate-500">测试预算</p><p className="text-sm font-bold text-white">¥{f.suggested_test_budget}</p></div></div></div>
                {f.risks.length > 0 && <div className="flex flex-wrap gap-1.5">{f.risks.map((r, ri) => (<span key={ri} className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/5 text-red-400/80 border border-red-500/10">{r}</span>))}</div>}
              </div>))}</div></motion.div>
        )}

        {/* Tab + 排序 */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-x-auto">{tabs.map(t => (<button key={t.key} onClick={() => setActiveTab(t.key)} className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap", activeTab === t.key ? "bg-white/[0.08] text-white" : "text-slate-400 hover:text-white")}><t.icon className="h-4 w-4" />{t.label}</button>))}</div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="h-9 rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-300 text-sm px-3"><option value="hot_score">爆款指数</option><option value="sales_growth_rate">销量增长率</option><option value="gmv_growth_rate">GMV增长率</option><option value="profit_margin_estimate">利润率潜力</option><option value="price">价格</option></select>
          <button onClick={() => setSortDir(d => d === "desc" ? "asc" : "desc")} className="h-9 px-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-white text-sm">{sortDir === "desc" ? "↓ 降序" : "↑ 升序"}</button>
          {stats.platforms.length > 0 && (<button onClick={() => setShowFilters(!showFilters)} className={cn("h-9 px-3 rounded-xl border text-sm gap-1.5 flex items-center", showFilters ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400" : "bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-white")}><Search className="h-3.5 w-3.5" />筛选</button>)}
        </div>

        {showFilters && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-6 p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] grid grid-cols-2 md:grid-cols-5 gap-3">
          <div><label className="text-[11px] text-slate-500 mb-1 block">平台</label><select value={fp} onChange={e => setFp(e.target.value)} className="w-full h-9 rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-300 text-sm px-3"><option value="">全部平台</option>{stats.platforms.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
          <div><label className="text-[11px] text-slate-500 mb-1 block">类目</label><select value={fc2} onChange={e => setFc2(e.target.value)} className="w-full h-9 rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-300 text-sm px-3"><option value="">全部类目</option>{stats.categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <div><label className="text-[11px] text-slate-500 mb-1 block">最低价</label><input type="number" placeholder="¥最低" value={fpl} onChange={e => setFpl(e.target.value)} className="w-full h-9 rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-300 text-sm px-3 placeholder:text-slate-600" /></div>
          <div><label className="text-[11px] text-slate-500 mb-1 block">最高价</label><input type="number" placeholder="¥最高" value={fph} onChange={e => setFph(e.target.value)} className="w-full h-9 rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-300 text-sm px-3 placeholder:text-slate-600" /></div>
          <div className="flex items-end"><Button variant="outline" size="sm" onClick={() => { setFp(""); setFc2(""); setFpl(""); setFph(""); }} className="rounded-xl border-white/[0.08] text-slate-400 hover:text-white w-full">清除筛选</Button></div>
        </motion.div>)}

        {/* 空数据 */}
        {!loading && !hasData && (<div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-16 text-center"><Package className="h-12 w-12 mx-auto text-slate-700 mb-4" /><h3 className="text-lg font-semibold text-white mb-2">暂无商品数据</h3><p className="text-slate-400 text-sm mb-6">请上传商品趋势Excel，AI会帮你发现爆品机会</p><Button onClick={() => router.push("/upload")} className="rounded-xl bg-indigo-600 hover:bg-indigo-500 gap-2"><Upload className="h-4 w-4" /> 上传商品数据</Button></div>)}

        {loading && (<div className="space-y-3">{[1,2,3].map(i => (<div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 animate-pulse"><div className="h-4 w-48 bg-white/[0.04] rounded mb-3" /><div className="h-3 w-32 bg-white/[0.03] rounded" /></div>))}</div>)}

        {/* 截断提示 */}
        {hasData && truncated && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-between">
            <div className="flex items-center gap-2"><Crown className="h-4 w-4 text-indigo-400" /><span className="text-xs text-indigo-300">免费版显示前{limits.productRadarPerDay}个，升级查看全部{rows.length}个商品</span></div>
            <Button variant="outline" size="sm" onClick={() => router.push("/pricing")} className="rounded-xl border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 text-xs gap-1">升级专业版</Button>
          </div>
        )}

        {hasData && (<div className="space-y-3">{visibleRows.map((p, i) => { const lv = getLvl(p.hot_score); return (<motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1] p-5"><div className="flex flex-col md:flex-row md:items-center gap-4"><div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-1.5"><span className="text-sm font-semibold text-white truncate">{p.product_name}</span><span className={cn("text-[11px] px-2 py-0.5 rounded-full border flex items-center gap-1 shrink-0", getTrendColor(p.trend_status))}>{getTrendIcon(p.trend_status)}{p.trend_status}</span></div><div className="flex items-center gap-3 text-xs text-slate-500"><span>{p.category || "未分类"}</span><span>¥{p.price}</span><span className={cn("px-1.5 py-0.5 rounded text-[11px]", getCompColor(p.competition_level))}>{p.competition_level}竞争</span>{p.platform && p.platform !== "unknown" && <span className="text-slate-600">{p.platform}</span>}</div></div><div className="flex items-center gap-4 md:gap-6 flex-wrap"><div className="text-center"><p className="text-xs text-slate-500 mb-0.5">近7天销量</p><p className="text-sm font-bold text-white">{fc(p.sales_7d)}</p><p className={cn("text-[11px]", p.sales_growth_rate >= 0 ? "text-emerald-400" : "text-red-400")}>{p.sales_growth_rate >= 0 ? "+" : ""}{p.sales_growth_rate}%</p></div><div className="text-center"><p className="text-xs text-slate-500 mb-0.5">近7天GMV</p><p className="text-sm font-bold text-white">{fm(p.gmv_7d)}</p><p className={cn("text-[11px]", p.gmv_growth_rate >= 0 ? "text-emerald-400" : "text-red-400")}>{p.gmv_growth_rate >= 0 ? "+" : ""}{p.gmv_growth_rate}%</p></div><div className="text-center"><p className="text-xs text-slate-500 mb-0.5">爆款指数</p><div className="flex items-center gap-1.5"><div className="w-16 h-1.5 rounded-full bg-white/[0.06] overflow-hidden"><div className={cn("h-full rounded-full", getScoreBar(p.hot_score))} style={{ width: `${p.hot_score}%` }} /></div><span className="text-sm font-bold text-white">{p.hot_score}</span></div></div><div className="text-center"><p className="text-xs text-slate-500 mb-0.5">利润潜力</p><span className="text-sm font-bold text-white">{Math.round((p.profit_margin_estimate || 0) * 100)}%</span></div><span className={cn("text-[11px] px-2 py-1 rounded-lg font-medium border shrink-0", lv.c)}>{lv.l}</span></div></div></motion.div>); })}</div>)}
      </main>
    </div>
  );
}
