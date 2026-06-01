"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/layout/navbar";
import { MetricCards } from "@/components/dashboard/metric-cards";
import { DashboardCharts } from "@/components/dashboard/charts";
import { AIPanel } from "@/components/analysis/ai-panel";
import { AnalysisPanel } from "@/components/analysis/analysis-panel";
import { StrategyPanel } from "@/components/analysis/strategy-panel";
import { Button } from "@/components/ui/button";
import {
  Crown, LayoutDashboard, Sparkles,
  
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { PlanTier } from "@/lib/permissions";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [userPlan, setUserPlan] = useState<PlanTier>("free");
  const [currentTime, setCurrentTime] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (!data.user) { setLoading(false); return; }
      fetch("/api/user")
        .then(r => r.json())
        .then(u => { if (u.plan) setUserPlan(u.plan); setLoading(false); })
        .catch(() => setLoading(false));
    });
    const now = new Date();
    setCurrentTime(now.toLocaleString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-5"
        >
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center mx-auto">
            <LayoutDashboard className="h-8 w-8 text-indigo-400" />
          </div>
          <p className="text-slate-400 text-lg">请先登录以访问数据大屏</p>
          <Link href="/login">
            <Button className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/20 gap-2">
              去登录 <Sparkles className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b]">
      <Navbar
        user={user}
        showAuth={false}
        onLogout={async () => { await supabase.auth.signOut(); router.push("/login"); }}
      />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-24 pb-16 space-y-6">
        {/* ── Header Bar ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center">
              <LayoutDashboard className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">数据大屏</h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
                {loading ? "加载中..." : "实时投流数据概览"}
              </p>
            </div>
          </div>

          {/* Right side: status + upgrade */}
          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/[0.06] border border-emerald-500/[0.15]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="text-[11px] text-emerald-400 font-medium">实时</span>
              <span className="text-[11px] text-slate-500 font-mono">{currentTime}</span>
            </div>

            {userPlan === "free" && (
              <Link href="/pricing">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/[0.08] hover:border-indigo-500/30 gap-1.5 h-9"
                >
                  <Crown className="h-3.5 w-3.5" /> 升级专业版
                </Button>
              </Link>
            )}
          </div>
        </motion.div>

        {/* ── KPI Metric Cards ── */}
        <MetricCards totals={null} />

        {/* ── Main Grid: Charts + Side Panels ── */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Charts (2 columns wide on desktop) */}
          <div className="lg:col-span-2 space-y-6">
            <DashboardCharts daily={[]} platforms={[]} />
          </div>

          {/* Right: Strategy + Analysis */}
          <div className="space-y-6">
            <StrategyPanel data={null} loading={loading} />
            <AnalysisPanel data={null} loading={loading} />
          </div>
        </div>

        {/* ── AI Panel (full width) ── */}
        <AIPanel data={null} />
      </main>
    </div>
  );
}