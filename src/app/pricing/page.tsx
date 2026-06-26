"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { WorkspaceLayout } from "@/components/layout/workspace-layout";
import { Button } from "@/components/ui/button";
import {
  Check, Crown, Zap, Shield, ArrowRight,
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
    accent: "border-[#e5eaf0]", accentBg: "bg-[#f8fafc]", accentText: "text-[#64748b]",
    btnStyle: "bg-white hover:bg-[#f8fafc] text-[#0f172a] border border-[#e5eaf0]",
  },
  {
    name: "专业版", price: { m: 299, y: 2990 }, desc: "专业投手首选方案",
    icon: Crown, features: [
      "无限 AI 数据分析", "AI 智能投流建议", "实时数据大屏监控",
      "CSV 批量 1,000 行", "自动报告下载", "30 天历史数据",
      "优先客服支持", "导出 PDF 报告",
    ],
    cta: "立即订阅", popular: true, plan: "pro",
    accent: "border-[#1688ff]/30", accentBg: "bg-[#eaf4ff]", accentText: "text-[#1688ff]",
    btnStyle: "bg-gradient-to-r from-[#1688ff] to-[#1d9bf0] hover:from-[#1670d9] hover:to-[#188bd9] text-white shadow-lg shadow-[#1688ff]/25",
  },
  {
    name: "企业版", price: { m: 999, y: 9990 }, desc: "团队级全面管理",
    icon: Shield, features: [
      "全部专业版功能", "无限 AI 调用次数", "API 接口访问",
      "多平台数据聚合", "专属定制看板", "90 天历史数据",
      "专属客户经理", "SLA 服务保障", "定制开发支持",
    ],
    cta: "联系销售", popular: false, plan: "enterprise",
    accent: "border-[#e5eaf0]", accentBg: "bg-[#f8fafc]", accentText: "text-[#64748b]",
    btnStyle: "bg-white hover:bg-[#f8fafc] text-[#0f172a] border border-[#e5eaf0]",
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
    <WorkspaceLayout>
      <div className="max-w-7xl mx-auto pb-10">
        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <p className="text-sm font-semibold text-[#1688ff] mb-2 tracking-widest uppercase">价格方案</p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 text-[#0f172a]">
            选择适合你的
            <span className="bg-gradient-to-r from-[#1688ff] to-[#ff7a00] bg-clip-text text-transparent"> 方案</span>
          </h1>
          <p className="text-[#64748b] text-base max-w-xl mx-auto">
            从免费版开始，随时升级。所有方案均包含核心功能。
          </p>

          {/* ── Toggle ── */}
          <div className="flex items-center justify-center gap-3 mt-8 mb-12">
            <span className={`text-sm font-medium ${!yearly ? "text-[#0f172a]" : "text-[#94a3b8]"}`}>月付</span>
            <button onClick={() => setYearly(!yearly)}
              className={`relative w-14 h-7 rounded-full transition-colors ${yearly ? "bg-[#1688ff]" : "bg-[#e5eaf0]"}`}>
              <motion.div className="absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-lg"
                animate={{ x: yearly ? 28 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
            </button>
            <span className={`text-sm font-medium ${yearly ? "text-[#0f172a]" : "text-[#94a3b8]"}`}>
              年付 <span className="text-[#16a34a] text-xs ml-1">省 17%</span>
            </span>
          </div>
        </motion.div>

        {/* ── Trust ── */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-12">
          {TRUST_SIGNALS.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
              className="flex items-center gap-2 text-sm text-[#64748b]">
              <s.icon className="h-4 w-4 text-[#1688ff]" />
              {s.text}
            </motion.div>
          ))}
        </div>

        {/* ── Plans ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan, i) => {
            const price = yearly ? plan.price.y : plan.price.m;
            const Icon = plan.icon;
            return (
              <motion.div key={plan.plan} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
                className={`relative rounded-[18px] border ${plan.accent} ${plan.accentBg} p-6 flex flex-col ${plan.popular ? "shadow-[0_8px_30px_rgba(22,136,255,0.15)] ring-1 ring-[#1688ff]/20" : "shadow-[0_4px_16px_rgba(15,23,42,0.04)]"}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-0.5 rounded-full bg-gradient-to-r from-[#1688ff] to-[#1d9bf0] text-white text-[11px] font-semibold shadow-md">
                    最受欢迎
                  </div>
                )}
                <div className={`h-10 w-10 rounded-xl ${plan.popular ? "bg-[#eaf4ff]" : "bg-[#f1f5f9]"} flex items-center justify-center mb-4`}>
                  <Icon className={`h-5 w-5 ${plan.popular ? "text-[#1688ff]" : "text-[#64748b]"}`} />
                </div>
                <h3 className={`text-lg font-bold ${plan.popular ? "text-[#1688ff]" : "text-[#0f172a]"} mb-1`}>{plan.name}</h3>
                <p className="text-sm text-[#64748b] mb-4">{plan.desc}</p>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-[#0f172a]">¥{price}</span>
                  <span className="text-sm text-[#94a3b8]">/{yearly ? "年" : "月"}</span>
                </div>
                <Link href={plan.plan === "free" ? "/login?signup=1" : plan.plan === "enterprise" ? "/account" : "/login?signup=1"}>
                  <Button className={`w-full rounded-xl h-11 text-sm font-semibold gap-2 mb-6 ${plan.btnStyle}`}>
                    {plan.cta} <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <ul className="space-y-2.5 flex-1">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-sm text-[#475569]">
                      <Check className="h-4 w-4 text-[#16a34a] shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* ── Compare ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-20 mb-20">
          <div className="text-center mb-8">
            <p className="text-sm font-semibold text-[#1688ff] mb-2 tracking-widest uppercase">功能对比</p>
            <h2 className="text-2xl font-bold text-[#0f172a]">详细功能对比</h2>
          </div>
          <div className="overflow-x-auto rounded-[18px] border border-[#e5eaf0] bg-white shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5eaf0] bg-[#f8fafc]">
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-[#64748b] uppercase tracking-wider">功能</th>
                  <th className="text-center px-4 py-3.5 text-xs font-semibold text-[#64748b] uppercase tracking-wider">免费版</th>
                  <th className="text-center px-4 py-3.5 text-xs font-semibold text-[#1688ff] uppercase tracking-wider bg-[#eaf4ff]/50">专业版</th>
                  <th className="text-center px-4 py-3.5 text-xs font-semibold text-[#64748b] uppercase tracking-wider">企业版</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row, i) => (
                  <tr key={i} className={`border-b border-[#e5eaf0] ${i % 2 === 0 ? "bg-transparent" : "bg-[#f8fafc]/50"}`}>
                    <td className="px-6 py-3.5 text-sm text-[#475569]">{row.f}</td>
                    <td className="px-4 py-3.5 text-sm text-[#94a3b8] text-center">{row.free}</td>
                    <td className={`px-4 py-3.5 text-sm text-center font-semibold ${row.proHighlight ? "bg-[#eaf4ff]/30" : ""}`}>
                      <span className={row.proHighlight ? "text-[#1688ff]" : "text-[#475569]"}>
                        {row.pro === "✓" ? <Check className="h-4 w-4 text-[#16a34a] inline" /> : row.pro}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-[#1688ff] text-center font-medium">
                      {row.ent === "✓" ? <Check className="h-4 w-4 text-[#16a34a] inline" /> : row.ent}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* ── FAQ ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-sm font-semibold text-[#1688ff] mb-2 tracking-widest uppercase">常见问题</p>
            <h2 className="text-2xl font-bold text-[#0f172a]">还有疑问？</h2>
          </div>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <div key={i} className="rounded-[14px] border border-[#e5eaf0] bg-white overflow-hidden shadow-[0_2px_8px_rgba(15,23,42,0.03)]">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#f8fafc] transition-colors"
                >
                  <span className="text-sm font-medium text-[#0f172a]">{item.q}</span>
                  {openFaq === i ? <ChevronUp className="h-4 w-4 text-[#94a3b8] shrink-0" /> : <ChevronDown className="h-4 w-4 text-[#94a3b8] shrink-0" />}
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
                      <p className="px-5 pb-4 text-sm text-[#64748b] leading-relaxed">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── CTA Banner ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center mt-20 rounded-[18px] border border-[#1688ff]/15 bg-gradient-to-br from-[#eaf4ff] to-white p-10 sm:p-14">
          <Users className="h-10 w-10 mx-auto text-[#1688ff] mb-4" />
          <h3 className="text-2xl font-bold text-[#0f172a] mb-3">已有 5,000+ 投手选择我们</h3>
          <p className="text-[#64748b] mb-8 max-w-md mx-auto">
            加入 WQHub，让数据驱动你的投放决策，提升 ROI。
          </p>
          <Link href="/login?signup=1">
            <Button className="rounded-xl bg-[#1688ff] hover:bg-[#1670d9] text-white shadow-xl shadow-[#1688ff]/25 h-12 px-8 text-base font-bold gap-2">
              <Crown className="h-5 w-5" /> 免费开始使用
            </Button>
          </Link>
          <p className="text-xs text-[#94a3b8] mt-4">无需信用卡 · 30 秒完成注册</p>
        </motion.div>
      </div>
    </WorkspaceLayout>
  );
}
