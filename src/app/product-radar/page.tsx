"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { WorkspaceLayout } from "@/components/layout/workspace-layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Flame, TrendingUp, DollarSign, Sparkles,
  ShoppingBag, Filter, ChevronRight, Star,
  Package,
  Target, BarChart3, Zap, Search, Download,
} from "lucide-react";

/* ===== MOCK DATA — 后续可替换为 Supabase/API ===== */
const MOCK_PRODUCTS = [
  { rank: 1, name: "夏季冰丝防晒衣UPF50+", platform: "1688", category: "服饰", price: "¥39.9", sales: "12.8万", profit: "¥16.5", profitRate: "41%", heat: 98, competition: "中", aiSuggestion: "可跟进", inPlan: false },
  { rank: 2, name: "无线蓝牙耳机降噪版", platform: "京东", category: "数码", price: "¥59.9", sales: "8.2万", profit: "¥22.3", profitRate: "37%", heat: 95, competition: "高", aiSuggestion: "适合投流", inPlan: false },
  { rank: 3, name: "儿童防晒帽UPF50+", platform: "淘宝", category: "母婴", price: "¥29.9", sales: "6.5万", profit: "¥12.8", profitRate: "42%", heat: 91, competition: "中", aiSuggestion: "宝妈人群", inPlan: false },
  { rank: 4, name: "厨房沥水置物架双层", platform: "1688", category: "家居", price: "¥49.9", sales: "5.1万", profit: "¥18.6", profitRate: "37%", heat: 89, competition: "低", aiSuggestion: "短视频", inPlan: false },
  { rank: 5, name: "低脂鸡胸肉零食10包装", platform: "天猫", category: "食品", price: "¥29.8", sales: "4.7万", profit: "¥9.5", profitRate: "31%", heat: 86, competition: "中", aiSuggestion: "谨慎观察", inPlan: false },
  { rank: 6, name: "大容量运动水壶2L", platform: "1688", category: "户外", price: "¥49", sales: "4.8万", profit: "¥18.6", profitRate: "38%", heat: 88, competition: "低", aiSuggestion: "直播带货", inPlan: false },
  { rank: 7, name: "磁吸充电宝10000mAh", platform: "京东", category: "数码", price: "¥79", sales: "2.8万", profit: "¥28.4", profitRate: "36%", heat: 78, competition: "高", aiSuggestion: "需差异化", inPlan: false },
  { rank: 8, name: "儿童水杯吸管杯", platform: "淘宝", category: "母婴", price: "¥25.9", sales: "3.2万", profit: "¥10.2", profitRate: "39%", heat: 83, competition: "中", aiSuggestion: "可测试", inPlan: false },
];

const AI_PICKS = [
  { name: "夏季冰丝防晒衣", price: "¥39.9", profit: "¥16.5", profitRate: "41%", reason: "季节需求强，适合短视频带货。", icon: ShoppingBag },
  { name: "厨房沥水置物架", price: "¥49.9", profit: "¥18.6", profitRate: "37%", reason: "痛点明显，适合前后对比内容。", icon: Package },
  { name: "儿童防晒帽", price: "¥29.9", profit: "¥12.8", profitRate: "42%", reason: "人群明确，适合宝妈内容场景。", icon: Target },
];

const PLATFORMS = ["全部", "抖音", "快手", "小红书", "淘宝", "1688", "京东", "天猫"];
const CATEGORIES = ["全部", "服饰", "美妆", "家居", "母婴", "食品", "数码", "户外"];
const TIME_RANGES = ["今日", "近7天", "近30天"];
const SORT_OPTIONS = ["热度最高", "销量最高", "利润最高", "增长最快"];
const PRICE_RANGES = ["全部", "¥0-¥50", "¥50-¥100", "¥100以上"];

/* ===== Helpers ===== */
function compBadge(c: string) {
  switch (c) {
    case "低": return "bg-[#f0fdf4] text-[#16a34a] border-[#16a34a]/20";
    case "中": return "bg-[#fffbeb] text-[#f59e0b] border-[#f59e0b]/20";
    case "高": return "bg-[#fef2f2] text-[#ef4444] border-[#ef4444]/20";
    default: return "bg-[#f8fafc] text-[#94a3b8] border-[#e5eaf0]";
  }
}
function heatBar(h: number) {
  if (h >= 90) return "bg-gradient-to-r from-[#ff7a00] to-[#ef4444]";
  if (h >= 80) return "bg-gradient-to-r from-[#f59e0b] to-[#ff7a00]";
  return "bg-gradient-to-r from-[#94a3b8] to-[#64748b]";
}
function heatColor(h: number) {
  if (h >= 90) return "text-[#ff7a00]";
  if (h >= 80) return "text-[#f59e0b]";
  return "text-[#94a3b8]";
}
function rankIcon(r: number) {
  if (r === 1) return <Star className="h-4 w-4 text-amber-400 fill-amber-400" />;
  if (r === 2) return <Star className="h-4 w-4 text-slate-300 fill-slate-300" />;
  if (r === 3) return <Star className="h-4 w-4 text-amber-600 fill-amber-600" />;
  return <span className="text-xs text-[#94a3b8] font-mono w-4">{r}</span>;
}
function suggestionBadge(s: string) {
  if (s === "可跟进" || s === "可测试") return "bg-[#eaf4ff] text-[#1688ff]";
  if (s === "短视频" || s === "直播带货") return "bg-[#f0fdf4] text-[#16a34a]";
  if (s === "宝妈人群") return "bg-[#fdf2f8] text-[#db2777]";
  if (s === "适合投流") return "bg-[#fff7ed] text-[#ff7a00]";
  return "bg-[#f8fafc] text-[#64748b]";
}

export default function ProductRadarPage() {
  const [activeTab, setActiveTab] = useState<"hot" | "profit" | "ai">("hot");
  const [platform, setPlatform] = useState("全部");
  const [category, setCategory] = useState("全部");
  const [timeRange, setTimeRange] = useState("今日");
  const [sortBy, setSortBy] = useState("热度最高");
  const [priceRange, setPriceRange] = useState("全部");
  const [addedToPlan, setAddedToPlan] = useState<Set<number>>(new Set());

  const togglePlan = (rank: number) => {
    setAddedToPlan(prev => {
      const next = new Set(prev);
      if (next.has(rank)) next.delete(rank); else next.add(rank);
      return next;
    });
  };

  return (
    <WorkspaceLayout>
      <div className="max-w-7xl mx-auto space-y-5">
        {/* ── Title Card ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[18px] border border-[#e5eaf0] shadow-[0_4px_16px_rgba(15,23,42,0.04)] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#ff7a00] to-[#ef4444] flex items-center justify-center shadow-sm">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider">商品雷达</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#fff7ed] text-[#ff7a00]">爆款榜单</span>
              </div>
              <h1 className="text-xl font-bold text-[#0f172a]">爆款榜单中心</h1>
              <p className="text-xs text-[#64748b] mt-0.5">实时追踪高销量、高增长、高利润商品，快速发现值得跟进的爆款机会。</p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            {[
              { k: "hot" as const, label: "今日榜单", icon: Flame },
              { k: "profit" as const, label: "高利润榜", icon: DollarSign },
              { k: "ai" as const, label: "AI推荐榜", icon: Sparkles },
            ].map(t => (
              <button key={t.k} onClick={() => setActiveTab(t.k)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[12px] text-[13px] font-medium transition-all duration-150 ${
                  activeTab === t.k
                    ? "bg-[#eaf4ff] text-[#1688ff] border border-[#1688ff]/20"
                    : "bg-white text-[#64748b] border border-[#e5eaf0] hover:bg-[#f8fafc] hover:text-[#0f172a]"
                }`}>
                <t.icon className="h-3.5 w-3.5" /> {t.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Stats ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "今日上榜商品", value: "12,486", icon: Flame, color: "bg-[#fff7ed] text-[#ff7a00]" },
            { label: "销量增长商品", value: "3,218", icon: TrendingUp, color: "bg-[#f0fdf4] text-[#16a34a]" },
            { label: "高利润商品", value: "1,086", icon: DollarSign, color: "bg-[#eaf4ff] text-[#1688ff]" },
            { label: "AI推荐商品", value: "326", icon: Sparkles, color: "bg-[#f5f3ff] text-[#7c3aed]" },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-[14px] border border-[#e5eaf0] shadow-[0_2px_8px_rgba(15,23,42,0.03)] p-4 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(15,23,42,0.06)] transition-all duration-150">
              <div className="flex items-center gap-2.5 mb-3">
                <div className={`h-8 w-8 rounded-lg ${s.color} flex items-center justify-center`}>
                  <s.icon className="h-4 w-4" />
                </div>
                <span className="text-[11px] text-[#94a3b8] font-medium">{s.label}</span>
              </div>
              <p className="text-2xl font-bold text-[#0f172a]">{s.value}</p>
            </div>
          ))}
        </motion.div>

        {/* ── Filters ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-[18px] border border-[#e5eaf0] shadow-[0_4px_16px_rgba(15,23,42,0.04)] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-[#94a3b8]" />
            <span className="text-sm font-semibold text-[#0f172a]">筛选商品机会</span>
          </div>
          <div className="space-y-3">
            {/* Platform */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[11px] text-[#94a3b8] font-medium w-10 shrink-0">平台</span>
              {PLATFORMS.map(p => (
                <button key={p} onClick={() => setPlatform(p)}
                  className={`px-3 py-1.5 rounded-[10px] text-[12px] font-medium transition-all ${
                    platform === p ? "bg-[#eaf4ff] text-[#1688ff] border border-[#1688ff]/20" : "bg-[#f8fafc] text-[#64748b] border border-[#e5eaf0] hover:bg-white"
                  }`}>{p}</button>
              ))}
            </div>
            {/* Category + Time */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[11px] text-[#94a3b8] font-medium w-10 shrink-0">类目</span>
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 rounded-[10px] text-[12px] font-medium transition-all ${
                    category === c ? "bg-[#eaf4ff] text-[#1688ff] border border-[#1688ff]/20" : "bg-[#f8fafc] text-[#64748b] border border-[#e5eaf0] hover:bg-white"
                  }`}>{c}</button>
              ))}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[11px] text-[#94a3b8] font-medium w-10 shrink-0">时间</span>
              {TIME_RANGES.map(t => (
                <button key={t} onClick={() => setTimeRange(t)}
                  className={`px-3 py-1.5 rounded-[10px] text-[12px] font-medium transition-all ${
                    timeRange === t ? "bg-[#eaf4ff] text-[#1688ff] border border-[#1688ff]/20" : "bg-[#f8fafc] text-[#64748b] border border-[#e5eaf0] hover:bg-white"
                  }`}>{t}</button>
              ))}
            </div>
            {/* Sort + Price */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[11px] text-[#94a3b8] font-medium w-10 shrink-0">排序</span>
              {SORT_OPTIONS.map(s => (
                <button key={s} onClick={() => setSortBy(s)}
                  className={`px-3 py-1.5 rounded-[10px] text-[12px] font-medium transition-all ${
                    sortBy === s ? "bg-[#eaf4ff] text-[#1688ff] border border-[#1688ff]/20" : "bg-[#f8fafc] text-[#64748b] border border-[#e5eaf0] hover:bg-white"
                  }`}>{s}</button>
              ))}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[11px] text-[#94a3b8] font-medium w-10 shrink-0">价格</span>
              {PRICE_RANGES.map(p => (
                <button key={p} onClick={() => setPriceRange(p)}
                  className={`px-3 py-1.5 rounded-[10px] text-[12px] font-medium transition-all ${
                    priceRange === p ? "bg-[#eaf4ff] text-[#1688ff] border border-[#1688ff]/20" : "bg-[#f8fafc] text-[#64748b] border border-[#e5eaf0] hover:bg-white"
                  }`}>{p}</button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Main Content: Table + Analysis Panel ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
          {/* Table */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
            className="bg-white rounded-[18px] border border-[#e5eaf0] shadow-[0_4px_16px_rgba(15,23,42,0.04)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e5eaf0] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-[#fff7ed] flex items-center justify-center"><Flame className="h-3.5 w-3.5 text-[#ff7a00]" /></div>
                <h3 className="text-sm font-bold text-[#0f172a]">今日爆款商品</h3>
                <span className="text-xs text-[#94a3b8]">({MOCK_PRODUCTS.length})</span>
              </div>
              <div className="flex gap-1.5">
                <button className="px-2.5 py-1.5 rounded-[10px] text-[11px] text-[#94a3b8] hover:text-[#475569] hover:bg-[#f8fafc] transition-all flex items-center gap-1">
                  <Filter className="h-3 w-3" />筛选
                </button>
                <button className="px-2.5 py-1.5 rounded-[10px] text-[11px] text-[#94a3b8] hover:text-[#475569] hover:bg-[#f8fafc] transition-all flex items-center gap-1">
                  <Download className="h-3 w-3" />导出
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-[#e5eaf0]">
                    {["排名","商品名称","平台","类目","售价","近7日销量","预估利润","利润率","热度","竞争度","AI建议","操作"].map(h => (
                      <th key={h} className="text-left px-3 py-3 text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_PRODUCTS.map((p, i) => (
                    <motion.tr key={p.rank} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 + i * 0.03 }}
                      className={`border-b border-[#e5eaf0] hover:bg-[#f8fafc] transition-colors ${p.rank <= 3 ? "bg-[#fffbeb]/30" : ""}`}>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">{rankIcon(p.rank)}</div>
                      </td>
                      <td className="px-3 py-3 font-semibold text-[#0f172a] text-[13px] max-w-[160px] truncate">{p.name}</td>
                      <td className="px-3 py-3">
                        <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${
                          p.platform === "1688" ? "bg-[#fff7ed] text-[#ff7a00]" :
                          p.platform === "淘宝" ? "bg-[#eaf4ff] text-[#1688ff]" :
                          p.platform === "京东" ? "bg-[#fef2f2] text-[#ef4444]" :
                          "bg-[#f8fafc] text-[#475569]"
                        }`}>{p.platform}</span>
                      </td>
                      <td className="px-3 py-3 text-[#64748b] text-[12px]">{p.category}</td>
                      <td className="px-3 py-3 font-bold text-[#ff7a00] text-[13px]">{p.price}</td>
                      <td className="px-3 py-3 text-[#0f172a] text-[12px]">{p.sales}</td>
                      <td className="px-3 py-3 font-semibold text-[#16a34a] text-[12px]">{p.profit}</td>
                      <td className="px-3 py-3 font-semibold text-[#16a34a] text-[12px]">{p.profitRate}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-[#e5eaf0] overflow-hidden">
                            <div className={`h-full rounded-full ${heatBar(p.heat)}`} style={{ width: `${p.heat}%` }} />
                          </div>
                          <span className={`text-[11px] font-semibold ${heatColor(p.heat)}`}>{p.heat}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${compBadge(p.competition)}`}>{p.competition}</span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${suggestionBadge(p.aiSuggestion)}`}>{p.aiSuggestion}</span>
                      </td>
                      <td className="px-3 py-3">
                        <button onClick={() => togglePlan(p.rank)}
                          className={`text-[11px] px-2 py-1 rounded-[8px] font-medium transition-all ${
                            addedToPlan.has(p.rank)
                              ? "bg-[#f0fdf4] text-[#16a34a] border border-[#16a34a]/20"
                              : "bg-[#f8fafc] text-[#64748b] border border-[#e5eaf0] hover:bg-[#eaf4ff] hover:text-[#1688ff] hover:border-[#1688ff]/20"
                          }`}>
                          {addedToPlan.has(p.rank) ? "已加入" : "加入选品库"}
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Analysis Panel */}
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
              className="bg-white rounded-[18px] border border-[#e5eaf0] shadow-[0_4px_16px_rgba(15,23,42,0.04)] p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="h-8 w-8 rounded-lg bg-[#eaf4ff] flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-[#1688ff]" />
                </div>
                <h3 className="text-sm font-bold text-[#0f172a]">榜单分析</h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e5eaf0]">
                  <p className="text-[11px] text-[#94a3b8] mb-1">今日高热类目</p>
                  <p className="text-[13px] font-semibold text-[#0f172a]">服饰 · 家居 · 母婴</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl bg-[#f0fdf4] border border-[#16a34a]/10">
                    <p className="text-[11px] text-[#16a34a] mb-1">平均利润率</p>
                    <p className="text-lg font-bold text-[#16a34a]">38.6%</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#eaf4ff] border border-[#1688ff]/10">
                    <p className="text-[11px] text-[#1688ff] mb-1">低竞争机会</p>
                    <p className="text-xs font-medium text-[#0f172a] leading-relaxed">家居收纳 · 儿童出行 · 防晒</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e5eaf0]">
                  <p className="text-[11px] text-[#94a3b8] mb-1">建议关注</p>
                  <p className="text-xs text-[#475569] leading-relaxed">夏季需求、低价高频、短视频展示效果强的商品</p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
              className="bg-gradient-to-br from-[#eaf4ff] to-white rounded-[18px] border border-[#1688ff]/15 shadow-[0_4px_16px_rgba(15,23,42,0.04)] p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-[#1688ff]" />
                <span className="text-sm font-bold text-[#0f172a]">AI榜单结论</span>
              </div>
              <p className="text-[11px] text-[#475569] leading-relaxed">
                今日榜单中，夏季防晒、厨房收纳和儿童出行类商品热度上升明显。建议优先筛选利润率35%以上、竞争度中低、适合短视频展示的商品进行测试。
              </p>
            </motion.div>
          </div>
        </div>

        {/* ── AI Picks ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-[#f5f3ff] flex items-center justify-center">
                <Zap className="h-3.5 w-3.5 text-[#7c3aed]" />
              </div>
              <h3 className="text-sm font-bold text-[#0f172a]">AI精选高利润商品</h3>
            </div>
            <Link href="/ai-assistant" className="text-[11px] text-[#1688ff] hover:text-[#1670d9] font-medium flex items-center gap-1 transition-colors">
              查看全部 <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {AI_PICKS.map((item, i) => (
              <div key={i} className="bg-white rounded-[16px] border border-[#e5eaf0] shadow-[0_4px_16px_rgba(15,23,42,0.04)] p-5 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition-all duration-200 group">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-9 w-9 rounded-xl bg-[#f8fafc] border border-[#e5eaf0] flex items-center justify-center">
                    <item.icon className="h-4.5 w-4.5 text-[#94a3b8]" />
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#f0fdf4] text-[#16a34a]">高利润</span>
                </div>
                <h4 className="text-sm font-bold text-[#0f172a] mb-2">{item.name}</h4>
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-[13px] font-bold text-[#ff7a00]">{item.price}</span>
                  <span className="text-[13px] font-bold text-[#16a34a]">利润 {item.profit}</span>
                  <span className="text-[12px] text-[#16a34a] font-medium">{item.profitRate}</span>
                </div>
                <p className="text-[11px] text-[#64748b] leading-relaxed mb-4">{item.reason}</p>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 rounded-[10px] text-[11px] font-medium bg-[#f8fafc] text-[#64748b] border border-[#e5eaf0] hover:bg-[#eaf4ff] hover:text-[#1688ff] hover:border-[#1688ff]/20 transition-all">
                    加入选品库
                  </button>
                  <button className="flex-1 py-2 rounded-[10px] text-[11px] font-medium bg-[#eaf4ff] text-[#1688ff] hover:bg-[#1688ff] hover:text-white transition-all">
                    生成AI分析
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── CTA ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-[#eaf4ff] via-white to-[#fff7ed] rounded-[20px] border border-[#e5eaf0] shadow-[0_4px_16px_rgba(15,23,42,0.04)] p-8 md:p-10 text-center">
          <Search className="h-8 w-8 mx-auto text-[#1688ff] mb-3" />
          <h3 className="text-lg font-bold text-[#0f172a] mb-2">想从榜单里快速筛出适合你的商品？</h3>
          <p className="text-sm text-[#64748b] mb-6 max-w-lg mx-auto">
            进入 AI智能选品，输入类目、预算和利润目标，自动生成选品方案。
          </p>
          <Link href="/ai-assistant">
            <Button className="rounded-xl bg-[#1688ff] hover:bg-[#1670d9] text-white shadow-lg shadow-[#1688ff]/25 h-11 px-6 text-sm font-bold gap-2">
              <Sparkles className="h-4 w-4" /> 去 AI选品
            </Button>
          </Link>
        </motion.div>
      </div>
    </WorkspaceLayout>
  );
}
