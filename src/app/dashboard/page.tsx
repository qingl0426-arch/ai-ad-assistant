/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/layout/navbar";
import { MetricCards } from "@/components/dashboard/metric-cards";
import { DashboardCharts } from "@/components/dashboard/charts";
import { Button } from "@/components/ui/button";
import { Crown, LayoutDashboard, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { PlanTier } from "@/lib/permissions";

interface AdRow {
  date: string; spend: number; impressions: number; clicks: number;
  gmv: number; orders: number; roi: number; platform: string; campaign: string;
}

interface DailyRow {
  date: string; spend: number; gmv: number; roi: number;
  orders: number; impressions: number; clicks: number;
}

interface PlatformRow {
  name: string; spend: number; gmv: number; roi: number; orders: number;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [userPlan, setUserPlan] = useState<PlanTier>("free");
  const [currentTime, setCurrentTime] = useState("");
  const [totals, setTotals] = useState<{ totalSpend: number; totalGmv: number; totalRoi: number; totalOrders: number; totalImpressions: number; } | null>(null);
  const [dailyData, setDailyData] = useState<DailyRow[]>([]);
  const [platformData, setPlatformData] = useState<PlatformRow[]>([]);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function init() {
      try {
      const { data: authData } = await supabase.auth.getUser();
      setUser(authData.user);
      if (!authData.user) { setLoading(false); return; }

      fetch("/api/user").then(r => r.json()).then(u => { if (u.plan) setUserPlan(u.plan); }).catch(() => {});

      const { data: rows, error } = await (supabase.from("ad_traffic") as any)
        .select("*").eq("user_id", authData.user.id).order("date", { ascending: false }).limit(1000);

      if (error) { console.error("Dashboard fetch error:", error); setLoading(false); return; }

      const ads = (rows || []) as AdRow[];
      let totalSpend = 0, totalGmv = 0, totalOrders = 0, totalImpressions = 0;
      for (const r of ads) {
        totalSpend += Number(r.spend) || 0;
        totalGmv += Number(r.gmv) || 0;
        totalOrders += Number(r.orders) || 0;
        totalImpressions += Number(r.impressions) || 0;
      }
      const totalRoi = totalSpend > 0 ? (totalGmv - totalSpend) / totalSpend : 0;
      setTotals({ totalSpend, totalGmv, totalRoi, totalOrders, totalImpressions });

      const dateMap = new Map<string, DailyRow>();
      const sorted = [...ads].sort((a, b) => a.date.localeCompare(b.date));
      for (const r of sorted) {
        const d = r.date?.slice(0, 10) || "未知";
        const existing = dateMap.get(d);
        if (existing) {
          existing.spend += Number(r.spend) || 0;
          existing.gmv += Number(r.gmv) || 0;
          existing.orders += Number(r.orders) || 0;
          existing.impressions += Number(r.impressions) || 0;
          existing.clicks += Number(r.clicks) || 0;
        } else {
          dateMap.set(d, { date: d, spend: Number(r.spend) || 0, gmv: Number(r.gmv) || 0, roi: 0, orders: Number(r.orders) || 0, impressions: Number(r.impressions) || 0, clicks: Number(r.clicks) || 0 });
        }
      }
      const dailyArr = Array.from(dateMap.values());
      for (const d of dailyArr) { d.roi = d.spend > 0 ? (d.gmv - d.spend) / d.spend : 0; }
      setDailyData(dailyArr.slice(-30));

      const platMap = new Map<string, PlatformRow>();
      const platNames: Record<string, string> = { juliang: "巨量引擎", qianchuan: "千川", douyin: "抖音", kuaishou: "快手", tencent: "腾讯广告", alibaba: "阿里巴巴", shipinhao: "视频号" };
      for (const r of ads) {
        const raw = (r.platform || "").trim();
        const name = platNames[raw] || raw || "其他";
        const existing = platMap.get(name);
        if (existing) { existing.spend += Number(r.spend) || 0; existing.gmv += Number(r.gmv) || 0; existing.orders += Number(r.orders) || 0; }
        else { platMap.set(name, { name, spend: Number(r.spend) || 0, gmv: Number(r.gmv) || 0, roi: 0, orders: Number(r.orders) || 0 }); }
      }
      const platArr = Array.from(platMap.values());
      for (const p of platArr) { p.roi = p.spend > 0 ? (p.gmv - p.spend) / p.spend : 0; }
      setPlatformData(platArr);

      } catch (e) { console.error("Dashboard init error:", e); }
      finally { setLoading(false); }
    }

    init();
    setCurrentTime(new Date().toLocaleString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    const timer = setInterval(() => { setCurrentTime(new Date().toLocaleString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })); }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-5">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center mx-auto">
            <LayoutDashboard className="h-8 w-8 text-indigo-400" />
          </div>
          <p className="text-slate-400 text-lg">请先登录以访问数据大屏</p>
          <Link href="/login"><Button className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/20 gap-2">去登录 <Sparkles className="h-4 w-4" /></Button></Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b]">
      <Navbar user={user} showAuth={false} onLogout={async () => { await supabase.auth.signOut(); router.push("/login"); }} />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-24 pb-16 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center">
              <LayoutDashboard className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">数据大屏</h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-0.5">{loading ? "加载中..." : "实时投流数据概览"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/[0.06] border border-emerald-500/[0.15]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="text-[11px] text-emerald-400 font-medium">实时</span>
              <span className="text-[11px] text-slate-500 font-mono">{currentTime}</span>
            </div>
            {userPlan === "free" && (
              <Link href="/pricing"><Button variant="outline" size="sm" className="rounded-xl border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/[0.08] hover:border-indigo-500/30 gap-1.5 h-9"><Crown className="h-3.5 w-3.5" /> 升级专业版</Button></Link>
            )}
          </div>
        </motion.div>
        <MetricCards totals={totals} />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <DashboardCharts daily={dailyData} platforms={platformData} />
          </div>
          <div className="space-y-6">
          </div>
        </div>
      </main>
    </div>
  );
}
