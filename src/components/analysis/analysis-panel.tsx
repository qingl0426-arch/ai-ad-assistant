"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, CheckCircle, BarChart3, PieChart } from "lucide-react";
import type { BatchAnalysisResult } from "@/lib/roi-engine";

interface AnalysisPanelProps {
  data: BatchAnalysisResult | null;
  loading?: boolean;
}

export function AnalysisPanel({ data, loading }: AnalysisPanelProps) {
  if (loading) {
    return (
      <div className="rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] p-5 animate-pulse">
        <div className="h-4 w-24 bg-white/[0.05] rounded-lg mb-4" />
        <div className="space-y-3">
          <div className="h-12 bg-white/[0.03] rounded-xl" />
          <div className="h-12 bg-white/[0.03] rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data?.platformAnalysis || data.platformAnalysis.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] p-6 text-center"
      >
        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
          <PieChart className="h-5 w-5 text-emerald-400" />
        </div>
        <p className="text-slate-400 text-sm font-medium mb-1">平台分析</p>
        <p className="text-slate-600 text-xs">暂无数据</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] p-5"
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <BarChart3 className="h-3.5 w-3.5 text-emerald-400" />
        </div>
        <h3 className="text-sm font-semibold text-white">平台分析</h3>
      </div>

      <div className="space-y-2">
        {data.platformAnalysis.map((p, i) => {
          const roiLevel = p.roi != null ? (p.roi >= 2 ? "high" : p.roi >= 1 ? "mid" : "low") : null;
          const styles = {
            high: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", icon: TrendingUp, bar: "bg-emerald-500" },
            mid: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", icon: TrendingUp, bar: "bg-amber-500" },
            low: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20", icon: TrendingDown, bar: "bg-red-500" },
          };
          const s = roiLevel ? styles[roiLevel] : styles.mid;
          const Icon = s.icon;

          return (
            <motion.div
              key={p.platform || i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-3 rounded-xl bg-white/[0.01] border border-white/[0.04] hover:bg-white/[0.03] transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="text-sm font-medium text-white">{p.platform || `平台 ${i + 1}`}</span>
                </div>
                {p.roi != null && (
                  <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-md border", s.bg, s.text, s.border)}>
                    <Icon className="h-3 w-3 inline mr-1" />
                    ROI {p.roi.toFixed(1)}
                  </span>
                )}
              </div>
              {/* Mini bar */}
              <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(((p.roi || 0) / 5) * 100, 100)}%` }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                  className={`h-full rounded-full ${s.bar}`}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                消耗: ¥{(p.spend || 0).toLocaleString()} · GMV: ¥{((p.spend || 0) * (p.roi || 0)).toLocaleString()}
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}