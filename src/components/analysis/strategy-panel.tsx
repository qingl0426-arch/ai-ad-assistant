"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Target } from "lucide-react";
import type { StrategyResult } from "@/lib/ad-strategy";

interface StrategyPanelProps {
  data: {
    overall: StrategyResult;
    platforms: Record<string, StrategyResult>;
    dailyAnalysis: Array<{ date: string; roi: number; action: string }>;
  } | null;
  loading?: boolean;
}

export function StrategyPanel({ data, loading }: StrategyPanelProps) {
  if (loading) {
    return (
      <div className="rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] p-5 animate-pulse">
        <div className="h-4 w-24 bg-white/[0.05] rounded-lg mb-4" />
        <div className="space-y-3">
          <div className="h-14 bg-white/[0.03] rounded-xl" />
          <div className="h-14 bg-white/[0.03] rounded-xl" />
          <div className="h-14 bg-white/[0.03] rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] p-6 text-center"
      >
        <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-3">
          <Target className="h-5 w-5 text-indigo-400" />
        </div>
        <p className="text-slate-400 text-sm font-medium mb-1">投流策略</p>
        <p className="text-slate-600 text-xs">上传数据后自动生成</p>
      </motion.div>
    );
  }

  const getActionStyle = (action: string) => {
    if (action.includes("加投") || action.includes("增加"))
      return { icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "加投" };
    if (action.includes("减投") || action.includes("减少"))
      return { icon: TrendingDown, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", label: "减投" };
    return { icon: Minus, color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20", label: "保持" };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] p-5"
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div className="h-7 w-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
          <Target className="h-3.5 w-3.5 text-indigo-400" />
        </div>
        <h3 className="text-sm font-semibold text-white">投流策略</h3>
        <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">AI 生成</span>
      </div>

      <div className="space-y-2">
        {data.dailyAnalysis.slice(0, 5).map((d, i) => {
          const style = getActionStyle(d.action);
          const Icon = style.icon;
          return (
            <motion.div
              key={d.date}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.01] border border-white/[0.04] hover:bg-white/[0.03] transition-all group"
            >
              <div className={`h-8 w-8 rounded-lg ${style.bg} border ${style.border} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                <Icon className={`h-4 w-4 ${style.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{d.action}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{d.date} · ROI {d.roi.toFixed(2)}</p>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium border shrink-0 ${style.bg} ${style.color} ${style.border}`}>
                {style.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}