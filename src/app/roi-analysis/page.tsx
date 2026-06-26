"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { WorkspaceLayout } from "@/components/layout/workspace-layout";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, Target, BarChart3,
  ArrowLeft, Star, AlertTriangle, CheckCircle2
} from "lucide-react";
import Link from "next/link";
import {
  Area, BarChart, Bar,
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
  cursor: { fill: "rgba(15,23,42,0.03)" },
  contentStyle: {
    backgroundColor: "#ffffff",
    border: "1px solid #e5eaf0",
    borderRadius: "12px",
    color: "#0f172a",
    fontSize: "12px",
    boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
    padding: "10px 14px",
  },
  labelStyle: { color: "#64748b", fontWeight: 600 as const, marginBottom: 4 },
};

const gradeConfig: Record<string, { color: string; bg: string; border: string; icon: typeof Star; label: string }> = {
  excellent: { color: "text-[#16a34a]", bg: "bg-[#f0fdf4]", border: "border-[#16a34a]/20", icon: Star, label: "优秀" },
  normal: { color: "text-[#1688ff]", bg: "bg-[#eaf4ff]", border: "border-[#1688ff]/20", icon: CheckCircle2, label: "正常" },
  poor: { color: "text-[#ef4444]", bg: "bg-[#fef2f2]", border: "border-[#ef4444]/20", icon: AlertTriangle, label: "需优化" },
};

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
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }} className="rounded-[18px] border border-[#e5eaf0] bg-white p-4 sm:p-5 hover:shadow-[0_4px_16px_rgba(15,23,42,0.06)] transition-all">
      <p className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">{label}</p>
      <p className="text-2xl sm:text-3xl font-bold text-[#0f172a] tracking-tight">{prefix}{value}{suffix}</p>
      <div className="flex items-center gap-2 mt-2">
        {trend != null && (
          <span className={`flex items-center gap-1 text-[11px] font-semibold ${trend >= 0 ? "text-[#16a34a]" : "text-[#ef4444]"}`}>
            {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trend >= 0 ? "+" : ""}{trend}%
          </span>
        )}
        {sub && <span className="text-[11px] text-[#94a3b8]">{sub}</span>}
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

export default function ROIAnalysisPage() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [analysis, setAnalysis] = useState<BatchAnalysis | null>(null);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
      if (data.user) {
        fetchDashboard();
      }
    });
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      if (res.ok) setDashboard(data);
    } catch (err) { console.error(err); }
  };

  const runAnalysis = async () => {
    setAnalyzeLoading(true);
    try {
      const res = await fetch("/api/analysis", { method: "POST" });
      const data = await res.json();
      if (res.ok) setAnalysis(data);
    } catch (err) { console.error(err); }
    finally { setAnalyzeLoading(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f7fb] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1688ff] border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f3f7fb] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-[#64748b]">请先登录</p>
          <Button onClick={() => router.push("/login")} className="rounded-xl bg-[#1688ff] hover:bg-[#1670d9]">去登录</Button>
        </div>
      </div>
    );
  }

  const totals = dashboard?.totals;
  const daily = dashboard?.daily ?? [];

  const formatNum = (n: number) => {
    if (n >= 10000) return (n / 10000).toFixed(1) + "万";
    return n.toFixed(0);
  };
  const formatMoney = (n: number) => {
    if (n >= 10000) return "¥" + (n / 10000).toFixed(1) + "万";
    return "¥" + n.toFixed(0);
  };

  return (
    <WorkspaceLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-8 w-8 rounded-xl bg-[#eaf4ff] border border-[#1688ff]/20 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-[#1688ff]" />
              </div>
              <h1 className="text-2xl font-bold text-[#0f172a]">ROI 分析</h1>
            </div>
            <p className="text-[#64748b] text-sm mt-1">多维度数据分析，识别盈亏机会</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={fetchDashboard} className="rounded-xl border-[#e5eaf0] text-[#64748b] hover:text-[#0f172a] gap-1.5">
              刷新数据
            </Button>
            <Button onClick={runAnalysis} disabled={analyzeLoading} className="rounded-xl bg-[#1688ff] hover:bg-[#1670d9] gap-1.5">
              {analyzeLoading ? "分析中..." : "运行分析"}
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        {totals && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <KPICard label="总消耗" value={formatMoney(totals.spend)} trend={-5.2} delay={0.1} />
            <KPICard label="总GMV" value={formatMoney(totals.gmv)} trend={8.3} delay={0.15} />
            <KPICard label="整体ROI" value={totals.roi.toFixed(2)} trend={2.1} delay={0.2} />
            <KPICard label="订单数" value={formatNum(totals.orders)} sub="近7日" delay={0.25} />
          </div>
        )}

        {/* Analysis Results */}
        {analysis ? (
          <>
            {/* Overall grade */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="rounded-[18px] border border-[#e5eaf0] bg-white p-5 sm:p-6 mb-6 shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[#0f172a]">综合评估</h3>
                <GradeBadge grade={analysis.overall.grade} />
              </div>
              <p className="text-sm text-[#64748b] leading-relaxed">{analysis.overall.suggestion}</p>
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-[#e5eaf0]">
                <div className="text-center">
                  <p className="text-[11px] text-[#94a3b8] mb-1">总消耗</p>
                  <p className="text-lg font-bold text-[#0f172a]">¥{analysis.overall.totalSpend.toFixed(0)}</p>
                </div>
                <div className="text-center">
                  <p className="text-[11px] text-[#94a3b8] mb-1">总GMV</p>
                  <p className="text-lg font-bold text-[#0f172a]">¥{analysis.overall.totalGMV.toFixed(0)}</p>
                </div>
                <div className="text-center">
                  <p className="text-[11px] text-[#94a3b8] mb-1">整体ROI</p>
                  <p className="text-lg font-bold text-[#1688ff]">{analysis.overall.overallROI.toFixed(2)}</p>
                </div>
              </div>
            </motion.div>

            {/* Platform comparison */}
            {analysis.platformAnalysis && analysis.platformAnalysis.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                className="rounded-[18px] border border-[#e5eaf0] bg-white p-5 sm:p-6 mb-6 shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
                <h3 className="text-sm font-semibold text-[#0f172a] mb-5">平台对比</h3>
                <ChartContainer height={280}>
                  <BarChart data={analysis.platformAnalysis} style={{ background: "transparent" }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5eaf0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} dy={8} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: "rgba(15,23,42,0.03)" }} contentStyle={tooltipStyle.contentStyle} labelStyle={tooltipStyle.labelStyle} />
                    <Bar dataKey="roi" name="ROI" radius={[6, 6, 0, 0]} maxBarSize={40}>
                      {analysis.platformAnalysis.map((_, i) => (
                        <Cell key={i} fill={PURPLE_COLORS[i % PURPLE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </motion.div>
            )}

            {/* Spend vs GMV trend */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="rounded-[18px] border border-[#e5eaf0] bg-white p-5 sm:p-6 mb-6 shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
              <h3 className="text-sm font-semibold text-[#0f172a] mb-5">消耗 vs GMV 趋势</h3>
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5eaf0" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} dy={8} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "rgba(15,23,42,0.03)" }} contentStyle={tooltipStyle.contentStyle} labelStyle={tooltipStyle.labelStyle} />
                  <Bar dataKey="spend" name="消耗" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={28} />
                  <Area type="monotone" dataKey="gmv" name="GMV" stroke="#34d399" fill="url(#gmvFill2)" strokeWidth={2.5} dot={false} />
                </ComposedChart>
              </ChartContainer>
            </motion.div>

            {/* Daily Breakdown Table */}
            {analysis?.daily && analysis.daily.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
                className="rounded-[18px] border border-[#e5eaf0] bg-white overflow-hidden shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
                <div className="p-5 sm:p-6 border-b border-[#e5eaf0]">
                  <h3 className="text-sm font-semibold text-[#0f172a]">每日 ROI 明细</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#f8fafc]">
                        {["日期","ROI","CTR","转化率","单均成本","客单价","评分","评级"].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-[#64748b] uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.daily.map((d, i) => {
                        const g = gradeConfig[d.grade] ?? gradeConfig.normal!;
                        return (
                          <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.03 }}
                            className="border-b border-[#e5eaf0] hover:bg-[#f8fafc] transition-colors">
                            <td className="px-4 py-3 text-[#0f172a] font-mono text-xs">{daily[i]?.date || `D${i + 1}`}</td>
                            <td className="px-4 py-3">
                              <span className={`font-semibold ${d.roi >= 4 ? "text-[#16a34a]" : d.roi >= 2 ? "text-[#1688ff]" : "text-[#ef4444]"}`}>
                                {d.roi.toFixed(2)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-[#475569]">{(d.ctr * 100).toFixed(2)}%</td>
                            <td className="px-4 py-3 text-[#475569]">{(d.conversionRate * 100).toFixed(2)}%</td>
                            <td className="px-4 py-3 text-[#475569]">¥{d.costPerOrder.toFixed(0)}</td>
                            <td className="px-4 py-3 text-[#475569]">¥{d.avgOrderValue.toFixed(0)}</td>
                            <td className="px-4 py-3"><span className="text-[#0f172a] font-semibold">{d.score}</span></td>
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
        ) : (
          /* Empty state */
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-[18px] border border-[#e5eaf0] bg-white p-10 text-center shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
            <Target className="h-12 w-12 mx-auto text-[#94a3b8] mb-4" />
            <h3 className="text-lg font-semibold text-[#0f172a] mb-2">运行分析以查看结果</h3>
            <p className="text-[#64748b] text-sm mb-6">点击上方"运行分析"按钮，AI 将自动分析你的投放数据</p>
            <Button onClick={runAnalysis} disabled={analyzeLoading} className="rounded-xl bg-[#1688ff] hover:bg-[#1670d9] gap-2">
              {analyzeLoading ? "分析中..." : "开始分析"}
            </Button>
          </motion.div>
        )}

        {/* Back link */}
        <div className="mt-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-[#94a3b8] hover:text-[#1688ff] transition-colors">
            <ArrowLeft className="h-4 w-4" /> 返回仪表盘
          </Link>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
