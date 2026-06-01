"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, DollarSign, Target, ShoppingCart, BarChart3 } from "lucide-react";

interface MetricCardsProps {
  totals: {
    totalSpend?: number;
    totalGmv?: number;
    totalRoi?: number;
    totalOrders?: number;
    totalImpressions?: number;
  } | null;
}

interface MetricDef {
  key: string;
  label: string;
  icon: typeof DollarSign;
  color: string;
  bg: string;
  border: string;
  glow: string;
  prefix: string;
  suffix: string;
  value: string;
  trend: number;
}

const defaultMetrics: MetricDef[] = [
  {
    key: "totalSpend", label: "总消耗",
    icon: DollarSign,
    color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", glow: "shadow-amber-500/10",
    prefix: "¥", suffix: "", value: "0", trend: 12.3,
  },
  {
    key: "totalGmv", label: "成交金额",
    icon: ShoppingCart,
    color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", glow: "shadow-emerald-500/10",
    prefix: "¥", suffix: "", value: "0", trend: 23.1,
  },
  {
    key: "totalRoi", label: "ROI",
    icon: Target,
    color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20", glow: "shadow-indigo-500/10",
    prefix: "", suffix: "", value: "0.00", trend: 8.5,
  },
  {
    key: "totalOrders", label: "订单数",
    icon: BarChart3,
    color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", glow: "shadow-purple-500/10",
    prefix: "", suffix: "", value: "0", trend: -2.1,
  },
];

/* ── Animated counter ── */
function AnimatedValue({ value, prefix, suffix }: { value: string; prefix: string; suffix: string }) {
  const [display, setDisplay] = useState("0");
  const target = parseFloat(value.replace(/,/g, "")) || 0;
  const isDecimal = value.includes(".");

  useEffect(() => {
    if (target === 0) { setDisplay(value); return; }
    let startTime: number;
    let raf: number;
    const duration = 1500;
    const animate = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;
      setDisplay(isDecimal ? current.toFixed(2) : Math.floor(current).toLocaleString());
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [target, isDecimal, value]);

  return <span>{prefix}{display}{suffix}</span>;
}

export function MetricCards({ totals }: MetricCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {defaultMetrics.map((m, i) => {
        const rawValue = totals ? (totals as Record<string, number | undefined>)[m.key] : undefined;
        const displayValue = rawValue != null
          ? (m.key === "totalRoi" ? rawValue.toFixed(2) : rawValue.toLocaleString())
          : m.value;
        const isPositive = m.trend >= 0;

        return (
          <motion.div
            key={m.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className={`group relative rounded-2xl border ${m.border} bg-white/[0.02] backdrop-blur-xl p-4 sm:p-5 hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-300 overflow-hidden`}
          >
            {/* Glow on hover */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl ${m.glow}`}
              style={{ boxShadow: `inset 0 0 60px -20px currentColor` }} />

            {/* Header */}
            <div className="flex items-center justify-between mb-3 relative">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">{m.label}</span>
              <div className={`h-8 w-8 sm:h-9 sm:w-9 rounded-lg ${m.bg} border ${m.border} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <m.icon className={`h-4 w-4 sm:h-4.5 sm:w-4.5 ${m.color}`} />
              </div>
            </div>

            {/* Big Number */}
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight relative">
              <AnimatedValue value={displayValue} prefix={m.prefix} suffix={m.suffix} />
            </p>

            {/* Trend */}
            <div className="flex items-center gap-1.5 mt-2.5 relative">
              {isPositive ? (
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/[0.08] border border-emerald-500/[0.15]">
                  <TrendingUp className="h-3 w-3 text-emerald-400" />
                  <span className="text-[11px] font-semibold text-emerald-400">+{m.trend}%</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-red-500/[0.08] border border-red-500/[0.15]">
                  <TrendingDown className="h-3 w-3 text-red-400" />
                  <span className="text-[11px] font-semibold text-red-400">{m.trend}%</span>
                </div>
              )}
              <span className="text-[10px] text-slate-600">vs 上期</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}