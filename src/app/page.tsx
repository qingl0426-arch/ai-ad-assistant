"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { HomeNavbar } from "@/components/layout/home-navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ShoppingBag, TrendingUp, Flame, Sparkles, ArrowRight,
  Clock, Users, Package, FileText, Calculator,
  Target, Gem, Crown, Coffee, Rocket, Globe, ChevronRight,
  Download, Filter, DollarSign, Percent, BarChart3,
  MessageCircle, Phone, CheckCircle2, Play,
  Truck, Eye, TrendingDown, Bot,
} from "lucide-react";

function useCountUp(end: number, duration = 2000, start = true) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    let raf: number;
    const animate = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [end, duration, start]);
  return count;
}

const hotProducts = [
  { rank: 1, name: "夏季冰丝防晒衣", cat: "服饰内衣", price: "¥39.9", sales: "12.8万", profit: "¥16.5", heat: 98, ai: "适合短视频带货" },
  { rank: 2, name: "无线蓝牙耳机Pro", cat: "3C数码", price: "¥59.9", sales: "8.2万", profit: "¥22.3", heat: 95, ai: "适合投流测试" },
  { rank: 3, name: "儿童防晒帽UPF50+", cat: "母婴用品", price: "¥29.9", sales: "6.5万", profit: "¥12.8", heat: 91, ai: "适合宝妈人群" },
  { rank: 4, name: "大容量运动水壶2L", cat: "运动户外", price: "¥49", sales: "4.8万", profit: "¥18.6", heat: 88, ai: "适合直播带货" },
  { rank: 5, name: "便携折叠露营椅", cat: "运动户外", price: "¥89", sales: "3.9万", profit: "¥31.5", heat: 85, ai: "适合户外达人" },
];

const dashboardMetrics = [
  { label: "今日爆款数", value: "1,247", change: "+18%", icon: Flame, color: "text-orange-500", bg: "bg-orange-50" },
  { label: "平均利润空间", value: "32.6%", change: "+5%", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
  { label: "潜力商品池", value: "3,892", change: "+24%", icon: Gem, color: "text-blue-500", bg: "bg-blue-50" },
  { label: "AI命中率", value: "87.3%", change: "+3%", icon: Target, color: "text-purple-500", bg: "bg-purple-50" },
];

function HeroDashboard() {
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  useEffect(() => { setVisible(true); }, []);
  const tabs = ["🔥 爆款榜", "📈 增长榜", "💎 潜力榜"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={visible ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative hidden lg:block w-full max-w-[540px] shrink-0"
    >
      <div className="relative bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center">
              <Flame className="h-4 w-4 text-orange-500" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#1a1a2e]">今日爆款商品榜</h4>
              <p className="text-[10px] text-gray-400">实时更新 · 每小时刷新</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-emerald-500 font-medium">在线</span>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-2.5 p-4 pb-2">
          {dashboardMetrics.map((m) => (
            <div key={m.label} className={`rounded-xl ${m.bg} p-3 border border-gray-100`}>
              <div className="flex items-center justify-between mb-1.5">
                <m.icon className={`h-3.5 w-3.5 ${m.color}`} />
                <span className="text-[10px] font-medium text-emerald-500">{m.change}</span>
              </div>
              <p className="text-lg font-bold text-[#1a1a2e]">{m.value}</p>
              <p className="text-[10px] text-gray-500">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mx-4 p-1 rounded-lg bg-gray-50 border border-gray-100">
          {tabs.map((tab, i) => (
            <button key={tab} onClick={() => setActiveTab(i)}
              className={`flex-1 text-[11px] font-medium py-1.5 rounded-md transition-all ${
                activeTab === i ? "bg-white text-[#1a1a2e] shadow-sm border border-gray-200" : "text-gray-400 hover:text-gray-600"
              }`}>{tab}</button>
          ))}
        </div>

        {/* Product list */}
        <div className="px-4 py-3">
          <div className="grid grid-cols-12 gap-2 px-2 py-1.5 text-[10px] font-medium text-gray-400 uppercase tracking-wider">
            <span className="col-span-1">#</span>
            <span className="col-span-4">商品</span>
            <span className="col-span-2">售价</span>
            <span className="col-span-2">利润</span>
            <span className="col-span-3">AI建议</span>
          </div>
          {hotProducts.map((item) => (
            <div key={item.rank} className="grid grid-cols-12 gap-2 px-2 py-2.5 border-b border-gray-50 hover:bg-orange-50/30 rounded-md transition-colors text-[11px]">
              <span className={`col-span-1 font-bold ${item.rank <= 3 ? "text-orange-500" : "text-gray-400"}`}>
                {item.rank <= 3 ? ["🥇","🥈","🥉"][item.rank-1] : item.rank}
              </span>
              <span className="col-span-4 text-[#1a1a2e] font-medium truncate">{item.name}</span>
              <span className="col-span-2 text-orange-500 font-medium">{item.price}</span>
              <span className="col-span-2 text-emerald-600 font-medium">{item.profit}</span>
              <span className="col-span-3 text-[10px] text-gray-500">{item.ai}</span>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between px-5 py-2.5 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3 text-[10px] text-gray-400">
            <span className="flex items-center gap-1"><ShoppingBag className="h-2.5 w-2.5" /> 实时数据</span>
            <span className="flex items-center gap-1"><Download className="h-2.5 w-2.5" /> 导出榜单</span>
          </div>
          <Link href="/product-radar" className="text-[10px] text-orange-500 font-medium hover:text-orange-600 flex items-center gap-0.5">
            查看全部 <ChevronRight className="h-2.5 w-2.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

const globalStats = [
  { label: "今日收录商品", value: 1247832, icon: Package, color: "from-orange-500 to-red-500" },
  { label: "爆款商品数量", value: 12486, icon: Flame, color: "from-amber-500 to-orange-500" },
  { label: "平均利润空间", value: 32.6, suffix: "%", icon: Percent, color: "from-emerald-500 to-teal-500" },
  { label: "AI生成报告", value: 89210, icon: FileText, color: "from-blue-500 to-indigo-500" },
];

function StatItem({ label, value, suffix = "+", icon: Icon, color, inView }: {
  label: string; value: number; suffix?: string; icon: typeof Package; color: string; inView: boolean
}) {
  const count = useCountUp(value, 2000, inView);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      className="text-center p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className={`inline-flex h-12 w-12 rounded-xl bg-gradient-to-br ${color} items-center justify-center mb-3 shadow-sm`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="text-2xl md:text-3xl font-bold text-[#1a1a2e]">{count.toLocaleString()}{suffix}</div>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </motion.div>
  );
}

const features = [
  { icon: Flame, title: "爆款商品雷达", desc: "发现销量增长快、热度上升快、利润空间大的潜力商品，先人一步锁定爆款机会", color: "bg-orange-50 text-orange-500", tag: "实时监控 10万+ 商品" },
  { icon: BarChart3, title: "AI选品分析", desc: "自动分析价格、销量、评论、竞争度、利润空间，给出精准选品建议", color: "bg-blue-50 text-blue-500", tag: "AI命中率 87%" },
  { icon: Calculator, title: "商品利润测算", desc: "输入售价、成本、运费、平台扣点，自动计算利润率和预估总利润", color: "bg-emerald-50 text-emerald-500", tag: "支持多平台" },
  { icon: Eye, title: "竞品监控", desc: "跟踪竞品价格、销量、热度变化，实时掌握市场动向", color: "bg-purple-50 text-purple-500", tag: "覆盖 500+ 品类" },
];

const trendingProducts = [
  { rank: 1, name: "夏季冰丝防晒衣UPF50+", cat: "服饰内衣", price: "¥39.9", sales: "12.8万", profit: "¥16.5", heat: 98, trend: "up", ai: "适合短视频带货，佣金高" },
  { rank: 2, name: "无线蓝牙耳机降噪版", cat: "3C数码", price: "¥59.9", sales: "8.2万", profit: "¥22.3", heat: 95, trend: "up", ai: "千川投流测试效果好" },
  { rank: 3, name: "儿童防晒帽UPF50+", cat: "母婴用品", price: "¥29.9", sales: "6.5万", profit: "¥12.8", heat: 91, trend: "up", ai: "宝妈人群转化率高" },
  { rank: 4, name: "大容量运动水壶2L", cat: "运动户外", price: "¥49", sales: "4.8万", profit: "¥18.6", heat: 88, trend: "up", ai: "适合直播带货场景" },
  { rank: 5, name: "便携折叠露营椅", cat: "运动户外", price: "¥89", sales: "3.9万", profit: "¥31.5", heat: 85, trend: "up", ai: "户外达人口碑推荐" },
  { rank: 6, name: "天然除螨喷雾500ml", cat: "家居日用", price: "¥39.9", sales: "3.2万", profit: "¥15.2", heat: 82, trend: "down", ai: "换季节点注意补货" },
  { rank: 7, name: "磁吸充电宝10000mAh", cat: "3C数码", price: "¥79", sales: "2.8万", profit: "¥28.4", heat: 78, trend: "down", ai: "关注竞品价格变化" },
  { rank: 8, name: "简约北欧风台灯", cat: "家居日用", price: "¥69", sales: "2.1万", profit: "¥24.8", heat: 74, trend: "up", ai: "适合小红书种草" },
];

function TrendingTable() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-orange-50 flex items-center justify-center">
            <Flame className="h-4.5 w-4.5 text-orange-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1a1a2e]">爆款商品排行榜</h3>
            <p className="text-xs text-gray-400">实时追踪抖音/快手/淘宝热卖商品</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all">
            <Filter className="h-3 w-3" /> 筛选
          </button>
          <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all">
            <Download className="h-3 w-3" /> 导出
          </button>
          <Link href="/product-radar">
            <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white text-xs gap-1">
              查看更多 <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/50">
              {["排名","商品","类目","售价","近7日销量","预估利润","热度","AI建议"].map((col) => (
                <th key={col} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trendingProducts.map((item) => (
              <tr key={item.rank} className="border-b border-gray-50 hover:bg-orange-50/20 transition-colors group">
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${
                    item.rank === 1 ? "bg-orange-500 text-white" :
                    item.rank === 2 ? "bg-orange-100 text-orange-600" :
                    item.rank === 3 ? "bg-amber-50 text-amber-600" : "text-gray-400"
                  }`}>{item.rank}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      <ShoppingBag className="h-3.5 w-3.5 text-gray-400" />
                    </div>
                    <span className="text-sm font-medium text-[#1a1a2e] group-hover:text-orange-500 transition-colors">
                      {item.name}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-gray-50 text-gray-500 border border-gray-100">{item.cat}</span>
                </td>
                <td className="px-5 py-4">
                  <span className="text-sm font-bold text-orange-500">{item.price}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-[#1a1a2e]">{item.sales}</span>
                    {item.trend === "up" ? <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> : <TrendingDown className="h-3.5 w-3.5 text-red-400" />}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="text-sm font-bold text-emerald-600">{item.profit}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 max-w-[80px] h-1.5 rounded-full bg-gray-100">
                      <div className={`h-1.5 rounded-full ${
                        item.heat >= 90 ? "bg-gradient-to-r from-orange-500 to-red-500" :
                        item.heat >= 80 ? "bg-gradient-to-r from-amber-400 to-orange-500" :
                        "bg-gradient-to-r from-gray-400 to-gray-500"
                      }`} style={{ width: `${item.heat}%` }} />
                    </div>
                    <span className={`text-xs font-bold ${
                      item.heat >= 90 ? "text-orange-500" : item.heat >= 80 ? "text-amber-500" : "text-gray-500"
                    }`}>{item.heat}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="text-xs text-gray-500">{item.ai}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-gray-50">
        {trendingProducts.map((item) => (
          <div key={item.rank} className="p-4 hover:bg-orange-50/20 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold ${item.rank <= 3 ? "bg-orange-500 text-white" : "text-gray-400"}`}>{item.rank}</span>
                <span className="text-sm font-medium text-[#1a1a2e]">{item.name}</span>
              </div>
              <span className="text-sm font-bold text-orange-500">{item.price}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="px-1.5 py-0.5 rounded bg-gray-50 border border-gray-100">{item.cat}</span>
              <span>销量 {item.sales}</span>
              <span className="font-medium text-emerald-600">{item.profit}</span>
              <span>热度 {item.heat}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1.5">{item.ai}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfitCalculator() {
  const [price, setPrice] = useState("39.9");
  const [cost, setCost] = useState("18");
  const [platformFee, setPlatformFee] = useState("5");
  const [shipping, setShipping] = useState("3");
  const [adCost, setAdCost] = useState("2");
  const [sales, setSales] = useState("1000");

  const p = parseFloat(price) || 0;
  const c = parseFloat(cost) || 0;
  const pf = parseFloat(platformFee) || 0;
  const s = parseFloat(shipping) || 0;
  const a = parseFloat(adCost) || 0;
  const vol = parseInt(sales) || 0;

  const unitProfit = p - c - pf - s - a;
  const profitRate = p > 0 ? (unitProfit / p) * 100 : 0;
  const totalProfit = unitProfit * vol;
  const verdict = profitRate >= 25 ? "值得测试" : profitRate >= 10 ? "谨慎跟进" : "不建议";

  const inputs = [
    { label: "商品售价", value: price, setValue: setPrice, prefix: "¥", icon: DollarSign },
    { label: "拿货成本", value: cost, setValue: setCost, prefix: "¥", icon: Package },
    { label: "平台扣点", value: platformFee, setValue: setPlatformFee, prefix: "%", icon: Percent },
    { label: "运费成本", value: shipping, setValue: setShipping, prefix: "¥", icon: Truck },
    { label: "广告成本", value: adCost, setValue: setAdCost, prefix: "¥", icon: Target },
    { label: "预估销量", value: sales, setValue: setSales, prefix: "", icon: TrendingUp },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
        {/* Inputs */}
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Calculator className="h-4 w-4 text-emerald-500" />
            </div>
            <h3 className="text-base font-bold text-[#1a1a2e]">利润测算器</h3>
          </div>
          <div className="space-y-4">
            {inputs.map((inp) => (
              <div key={inp.label}>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">{inp.label}</label>
                <div className="relative">
                  {inp.prefix && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">{inp.prefix}</span>
                  )}
                  <input
                    type="number"
                    value={inp.value}
                    onChange={(e) => inp.setValue(e.target.value)}
                    className={`w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 text-sm text-[#1a1a2e] focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all ${inp.prefix ? "pl-8" : "pl-3"} pr-3`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="p-6 md:p-8 bg-gradient-to-br from-orange-50/50 to-white">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-orange-500" />
            </div>
            <h3 className="text-base font-bold text-[#1a1a2e]">测算结果</h3>
          </div>
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-xs text-gray-400 mb-1">单件利润</p>
              <p className="text-2xl font-bold text-[#1a1a2e]">
                ¥{unitProfit.toFixed(2)}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-xs text-gray-400 mb-1">利润率</p>
              <p className={`text-2xl font-bold ${profitRate >= 20 ? "text-emerald-600" : profitRate >= 10 ? "text-amber-500" : "text-red-500"}`}>
                {profitRate.toFixed(1)}%
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-xs text-gray-400 mb-1">预估总利润（销量 {vol.toLocaleString()}）</p>
              <p className="text-2xl font-bold text-emerald-600">
                ¥{totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className={`rounded-xl p-4 border ${
              verdict === "值得测试" ? "bg-emerald-50 border-emerald-200" :
              verdict === "谨慎跟进" ? "bg-amber-50 border-amber-200" :
              "bg-red-50 border-red-200"
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#1a1a2e]">AI 判断</span>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${
                  verdict === "值得测试" ? "bg-emerald-500 text-white" :
                  verdict === "谨慎跟进" ? "bg-amber-500 text-white" :
                  "bg-red-500 text-white"
                }`}>
                  {verdict === "值得测试" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Target className="h-3.5 w-3.5" />}
                  {verdict}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const aiReports = [
  { icon: FileText, title: "商品卖点提炼", desc: "AI自动分析商品属性，生成高转化卖点文案和推广话术", color: "bg-orange-50 text-orange-500", features: ["核心卖点提炼","人群痛点分析","差异化对比","转化话术生成"] },
  { icon: Play, title: "短视频脚本生成", desc: "根据商品特点自动生成带货短视频分镜脚本", color: "bg-blue-50 text-blue-500", features: ["开场钩子设计","产品展示要点","促销利益点","行动号召文案"] },
  { icon: Bot, title: "直播话术生成", desc: "AI生成直播间产品讲解话术和互动引导", color: "bg-purple-50 text-purple-500", features: ["产品讲解话术","互动引导设计","逼单催单话术","粉丝留存策略"] },
];

const audiences = [
  { icon: ShoppingBag, title: "抖店商家", desc: "发现潜在爆款，优化商品定价和投放策略" },
  { icon: Play, title: "短视频带货达人", desc: "找到高佣金高转化商品，提升带货收益" },
  { icon: Users, title: "直播运营团队", desc: "数据化选品，精准匹配直播间人群" },
  { icon: Truck, title: "供应链老板", desc: "了解市场热销品类，调整供应链方向" },
  { icon: BarChart3, title: "电商公司", desc: "多店铺数据管理，全局选品决策" },
  { icon: Target, title: "代运营团队", desc: "为客户提供数据驱动的选品方案" },
];

const plans = [
  { name: "体验版", tag: "免费入门", price: "0", period: "/月", icon: Coffee, color: "bg-white", border: "border-gray-200", btnStyle: "border-gray-300 text-gray-700 hover:bg-gray-50" as const, btnText: "免费开始", features: ["每日查看 50 个商品","基础爆款榜单","单次利润测算","3天历史数据","社区支持"] },
  { name: "专业版", tag: "最受欢迎", price: "99", period: "/月", icon: Rocket, color: "bg-white", border: "border-orange-300 ring-2 ring-orange-100", btnStyle: "bg-orange-500 hover:bg-orange-600 text-white" as const, btnText: "立即订阅", popular: true, features: ["无限商品查询","全功能爆款榜单","无限利润测算","AI选品分析报告","竞品监控 10家","90天历史数据","数据导出 Excel/PDF","AI卖点提炼","AI短视频脚本"] },
  { name: "团队版", tag: "专业团队", price: "299", period: "/月", icon: Crown, color: "bg-white", border: "border-gray-200", btnStyle: "border-gray-300 text-gray-700 hover:bg-gray-50" as const, btnText: "联系销售", features: ["专业版全部功能","无限数据导入","竞品监控 50家","自定义AI模型","365天历史数据","专属客户经理","API接口接入","5人团队协作","SSO单点登录"] },
];

function PricingSection() {
  const [billing, setBilling] = useState<"monthly"|"yearly">("monthly");
  return (
    <div>
      <div className="flex items-center justify-center mb-10">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 border border-gray-200">
          <button onClick={() => setBilling("monthly")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${billing === "monthly" ? "bg-white text-[#1a1a2e] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>月付</button>
          <button onClick={() => setBilling("yearly")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${billing === "yearly" ? "bg-white text-[#1a1a2e] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>年付<span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-600 border border-emerald-200">省20%</span></button>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {plans.map((plan, i) => (
          <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            className={`relative rounded-2xl border ${plan.border} ${plan.color} p-6 flex flex-col shadow-sm ${plan.popular ? "md:-mt-4 md:mb-4 shadow-lg shadow-orange-100" : ""}`}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-[11px] font-semibold shadow-md shadow-orange-200">{plan.tag}</div>
            )}
            {!plan.popular && <span className="text-xs font-medium text-gray-400 mb-1">{plan.tag}</span>}
            <div className="flex items-center gap-2.5 mb-3 mt-1">
              <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center"><plan.icon className="h-4 w-4 text-gray-500" /></div>
              <h3 className="text-lg font-bold text-[#1a1a2e]">{plan.name}</h3>
            </div>
            <div className="mb-3">
              <span className="text-3xl font-bold text-[#1a1a2e]">¥{billing === "yearly" ? Math.floor(Number(plan.price) * 0.8) : plan.price}</span>
              <span className="text-gray-400 text-sm">{plan.period}</span>
            </div>
            <Link href={plan.name === "团队版" ? "#" : "/login?signup=1"} className="mb-5">
              <Button className={`w-full ${plan.btnStyle}`} size="lg">{plan.btnText}{plan.name !== "团队版" && <ArrowRight className="h-4 w-4" />}</Button>
            </Link>
            <div className="space-y-3 flex-1">
              {plan.features.map((feat) => (
                <div key={feat} className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-500">{feat}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function FooterSection() {
  return (
    <footer className="bg-[#1a1a2e] text-gray-400">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-sm">
                <ShoppingBag className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">WQHub</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs mb-4">AI电商爆款选品与利润增长平台 — 发现爆款商品，分析竞品，测算利润，生成AI运营方案。</p>
            <div className="flex items-center gap-3">
              <a href="#" className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"><MessageCircle className="h-3.5 w-3.5" /></a>
              <a href="#" className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"><Phone className="h-3.5 w-3.5" /></a>
            </div>
          </div>
          <div><h4 className="text-xs font-semibold text-white uppercase tracking-widest mb-4">产品</h4><div className="space-y-3">{[{name:"爆款雷达",href:"/product-radar"},{name:"AI选品",href:"/ai-assistant"},{name:"利润测算",href:"/profit-growth"},{name:"竞品监控",href:"/roi-analysis"},{name:"数据大屏",href:"/dashboard"}].map((item)=>(<Link key={item.name} href={item.href} className="block text-sm hover:text-white transition-colors">{item.name}</Link>))}</div></div>
          <div><h4 className="text-xs font-semibold text-white uppercase tracking-widest mb-4">支持</h4><div className="space-y-3">{["帮助文档","常见问题","API文档","联系我们"].map((item)=>(<Link key={item} href="#" className="block text-sm hover:text-white transition-colors">{item}</Link>))}</div></div>
          <div><h4 className="text-xs font-semibold text-white uppercase tracking-widest mb-4">法律</h4><div className="space-y-3">{["隐私政策","服务条款"].map((item)=>(<Link key={item} href="#" className="block text-sm hover:text-white transition-colors">{item}</Link>))}</div></div>
        </div>
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs">© 2026 WQHub. All rights reserved.</p>
          <p className="text-xs">Powered by DeepSeek · Supabase · Next.js</p>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsInView, setStatsInView] = useState(false);
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => { if (entry?.isIntersecting) { setStatsInView(true); obs.disconnect(); } }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1a1a2e]">
      <HomeNavbar />

      {/* ═══════ HERO ═══════ */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden bg-gradient-to-br from-[#fff7f2] via-white to-[#f7f8fa]">
        {/* Background pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle, #ff4d2d 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        {/* Top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-orange-100/60 rounded-full blur-[120px]" />

        <div className="mx-auto max-w-7xl px-4 md:px-6 relative">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
            {/* Left content */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-sm text-orange-600 font-medium mb-6">
                <Sparkles className="h-3.5 w-3.5" /> AI电商爆款选品与利润增长平台
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-[56px] font-extrabold tracking-tight leading-[1.08] mb-5 text-[#1a1a2e]">
                AI电商爆款选品
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">与利润增长平台</span>
              </h1>
              <p className="text-base md:text-lg text-gray-500 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                聚合商品趋势、销量排行、利润空间和AI运营建议，帮助商家快速发现爆款、分析竞品、生成带货方案。
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-8 justify-center lg:justify-start">
                <Link href="/product-radar">
                  <Button size="xl" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold shadow-lg shadow-orange-200 gap-2 rounded-2xl">
                    <Flame className="h-5 w-5" /> 查看今日爆款
                  </Button>
                </Link>
                <Link href="/login?signup=1">
                  <Button variant="outline" size="xl" className="border-gray-300 text-gray-700 hover:bg-gray-50 gap-2 rounded-2xl font-medium">
                    免费生成选品报告 <FileText className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-5 justify-center lg:justify-start text-xs text-gray-400">
                <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-orange-400" /> 14天免费试用</span>
                <span className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-blue-400" /> 支持多平台商品分析</span>
                <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-emerald-400" /> 适合商家/达人/运营团队</span>
              </div>
            </motion.div>

            {/* Right: Dashboard */}
            <HeroDashboard />
          </div>
        </div>
      </section>

      {/* ═══════ STATS ═══════ */}
      <section className="py-12 md:py-16 relative -mt-8" ref={statsRef}>
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {globalStats.map((s) => (
              <StatItem key={s.label} {...s} inView={statsInView} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FEATURES ═══════ */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <p className="text-xs font-semibold text-orange-500 mb-3 tracking-[0.2em] uppercase">核心功能</p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#1a1a2e] mb-3">四大核心能力，助你<span className="text-orange-500">精准选品</span></h2>
            <p className="text-gray-500 text-sm max-w-lg mx-auto">覆盖选品、分析、测算、监控全流程</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="group bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-300">
                <div className={`h-11 w-11 rounded-xl ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-[#1a1a2e] mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{f.desc}</p>
                <span className="text-[11px] font-medium text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">{f.tag}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ TRENDING TABLE ═══════ */}
      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <p className="text-xs font-semibold text-orange-500 mb-3 tracking-[0.2em] uppercase">实时榜单</p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#1a1a2e] mb-3">
              全网<span className="text-orange-500">爆款商品</span>实时追踪
            </h2>
            <p className="text-gray-500 text-sm max-w-lg mx-auto">覆盖抖音、快手、淘宝、小红书等主流平台热卖商品</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            <TrendingTable />
          </motion.div>
        </div>
      </section>

      {/* ═══════ PROFIT CALCULATOR ═══════ */}
      <section className="py-16 md:py-24 bg-[#f7f8fa]">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <p className="text-xs font-semibold text-emerald-500 mb-3 tracking-[0.2em] uppercase">利润测算</p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#1a1a2e] mb-3">
              一键测算<span className="text-emerald-500">商品利润</span>
            </h2>
            <p className="text-gray-500 text-sm max-w-lg mx-auto">输入成本数据，AI自动判断这个商品值不值得做</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="max-w-4xl mx-auto">
            <ProfitCalculator />
          </motion.div>
        </div>
      </section>

      {/* ═══════ AI REPORTS ═══════ */}
      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <p className="text-xs font-semibold text-blue-500 mb-3 tracking-[0.2em] uppercase">AI 运营</p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#1a1a2e] mb-3">
              AI<span className="text-blue-500">运营报告</span>自动生成
            </h2>
            <p className="text-gray-500 text-sm max-w-lg mx-auto">AI帮你生成卖点文案、短视频脚本和直播话术</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {aiReports.map((r, i) => (
              <motion.div key={r.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300">
                <div className={`h-11 w-11 rounded-xl ${r.color} flex items-center justify-center mb-4`}><r.icon className="h-5 w-5" /></div>
                <h4 className="text-base font-bold text-[#1a1a2e] mb-2">{r.title}</h4>
                <p className="text-sm text-gray-500 mb-4">{r.desc}</p>
                <div className="space-y-2">
                  {r.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="h-1 w-1 rounded-full bg-orange-400" />{f}
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Link href="/login?signup=1" className="text-xs text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1">
                    免费生成 <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ AUDIENCE ═══════ */}
      <section className="py-16 md:py-24 bg-[#f7f8fa]">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <p className="text-xs font-semibold text-purple-500 mb-3 tracking-[0.2em] uppercase">适合人群</p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#1a1a2e] mb-3">
              无论你是谁，<span className="text-purple-500">WQHub</span> 都能帮到你
            </h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {audiences.map((a, i) => (
              <motion.div key={a.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-gray-100 p-5 text-center shadow-sm hover:shadow-md hover:border-orange-200 transition-all">
                <div className="inline-flex h-10 w-10 rounded-xl bg-orange-50 items-center justify-center mb-3">
                  <a.icon className="h-5 w-5 text-orange-500" />
                </div>
                <h4 className="text-sm font-bold text-[#1a1a2e] mb-1.5">{a.title}</h4>
                <p className="text-xs text-gray-400 leading-relaxed">{a.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ PRICING ═══════ */}
      <section id="pricing" className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <p className="text-xs font-semibold text-orange-500 mb-3 tracking-[0.2em] uppercase">会员价格</p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#1a1a2e] mb-3">
              选择适合你的<span className="text-orange-500">选品方案</span>
            </h2>
            <p className="text-gray-500 text-sm max-w-lg mx-auto">灵活定价，随时升级，满足不同阶段的选品需求</p>
          </motion.div>
          <PricingSection />
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-orange-500 to-red-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/10 rounded-full blur-[100px]" />
        <div className="mx-auto max-w-7xl px-4 md:px-6 text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-4">现在开始，发现你的下一个爆款商品</h2>
            <p className="text-white/80 text-lg mb-8">加入 3,200+ 电商商家，AI助你精准选品</p>
            <Link href="/login?signup=1">
              <Button size="xl" className="bg-white text-orange-600 hover:bg-orange-50 font-bold shadow-xl shadow-orange-700/30 gap-2 rounded-2xl px-10">
                <Sparkles className="h-5 w-5" /> 免费体验 WQHub
              </Button>
            </Link>
            <p className="text-white/60 text-sm mt-4">无需信用卡 · 14天免费试用 · 随时取消</p>
          </motion.div>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <FooterSection />
    </div>
  );
}