"use client";

import { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/layout/navbar";
import {
  Brain, Sparkles, FileDown, RefreshCw, Play, Loader2,
  TrendingUp, TrendingDown, ShieldAlert,
  AlertTriangle, CheckCircle2, Zap, CalendarDays,
  Target, Eye, Lightbulb, ArrowUpRight, ArrowDownRight,
  PieChart, LineChart, Activity, DollarSign,
  FileText, XCircle,
} from "lucide-react";

/* ── Types ── */

interface DirectorReport {
  generatedAt: string;
  dataRange: { from: string; to: string };
  summary: string;
  overallMetrics: { totalSpend: number; totalGMV: number; totalOrders: number; overallROI: number; avgCTR: number; avgCVR: number };
  dataAnalysis: { summary: string; platformBreakdown: { platform: string; spend: number; gmv: number; roi: number; share: number }[]; dailyTrend: { date: string; spend: number; roi: number }[]; keyFindings: string[] };
  strategy: { currentStrategy: string; recommendations: string[]; priority: string; expectedImpact: string };
  budgetOptimization: { currentAllocation: { platform: string; spend: number; percentage: number }[]; optimizedAllocation: { platform: string; spend: number; percentage: number; change: number }[]; totalRecommended: number; savingsPotential: number; advice: string };
  creativeDiagnosis: { overallScore: number; findings: { dimension: string; score: number; detail: string }[]; suggestions: string[] };
  anomalyDetection: { hasAnomalies: boolean; anomalies: { date: string; platform: string; metric: string; value: number; expected: number; severity: string }[]; summary: string };
  trendPrediction: { next7Days: { date: string; predictedROI: number; predictedSpend: number; confidence: number }[]; trend: string; confidence: number; factors: string[] };
  suggestions: { increaseInvest: { platform: string; reason: string; amount: number; expectedROI: number }[]; decreaseInvest: { platform: string; reason: string; amount: number; expectedSave: number }[]; stopInvest: { platform: string; reason: string }[]; urgentActions: string[] };
  score: number;
}

interface DailyReport { date: string; summary: string; metrics: { spend: number; gmv: number; roi: number; orders: number; impressions: number; clicks: number }; highlights: string[]; alerts: string[]; suggestions: string[] }
interface WeeklyReport { week: string; summary: string; weeklyMetrics: { totalSpend: number; totalGMV: number; overallROI: number; totalOrders: number }; comparison: { spendChange: number; roiChange: number; ordersChange: number }; topPlatforms: { platform: string; roi: number; spend: number }[]; keyInsights: string[]; nextWeekPlan: string[] }


/* ── Styles ── */

const bg = "#09090b";
const cardBg = "rgba(255,255,255,.02)";
const cardBorder = "rgba(255,255,255,.06)";
const muted = "#94a3b8";
const textWhite = "#f1f5f9";

const S = {
  page: { minHeight: "100vh", background: bg } as React.CSSProperties,
  main: { maxWidth: 1200, margin: "0 auto", padding: "96px 20px 80px" } as React.CSSProperties,
  headerRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginBottom: 32 } as React.CSSProperties,
  titleRow: { display: "flex", alignItems: "center", gap: 16 } as React.CSSProperties,
  iconBox: { width: 52, height: 52, borderRadius: 16, background: "linear-gradient(135deg, rgba(99,102,241,.15), rgba(168,85,247,.15))", border: "1px solid rgba(99,102,241,.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 } as React.CSSProperties,
  h1: { fontSize: 26, fontWeight: 700, color: textWhite, lineHeight: 1.2 } as React.CSSProperties,
  sub: { fontSize: 14, color: muted, marginTop: 3 } as React.CSSProperties,
  btnRow: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" } as React.CSSProperties,
  btnPrimary: { display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 12, fontWeight: 500, transition: "all .2s", cursor: "pointer", background: "linear-gradient(to right, #4f46e5, #9333ea)", color: "#fff", boxShadow: "0 4px 16px rgba(79,70,229,.25)", height: 46, padding: "0 24px", fontSize: 14, border: "none", outline: "none" } as React.CSSProperties,
  btnPrimaryDisabled: { opacity: 0.4, pointerEvents: "none" } as React.CSSProperties,
  btnSm: { display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 10, fontWeight: 500, transition: "all .2s", cursor: "pointer", background: "rgba(255,255,255,.03)", color: muted, border: "1px solid rgba(255,255,255,.08)", height: 36, padding: "0 16px", fontSize: 13 } as React.CSSProperties,
  scoreRing: { width: 100, height: 100, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 } as React.CSSProperties,
  scoreText: { fontSize: 32, fontWeight: 800, color: textWhite } as React.CSSProperties,
  scoreSub: { fontSize: 12, color: muted } as React.CSSProperties,
  metricGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 32 } as React.CSSProperties,
  metricCard: { borderRadius: 16, background: cardBg, border: "1px solid " + cardBorder, padding: 20 } as React.CSSProperties,
  metricLabel: { fontSize: 12, color: muted, textTransform: "uppercase", letterSpacing: ".5px", fontWeight: 500, marginBottom: 6 } as React.CSSProperties,
  metricValue: { fontSize: 26, fontWeight: 700, color: textWhite } as React.CSSProperties,
  metricChange: (v: number) => ({ fontSize: 12, color: v > 0 ? "#34d399" : v < 0 ? "#f87171" : muted, marginTop: 2 } as React.CSSProperties),
  section: { marginBottom: 32 } as React.CSSProperties,
  sectionHeader: { display: "flex", alignItems: "center", gap: 12, marginBottom: 16 } as React.CSSProperties,
  sectionTitle: { fontSize: 17, fontWeight: 600, color: textWhite } as React.CSSProperties,
  sectionSub: { fontSize: 12, color: muted, marginTop: 1 } as React.CSSProperties,
  card: { borderRadius: 16, background: cardBg, border: "1px solid " + cardBorder, padding: 24 } as React.CSSProperties,
  cardHighlight: { borderRadius: 16, background: "linear-gradient(to right, rgba(99,102,241,.04), rgba(168,85,247,.04))", border: "1px solid rgba(99,102,241,.15)", padding: 24 } as React.CSSProperties,
  bodyText: { fontSize: 14, color: "#cbd5e1", lineHeight: 1.7, margin: 0 } as React.CSSProperties,
  mutedText: { fontSize: 13, color: muted, fontStyle: "italic" } as React.CSSProperties,
  grid2: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 20 } as React.CSSProperties,
  grid3: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 } as React.CSSProperties,
  progressBar: { width: "100%", height: 6, borderRadius: 9999, background: "rgba(255,255,255,.04)", overflow: "hidden" } as React.CSSProperties,
  table: { width: "100%", borderCollapse: "collapse" } as React.CSSProperties,
  th: { textAlign: "left", fontSize: 12, color: muted, fontWeight: 500, padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,.06)" } as React.CSSProperties,
  td: { padding: "10px 12px", fontSize: 13, color: textWhite, borderBottom: "1px solid rgba(255,255,255,.03)" } as React.CSSProperties,
  tdRight: { padding: "10px 12px", fontSize: 13, color: textWhite, borderBottom: "1px solid rgba(255,255,255,.03)", textAlign: "right" } as React.CSSProperties,
  empty: { textAlign: "center", padding: "80px 20px", color: muted } as React.CSSProperties,
  tabs: { display: "flex", gap: 4, marginBottom: 28, background: "rgba(255,255,255,.02)", borderRadius: 14, padding: 4, border: "1px solid rgba(255,255,255,.05)" } as React.CSSProperties,
  tab: (active: boolean): React.CSSProperties => ({ padding: "10px 20px", borderRadius: 11, fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all .2s", border: "none", background: active ? "rgba(99,102,241,.15)" : "transparent", color: active ? textWhite : muted }),
};


/* ── sectionIcon helper ── */
const sectionIcon = (c: string): React.CSSProperties => {
  const m: Record<string, { bg: string; border: string; color: string }> = {
    indigo: { bg: "rgba(99,102,241,.1)", border: "rgba(99,102,241,.2)", color: "#818cf8" },
    emerald: { bg: "rgba(52,211,153,.1)", border: "rgba(52,211,153,.2)", color: "#34d399" },
    amber: { bg: "rgba(251,191,36,.1)", border: "rgba(251,191,36,.2)", color: "#fbbf24" },
    red: { bg: "rgba(239,68,68,.1)", border: "rgba(239,68,68,.2)", color: "#f87171" },
    purple: { bg: "rgba(168,85,247,.1)", border: "rgba(168,85,247,.2)", color: "#a78bfa" },
    cyan: { bg: "rgba(6,182,212,.1)", border: "rgba(6,182,212,.2)", color: "#22d3ee" },
  };
  const s = m[c] ?? m.indigo;
  return { width: 38, height: 38, borderRadius: 12, background: s!.bg, border: "1px solid " + s!.border, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: s!.color };
};

/* ── tag helper ── */
const tag = (c: string): React.CSSProperties => {
  const m: Record<string, { bg: string; border: string; color: string }> = {
    green: { bg: "rgba(52,211,153,.1)", border: "rgba(52,211,153,.2)", color: "#34d399" },
    amber: { bg: "rgba(251,191,36,.1)", border: "rgba(251,191,36,.2)", color: "#fbbf24" },
    red: { bg: "rgba(239,68,68,.1)", border: "rgba(239,68,68,.2)", color: "#f87171" },
    blue: { bg: "rgba(96,165,250,.1)", border: "rgba(96,165,250,.2)", color: "#60a5fa" },
  };
  const s = m[c] ?? m.blue;
  return { display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 600, border: "1px solid " + s!.border, background: s!.bg, color: s!.color };
};

/* ── itemRow helper ── */
const itemRow = (_c: string): React.CSSProperties => ({ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0", borderTop: "1px solid rgba(255,255,255,.04)", color: textWhite, fontSize: 14, lineHeight: 1.6 });

/* ── progressFill helper ── */
const progressFill = (p: number, c: string): React.CSSProperties => ({
  width: Math.min(100, p) + "%", height: "100%", borderRadius: 9999,
  background: c === "green" ? "linear-gradient(to right, #22c55e, #10b981)" : c === "indigo" ? "linear-gradient(to right, #6366f1, #a855f7)" : "linear-gradient(to right, #f59e0b, #f97316)",
  transition: "width .6s",
});

/* ── formatters ── */
const fmt = (n: number) => n.toLocaleString("zh-CN");
const pct = (n: number) => (n * 100).toFixed(0) + "%";
const rmb = (n: number) => "¥" + fmt(Math.round(n));

/* ── score ring gradient ── */
const scoreGradient = (s: number) => s >= 80
  ? "conic-gradient(#34d399 " + s * 3.6 + "deg, rgba(255,255,255,.06) 0deg)"
  : s >= 50
  ? "conic-gradient(#fbbf24 " + s * 3.6 + "deg, rgba(255,255,255,.06) 0deg)"
  : "conic-gradient(#f87171 " + s * 3.6 + "deg, rgba(255,255,255,.06) 0deg)";

type TabKey = "full" | "daily" | "weekly";

/* ═══════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════ */

export default function AIDirectorPage() {
  const [tab, setTab] = useState<TabKey>("full");
  const [fullReport, setFullReport] = useState<DirectorReport | null>(null);
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hoverBtn, setHoverBtn] = useState<string | null>(null);

  const fetchReport = useCallback(async (mode: TabKey) => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/director?mode=" + mode);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || json.error || "请求失败");
      if (mode === "full") setFullReport(json.data);
      else if (mode === "daily") setDailyReport(json.data);
      else setWeeklyReport(json.data);
    } catch (e: unknown) {
      setError((e as Error).message || "加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReport(tab); }, [tab, fetchReport]);

  const exportReport = () => {
    const data = tab === "full" ? fullReport : tab === "daily" ? dailyReport : weeklyReport;
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "ai-director-" + tab + "-report.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={S.page}>
      <Navbar />
      <div style={S.main}>
        {/* Header */}
        <div style={S.headerRow}>
          <div style={S.titleRow}>
            <div style={S.iconBox}><Brain size={26} color="#a78bfa" /></div>
            <div>
              <h1 style={S.h1}>AI 投流总监</h1>
              <p style={S.sub}>智能数据分析 · 策略优化 · 预算管理 · 异常检测 · 趋势预测</p>
            </div>
          </div>
          <div style={S.btnRow}>
            <button style={{ ...S.btnSm, ...(hoverBtn === "refresh" ? { background: "rgba(255,255,255,.06)" } : {}) }}
              onMouseEnter={() => setHoverBtn("refresh")} onMouseLeave={() => setHoverBtn(null)}
              onClick={() => fetchReport(tab)} disabled={loading}>
              {loading ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : <RefreshCw size={15} />}
              刷新分析
            </button>
            {(fullReport || dailyReport || weeklyReport) && (
              <button style={{ ...S.btnSm, ...(hoverBtn === "export" ? { background: "rgba(255,255,255,.06)" } : {}) }}
                onMouseEnter={() => setHoverBtn("export")} onMouseLeave={() => setHoverBtn(null)}
                onClick={exportReport}>
                <FileDown size={15} /> 导出报告
              </button>
            )}
            <button style={S.btnPrimary} disabled={loading} onClick={() => fetchReport(tab)}>
              {loading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Play size={16} />}
              开始分析
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={S.tabs}>
          <button style={S.tab(tab === "full")} onClick={() => setTab("full")}><Brain size={14} style={{ marginRight: 6 }} />AI 总监报告</button>
          <button style={S.tab(tab === "daily")} onClick={() => setTab("daily")}><CalendarDays size={14} style={{ marginRight: 6 }} />运营日报</button>
          <button style={S.tab(tab === "weekly")} onClick={() => setTab("weekly")}><FileText size={14} style={{ marginRight: 6 }} />运营周报</button>
        </div>

        {/* Error */}
        {error && (
          <div style={{ ...S.cardHighlight, marginBottom: 24, borderColor: "rgba(239,68,68,.2)", background: "rgba(239,68,68,.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <XCircle size={18} color="#f87171" />
              <p style={{ ...S.bodyText, color: "#f87171", margin: 0 }}>{error}</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={S.empty}>
            <Loader2 size={40} color="#a78bfa" style={{ animation: "spin 1s linear infinite", marginBottom: 16 }} />
            <p style={{ fontSize: 15, color: muted }}>AI 总监正在分析数据...</p>
          </div>
        )}

        {!loading && tab === "full" && fullReport && <ReportView report={fullReport} />}
        {!loading && tab === "daily" && dailyReport && <DailyView report={dailyReport} />}
        {!loading && tab === "weekly" && weeklyReport && <WeeklyView report={weeklyReport} />}
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════
   Section Wrapper
   ═══════════════════════════════════════════ */

function Section({ icon, title, sub, color, tag: tagLabel, children }: {
  icon: React.ReactNode; title: string; sub: string; color: string;
  tag?: string; children: React.ReactNode;
}) {
  const tagText: Record<string, string> = { green: "优秀", red: "紧急", amber: "注意" };
  return (
    <div style={S.section}>
      <div style={S.sectionHeader}>
        <div style={sectionIcon(color)}>{icon}</div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={S.sectionTitle}>{title}</span>
            {tagLabel && <span style={tag(tagLabel)}>{tagText[tagLabel] || ""}</span>}
          </div>
          <div style={S.sectionSub}>{sub}</div>
        </div>
      </div>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════
   ReportView - Full AI Director Report
   ═══════════════════════════════════════════ */

function ReportView({ report: r }: { report: DirectorReport }) {
  return (
    <div>
      {/* Summary + Score + Metrics */}
      <div style={{ ...S.grid2, marginBottom: 32 }}>
        <div style={{ ...S.cardHighlight, display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ ...S.scoreRing, background: scoreGradient(r.score), position: "relative" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#09090b", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: r.score >= 80 ? "#34d399" : r.score >= 50 ? "#fbbf24" : "#f87171" }}>{r.score}</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, color: muted, marginBottom: 4 }}>投流健康分</div>
            <div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.6 }}>{r.summary}</div>
            <div style={{ fontSize: 11, color: "#475569", marginTop: 8 }}>
              数据范围：{r.dataRange.from} ~ {r.dataRange.to} · 生成时间：{new Date(r.generatedAt).toLocaleString("zh-CN")}
            </div>
          </div>
        </div>
        <div style={S.metricGrid}>
          {[
            { label: "总消耗", value: rmb(r.overallMetrics.totalSpend) },
            { label: "总GMV", value: rmb(r.overallMetrics.totalGMV) },
            { label: "整体ROI", value: pct(r.overallMetrics.overallROI) },
            { label: "总订单", value: fmt(r.overallMetrics.totalOrders) },
            { label: "平均CTR", value: (r.overallMetrics.avgCTR * 100).toFixed(2) + "%" },
            { label: "平均CVR", value: (r.overallMetrics.avgCVR * 100).toFixed(2) + "%" },
          ].map((m, i) => (
            <div key={i} style={S.metricCard}>
              <div style={S.metricLabel}>{m.label}</div>
              <div style={S.metricValue}>{m.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 1. AI Data Analysis */}
      <Section icon={<PieChart size={18} />} title="AI 数据分析" sub={r.dataAnalysis.summary} color="indigo">
        <div style={S.grid2}>
          <div style={S.card}>
            <table style={S.table}>
              <thead><tr><th style={S.th}>平台</th><th style={{ ...S.th, textAlign: "right" }}>消耗</th><th style={{ ...S.th, textAlign: "right" }}>ROI</th><th style={{ ...S.th, textAlign: "right" }}>占比</th></tr></thead>
              <tbody>
                {r.dataAnalysis.platformBreakdown.map((p, i) => (
                  <tr key={i}>
                    <td style={S.td}>{p.platform}</td>
                    <td style={S.tdRight}>{rmb(p.spend)}</td>
                    <td style={{ ...S.tdRight, color: p.roi >= 2 ? "#34d399" : p.roi >= 0 ? "#fbbf24" : "#f87171" }}>{pct(p.roi)}</td>
                    <td style={S.tdRight}>{(p.share * 100).toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <div style={{ ...S.sectionTitle, fontSize: 15, marginBottom: 12 }}>关键发现</div>
            {r.dataAnalysis.keyFindings.map((k, i) => (
              <div key={i} style={itemRow("indigo")}>
                <Lightbulb size={15} color="#818cf8" style={{ marginTop: 1, flexShrink: 0 }} />
                <p style={S.bodyText}>{k}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* 2. AI Strategy */}
      <Section icon={<Target size={18} />} title="AI 投流策略" sub={r.strategy.currentStrategy + " · " + r.strategy.expectedImpact} color="purple"
        tag={r.strategy.priority === "high" ? "red" : r.strategy.priority === "medium" ? "amber" : "green"}>
        <div style={S.card}>
          {r.strategy.recommendations.map((rec, i) => (
            <div key={i} style={{ ...itemRow("purple"), borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,.04)" }}>
              <Sparkles size={15} color="#a78bfa" style={{ marginTop: 1, flexShrink: 0 }} />
              <p style={S.bodyText}>{rec}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 3. AI Budget Optimization */}
      <Section icon={<DollarSign size={18} />} title="AI 预算优化" sub={"建议总预算: " + rmb(r.budgetOptimization.totalRecommended) + " · 可节省: " + rmb(r.budgetOptimization.savingsPotential)} color="emerald">
        <p style={{ ...S.bodyText, marginBottom: 16 }}>{r.budgetOptimization.advice}</p>
        <div style={S.grid2}>
          <div style={S.card}>
            <div style={{ ...S.sectionTitle, fontSize: 14, marginBottom: 12 }}>当前分配</div>
            {r.budgetOptimization.currentAllocation.map((p, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#cbd5e1", marginBottom: 4 }}>
                  <span>{p.platform}</span><span>{rmb(p.spend)} ({(p.percentage*100).toFixed(0)}%)</span>
                </div>
                <div style={S.progressBar}><div style={progressFill(p.percentage * 100, "indigo")} /></div>
              </div>
            ))}
          </div>
          <div style={S.card}>
            <div style={{ ...S.sectionTitle, fontSize: 14, marginBottom: 12 }}>优化分配</div>
            {r.budgetOptimization.optimizedAllocation.map((p, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#cbd5e1", marginBottom: 4 }}>
                  <span>{p.platform}</span>
                  <span>{rmb(p.spend)} ({(p.percentage*100).toFixed(0)}%)
                    <span style={{ marginLeft: 6, fontSize: 12, color: p.change > 0 ? "#34d399" : p.change < 0 ? "#f87171" : muted }}>
                      {p.change > 0 ? "+" : ""}{p.change}%
                    </span>
                  </span>
                </div>
                <div style={S.progressBar}><div style={progressFill(p.percentage * 100, "green")} /></div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* 4. AI Creative Diagnosis */}
      <Section icon={<Eye size={18} />} title="AI 素材诊断" sub={"综合评分: " + r.creativeDiagnosis.overallScore + "/100"} color="cyan">
        <div style={S.grid2}>
          <div style={S.card}>
            {r.creativeDiagnosis.findings.map((f, i) => (
              <div key={i} style={{ marginBottom: i < r.creativeDiagnosis.findings.length - 1 ? 16 : 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#cbd5e1", marginBottom: 4 }}>
                  <span>{f.dimension}</span><span>{f.score}/100</span>
                </div>
                <div style={S.progressBar}><div style={progressFill(f.score, f.score >= 70 ? "green" : f.score >= 40 ? "indigo" : "orange")} /></div>
                <p style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{f.detail}</p>
              </div>
            ))}
          </div>
          <div style={S.card}>
            <div style={{ ...S.sectionTitle, fontSize: 14, marginBottom: 12 }}>优化建议</div>
            {r.creativeDiagnosis.suggestions.map((s, i) => (
              <div key={i} style={itemRow("cyan")}>
                <Lightbulb size={15} color="#22d3ee" style={{ marginTop: 1, flexShrink: 0 }} />
                <p style={S.bodyText}>{s}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* 5. AI Anomaly Detection */}
      <Section icon={<ShieldAlert size={18} />} title="AI 异常检测" sub={r.anomalyDetection.hasAnomalies ? "发现 " + r.anomalyDetection.anomalies.length + " 个异常" : "数据正常"} color="red">
        <p style={{ ...S.bodyText, marginBottom: 16 }}>{r.anomalyDetection.summary}</p>
        {r.anomalyDetection.hasAnomalies && (
          <div style={S.card}>
            <table style={S.table}>
              <thead><tr>
                <th style={S.th}>日期</th><th style={S.th}>平台</th><th style={S.th}>指标</th>
                <th style={{ ...S.th, textAlign: "right" }}>实际值</th><th style={{ ...S.th, textAlign: "right" }}>预期值</th><th style={S.th}>级别</th>
              </tr></thead>
              <tbody>
                {r.anomalyDetection.anomalies.map((a, i) => (
                  <tr key={i}>
                    <td style={S.td}>{a.date}</td><td style={S.td}>{a.platform}</td><td style={S.td}>{a.metric}</td>
                    <td style={S.tdRight}>{typeof a.value === "number" && a.value < 1 ? (a.value * 100).toFixed(2) + "%" : fmt(Math.round(a.value))}</td>
                    <td style={S.tdRight}>{typeof a.expected === "number" && a.expected < 1 ? (a.expected * 100).toFixed(2) + "%" : fmt(Math.round(a.expected))}</td>
                    <td style={S.td}><span style={tag(a.severity === "critical" ? "red" : a.severity === "warning" ? "amber" : "blue")}>{a.severity === "critical" ? "严重" : a.severity === "warning" ? "警告" : "信息"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* 6. AI Trend Prediction */}
      <Section icon={<LineChart size={18} />} title="AI 趋势预测" sub={"趋势: " + (r.trendPrediction.trend === "rising" ? "上升" : r.trendPrediction.trend === "declining" ? "下降" : "平稳") + " · 置信度: " + r.trendPrediction.confidence + "%"} color="indigo"
        tag={r.trendPrediction.trend === "rising" ? "green" : r.trendPrediction.trend === "declining" ? "red" : "amber"}>
        <div style={S.grid2}>
          <div style={S.card}>
            <div style={{ ...S.sectionTitle, fontSize: 14, marginBottom: 12 }}>未来7天预测</div>
            {r.trendPrediction.next7Days.length > 0 ? (
              <table style={S.table}>
                <thead><tr>
                  <th style={S.th}>日期</th><th style={{ ...S.th, textAlign: "right" }}>预测ROI</th><th style={{ ...S.th, textAlign: "right" }}>预测消耗</th><th style={{ ...S.th, textAlign: "right" }}>置信度</th>
                </tr></thead>
                <tbody>
                  {r.trendPrediction.next7Days.map((d, i) => (
                    <tr key={i}>
                      <td style={S.td}>{d.date}</td>
                      <td style={{ ...S.tdRight, color: d.predictedROI >= 200 ? "#34d399" : d.predictedROI >= 100 ? "#fbbf24" : "#f87171" }}>{d.predictedROI}%</td>
                      <td style={S.tdRight}>{rmb(d.predictedSpend)}</td>
                      <td style={S.tdRight}>{d.confidence}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p style={S.mutedText}>数据不足，无法预测</p>}
          </div>
          <div>
            <div style={{ ...S.sectionTitle, fontSize: 14, marginBottom: 12 }}>影响因素</div>
            {r.trendPrediction.factors.map((f, i) => (
              <div key={i} style={itemRow("indigo")}>
                <Activity size={15} color="#818cf8" style={{ marginTop: 1, flexShrink: 0 }} />
                <p style={S.bodyText}>{f}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* 7. Increase/Decrease Suggestions */}
      <Section icon={<Zap size={18} />} title="AI 加投/减投建议" sub="智能投放决策" color="emerald">
        <div style={S.grid2}>
          <div style={S.card}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <ArrowUpRight size={16} color="#34d399" /><span style={{ ...S.sectionTitle, fontSize: 14 }}>加投建议</span>
            </div>
            {r.suggestions.increaseInvest.length > 0 ? r.suggestions.increaseInvest.map((s, i) => (
              <div key={i} style={{ ...itemRow("emerald"), borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,.04)" }}>
                <TrendingUp size={15} color="#34d399" style={{ marginTop: 1, flexShrink: 0 }} />
                <div>
                  <p style={{ ...S.bodyText, fontWeight: 500, margin: 0 }}>{s.platform} — 建议加投 {rmb(s.amount)}</p>
                  <p style={{ fontSize: 12, color: muted, margin: "2px 0 0" }}>{s.reason} · 预期ROI: {s.expectedROI}%</p>
                </div>
              </div>
            )) : <p style={S.mutedText}>暂无加投建议</p>}
          </div>
          <div style={S.card}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <ArrowDownRight size={16} color="#f87171" /><span style={{ ...S.sectionTitle, fontSize: 14 }}>减投/停投建议</span>
            </div>
            {(() => {
              const items: { type: string; platform: string; reason: string; amount: number; expectedSave: number }[] = [
                ...r.suggestions.decreaseInvest.map(s => ({ type: "decrease", ...s })),
                ...r.suggestions.stopInvest.map(s => ({ type: "stop", platform: s.platform, reason: s.reason, amount: 0, expectedSave: 0 })),
              ];
              return items.length > 0 ? items.map((s, i) => (
                <div key={i} style={{ ...itemRow("red"), borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,.04)" }}>
                  <TrendingDown size={15} color="#f87171" style={{ marginTop: 1, flexShrink: 0 }} />
                  <div>
                    <p style={{ ...S.bodyText, fontWeight: 500, margin: 0 }}>
                      {s.platform} — {s.type === "stop" ? "建议立即暂停" : "建议减投 " + rmb(s.amount)}
                    </p>
                    <p style={{ fontSize: 12, color: muted, margin: "2px 0 0" }}>{s.reason}{s.type === "decrease" ? " · 预计节省: " + rmb(s.expectedSave) : ""}</p>
                  </div>
                </div>
              )) : <p style={S.mutedText}>暂无减投建议</p>;
            })()}
          </div>
        </div>
        {r.suggestions.urgentActions.length > 0 && (
          <div style={{ ...S.cardHighlight, marginTop: 16, borderColor: "rgba(251,191,36,.2)", background: "rgba(251,191,36,.04)" }}>
            <div style={{ ...S.sectionTitle, fontSize: 14, marginBottom: 10 }}>紧急操作</div>
            {r.suggestions.urgentActions.map((a, i) => (
              <div key={i} style={{ ...itemRow("amber"), borderTop: "none" }}>
                <AlertTriangle size={15} color="#fbbf24" style={{ marginTop: 1, flexShrink: 0 }} />
                <p style={S.bodyText}>{a}</p>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}


/* ═══════════════════════════════════════════
   DailyView
   ═══════════════════════════════════════════ */

function DailyView({ report: r }: { report: DailyReport }) {
  return (
    <div>
      <div style={{ ...S.cardHighlight, marginBottom: 24, display: "flex", alignItems: "center", gap: 20 }}>
        <CalendarDays size={32} color="#a78bfa" />
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: textWhite }}>{r.date} 运营日报</div>
          <div style={{ ...S.bodyText, marginTop: 4 }}>{r.summary}</div>
        </div>
      </div>

      <div style={S.metricGrid}>
        {[
          { label: "消耗", value: rmb(r.metrics.spend) },
          { label: "GMV", value: rmb(r.metrics.gmv) },
          { label: "ROI", value: pct(r.metrics.roi) },
          { label: "订单", value: fmt(r.metrics.orders) },
          { label: "曝光", value: fmt(r.metrics.impressions) },
          { label: "点击", value: fmt(r.metrics.clicks) },
        ].map((m, i) => (
          <div key={i} style={S.metricCard}>
            <div style={S.metricLabel}>{m.label}</div>
            <div style={S.metricValue}>{m.value}</div>
          </div>
        ))}
      </div>

      <div style={S.grid2}>
        <div style={S.card}>
          <div style={{ ...S.sectionTitle, fontSize: 14, marginBottom: 12, color: "#34d399" }}>亮点</div>
          {r.highlights.length > 0 ? r.highlights.map((h, i) => (
            <div key={i} style={itemRow("emerald")}><CheckCircle2 size={15} color="#34d399" style={{ marginTop: 1, flexShrink: 0 }} /><p style={S.bodyText}>{h}</p></div>
          )) : <p style={S.mutedText}>今日数据平稳</p>}
        </div>
        <div style={S.card}>
          <div style={{ ...S.sectionTitle, fontSize: 14, marginBottom: 12, color: "#f87171" }}>预警</div>
          {r.alerts.length > 0 ? r.alerts.map((a, i) => (
            <div key={i} style={itemRow("red")}><AlertTriangle size={15} color="#f87171" style={{ marginTop: 1, flexShrink: 0 }} /><p style={S.bodyText}>{a}</p></div>
          )) : <p style={S.mutedText}>无异常预警</p>}
        </div>
      </div>

      <div style={{ ...S.card, marginTop: 20 }}>
        <div style={{ ...S.sectionTitle, fontSize: 14, marginBottom: 10 }}>建议</div>
        {r.suggestions.map((s, i) => (
          <div key={i} style={itemRow("indigo")}><Lightbulb size={15} color="#818cf8" style={{ marginTop: 1, flexShrink: 0 }} /><p style={S.bodyText}>{s}</p></div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   WeeklyView
   ═══════════════════════════════════════════ */

function WeeklyView({ report: r }: { report: WeeklyReport }) {
  return (
    <div>
      <div style={{ ...S.cardHighlight, marginBottom: 24, display: "flex", alignItems: "center", gap: 20 }}>
        <FileText size={32} color="#a78bfa" />
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: textWhite }}>周报 · {r.week}</div>
          <div style={{ ...S.bodyText, marginTop: 4 }}>{r.summary}</div>
        </div>
      </div>

      <div style={S.metricGrid}>
        {[
          { label: "总消耗", value: rmb(r.weeklyMetrics.totalSpend), change: r.comparison.spendChange },
          { label: "总GMV", value: rmb(r.weeklyMetrics.totalGMV), change: 0 },
          { label: "整体ROI", value: pct(r.weeklyMetrics.overallROI), change: r.comparison.roiChange },
          { label: "总订单", value: fmt(r.weeklyMetrics.totalOrders), change: r.comparison.ordersChange },
        ].map((m, i) => (
          <div key={i} style={S.metricCard}>
            <div style={S.metricLabel}>{m.label}</div>
            <div style={S.metricValue}>{m.value}</div>
            {m.change !== 0 && (
              <div style={{ fontSize: 12, color: m.change > 0 ? "#34d399" : "#f87171", marginTop: 2 }}>
                {m.change > 0 ? <ArrowUpRight size={14} color="#34d399" style={{ verticalAlign: -2 }} /> : <ArrowDownRight size={14} color="#f87171" style={{ verticalAlign: -2 }} />}
                {" "}环比 {m.change > 0 ? "+" : ""}{m.change}%
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={S.grid2}>
        <div style={S.card}>
          <div style={{ ...S.sectionTitle, fontSize: 14, marginBottom: 12 }}>平台表现</div>
          {r.topPlatforms.length > 0 ? (
            <table style={S.table}>
              <thead><tr><th style={S.th}>平台</th><th style={{ ...S.th, textAlign: "right" }}>消耗</th><th style={{ ...S.th, textAlign: "right" }}>ROI</th></tr></thead>
              <tbody>
                {r.topPlatforms.map((p, i) => (
                  <tr key={i}><td style={S.td}>{p.platform}</td><td style={S.tdRight}>{rmb(p.spend)}</td><td style={{ ...S.tdRight, color: p.roi >= 2 ? "#34d399" : p.roi >= 0 ? "#fbbf24" : "#f87171" }}>{pct(p.roi)}</td></tr>
                ))}
              </tbody>
            </table>
          ) : <p style={S.mutedText}>暂无平台数据</p>}
        </div>
        <div>
          <div style={{ ...S.card, marginBottom: 16 }}>
            <div style={{ ...S.sectionTitle, fontSize: 14, marginBottom: 10 }}>核心洞察</div>
            {r.keyInsights.map((k, i) => (
              <div key={i} style={itemRow("indigo")}><Lightbulb size={15} color="#818cf8" style={{ marginTop: 1, flexShrink: 0 }} /><p style={S.bodyText}>{k}</p></div>
            ))}
          </div>
          <div style={S.card}>
            <div style={{ ...S.sectionTitle, fontSize: 14, marginBottom: 10 }}>下周计划</div>
            {r.nextWeekPlan.map((p, i) => (
              <div key={i} style={itemRow("purple")}><Sparkles size={15} color="#a78bfa" style={{ marginTop: 1, flexShrink: 0 }} /><p style={S.bodyText}>{p}</p></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
