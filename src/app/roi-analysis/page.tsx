"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, Target, BarChart3,
  ArrowLeft, Star, AlertTriangle, CheckCircle2
} from "lucide-react";
import Link from "next/link";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ComposedChart, Cell
} from "recharts";

/* ── Types ── */
interface DailyData { date: string; spend: number; gmv: number; roi: number; orders: number; impressions: number; clicks: number }
interface PlatformData { name: string; spend: number; gmv: number; roi: number; orders: number }
interface DashboardData { totals: { spend: number; gmv: number; roi: number; ctr: number; orders: number; impressions: number; clicks: number } | null; daily: DailyData[]; platforms: PlatformData[] }
interface ROIDaily { grade: string; gradeLabel: string; roi: number; ctr: number; ctrLabel: string; conversionRate: number; costPerOrder: number; avgOrderValue: number; suggestion: string; score: number }
interface BatchAnalysis { overall: { totalSpend: number; totalGMV: number; totalOrders: number; overallROI: number; avgCTR: number; avgConversionRate: number; grade: string; suggestion: string }; daily: ROIDaily[]; platformAnalysis: PlatformData[] }

const PURPLE_COLORS = ["#8b5cf6", "#7c3aed", "#6d28d9", "#a78bfa", "#c4b5fd"];

const tooltipStyle = {
  cursor: { fill: "rgba(255,255,255,0.03)" },
  contentStyle: {
    backgroundColor: "#18181b",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px",
    color: "#fafafa",
    fontSize: "12px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
    padding: "10px 14px",
  },
  labelStyle: { color: "#a1a1aa", fontWeight: 600 as const, marginBottom: 4 },
};

const gradeConfig: Record<string, { color: string; bg: string; border: string; icon: typeof Star; label: string }> = {
  excellent: { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: Star, label: "优秀" },
  normal: { color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20", icon: CheckCircle2, label: "正常" },
  poor: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", icon: AlertTriangle, label: "需优化" },
};

/* ── Chart wrapper: ensures transparent bg ── */
function ChartContainer({ children, height = 300 }: { children: React.ReactNode; height?: number }) {
  return (
    <div style={{ width: "100%", height, background: "transparent" }}>
      <ResponsiveContainer width="100%" height={height}>
        {children as React.ReactElement}
      </ResponsiveContainer>
    </div>
  );
}

function KPICard({ label, value, prefix = "", suffix = "", sub, trend, delay }: { label: string; value: string; prefix?: string; suffix?: string; sub?: string; trend?: number; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-4 sm:p-5 hover:bg-white/[0.04] transition-all">
      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">{label}</p>
      <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{prefix}{value}{suffix}</p>
      <div className="flex items-center gap-2 mt-2">
        {trend != null && (
          <span className={`flex items-center gap-1 text-[11px] font-semibold ${trend >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trend >= 0 ? "+" : ""}{trend}%
          </span>
        )}
        {sub && <span className="text-[11px] text-slate-600">{sub}</span>}
      </div>
    </motion.div>
  );
}

function GradeBadge({ grade }: { grade: string }) {
  const g = gradeConfig[grade] ?? gradeConfig.normal!;
  const Icon = g.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${g.bg} ${g.color} ${g.border}`}>
      <Icon className="h-3 w-3" /> {g.label}
    </span>
  );
}

/* ═══════════════════════════════════ MAIN ═══════════════════════════════════ */
export default function ROIAnalysisPage() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [analysis, setAnalysis] = useState<BatchAnalysis | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (!data.user) { setLoading(false); return; }
      Promise.all([
        fetch("/api/dashboard").then(r => r.ok ? r.json() : null),
        fetch("/api/analysis").then(r => r.ok ? r.json() : null),
      ]).then(([d, a]) => {
        if (d?.daily) setDashboard(d);
        if (a?.overall) setAnalysis(a);
        setLoading(false);
      }).catch(() => setLoading(false));
    });
  }, []);

  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-5">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center mx-auto">
            <BarChart3 className="h-8 w-8 text-indigo-400" />
          </div>
          <p className="text-slate-400 text-lg">请先登录</p>
          <Link href="/login"><Button className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600">去登录</Button></Link>
        </motion.div>
      </div>
    );
  }

  const totals = dashboard?.totals;
  const daily = dashboard?.daily || [];
  const platforms = dashboard?.platforms || [];
  const overall = analysis?.overall;
  const hasData = daily.length > 0;

  return (
    <div className="min-h-screen bg-[#09090b]">
      <Navbar user={user} showAuth={false} onLogout={async () => { await supabase.auth.signOut(); router.push("/login"); }} />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-24 pb-16 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-2">
          <Link href="/dashboard" className="p-2 rounded-xl border border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all"><ArrowLeft className="h-4 w-4" /></Link>
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center"><Target className="h-5 w-5 text-indigo-400" /></div>
          <div><h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">ROI 分析</h1><p className="text-slate-400 text-xs sm:text-sm mt-0.5">投入产出比深度分析</p></div>
          {overall && <div className="ml-auto"><GradeBadge grade={overall.grade} /></div>}
        </motion.div>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3"><div className="h-24 bg-white/[0.03] rounded-2xl" /><div className="h-24 bg-white/[0.03] rounded-2xl" /><div className="h-24 bg-white/[0.03] rounded-2xl" /><div className="h-24 bg-white/[0.03] rounded-2xl" /></div>
            <div className="h-80 bg-white/[0.03] rounded-2xl" />
          </div>
        ) : !hasData ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
            <div className="h-20 w-20 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-6"><BarChart3 className="h-10 w-10 text-slate-600" /></div>
            <h2 className="text-xl font-bold text-white mb-2">暂无分析数据</h2>
            <p className="text-slate-400 mb-8">上传 CSV 后自动生成 ROI 分析报告</p>
            <Link href="/upload"><Button className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 gap-2">上传数据</Button></Link>
          </motion.div>
        ) : (
          <>
            {/* KPI Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <KPICard label="总消耗" value={totals?.spend?.toLocaleString() || "0"} prefix="¥" sub="投放总成本" delay={0.05} />
              <KPICard label="总 GMV" value={totals?.gmv?.toLocaleString() || "0"} prefix="¥" sub="成交总额" trend={totals?.gmv && totals?.spend ? +(((totals.gmv - totals.spend) / totals.spend * 100) || 0).toFixed(1) : undefined} delay={0.1} />
              <KPICard label="整体 ROI" value={totals?.roi?.toFixed(2) || "0.00"} sub={overall ? `评级: ${gradeConfig[overall.grade]?.label || "–"}` : "投入产出比"} delay={0.15} />
              <KPICard label="总订单" value={totals?.orders?.toLocaleString() || "0"} sub={totals?.gmv && totals?.orders ? `客单 ¥${Math.round(totals.gmv / totals.orders).toLocaleString()}` : undefined} delay={0.2} />
            </div>



            {/* Charts row */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* ROI Trend Area Chart */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="rounded-2xl border border-white/[0.06] bg-transparent backdrop-blur-xl p-5 sm:p-6">
                <h3 className="text-sm font-semibold text-white mb-5">ROI 趋势</h3>
                <ChartContainer height={300}>
                  <AreaChart data={daily} style={{ background: "transparent" }}>
                    <defs>
                      <linearGradient id="roiFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} dy={8} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: "rgba(255,255,255,0.03)" }} contentStyle={tooltipStyle.contentStyle} labelStyle={tooltipStyle.labelStyle} />
                    <Area type="monotone" dataKey="roi" name="ROI" stroke="#8b5cf6" fill="url(#roiFill)" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: "#8b5cf6", stroke: "#fff", strokeWidth: 2 }} />
                  </AreaChart>
                </ChartContainer>
              </motion.div>

              {/* Platform ROI Bar Chart - PURPLE ONLY */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                className="rounded-2xl border border-white/[0.06] bg-transparent backdrop-blur-xl p-5 sm:p-6">
                <h3 className="text-sm font-semibold text-white mb-5">平台 ROI 对比</h3>
                {platforms.length > 0 ? (
                  <ChartContainer height={300}>
                    <BarChart data={platforms} barSize={32} style={{ background: "transparent" }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} dy={8} />
                      <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: "rgba(255,255,255,0.03)" }} contentStyle={tooltipStyle.contentStyle} labelStyle={tooltipStyle.labelStyle} />
                      <Bar dataKey="roi" name="ROI" radius={[8, 8, 0, 0]}>
                        {platforms.map((_, i) => (
                          <Cell key={i} fill={PURPLE_COLORS[i % PURPLE_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-slate-600 text-sm">暂无平台数据</div>
                )}
              </motion.div>
            </div>

            {/* Spend vs GMV Composed */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="rounded-2xl border border-white/[0.06] bg-transparent backdrop-blur-xl p-5 sm:p-6">
              <h3 className="text-sm font-semibold text-white mb-5">消耗 vs GMV 趋势</h3>
              <ChartContainer height={320}>
                <ComposedChart data={daily} style={{ background: "transparent" }}>
                  <defs>
                    <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gmvFill2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34d399" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} dy={8} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "rgba(255,255,255,0.03)" }} contentStyle={tooltipStyle.contentStyle} labelStyle={tooltipStyle.labelStyle} />
                  <Bar dataKey="spend" name="消耗" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={28} />
                  <Area type="monotone" dataKey="gmv" name="GMV" stroke="#34d399" fill="url(#gmvFill2)" strokeWidth={2.5} dot={false} />
                </ComposedChart>
              </ChartContainer>
            </motion.div>

            {/* Daily Breakdown Table */}
            {analysis?.daily && analysis.daily.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-white/[0.06]">
                  <h3 className="text-sm font-semibold text-white">每日 ROI 明细</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-white/[0.01]">
                        {["日期","ROI","CTR","转化率","单均成本","客单价","评分","评级"].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.daily.map((d, i) => {
                        const g = gradeConfig[d.grade] ?? gradeConfig.normal!;
                        return (
                          <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.03 }}
                            className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                            <td className="px-4 py-3 text-white font-mono text-xs">{daily[i]?.date || `D${i + 1}`}</td>
                            <td className="px-4 py-3">
                              <span className={`font-semibold ${d.roi >= 4 ? "text-emerald-400" : d.roi >= 2 ? "text-indigo-400" : "text-red-400"}`}>
                                {d.roi.toFixed(2)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-400">{(d.ctr * 100).toFixed(2)}%</td>
                            <td className="px-4 py-3 text-slate-400">{(d.conversionRate * 100).toFixed(2)}%</td>
                            <td className="px-4 py-3 text-slate-400">¥{d.costPerOrder.toFixed(0)}</td>
                            <td className="px-4 py-3 text-slate-400">¥{d.avgOrderValue.toFixed(0)}</td>
                            <td className="px-4 py-3"><span className="text-white font-semibold">{d.score}</span></td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${g.bg} ${g.color} ${g.border}`}>
                                <g.icon className="h-3 w-3" /> {g.label}
                              </span>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
