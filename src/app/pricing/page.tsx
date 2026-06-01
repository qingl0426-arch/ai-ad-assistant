"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import {
  Check, Crown, Zap, Shield, ArrowRight, Sparkles,
  ShieldCheck, Clock, Users, BadgeCheck, Infinity,
  ChevronDown, ChevronUp
} from "lucide-react";

/* ── Plans ── */
const PLANS = [
  {
    name: "免费版", price: { m: 0, y: 0 }, desc: "零成本快速上手",
    icon: Zap, features: [
      "每日 AI 分析 1 次", "基础数据大屏", "CSV 上传 100 行",
      "基础 ROI 分析", "7 天历史数据", "社区支持",
    ],
    cta: "免费开始", popular: false, plan: "free",
    accent: "border-white/[0.08]", accentBg: "bg-white/[0.03]", accentText: "text-slate-300",
    btnStyle: "bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.08]",
  },
  {
    name: "专业版", price: { m: 299, y: 2990 }, desc: "专业投手首选方案",
    icon: Crown, features: [
      "无限 AI 数据分析", "AI 智能投流建议", "实时数据大屏监控",
      "CSV 批量 1,000 行", "自动报告下载", "30 天历史数据",
      "优先客服支持", "导出 PDF 报告",
    ],
    cta: "立即订阅", popular: true, plan: "pro",
    accent: "border-indigo-500/30", accentBg: "bg-indigo-500/10", accentText: "text-indigo-300",
    btnStyle: "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-500/25",
  },
  {
    name: "企业版", price: { m: 999, y: 9990 }, desc: "团队级全面管理",
    icon: Shield, features: [
      "全部专业版功能", "无限 AI 调用次数", "API 接口访问",
      "多平台数据聚合", "专属定制看板", "90 天历史数据",
      "专属客户经理", "SLA 服务保障", "定制开发支持",
    ],
    cta: "联系销售", popular: false, plan: "enterprise",
    accent: "border-purple-500/20", accentBg: "bg-purple-500/10", accentText: "text-purple-300",
    btnStyle: "bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.08]",
  },
];

const COMPARE = [
  { f: "每日 AI 分析", free: "1 次", pro: "10 次", ent: "无限", proHighlight: true },
  { f: "CSV 上传行数", free: "100 行", pro: "1,000 行", ent: "5,000 行", proHighlight: true },
  { f: "历史数据", free: "7 天", pro: "30 天", ent: "90 天", proHighlight: false },
  { f: "AI 投流建议", free: "基础", pro: "✓", ent: "✓", proHighlight: true },
  { f: "自动报告", free: "–", pro: "✓", ent: "✓", proHighlight: true },
  { f: "API 接口", free: "–", pro: "–", ent: "✓", proHighlight: false },
  { f: "专属客服", free: "–", pro: "✓", ent: "✓", proHighlight: false },
  { f: "定制开发", free: "–", pro: "–", ent: "✓", proHighlight: false },
];

const FAQ = [
  { q: "免费版有什么限制？", a: "免费版每天可使用 1 次 AI 分析，上传 100 行 CSV，查看 7 天历史数据。适合个人体验和评估。" },
  { q: "可以随时升级或降级吗？", a: "可以。升级立即生效，降级在当前计费周期结束后生效，数据不会丢失。" },
  { q: "支持哪些支付方式？", a: "支持支付宝扫码支付和 H5 支付，即将支持微信支付。" },
  { q: "数据安全如何保障？", a: "所有数据加密传输和存储，采用 Supabase 企业级安全架构，绝不共享给第三方。" },
  { q: "有没有退款政策？", a: "专业版和企业版支持 7 天无理由退款，联系客服即可处理。" },
];

const TRUST_SIGNALS = [
  { icon: ShieldCheck, text: "数据加密保障" },
  { icon: BadgeCheck, text: "7 天无理由退款" },
  { icon: Infinity, text: "无限次更新" },
  { icon: Clock, text: "7×24 技术支持" },
];

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-28 pb-20">
        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <p className="text-sm font-semibold text-indigo-400 mb-3 tracking-widest uppercase">价格方案</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            选择适合你的
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"> 方案</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            从免费版开始，随时升级。所有方案均包含核心数据大屏功能。
          </p>

          {/* ── Toggle ── */}
          <div className="mt-10 inline-flex p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] relative">
            <button onClick={() => setYearly(false)} className={`relative px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 z-10 ${!yearly ? "text-white" : "text-slate-400 hover:text-white"}`}>
              月付
            </button>
            <button onClick={() => setYearly(true)} className={`relative px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 z-10 ${yearly ? "text-white" : "text-slate-400 hover:text-white"}`}>
              年付
              <span className="ml-1.5 px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                省 17%
              </span>
            </button>
            {/* Sliding background */}
            <motion.div
              className="absolute top-1 bottom-1 rounded-lg bg-white/[0.08] shadow-sm z-0"
              animate={{ left: yearly ? "calc(50% + 2px)" : "2px", width: yearly ? "calc(50% - 4px)" : "calc(50% - 4px)" }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          </div>
        </motion.div>

        {/* ── Trust signals ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-wrap justify-center gap-6 mb-16">
          {TRUST_SIGNALS.map((t, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
              <t.icon className="h-3.5 w-3.5 text-slate-600" />
              {t.text}
            </div>
          ))}
        </motion.div>

        {/* ── Pricing Cards ── */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-24">
          {PLANS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`relative rounded-2xl p-6 flex flex-col transition-all duration-300 ${
                p.popular
                  ? `border-2 ${p.accent} bg-gradient-to-b from-indigo-500/[0.06] to-purple-500/[0.02] shadow-2xl shadow-indigo-500/10 scale-[1.02] md:scale-105 z-10`
                  : `border ${p.accent} ${p.accentBg} hover:border-white/[0.12]`
              }`}
            >
              {/* Popular badge */}
              {p.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold shadow-xl shadow-indigo-500/30 flex items-center gap-1.5 whitespace-nowrap">
                    <Sparkles className="h-3 w-3" /> 最受欢迎
                  </div>
                </div>
              )}

              {/* Icon + Name */}
              <div className="flex items-center gap-3 mb-5 pt-1">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${p.popular ? "bg-indigo-500/20 border border-indigo-500/30" : "bg-white/[0.04] border border-white/[0.06]"}`}>
                  <p.icon className={`h-5 w-5 ${p.popular ? "text-indigo-400" : "text-slate-400"}`} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{p.name}</h3>
                  <p className="text-xs text-slate-500">{p.desc}</p>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-white tracking-tight">
                    ¥{yearly ? Math.round(p.price.y / 12) : p.price.m}
                  </span>
                  <span className="text-slate-500 text-sm">/月</span>
                </div>
                {yearly && p.price.y > 0 ? (
                  <p className="text-xs text-slate-500 mt-1.5">
                    年付 ¥{p.price.y.toLocaleString()}
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-medium border border-emerald-500/20">
                      省 ¥{(p.price.m * 12 - p.price.y).toLocaleString()}
                    </span>
                  </p>
                ) : p.price.m === 0 ? (
                  <p className="text-xs text-slate-600 mt-1.5">无需信用卡 · 永久免费</p>
                ) : null}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className={`h-4 w-4 mt-0.5 shrink-0 ${p.popular ? "text-indigo-400" : "text-emerald-400"}`} />
                    <span className={p.accentText}>{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link href={p.plan === "enterprise" ? "#" : "/login?signup=1"} className="block">
                <Button className={`w-full rounded-xl h-11 font-semibold text-sm gap-2 ${p.btnStyle}`}>
                  {p.cta} <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>

              {/* Money-back for pro */}
              {p.popular && (
                <p className="text-center text-[10px] text-slate-600 mt-3">
                  7 天无理由退款保障
                </p>
              )}
            </motion.div>
          ))}
        </div>

        {/* ── Comparison Table ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto mb-24"
        >
          <div className="text-center mb-8">
            <p className="text-sm font-semibold text-indigo-400 mb-2 tracking-widest uppercase">详细对比</p>
            <h2 className="text-3xl font-bold">功能对比</h2>
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-400">功能</th>
                  <th className="text-center px-4 py-4 text-sm font-semibold text-slate-400">免费版</th>
                  <th className="text-center px-4 py-4 text-sm font-semibold bg-indigo-500/[0.04]">
                    <span className="text-indigo-400">专业版</span>
                  </th>
                  <th className="text-center px-4 py-4 text-sm font-semibold text-purple-400">企业版</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row, i) => (
                  <tr key={row.f} className={`border-b border-white/[0.03] ${i % 2 === 0 ? "bg-transparent" : "bg-white/[0.01]"}`}>
                    <td className="px-6 py-3.5 text-sm text-slate-300">{row.f}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-400 text-center">{row.free}</td>
                    <td className={`px-4 py-3.5 text-sm text-center font-semibold ${row.proHighlight ? "bg-indigo-500/[0.04]" : ""}`}>
                      <span className={row.proHighlight ? "text-indigo-300" : "text-slate-300"}>
                        {row.pro === "✓" ? <Check className="h-4 w-4 text-emerald-400 inline" /> : row.pro}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-purple-300 text-center font-medium">
                      {row.ent === "✓" ? <Check className="h-4 w-4 text-emerald-400 inline" /> : row.ent}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* ── FAQ ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto mb-24"
        >
          <div className="text-center mb-8">
            <p className="text-sm font-semibold text-indigo-400 mb-2 tracking-widest uppercase">常见问题</p>
            <h2 className="text-3xl font-bold">还有疑问？</h2>
          </div>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-sm font-medium text-white">{item.q}</span>
                  {openFaq === i ? <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />}
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-4 text-sm text-slate-400 leading-relaxed">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── CTA Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center rounded-2xl border border-indigo-500/[0.12] bg-gradient-to-br from-indigo-500/[0.04] to-purple-500/[0.02] p-10 sm:p-14"
        >
          <Users className="h-10 w-10 mx-auto text-indigo-400 mb-4" />
          <h3 className="text-2xl font-bold text-white mb-3">已有 5,000+ 投手选择我们</h3>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            加入直播投流AI，让数据驱动你的投放决策，提升 ROI。
          </p>
          <Link href="/login?signup=1">
            <Button className="rounded-xl bg-white text-black hover:bg-white/90 shadow-xl shadow-white/5 h-12 px-8 text-base font-bold gap-2">
              <Crown className="h-5 w-5" /> 免费开始使用
            </Button>
          </Link>
          <p className="text-xs text-slate-600 mt-4">无需信用卡 · 30 秒完成注册</p>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-10">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
            <span>© 2026 直播投流AI</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">隐私政策</a>
            <a href="#" className="hover:text-white transition-colors">服务条款</a>
            <a href="#" className="hover:text-white transition-colors">联系我们</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
