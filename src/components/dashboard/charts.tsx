"use client";

import { motion } from "framer-motion";
import {
  BarChart, Bar, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ComposedChart,
} from "recharts";
import { BarChart3 } from "lucide-react";

interface ChartsProps {
  daily: Array<{
    date: string; spend: number; gmv: number; roi: number;
    orders: number; impressions: number; clicks: number;
  }>;
  platforms: Array<{ name: string; spend: number; gmv: number; roi: number; orders: number }>;
}

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "#18181b",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px",
    color: "#fafafa",
    fontSize: "12px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
    padding: "10px 14px",
  },
  labelStyle: { color: "#a1a1aa", fontWeight: 600, marginBottom: 4 },
};

export function DashboardCharts({ daily, platforms }: ChartsProps) {
  if (daily.length === 0 && platforms.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] p-8 sm:p-12 text-center h-full flex flex-col items-center justify-center min-h-[400px]"
      >
        <div className="h-14 w-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="h-7 w-7 text-slate-600" />
        </div>
        <p className="text-slate-400 font-medium mb-1">暂无图表数据</p>
        <p className="text-slate-600 text-sm">上传 CSV 文件后自动生成可视化图表</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ROI & GMV Trend */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] p-5 sm:p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold text-white">ROI & GMV 趋势</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">近 12 天数据走势</p>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-indigo-400" /> ROI</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" /> GMV</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={340}>
          <ComposedChart data={daily}>
            <defs>
              <linearGradient id="roiGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#818cf8" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gmvGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
            <YAxis yAxisId="left" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} dx={-10} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} dx={10} />
            <Tooltip {...tooltipStyle} />
            <Area yAxisId="left" type="monotone" dataKey="roi" name="ROI" stroke="#818cf8" fill="url(#roiGrad)" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: "#818cf8", stroke: "#fff", strokeWidth: 2 }} />
            <Area yAxisId="right" type="monotone" dataKey="gmv" name="GMV" stroke="#34d399" fill="url(#gmvGrad)" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: "#34d399", stroke: "#fff", strokeWidth: 2 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Spend vs Orders */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] p-5 sm:p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold text-white">消耗 vs 订单</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">每日投放效果对比</p>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" /> 消耗</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-indigo-400" /> 订单</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={daily} barGap={6}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
            <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} dx={-10} />
            <Tooltip {...tooltipStyle} />
            <Bar dataKey="spend" name="消耗" fill="#f59e0b" radius={[8, 8, 0, 0]} maxBarSize={32} />
            <Bar dataKey="orders" name="订单" fill="#818cf8" radius={[8, 8, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Platform comparison */}
      {platforms.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] p-5 sm:p-6"
        >
          <h3 className="text-sm font-semibold text-white mb-5">平台 ROI 对比</h3>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={platforms} layout="vertical" barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: "#a1a1aa", fontSize: 13, fontWeight: 500 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="roi" name="ROI" radius={[0, 8, 8, 0]}>
                {platforms.map((_, idx) => (
                  <stop key={idx} stopColor={["#818cf8", "#a78bfa", "#34d399", "#f59e0b"][idx % 4]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  );
}