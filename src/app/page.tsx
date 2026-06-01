"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Sparkles, ArrowRight, Zap, TrendingUp, Crown, Target,
  LineChart, PieChart, Activity, Check,
  Globe, ChevronDown, Play, Star
} from "lucide-react";

/* ── Animated counter ── */
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

/* ── Rotating words ── */
const ROTATING_WORDS = ["直播投流", "广告投放", "ROI 增长", "素材优化"];

/* ── Ambient orbs background ── */
function AmbientOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute w-[800px] h-[600px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)", left: "50%", top: "5%", transform: "translate(-50%, 0)", filter: "blur(80px)" }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)", right: "-5%", top: "35%", filter: "blur(100px)" }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 70%)", left: "0%", bottom: "5%", filter: "blur(90px)" }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(52,211,153,0.05) 0%, transparent 70%)", right: "20%", top: "0%", filter: "blur(70px)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
    </div>
  );
}

/* ── Dashboard Preview (Hero right side) ── */
const dashboardCards = [
  { label: "今日消耗", value: "¥12,480", change: "+12%", icon: TrendingUp, color: "text-amber-400", bg: "bg-amber-500/10" },
  { label: "ROI", value: "3.82", change: "+8%", icon: Target, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { label: "成交金额", value: "¥47,680", change: "+23%", icon: LineChart, color: "text-indigo-400", bg: "bg-indigo-500/10" },
  { label: "转化率", value: "4.6%", change: "+5%", icon: PieChart, color: "text-purple-400", bg: "bg-purple-500/10" },
];

function DashboardPreview() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setVisible(true); }, []);
  return (
    <motion.div
      initial={{ opacity: 0, x: 40, rotateY: -5 }}
      animate={visible ? { opacity: 1, x: 0, rotateY: 0 } : {}}
      transition={{ duration: 0.9, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative hidden lg:block"
    >
      <div className="absolute -inset-8 bg-gradient-to-br from-indigo-500/[0.08] via-purple-500/[0.05] to-pink-500/[0.03] rounded-2xl blur-3xl" />
      <div className="relative rounded-2xl border border-white/[0.08] bg-[#0d0d12]/80 backdrop-blur-2xl shadow-2xl shadow-black/40 overflow-hidden">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.03] via-transparent to-white/[0.01] pointer-events-none" />
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-black/20">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500/70" />
            <div className="h-3 w-3 rounded-full bg-amber-500/70" />
            <div className="h-3 w-3 rounded-full bg-emerald-500/70" />
          </div>
          <div className="flex-1 mx-4"><div className="h-5 rounded-md bg-white/[0.04] border border-white/[0.06] flex items-center justify-center"><span className="text-[9px] text-slate-600 font-mono">app.livecast.ai/dashboard</span></div></div>
        </div>
        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            {dashboardCards.map((c, i) => (
              <motion.div key={c.label} initial={{ opacity: 0, y: 8 }} animate={visible ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.6 + i * 0.08 }} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-300">
                <div className="flex items-center justify-between mb-2"><span className="text-[10px] text-slate-500 font-medium">{c.label}</span><div className={`h-5 w-5 rounded-md ${c.bg} flex items-center justify-center`}><c.icon className={`h-3 w-3 ${c.color}`} /></div></div>
                <p className="text-lg font-bold text-white tracking-tight">{c.value}</p>
                <span className="text-[10px] text-emerald-400 font-medium">{c.change}</span>
              </motion.div>
            ))}
          </div>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={visible ? { opacity: 1, y: 0 } : {}} transition={{ delay: 1.0 }} className="rounded-xl border border-indigo-500/[0.12] bg-gradient-to-r from-indigo-500/[0.04] to-purple-500/[0.02] p-3.5">
            <div className="flex items-center gap-2 mb-2"><div className="h-5 w-5 rounded-md bg-indigo-500/20 flex items-center justify-center"><Sparkles className="h-3 w-3 text-indigo-400" /></div><span className="text-xs font-semibold text-indigo-300">AI 实时建议</span><span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/[0.1] text-emerald-400 border border-emerald-500/[0.15] font-medium">高转化</span></div>
            <p className="text-xs text-slate-300 leading-relaxed">素材 ROI 达 <span className="text-emerald-400 font-bold">5.2</span>，建议追加 <span className="text-white font-bold">¥2,000</span> 预算</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={visible ? { opacity: 1, y: 0 } : {}} transition={{ delay: 1.15 }} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <div className="flex items-center justify-between mb-2"><span className="text-[10px] text-slate-500 font-medium">ROI 趋势</span><span className="text-[10px] text-emerald-400 font-semibold">+24%</span></div>
            <div className="flex items-end gap-[3px] h-12">
              {[1.2, 1.8, 2.1, 1.5, 2.8, 2.3, 3.1, 2.6, 3.4, 3.0, 3.8, 3.2].map((v, i) => (
                <motion.div key={i} initial={{ scaleY: 0 }} animate={visible ? { scaleY: 1 } : {}} transition={{ delay: 1.2 + i * 0.03, duration: 0.3 }} className="flex-1 rounded-t-[3px] origin-bottom" style={{ height: `${(v / 4) * 100}%`, background: "linear-gradient(to top, rgba(99,102,241,0.6), rgba(168,85,247,0.3))" }} />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Features ── */
const features = [
  { icon: Activity, title: "实时数据分析", desc: "多平台数据实时同步，秒级刷新", color: "from-indigo-500/20 to-indigo-600/5", iconColor: "text-indigo-400", borderColor: "border-indigo-500/20" },
  { icon: Target, title: "ROI 自动计算", desc: "AI 智能计算投入产出比，精准评估", color: "from-emerald-500/20 to-emerald-600/5", iconColor: "text-emerald-400", borderColor: "border-emerald-500/20" },
  { icon: Zap, title: "智能加投建议", desc: "识别高转化素材，自动生成策略", color: "from-amber-500/20 to-amber-600/5", iconColor: "text-amber-400", borderColor: "border-amber-500/20" },
  { icon: Globe, title: "多平台管理", desc: "统一管理抖音、快手等投放计划", color: "from-purple-500/20 to-purple-600/5", iconColor: "text-purple-400", borderColor: "border-purple-500/20" },
];

/* ── StatItem ── */
function StatItem({ value, suffix, label, inView }: { value: number; suffix: string; label: string; inView: boolean }) {
  const count = useCountUp(value, 2000, inView);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center">
      <p className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-1">{count.toLocaleString()}{suffix}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </motion.div>
  );
}

/* ═══════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════ */
export default function Home() {
  const [wordIndex, setWordIndex] = useState(0);
  const [heroVisible, setHeroVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsInView, setStatsInView] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length), 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { const t = setTimeout(() => setHeroVisible(true), 100); return () => clearTimeout(t); }, []);

  useEffect(() => {
    const el = statsRef.current; if (!el) return;
    const obs = new IntersectionObserver(([entry]) => { if (entry?.isIntersecting) { setStatsInView(true); obs.disconnect(); } }, { threshold: 0.3 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  const stats = [
    { value: 10000, suffix: "+", label: "直播场次" },
    { value: 5000, suffix: "+", label: "运营用户" },
    { value: 30, suffix: "%", label: "平均降本" },
    { value: 200, suffix: "%", label: "ROI 提升" },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-white overflow-x-hidden">
      <Navbar />

      {/* ═══════════ HERO - FULL SCREEN ═══════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "80px 80px", maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black 30%, transparent 70%)", WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black 30%, transparent 70%)" }} />
        <AmbientOrbs />

        <div className="relative mx-auto max-w-7xl px-6 w-full py-32 md:py-0">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* LEFT: Text */}
            <div className="space-y-8">
              {/* Badge */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={heroVisible ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }} className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl">
                <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" /></span>
                <span className="text-emerald-400 text-sm font-medium">AI 智能投流系统</span>
                <span className="h-3 w-px bg-white/[0.1]" />
                <span className="text-slate-500 text-sm">v3.0</span>
              </motion.div>

              {/* Headline */}
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={heroVisible ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.1 }} className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.06]">
                <span className="block text-white">让 AI 帮你</span>
                <span className="block mt-3">
                  <AnimatePresence mode="wait">
                    <motion.span key={wordIndex} initial={{ opacity: 0, y: 20, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -20, filter: "blur(8px)" }} transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }} className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {ROTATING_WORDS[wordIndex]}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p initial={{ opacity: 0, y: 20 }} animate={heroVisible ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.3 }} className="text-lg text-slate-400 leading-relaxed max-w-lg">
                实时分析 ROI，自动识别高转化素材，智能生成加投减投建议。多平台数据一站式管理，让每一分预算都花在刀刃上。
              </motion.p>

              {/* Bullet list */}
              <motion.ul initial={{ opacity: 0 }} animate={heroVisible ? { opacity: 1 } : {}} transition={{ duration: 0.5, delay: 0.4 }} className="space-y-3">
                {["AI 实时分析 · 30秒出具投放建议", "多平台聚合 · 抖音快手一站管理", "智能预警 · 异常消耗自动提醒"].map((text, i) => (
                  <motion.li key={text} initial={{ opacity: 0, x: -10 }} animate={heroVisible ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.5 + i * 0.1 }} className="flex items-center gap-3">
                    <span className="h-5 w-5 rounded-full bg-emerald-500/[0.12] border border-emerald-500/[0.25] flex items-center justify-center shrink-0"><Check className="h-3 w-3 text-emerald-400" strokeWidth={3} /></span>
                    <span className="text-slate-300 text-sm">{text}</span>
                  </motion.li>
                ))}
              </motion.ul>

              {/* CTAs */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={heroVisible ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.7 }} className="flex flex-wrap gap-3 pt-2">
                <Link href="/login?signup=1">
                  <Button size="lg" className="group relative rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 h-12 px-7 text-base font-semibold gap-2 border-0 overflow-hidden">
                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <span className="relative flex items-center gap-2">立即体验 <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" /></span>
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="glass" size="lg" className="rounded-xl h-12 px-7 text-base gap-2 hover:border-white/[0.15]"><Play className="h-4 w-4" /> 查看演示</Button>
                </Link>
              </motion.div>

              {/* Trust badges */}
              <motion.div initial={{ opacity: 0 }} animate={heroVisible ? { opacity: 1 } : {}} transition={{ duration: 0.5, delay: 0.9 }} className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-2">
                  {["张","李","王","陈"].map((initial, i) => (
                    <div key={i} className={`h-8 w-8 rounded-full border-2 border-[#09090b] bg-gradient-to-br flex items-center justify-center text-[10px] font-bold text-white ${["from-indigo-400 to-purple-500","from-emerald-400 to-teal-500","from-amber-400 to-orange-500","from-pink-400 to-rose-500"][i]}`}>{initial}</div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}<span className="text-xs text-slate-400 ml-1 font-medium">5.0</span></div>
                  <p className="text-xs text-slate-600 mt-0.5">超过 5,000+ 投手在使用</p>
                </div>
              </motion.div>
            </div>

            {/* RIGHT: Dashboard Preview */}
            <DashboardPreview />
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-[10px] text-slate-600 uppercase tracking-widest">Scroll</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}><ChevronDown className="h-4 w-4 text-slate-600" /></motion.div>
        </motion.div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section className="py-24 md:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.005] to-transparent pointer-events-none" />
        <div className="mx-auto max-w-7xl px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-sm font-semibold text-indigo-400 mb-3 tracking-widest uppercase">核心功能</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">智能投流，<span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">一站掌控</span></h2>
            <p className="text-slate-400 mt-4 text-lg max-w-xl mx-auto">从数据上传到策略生成，全流程 AI 驱动</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className={`group relative rounded-2xl border ${f.borderColor} bg-gradient-to-b ${f.color} p-6 hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-300`}>
                <div className={`h-11 w-11 rounded-xl bg-white/[0.04] border ${f.borderColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}><f.icon className={`h-5 w-5 ${f.iconColor}`} /></div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ STATS ═══════════ */}
      <section className="py-24 relative" ref={statsRef}>
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] via-transparent to-white/[0.01] pointer-events-none" />
        <div className="mx-auto max-w-7xl px-6">
          <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.02] to-white/[0.01] backdrop-blur-xl p-12 md:p-16 overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black,transparent)]" />
            <div className="relative grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">{stats.map((s) => <StatItem key={s.label} {...s} inView={statsInView} />)}</div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="py-24 md:py-32 relative">
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/[0.06] rounded-full blur-[150px]" /></div>
        <div className="mx-auto max-w-7xl px-6 text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">开始使用 AI 投流助手</h2>
            <p className="text-slate-400 text-lg mb-10">免费注册，即刻体验智能投流。无需信用卡。</p>
            <Link href="/login?signup=1"><Button size="xl" className="rounded-2xl bg-white text-black hover:bg-white/90 shadow-2xl shadow-white/5 gap-2 font-bold"><Crown className="h-5 w-5" /> 免费创建账号</Button></Link>
            <p className="text-xs text-slate-600 mt-4">免费版包含每日 1 次 AI 分析</p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t border-white/[0.06] py-10">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2"><div className="h-5 w-5 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"><Sparkles className="h-3 w-3 text-white" /></div><span>© 2026 直播投流AI</span></div>
          <div className="flex gap-8"><Link href="/pricing" className="hover:text-white transition-colors">价格</Link><a href="#" className="hover:text-white transition-colors">隐私政策</a><a href="#" className="hover:text-white transition-colors">联系我们</a></div>
        </div>
      </footer>
    </div>
  );
}
