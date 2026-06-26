"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { WorkspaceLayout } from "@/components/layout/workspace-layout";

import Link from "next/link";
import {
  BarChart3, TrendingUp, DollarSign, Sparkles,
  Package, Flame, Eye, AlertTriangle,
  ChevronRight, RefreshCw, Calculator,
  Download, ArrowUpRight, Zap,
} from "lucide-react";

/* ===== MOCK DATA — 后续可替换为 API ===== */
const KPI_CARDS = [
  { label: "今日监测商品", value: "12,486", icon: Package, color: "bg-[#eaf4ff] text-[#1688ff]", trend: "+8.2%" },
  { label: "近7日爆款商品", value: "3,218", icon: Flame, color: "bg-[#fff7ed] text-[#ff7a00]", trend: "+12.5%" },
  { label: "平均利润率", value: "38.6%", icon: DollarSign, color: "bg-[#f0fdf4] text-[#16a34a]", trend: "+2.1%" },
  { label: "高潜力商品", value: "1,086", icon: Zap, color: "bg-[#f5f3ff] text-[#7c3aed]", trend: "+15.8%" },
  { label: "竞品监控数", value: "326", icon: Eye, color: "bg-[#eaf4ff] text-[#1688ff]", trend: "+5.3%" },
  { label: "AI生成报告", value: "8,920", icon: Sparkles, color: "bg-[#fff7ed] text-[#ff7a00]", trend: "+22.6%" },
];

const TRENDS = [
  { label: "销量趋势", value: "近7日销量增长 26%", icon: TrendingUp, color: "bg-[#f0fdf4] text-[#16a34a]", bar: 76 },
  { label: "利润趋势", value: "平均利润率提升 8.4%", icon: DollarSign, color: "bg-[#eaf4ff] text-[#1688ff]", bar: 58 },
  { label: "商品热度", value: "高热商品增加 312 个", icon: Flame, color: "bg-[#fff7ed] text-[#ff7a00]", bar: 82 },
  { label: "AI选品效果", value: "推荐商品转化提升 18%", icon: Sparkles, color: "bg-[#f5f3ff] text-[#7c3aed]", bar: 68 },
];

const CATEGORY_OPPORTUNITIES = [
  { name: "服饰", heat: 98, profitRate: "41%", heatBar: 98, profitBar: 82 },
  { name: "家居", heat: 89, profitRate: "37%", heatBar: 89, profitBar: 74 },
  { name: "母婴", heat: 91, profitRate: "42%", heatBar: 91, profitBar: 84 },
  { name: "食品", heat: 86, profitRate: "31%", heatBar: 86, profitBar: 62 },
  { name: "数码", heat: 95, profitRate: "37%", heatBar: 95, profitBar: 74 },
];

const RISKS = [
  {
    title: "高竞争商品", count: "218 个", icon: AlertTriangle,
    color: "bg-[#fef2f2] text-[#ef4444] border-[#ef4444]/20",
    suggestion: "建议优先筛选差异化卖点。",
  },
  {
    title: "低利润商品", count: "436 个", icon: TrendingUp,
    color: "bg-[#fff7ed] text-[#f97316] border-[#f97316]/20",
    suggestion: "建议重新核算成本、运费和投流预算。",
  },
  {
    title: "价格波动商品", count: "129 个", icon: DollarSign,
    color: "bg-[#fffbeb] text-[#f59e0b] border-[#f59e0b]/20",
    suggestion: "建议观察 3-7 天后再跟进。",
  },
  {
    title: "热度下降商品", count: "86 个", icon: TrendingUp,
    color: "bg-[#f8fafc] text-[#64748b] border-[#e5eaf0]",
    suggestion: "建议减少投放或替换素材。",
  },
];

const QUICK_LINKS = [
  { label: "爆款榜单", desc: "发现高热商品和增长机会。", href: "/product-radar", btn: "查看榜单", icon: Flame, color: "bg-[#fff7ed] text-[#ff7a00]" },
  { label: "利润测算", desc: "判断商品是否值得上架和投流。", href: "/profit-growth", btn: "开始测算", icon: Calculator, color: "bg-[#eaf4ff] text-[#1688ff]" },
  { label: "竞品分析", desc: "分析竞品价格、销量和卖点。", href: "/roi-analysis", btn: "分析竞品", icon: Eye, color: "bg-[#f0fdf4] text-[#16a34a]" },
];

export default function MetricsOverviewPage() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  return (
    <WorkspaceLayout>
      <div className="max-w-7xl mx-auto space-y-5">
        {/* ── Title Card ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#eef7ff] to-[#fff8ee] rounded-[20px] border border-[#e5eef7] shadow-[0_4px_16px_rgba(15,23,42,0.04)] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#1688ff] to-[#1d9bf0] flex items-center justify-center shadow-sm">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider">分析决策中心</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#eaf4ff] text-[#1688ff]">数据看板</span>
              </div>
              <h1 className="text-xl font-bold text-[#0f172a]">指标总览</h1>
              <p className="text-xs text-[#64748b] mt-0.5">集中查看商品机会、销量趋势、利润表现和 AI 选品效果，快速判断当前经营状态。</p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={handleRefresh}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[12px] text-[13px] font-medium bg-white text-[#64748b] border border-[#e5eaf0] hover:bg-[#f8fafc] hover:text-[#0f172a] transition-all">
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} /> 刷新数据
            </button>
            <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[12px] text-[13px] font-medium bg-[#eaf4ff] text-[#1688ff] border border-[#1688ff]/20 hover:bg-[#1688ff] hover:text-white transition-all">
              <Download className="h-3.5 w-3.5" /> 导出报告
            </button>
          </div>
        </motion.div>

        {/* ── KPI Cards ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {KPI_CARDS.map((k, i) => (
            <div key={i} className="bg-white rounded-[14px] border border-[#e5eaf0] shadow-[0_2px_8px_rgba(15,23,42,0.03)] p-4 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(15,23,42,0.06)] transition-all duration-150">
              <div className="flex items-center gap-2.5 mb-3">
                <div className={`h-8 w-8 rounded-lg ${k.color} flex items-center justify-center`}><k.icon className="h-4 w-4" /></div>
                <span className="text-[11px] text-[#94a3b8] font-medium leading-tight">{k.label}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <p className="text-xl font-bold text-[#0f172a]">{k.value}</p>
                <span className="text-[11px] font-semibold text-[#16a34a] flex items-center gap-0.5">
                  <ArrowUpRight className="h-3 w-3" /> {k.trend}
                </span>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Trends + Opportunities ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-5">
          {/* Trends */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white rounded-[18px] border border-[#e5eaf0] shadow-[0_4px_16px_rgba(15,23,42,0.04)] p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-7 w-7 rounded-lg bg-[#eaf4ff] flex items-center justify-center"><TrendingUp className="h-3.5 w-3.5 text-[#1688ff]" /></div>
              <h3 className="text-sm font-bold text-[#0f172a]">经营趋势</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TRENDS.map((t, i) => (
                <div key={i} className="p-4 rounded-xl border border-[#e5eaf0] hover:bg-[#f8fafc] transition-colors">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className={`h-7 w-7 rounded-lg ${t.color} flex items-center justify-center`}><t.icon className="h-3.5 w-3.5" /></div>
                    <span className="text-[13px] font-semibold text-[#0f172a]">{t.label}</span>
                  </div>
                  <p className="text-xs text-[#16a34a] font-medium mb-3">{t.value}</p>
                  <div className="h-1.5 rounded-full bg-[#e5eaf0] overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#1688ff] to-[#1d9bf0] transition-all duration-700" style={{ width: `${t.bar}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Category Opportunities */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
            className="bg-white rounded-[18px] border border-[#e5eaf0] shadow-[0_4px_16px_rgba(15,23,42,0.04)] p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-7 w-7 rounded-lg bg-[#fff7ed] flex items-center justify-center"><Flame className="h-3.5 w-3.5 text-[#ff7a00]" /></div>
              <h3 className="text-sm font-bold text-[#0f172a]">商品机会分布</h3>
            </div>
            <div className="space-y-3.5">
              {CATEGORY_OPPORTUNITIES.map((c, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-medium text-[#0f172a]">{c.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-[#1688ff] font-medium">热度 {c.heat}</span>
                      <span className="text-[11px] text-[#16a34a] font-medium">利润 {c.profitRate}</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="flex-1 h-1.5 rounded-full bg-[#e5eaf0] overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#1688ff] to-[#1d9bf0]" style={{ width: `${c.heatBar}%` }} />
                    </div>
                    <div className="flex-1 h-1.5 rounded-full bg-[#e5eaf0] overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#16a34a] to-[#22c55e]" style={{ width: `${c.profitBar}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Risks + AI Advice ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Risks */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
            className="bg-white rounded-[18px] border border-[#e5eaf0] shadow-[0_4px_16px_rgba(15,23,42,0.04)] p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-7 w-7 rounded-lg bg-[#fef2f2] flex items-center justify-center"><AlertTriangle className="h-3.5 w-3.5 text-[#ef4444]" /></div>
              <h3 className="text-sm font-bold text-[#0f172a]">风险提醒</h3>
            </div>
            <div className="space-y-3">
              {RISKS.map((r, i) => (
                <div key={i} className={`p-3.5 rounded-xl border ${r.color.replace("text-", "border-").replace("bg-", "")} ${r.color.split(" ")[0]} flex items-start gap-3`}>
                  <div className={`h-7 w-7 rounded-lg ${r.color} flex items-center justify-center shrink-0 mt-0.5`}><r.icon className="h-3.5 w-3.5" /></div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[13px] font-semibold text-[#0f172a]">{r.title}</span>
                      <span className={`text-[12px] font-bold ${r.color.split(" ")[1]}`}>{r.count}</span>
                    </div>
                    <p className="text-[11px] text-[#64748b] leading-relaxed">{r.suggestion}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* AI Advice */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
            className="bg-white rounded-[18px] border border-[#e5eaf0] shadow-[0_4px_16px_rgba(15,23,42,0.04)] p-5 flex flex-col">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-7 w-7 rounded-lg bg-[#f5f3ff] flex items-center justify-center"><Sparkles className="h-3.5 w-3.5 text-[#7c3aed]" /></div>
              <h3 className="text-sm font-bold text-[#0f172a]">AI经营建议</h3>
            </div>
            <div className="p-4 rounded-xl bg-[#eff6ff] border border-[#bfdbfe] mb-4 flex-1">
              <p className="text-[12px] text-[#475569] leading-relaxed">
                本周建议重点关注<span className="font-semibold text-[#0f172a]">夏季防晒、厨房收纳、儿童出行</span>三个方向。
                优先选择利润率<span className="font-semibold text-[#16a34a]">35%以上</span>、竞争度中低、适合短视频展示的商品进行测试。
                对于高竞争数码类商品，建议先做差异化卖点和价格带分析后再投放。
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/ai-assistant" className="px-3.5 py-2 rounded-[12px] text-[12px] font-medium bg-[#1688ff] text-white hover:bg-[#1670d9] transition-all flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> 去 AI选品
              </Link>
              <Link href="/product-radar" className="px-3.5 py-2 rounded-[12px] text-[12px] font-medium bg-[#fff7ed] text-[#ff7a00] border border-[#ff7a00]/20 hover:bg-[#ff7a00] hover:text-white transition-all flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5" /> 查看爆款榜单
              </Link>
              <Link href="/profit-growth" className="px-3.5 py-2 rounded-[12px] text-[12px] font-medium bg-[#f0fdf4] text-[#16a34a] border border-[#16a34a]/20 hover:bg-[#16a34a] hover:text-white transition-all flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5" /> 利润测算
              </Link>
            </div>
          </motion.div>
        </div>

        {/* ── Quick Links ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {QUICK_LINKS.map((q, i) => (
            <Link key={i} href={q.href}
              className="bg-white rounded-[16px] border border-[#e5eaf0] shadow-[0_2px_8px_rgba(15,23,42,0.03)] p-5 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition-all duration-200 group">
              <div className="flex items-center gap-3 mb-3">
                <div className={`h-8 w-8 rounded-lg ${q.color} flex items-center justify-center`}><q.icon className="h-4 w-4" /></div>
                <h4 className="text-sm font-bold text-[#0f172a]">{q.label}</h4>
              </div>
              <p className="text-[12px] text-[#64748b] mb-4">{q.desc}</p>
              <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[#1688ff] group-hover:text-[#1670d9] transition-colors">
                {q.btn} <ChevronRight className="h-3 w-3" />
              </span>
            </Link>
          ))}
        </motion.div>
      </div>
    </WorkspaceLayout>
  );
}
