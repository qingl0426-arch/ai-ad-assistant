"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, Lightbulb, Loader2, Brain, Cpu } from "lucide-react";
import type { AISuggestionResult } from "@/lib/openai.service";

interface AIPanelProps {
  data: AISuggestionResult | null;
  loading?: boolean;
  onRefresh?: () => void;
}

export function AIPanel({ data, loading, onRefresh }: AIPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="relative rounded-2xl border border-indigo-500/[0.12] bg-gradient-to-br from-indigo-500/[0.03] via-purple-500/[0.02] to-pink-500/[0.01] backdrop-blur-xl p-5 sm:p-6 overflow-hidden"
    >
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-indigo-500/[0.04] rounded-full blur-[80px] pointer-events-none" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Brain className="h-4.5 w-4.5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">AI 智能分析</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                </span>
                <span className="text-[10px] text-slate-500">GPT-4o 驱动</span>
              </div>
            </div>
          </div>
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="rounded-lg border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/[0.08] hover:border-indigo-500/30 gap-1.5 h-8 text-xs"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              分析
            </Button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="h-4 w-4 rounded bg-white/[0.08] mt-0.5 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-full bg-white/[0.05] rounded" />
                  <div className="h-3 w-3/4 bg-white/[0.05] rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : data ? (
          <div className="space-y-2.5">
            {data.suggestions?.slice(0, 3).map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.12 }}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all group"
              >
                <div className="h-7 w-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {typeof s === "string" ? s : (s as { content?: string }).content || ""}
                </p>
              </motion.div>
            )) || (
              <div className="text-center py-10">
                <div className="h-12 w-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
                  <Cpu className="h-6 w-6 text-slate-600" />
                </div>
                <p className="text-slate-500 text-sm">点击分析按钮获取 AI 建议</p>
                <p className="text-slate-600 text-xs mt-1">基于实时数据生成智能推荐</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-10">
            <div className="h-12 w-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
              <Cpu className="h-6 w-6 text-slate-600" />
            </div>
            <p className="text-slate-500 text-sm">点击分析按钮获取 AI 建议</p>
            <p className="text-slate-600 text-xs mt-1">基于实时数据生成智能推荐</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}