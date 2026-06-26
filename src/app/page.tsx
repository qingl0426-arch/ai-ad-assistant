"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Sparkles, ArrowRight, Zap, TrendingUp, Crown, Target,
  Clock, Shield, Users, Package,
  ChevronDown, Flame, Gem, Coffee, Rocket,
  BarChart3, ShoppingBag, FileText, Bot, Search,
  Download, Filter, RefreshCw, Bell, Settings,
  TrendingDown, MessageCircle, Phone, CheckCircle2,
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

function AmbientOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div className="absolute w-[900px] h-[700px] rounded-full" style={{background:"radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)",left:"50%",top:"-10%",transform:"translate(-50%,0)",filter:"blur(100px)"}} animate={{scale:[1,1.06,1],opacity:[0.6,1,0.6]}} transition={{duration:10,repeat:Infinity,ease:"easeInOut"}} />
      <motion.div className="absolute w-[600px] h-[600px] rounded-full" style={{background:"radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)",right:"-8%",top:"30%",filter:"blur(120px)"}} animate={{scale:[1,1.1,1],opacity:[0.5,0.85,0.5]}} transition={{duration:12,repeat:Infinity,ease:"easeInOut",delay:2}} />
      <motion.div className="absolute w-[500px] h-[500px] rounded-full" style={{background:"radial-gradient(circle, rgba(34,211,238,0.05) 0%, transparent 70%)",left:"-5%",bottom:"10%",filter:"blur(100px)"}} animate={{scale:[1,1.12,1],opacity:[0.3,0.6,0.3]}} transition={{duration:14,repeat:Infinity,ease:"easeInOut",delay:4}} />
    </div>
  );
}

const hotProducts = [
  { rank: 1, name: "夏季防晒冰丝袖套", category: "服饰内衣", price: "¥29.9", sales: "12.8万", heat: 98, ai: "🔥 强烈推荐" },
  { rank: 2, name: "无线蓝牙降噪耳机", category: "3C数码", price: "¥159", sales: "8.2万", heat: 95, ai: "📈 持续加投" },
  { rank: 3, name: "便携折叠露营椅", category: "运动户外", price: "¥89", sales: "6.5万", heat: 91, ai: "✅ 稳定出单" },
  { rank: 4, name: "儿童智能手表GPS", category: "母婴", price: "¥199", sales: "4.3万", heat: 87, ai: "🔍 观察中" },
  { rank: 5, name: "天然除螨喷雾500ml", category: "家居日用", price: "¥39.9", sales: "3.9万", heat: 84, ai: "✅ 稳定出单" },
];

const trendCards = [
  { label: "今日爆款数", value: "1,247", change: "+18%", icon: Flame, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  { label: "销量增长率", value: "32.6%", change: "+12%", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { label: "潜力商品池", value: "3,892", change: "+24%", icon: Gem, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
  { label: "AI命中率", value: "87.3%", change: "+5%", icon: Target, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
];

function DashboardPreview() {
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  useEffect(() => { setVisible(true); }, []);
  const tabs = ["🔥 爆款榜", "📈 增长榜", "💎 潜力榜"];
  return (
    <motion.div initial={{opacity:0,x:50,rotateY:-8}} animate={visible?{opacity:1,x:0,rotateY:0}:{}} transition={{duration:0.8,delay:0.3,ease:[0.25,0.46,0.45,0.94]}} className="relative hidden lg:block w-full max-w-[560px] shrink-0">
      <div className="absolute -inset-10 bg-gradient-to-br from-indigo-500/[0.06] via-purple-500/[0.04] to-cyan-500/[0.03] rounded-3xl blur-3xl" />
      <div className="relative rounded-2xl border border-white/[0.07] bg-[#0b0b10]/90 backdrop-blur-2xl shadow-2xl shadow-black/50 overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.05] bg-black/30">
          <div className="flex gap-1.5"><div className="h-3 w-3 rounded-full bg-red-500/80"/><div className="h-3 w-3 rounded-full bg-amber-500/80"/><div className="h-3 w-3 rounded-full bg-emerald-500/80"/></div>
          <div className="flex-1 mx-4"><div className="h-6 rounded-md bg-white/[0.03] border border-white/[0.05] flex items-center justify-center"><span className="text-[10px] text-slate-500 flex items-center gap-1.5"><Search className="h-2.5 w-2.5"/> wqaihub.cn/dashboard</span></div></div>
          <div className="flex gap-2"><Bell className="h-3.5 w-3.5 text-slate-500"/><Settings className="h-3.5 w-3.5 text-slate-500"/></div>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div><h4 className="text-sm font-semibold text-white">实时数据看板</h4><p className="text-[10px] text-slate-500 mt-0.5">最后更新：刚刚</p></div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20"><div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"/><span className="text-[10px] text-emerald-400 font-medium">在线</span></div>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {trendCards.map((card)=>(
              <div key={card.label} className={`rounded-xl border ${card.border} ${card.bg} p-3 hover:border-white/[0.12] transition-all cursor-default`}>
                <div className="flex items-center justify-between mb-2"><card.icon className={`h-3.5 w-3.5 ${card.color}`}/><span className="text-[10px] text-emerald-400 font-medium">{card.change}</span></div>
                <p className="text-lg font-bold text-white tracking-tight">{card.value}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{card.label}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-1 p-1 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            {tabs.map((tab,i)=>(
              <button key={tab} onClick={()=>setActiveTab(i)} className={`flex-1 text-[11px] font-medium py-1.5 rounded-md transition-all ${activeTab===i?"bg-white/[0.08] text-white shadow-sm":"text-slate-500 hover:text-slate-300"}`}>{tab}</button>
            ))}
          </div>
          <div className="rounded-xl border border-white/[0.05] overflow-hidden">
            <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-white/[0.015] border-b border-white/[0.04] text-[10px] font-medium text-slate-500 uppercase tracking-wider"><span className="col-span-1">#</span><span className="col-span-4">商品</span><span className="col-span-2">销量</span><span className="col-span-2">热度</span><span className="col-span-3">AI建议</span></div>
            {hotProducts.slice(0,5).map((item)=>(
              <div key={item.rank} className="grid grid-cols-12 gap-2 px-3 py-2 border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors text-[11px]">
                <span className={`col-span-1 font-bold ${item.rank<=3?"text-amber-400":"text-slate-500"}`}>{item.rank<=3?["🥇","🥈","🥉"][item.rank-1]:item.rank}</span>
                <span className="col-span-4 text-slate-200 truncate">{item.name}</span>
                <span className="col-span-2 text-slate-400">{item.sales}</span>
                <span className="col-span-2"><div className="flex items-center gap-1.5"><div className="flex-1 h-1 rounded-full bg-white/[0.06]"><div className="h-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{width:`${item.heat}%`}}/></div><span className="text-slate-500 text-[10px]">{item.heat}</span></div></span>
                <span className="col-span-3 text-[10px] text-slate-400">{item.ai}</span>
              </div>
            ))}
          </div>
          <div className="rounded-xl bg-gradient-to-r from-indigo-500/[0.06] to-purple-500/[0.06] border border-indigo-500/[0.1] p-3 flex items-start gap-2.5">
            <div className="h-5 w-5 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5"><Sparkles className="h-3 w-3 text-indigo-400"/></div>
            <div><p className="text-[11px] text-white font-medium">AI 实时建议</p><p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">防晒冰丝袖套近3天销量环比增长47%，建议加大投放预算，预计ROI可达4.2+</p></div>
          </div>
        </div>
        <div className="flex items-center justify-between px-5 py-2 border-t border-white/[0.04] bg-black/20"><div className="flex items-center gap-3 text-[10px] text-slate-600"><span className="flex items-center gap-1"><RefreshCw className="h-2.5 w-2.5"/> 自动刷新</span><span className="flex items-center gap-1"><Download className="h-2.5 w-2.5"/> 导出报告</span></div><span className="text-[10px] text-slate-600">30s</span></div>
      </div>
    </motion.div>
  );
}

const features = [
  { icon: ShoppingBag, title: "抖音爆款雷达", desc: "实时追踪抖音热卖商品，AI自动识别潜力爆款，先人一步发现商机", color: "from-orange-500/10 to-amber-500/5", borderColor: "border-orange-500/15", iconColor: "text-orange-400", iconBg: "bg-orange-500/10", highlight: "实时监控 10万+ 商品" },
  { icon: Bot, title: "AI 选品分析", desc: "基于销量趋势、竞争度、利润空间多维度智能分析，给出精准选品建议", color: "from-indigo-500/10 to-blue-500/5", borderColor: "border-indigo-500/15", iconColor: "text-indigo-400", iconBg: "bg-indigo-500/10", highlight: "命中率 87%" },
  { icon: BarChart3, title: "竞品数据监控", desc: "全方位监控竞品投放策略、定价变化、销量波动，知己知彼百战不殆", color: "from-purple-500/10 to-pink-500/5", borderColor: "border-purple-500/15", iconColor: "text-purple-400", iconBg: "bg-purple-500/10", highlight: "覆盖 500+ 品类" },
  { icon: FileText, title: "运营报告生成", desc: "一键生成专业运营分析报告，支持日报、周报、月报，数据驱动运营决策", color: "from-emerald-500/10 to-teal-500/5", borderColor: "border-emerald-500/15", iconColor: "text-emerald-400", iconBg: "bg-emerald-500/10", highlight: "3秒自动生成" },
  { icon: Crown, title: "会员工具站", desc: "专属数据导出、高级筛选、竞品对比、批量分析等高级工具，解锁全部能力", color: "from-amber-500/10 to-yellow-500/5", borderColor: "border-amber-500/15", iconColor: "text-amber-400", iconBg: "bg-amber-500/10", highlight: "10+ 高级工具" },
];

const trendingProducts = [
  { rank: 1, name: "夏季防晒冰丝袖套女", category: "服饰内衣", price: "¥29.9", sales: "12.8万", heat: 98, trend: "up", ai: "🔥 强烈推荐，加大投放" },
  { rank: 2, name: "无线蓝牙降噪耳机", category: "3C数码", price: "¥159", sales: "8.2万", heat: 95, trend: "up", ai: "📈 持续加投，ROI稳定" },
  { rank: 3, name: "便携折叠露营椅", category: "运动户外", price: "¥89", sales: "6.5万", heat: 91, trend: "up", ai: "✅ 稳定出单，维持预算" },
  { rank: 4, name: "儿童智能手表GPS", category: "母婴", price: "¥199", sales: "4.3万", heat: 87, trend: "down", ai: "🔍 竞争加剧，观察中" },
  { rank: 5, name: "天然除螨喷雾500ml", category: "家居日用", price: "¥39.9", sales: "3.9万", heat: 84, trend: "up", ai: "✅ 稳定出单" },
  { rank: 6, name: "大容量运动水壶2L", category: "运动户外", price: "¥49", sales: "3.2万", heat: 81, trend: "up", ai: "📈 增长中，可适度加投" },
  { rank: 7, name: "磁吸充电宝10000mAh", category: "3C数码", price: "¥79", sales: "2.8万", heat: 78, trend: "down", ai: "⚠️ 热度下降，关注" },
  { rank: 8, name: "简约北欧风台灯", category: "家居日用", price: "¥69", sales: "2.1万", heat: 74, trend: "up", ai: "✅ 稳定出单" },
];

const tableColumns = ["排名", "商品名", "类目", "价格", "销量", "热度", "AI建议"];

function TrendingTable() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0b0b10]/60 backdrop-blur-xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.04]">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center"><Flame className="h-4 w-4 text-orange-400"/></div>
          <div><h3 className="text-sm font-semibold text-white">抖音爆款排行榜</h3><p className="text-[11px] text-slate-500">实时更新 · 每小时刷新</p></div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all"><Filter className="h-3 w-3"/> 筛选</button>
          <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all"><Download className="h-3 w-3"/> 导出</button>
          <Link href="/product-radar"><Button variant="glass" size="sm" className="text-[11px] gap-1">查看更多 <ArrowRight className="h-3 w-3"/></Button></Link>
        </div>
      </div>
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead><tr className="border-b border-white/[0.04]">{tableColumns.map((col)=>(<th key={col} className="text-left px-6 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">{col}</th>))}</tr></thead>
          <tbody>
            {trendingProducts.map((item)=>(
              <tr key={item.rank} className="border-b border-white/[0.02] hover:bg-white/[0.015] transition-colors group">
                <td className="px-6 py-3.5"><span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold ${item.rank===1?"bg-amber-500/15 text-amber-400":item.rank===2?"bg-slate-400/10 text-slate-300":item.rank===3?"bg-orange-500/10 text-orange-400":"text-slate-500"}`}>{item.rank}</span></td>
                <td className="px-6 py-3.5"><span className="text-sm text-slate-200 font-medium group-hover:text-white transition-colors">{item.name}</span></td>
                <td className="px-6 py-3.5"><span className="text-xs px-2 py-1 rounded-md bg-white/[0.03] text-slate-400 border border-white/[0.04]">{item.category}</span></td>
                <td className="px-6 py-3.5"><span className="text-sm text-white font-medium">{item.price}</span></td>
                <td className="px-6 py-3.5"><div className="flex items-center gap-1.5"><span className="text-sm text-white font-medium">{item.sales}</span>{item.trend==="up"?<TrendingUp className="h-3.5 w-3.5 text-emerald-400"/>:<TrendingDown className="h-3.5 w-3.5 text-red-400"/>}</div></td>
                <td className="px-6 py-3.5"><div className="flex items-center gap-2"><div className="flex-1 max-w-[80px] h-1.5 rounded-full bg-white/[0.05]"><div className={`h-1.5 rounded-full ${item.heat>=90?"bg-gradient-to-r from-orange-500 to-amber-500":item.heat>=80?"bg-gradient-to-r from-indigo-500 to-purple-500":"bg-gradient-to-r from-slate-500 to-slate-400"}`} style={{width:`${item.heat}%`}}/></div><span className="text-xs text-slate-400 font-medium">{item.heat}</span></div></td>
                <td className="px-6 py-3.5"><span className="text-xs text-slate-400">{item.ai}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="md:hidden divide-y divide-white/[0.04]">
        {trendingProducts.map((item)=>(
          <div key={item.rank} className="p-4 hover:bg-white/[0.015] transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2.5"><span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold ${item.rank<=3?"bg-amber-500/15 text-amber-400":"text-slate-500"}`}>{item.rank}</span><span className="text-sm text-slate-200 font-medium">{item.name}</span></div>
              <span className="text-sm text-white font-medium">{item.price}</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-500"><span className="px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/[0.04]">{item.category}</span><span className="flex items-center gap-0.5">销量 {item.sales}{item.trend==="up"?<TrendingUp className="h-3 w-3 text-emerald-400"/>:<TrendingDown className="h-3 w-3 text-red-400"/>}</span><span>热度 {item.heat}</span></div>
            <p className="text-[11px] text-slate-500 mt-1.5">{item.ai}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const reportTemplates = [
  { icon: FileText, title: "每日运营报告", desc: "自动汇总当日核心数据，AI分析关键变化", color: "border-indigo-500/20", bg: "bg-indigo-500/5", preview: ["📊 总销售额：¥47,680","📈 环比增长：+23%","🎯 ROI均值：3.82","💡 优化建议：2条"] },
  { icon: BarChart3, title: "竞品分析报告", desc: "全方位对比竞品数据，发现市场空白机会", color: "border-purple-500/20", bg: "bg-purple-500/5", preview: ["🔍 监控竞品：8家","🏆 优势品类：3个","⚠️ 风险预警：1条","💡 机会建议：4条"] },
  { icon: Target, title: "ROI 诊断报告", desc: "深度分析投放效率，精准定位优化方向", color: "border-emerald-500/20", bg: "bg-emerald-500/5", preview: ["💰 总消耗：¥12,480","📊 整体ROI：3.82","✅ 盈利计划：6个","❌ 亏损计划：2个"] },
];

function AIReportSection() {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {reportTemplates.map((report,i)=>(
        <motion.div key={report.title} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.1}} className={`group relative rounded-2xl border ${report.color} ${report.bg} p-6 hover:border-white/[0.1] transition-all duration-300 cursor-default`}>
          <div className="flex items-center gap-3 mb-4"><div className={`h-10 w-10 rounded-xl bg-white/[0.04] border ${report.color} flex items-center justify-center`}><report.icon className="h-5 w-5 text-slate-300"/></div><div><h4 className="text-sm font-semibold text-white">{report.title}</h4><p className="text-[11px] text-slate-500">{report.desc}</p></div></div>
          <div className="space-y-2">{report.preview.map((line,j)=>(<div key={j} className="flex items-center gap-2 text-[12px] text-slate-400"><div className="h-1 w-1 rounded-full bg-white/[0.2]"/>{line}</div>))}</div>
          <div className="mt-4 pt-4 border-t border-white/[0.04] flex items-center justify-between"><span className="text-[10px] text-slate-600 flex items-center gap-1"><Clock className="h-2.5 w-2.5"/> 每日自动生成</span><Sparkles className="h-3.5 w-3.5 text-indigo-400 group-hover:scale-110 transition-transform"/></div>
        </motion.div>
      ))}
    </div>
  );
}

const steps = [
  { step: "01", icon: Search, title: "导入数据", desc: "上传抖音/千川投放数据Excel或CSV，支持批量导入" },
  { step: "02", icon: Bot, title: "AI 分析", desc: "AI自动识别亏钱计划、发现高ROI机会、生成优化策略" },
  { step: "03", icon: FileText, title: "生成报告", desc: "一键生成可视化分析报告与投放建议，支持下载分享" },
  { step: "04", icon: TrendingUp, title: "执行优化", desc: "按AI建议调整投放策略，持续追踪ROI提升效果" },
];

const plans = [
  { name: "免费版", tag: "入门体验", price: "0", period: "/月", desc: "适合个人卖家初步体验AI选品", icon: Coffee, color: "from-slate-500/10 to-slate-600/5", borderColor: "border-slate-500/20", btnVariant: "outline" as const, btnText: "免费开始", features: ["每日 3 次商品查询","基础爆款榜单查看","单次数据导入（≤1000行）","基础AI选品建议","7天历史数据","社区支持"] },
  { name: "专业版", tag: "最受欢迎", price: "99", period: "/月", desc: "适合成长型卖家深度运营", icon: Rocket, color: "from-indigo-500/10 to-purple-600/5", borderColor: "border-indigo-500/30", btnVariant: "gradient" as const, btnText: "立即订阅", popular: true, features: ["无限商品查询","全功能爆款榜单","批量数据导入（≤5万行）","深度AI选品分析","竞品监控（10家）","90天历史数据","自动运营报告","数据导出（Excel/PDF）","邮件通知提醒"] },
  { name: "企业版", tag: "专业团队", price: "299", period: "/月", desc: "适合多店铺团队大规模运营", icon: Crown, color: "from-amber-500/10 to-orange-500/5", borderColor: "border-amber-500/20", btnVariant: "glass" as const, btnText: "联系销售", features: ["专业版全部功能","无限数据导入","竞品监控（50家）","自定义AI模型训练","365天历史数据","专属客户经理","API接口接入","多团队协作","SSO单点登录"] },
];

function PricingSection() {
  const [billing, setBilling] = useState<"monthly"|"yearly">("monthly");
  return (
    <div>
      <div className="flex items-center justify-center mb-10">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <button onClick={()=>setBilling("monthly")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${billing==="monthly"?"bg-white/[0.08] text-white shadow-sm":"text-slate-500 hover:text-slate-300"}`}>月付</button>
          <button onClick={()=>setBilling("yearly")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${billing==="yearly"?"bg-white/[0.08] text-white shadow-sm":"text-slate-500 hover:text-slate-300"}`}>年付<span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">省20%</span></button>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {plans.map((plan,i)=>(
          <motion.div key={plan.name} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.1}} className={`relative rounded-2xl border ${plan.borderColor} bg-gradient-to-b ${plan.color} backdrop-blur-xl p-6 flex flex-col ${plan.popular?"md:-mt-4 md:mb-4 shadow-2xl shadow-indigo-500/10":""}`}>
            {plan.popular&&(<div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[11px] font-semibold shadow-lg shadow-indigo-500/30">{plan.tag}</div>)}
            {!plan.popular&&(<span className="text-[11px] font-medium text-slate-500 mb-1">{plan.tag}</span>)}
            <div className="flex items-center gap-2.5 mb-4 mt-1"><div className="h-8 w-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center"><plan.icon className="h-4 w-4 text-slate-300"/></div><h3 className="text-lg font-bold text-white">{plan.name}</h3></div>
            <div className="mb-4"><span className="text-3xl font-bold text-white tracking-tight">¥{billing==="yearly"?Math.floor(Number(plan.price)*0.8):plan.price}</span><span className="text-slate-500 text-sm">{plan.period}</span></div>
            <p className="text-sm text-slate-400 mb-6">{plan.desc}</p>
            <Link href={plan.name==="企业版"?"#":"/login?signup=1"} className="mb-6"><Button variant={plan.btnVariant} size="lg" className="w-full">{plan.btnText}{plan.name!=="企业版"&&<ArrowRight className="h-4 w-4"/>}</Button></Link>
            <div className="space-y-3 flex-1">{plan.features.map((feat)=>(<div key={feat} className="flex items-start gap-2.5"><CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5"/><span className="text-sm text-slate-400">{feat}</span></div>))}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

const faqs = [
  { q: "WQHub 是什么？适合哪些人使用？", a: "WQHub 是一个 AI 电商利润增长系统，专为抖音电商卖家、直播投流团队设计。通过AI分析投放数据和市场趋势，帮助您发现爆款商品、优化投放策略、提升ROI。特别适合日消耗在 500-50000 元的中小型电商团队。" },
  { q: "免费版有什么限制？", a: "免费版每日可查询3次商品数据，查看基础爆款榜单，单次导入最多1000行数据，保留7天历史记录。适合初次体验AI电商分析的用户。升级专业版即可解锁全部功能。" },
  { q: "数据安全吗？我的投放数据会不会泄露？", a: "您的数据安全是我们的首要任务。所有数据传输采用 TLS 加密，存储使用 Supabase 企业级加密。我们不会查看、分享或出售您的任何数据。您可以在账户设置中随时导出或删除所有数据。" },
  { q: "支持哪些平台的数据导入？", a: "目前支持抖音千川、巨量千川的投放数据导入，格式支持 Excel (.xlsx) 和 CSV。同时支持手动录入或通过 API 自动同步。未来将支持更多平台。" },
  { q: "AI 分析的准确率怎么样？", a: "我们的 AI 模型基于 DeepSeek 大语言模型，结合电商领域专项训练。在爆款识别方面准确率达87%+，ROI优化建议平均帮助用户提升15-30%的投放效率。AI会持续学习您的数据，越用越精准。" },
  { q: "可以随时取消订阅吗？", a: "当然可以。所有付费方案都支持随时取消，取消后当前计费周期结束前您仍可正常使用。已支付的费用不予退还，但未使用的时长不会扣费。" },
];

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number|null>(null);
  return (
    <div className="max-w-3xl mx-auto space-y-3">
      {faqs.map((faq,i)=>(
        <motion.div key={i} initial={{opacity:0,y:10}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.05}} className="rounded-xl border border-white/[0.06] bg-white/[0.01] overflow-hidden">
          <button onClick={()=>setOpenIndex(openIndex===i?null:i)} className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"><span className="text-sm font-medium text-white pr-4">{faq.q}</span><ChevronDown className={`h-4 w-4 text-slate-500 shrink-0 transition-transform duration-200 ${openIndex===i?"rotate-180":""}`}/></button>
          <AnimatePresence>{openIndex===i&&(<motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.2}} className="overflow-hidden"><p className="px-5 pb-4 text-sm text-slate-400 leading-relaxed">{faq.a}</p></motion.div>)}</AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}

function CTASection() {
  return (
    <section className="py-24 md:py-32 relative">
      <div className="absolute inset-0 pointer-events-none"><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-500/[0.04] rounded-full blur-[180px]"/><div className="absolute top-1/3 right-1/4 w-[400px] h-[200px] bg-purple-500/[0.03] rounded-full blur-[100px]"/></div>
      <div className="mx-auto max-w-7xl px-6 text-center relative">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] text-sm text-slate-400 mb-6"><Sparkles className="h-4 w-4 text-indigo-400"/> 14天免费试用，无需信用卡</div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">准备好<span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">用AI驱动</span>你的电商增长了吗？</h2>
          <p className="text-slate-400 text-lg mb-10 max-w-lg mx-auto">加入 3,000+ 电商卖家，用数据发现爆款，用AI提升利润</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/login?signup=1"><Button variant="gradient" size="xl" className="gap-2 font-bold shadow-xl shadow-indigo-500/20"><Zap className="h-5 w-5"/> 免费注册体验</Button></Link>
            <Link href="/pricing"><Button variant="outline" size="xl" className="gap-2">查看价格方案 <ArrowRight className="h-4 w-4"/></Button></Link>
          </div>
          <p className="text-xs text-slate-600 mt-4">免费版永久可用 · 随时升级 · 无需绑定支付方式</p>
        </motion.div>
      </div>
    </section>
  );
}

function FooterSection() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#060608]">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4"><div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 flex items-center justify-center"><Sparkles className="h-4.5 w-4.5 text-white"/></div><span className="text-lg font-bold text-white tracking-tight">WQHub</span></Link>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs mb-4">AI电商利润增长系统 — 用数据发现爆款，用AI提升转化。为抖音电商卖家提供智能选品、竞品监控和投放优化服务。</p>
            <div className="flex items-center gap-3"><a href="#" className="h-8 w-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all"><MessageCircle className="h-3.5 w-3.5"/></a><a href="#" className="h-8 w-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all"><Phone className="h-3.5 w-3.5"/></a></div>
          </div>
          <div><h4 className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-4">产品</h4><div className="space-y-3">{["爆款雷达","AI选品","竞品监控","运营报告","数据大屏"].map((item)=>(<Link key={item} href="#" className="block text-sm text-slate-500 hover:text-white transition-colors">{item}</Link>))}</div></div>
          <div><h4 className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-4">支持</h4><div className="space-y-3">{["帮助文档","常见问题","API文档","联系我们","反馈建议"].map((item)=>(<Link key={item} href="#" className="block text-sm text-slate-500 hover:text-white transition-colors">{item}</Link>))}</div></div>
          <div><h4 className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-4">法律</h4><div className="space-y-3">{["隐私政策","服务条款","退款政策"].map((item)=>(<Link key={item} href="#" className="block text-sm text-slate-500 hover:text-white transition-colors">{item}</Link>))}</div></div>
        </div>
        <div className="mt-12 pt-6 border-t border-white/[0.04] flex flex-col md:flex-row items-center justify-between gap-4"><p className="text-xs text-slate-600">© 2026 WQHub. All rights reserved. 用AI驱动电商增长。</p><p className="text-xs text-slate-600">Powered by DeepSeek · Supabase · Next.js</p></div>
      </div>
    </footer>
  );
}

const stats = [
  { label: "服务商家", value: 3200, suffix: "+", icon: Users },
  { label: "分析商品", value: 150000, suffix: "+", icon: Package },
  { label: "生成报告", value: 86000, suffix: "+", icon: FileText },
  { label: "平均ROI提升", value: 28, suffix: "%", icon: TrendingUp },
];

function StatItem({ label, value, suffix, icon: Icon, inView }: { label: string; value: number; suffix: string; icon: typeof Users; inView: boolean }) {
  const count = useCountUp(value, 2000, inView);
  return (
    <div className="text-center"><Icon className="h-5 w-5 text-slate-600 mx-auto mb-2"/><div className="text-2xl md:text-3xl font-bold text-white tracking-tight">{count.toLocaleString()}{suffix}</div><p className="text-xs text-slate-500 mt-1">{label}</p></div>
  );
}

export default function HomePage() {
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsInView, setStatsInView] = useState(false);
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry])=>{if(entry?.isIntersecting){setStatsInView(true);obs.disconnect();}},{threshold:0.3});
    obs.observe(el);
    return ()=>obs.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <AmbientOrbs />
      <Navbar />

      {/* HERO */}
      <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.012]" style={{backgroundImage:"radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)",backgroundSize:"48px 48px"}}/>
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.6}} className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-sm text-slate-400 mb-6"><div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"/>AI 电商利润增长系统</div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-4"><span className="text-white">AI电商</span><br/><span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">利润增长系统</span></h1>
              <p className="text-lg md:text-xl text-slate-400 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">用数据发现爆款，用AI提升转化</p>
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-10 justify-center lg:justify-start">
                <Link href="/login?signup=1"><Button variant="gradient" size="xl" className="gap-2 font-bold shadow-xl shadow-indigo-500/20"><Zap className="h-5 w-5"/> 免费开始使用</Button></Link>
                <Link href="/product-radar"><Button variant="glass" size="xl" className="gap-2">查看爆款榜单 <ArrowRight className="h-4 w-4"/></Button></Link>
              </div>
              <div className="flex items-center gap-6 justify-center lg:justify-start text-xs text-slate-600"><span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-emerald-500"/> 数据加密</span><span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5"/> 14天免费试用</span><span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5"/> 3,200+ 商家信赖</span></div>
            </motion.div>
            <DashboardPreview/>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 md:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.003] to-transparent pointer-events-none"/>
        <div className="mx-auto max-w-7xl px-6">
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-14"><p className="text-xs font-semibold text-indigo-400 mb-3 tracking-[0.2em] uppercase">核心功能</p><h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">一站式<span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">AI电商</span>工具箱</h2><p className="text-slate-500 text-sm max-w-md mx-auto">覆盖选品、监控、分析、报告全流程，让数据驱动你的每一个决策</p></motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {features.map((f,i)=>(
              <motion.div key={f.title} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.08}} className={`group relative rounded-2xl border ${f.borderColor} bg-gradient-to-b ${f.color} backdrop-blur-xl p-5 hover:border-white/[0.12] hover:bg-white/[0.03] transition-all duration-300`}>
                <div className={`h-10 w-10 rounded-xl ${f.iconBg} border ${f.borderColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}><f.icon className={`h-5 w-5 ${f.iconColor}`}/></div>
                <h3 className="text-sm font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-3">{f.desc}</p>
                <span className="text-[10px] font-medium text-slate-600 bg-white/[0.03] px-2 py-1 rounded-md border border-white/[0.04]">{f.highlight}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 relative" ref={statsRef}>
        <div className="mx-auto max-w-7xl px-6">
          <motion.div initial={{opacity:0,scale:0.98}} whileInView={{opacity:1,scale:1}} viewport={{once:true}} className="relative rounded-2xl border border-white/[0.05] bg-gradient-to-br from-white/[0.02] to-white/[0.005] backdrop-blur-xl p-10 md:p-14 overflow-hidden">
            <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black,transparent)]" style={{backgroundImage:"linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)",backgroundSize:"40px 40px"}}/>
            <div className="relative grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">{stats.map((s)=>(<StatItem key={s.label} {...s} inView={statsInView}/>))}</div>
          </motion.div>
        </div>
      </section>

      {/* TRENDING TABLE */}
      <section className="py-20 md:py-28 relative">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-12"><p className="text-xs font-semibold text-orange-400 mb-3 tracking-[0.2em] uppercase">实时榜单</p><h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">抖音<span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">爆款排行榜</span></h2><p className="text-slate-500 text-sm max-w-md mx-auto">AI实时追踪抖音热卖商品，帮你第一时间发现爆款机会</p></motion.div>
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:0.1}}><TrendingTable/></motion.div>
        </div>
      </section>

      {/* AI REPORT */}
      <section className="py-20 md:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/[0.015] to-transparent pointer-events-none"/>
        <div className="mx-auto max-w-7xl px-6">
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-12"><p className="text-xs font-semibold text-purple-400 mb-3 tracking-[0.2em] uppercase">AI 分析</p><h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">智能<span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">运营报告</span></h2><p className="text-slate-500 text-sm max-w-md mx-auto">AI自动生成多维度分析报告，让数据会说话</p></motion.div>
          <AIReportSection/>
          <motion.div initial={{opacity:0,y:10}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mt-8"><Link href="/report"><Button variant="ghost" size="default" className="gap-1.5 text-slate-500 hover:text-white">查看完整报告功能 <ArrowRight className="h-3.5 w-3.5"/></Button></Link></motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 md:py-28 relative">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-14"><p className="text-xs font-semibold text-cyan-400 mb-3 tracking-[0.2em] uppercase">快速上手</p><h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">四步开启<span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">AI增长</span></h2><p className="text-slate-500 text-sm max-w-md mx-auto">无需复杂配置，几分钟即可体验AI驱动的电商分析</p></motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
            <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-white/[0.04] via-white/[0.08] to-white/[0.04]"/>
            {steps.map((step,i)=>(
              <motion.div key={step.step} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.1}} className="relative text-center">
                <div className="relative z-10 mx-auto mb-5"><div className="h-24 w-24 mx-auto rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center backdrop-blur-xl hover:border-white/[0.12] transition-all duration-300 group"><step.icon className="h-8 w-8 text-slate-400 group-hover:text-white transition-colors"/></div><div className="absolute -top-1 -right-1 h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-indigo-500/20">{i+1}</div></div>
                <h3 className="text-sm font-semibold text-white mb-2">{step.title}</h3><p className="text-xs text-slate-500 leading-relaxed max-w-[200px] mx-auto">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-20 md:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/[0.01] to-transparent pointer-events-none"/>
        <div className="mx-auto max-w-7xl px-6">
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-12"><p className="text-xs font-semibold text-amber-400 mb-3 tracking-[0.2em] uppercase">价格方案</p><h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">选择适合你的<span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">增长计划</span></h2><p className="text-slate-500 text-sm max-w-md mx-auto">灵活定价，随时升级，满足不同阶段的需求</p></motion.div>
          <PricingSection/>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-28 relative">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-12"><p className="text-xs font-semibold text-slate-500 mb-3 tracking-[0.2em] uppercase">常见问题</p><h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">还有<span className="text-white">疑问</span>？</h2><p className="text-slate-500 text-sm max-w-md mx-auto">以下是用户最常问的问题，也许能帮到你</p></motion.div>
          <FAQSection/>
        </div>
      </section>

      {/* CTA */}
      <CTASection/>

      {/* FOOTER */}
      <FooterSection/>
    </div>
  );
}