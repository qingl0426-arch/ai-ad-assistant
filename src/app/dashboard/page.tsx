"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MetricCards } from "@/components/dashboard/metric-cards";
import { StrategyPanel } from "@/components/analysis/strategy-panel";
import { AIPanel } from "@/components/analysis/ai-panel";
import { AnalysisPanel } from "@/components/analysis/analysis-panel";
import { DashboardCharts } from "@/components/dashboard/charts";
import { Button } from "@/components/ui/button";
import { LogOut, BarChart3, Upload, LayoutDashboard, FileText, Crown, CreditCard } from "lucide-react";
import Link from "next/link";
import type { BatchAnalysisResult } from "@/lib/roi-engine";
import type { AISuggestionResult } from "@/lib/openai.service";
import { getPlanName, type PlanTier } from "@/lib/permissions";

interface DashboardData {
  totals: { spend: number; impressions: number; clicks: number; gmv: number; orders: number; roi: number; ctr: number } | null;
  daily: Array<{ date: string; spend: number; gmv: number; roi: number; orders: number; impressions: number; clicks: number }>;
  platforms: Array<{ name: string; spend: number; gmv: number; roi: number; orders: number }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({ totals: null, daily: [], platforms: [] });
  const [analysis, setAnalysis] = useState<BatchAnalysisResult | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestionResult | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [strategy, setStrategy] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [userPlan, setUserPlan] = useState<PlanTier>("free");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: authData }) => {
      setUser(authData.user);
      if (!authData.user) { setLoading(false); return; }
      Promise.all([
        fetch("/api/strategy").then((r) => r.json()),
        fetch("/api/dashboard").then((r) => r.json()),
        fetch("/api/analysis").then((r) => r.json()),
        fetch("/api/user").then((r) => r.json()),
      ]).then(([s, d, a, u]) => {
        setStrategy(s);
        setData(d);
        setAnalysis(a);
        if (u.plan) setUserPlan(u.plan);
        setLoading(false);
      }).catch(() => setLoading(false));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchAISuggestions() {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai-suggest");
      const json = await res.json();
      if (res.ok) setAiSuggestions(json);
    } catch { /* ignore */ }
    finally { setAiLoading(false); }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (!user && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
        <div className="text-center space-y-4">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">请先登录</p>
          <Button asChild><Link href="/login">去登录</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="h-14 border-b bg-background flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-5 w-5 text-primary" />
          <span className="font-semibold">AI Ad Assistant</span>
          {userPlan !== "free" && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium flex items-center gap-1">
              <Crown className="h-3 w-3" />
              {getPlanName(userPlan)}
            </span>
          )}
        </div>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild><Link href="/report"><FileText className="h-4 w-4 mr-1" />报告</Link></Button>
          <Button variant="ghost" size="sm" asChild><Link href="/dashboard"><LayoutDashboard className="h-4 w-4 mr-1" />大屏</Link></Button>
          <Button variant="ghost" size="sm" asChild><Link href="/upload"><Upload className="h-4 w-4 mr-1" />上传</Link></Button>
          <Button variant="ghost" size="sm" asChild><Link href="/pricing"><CreditCard className="h-4 w-4 mr-1" />套餐</Link></Button>
          <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut className="h-4 w-4 mr-1" />退出</Button>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">投流数据大屏</h1>
            <p className="text-muted-foreground text-sm mt-1">{loading ? "加载中..." : data.totals ? `共 ${data.daily.length} 天数据` : "暂无数据"}</p>
          </div>
          {userPlan === "free" && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/pricing"><Crown className="h-4 w-4 mr-1" />升级套餐</Link>
            </Button>
          )}
        </div>

        <StrategyPanel data={strategy} loading={loading} />
        <MetricCards totals={data.totals} />
        <AIPanel data={aiSuggestions} loading={aiLoading} onRefresh={fetchAISuggestions} />
        <AnalysisPanel data={analysis} loading={loading} />
        <DashboardCharts daily={data.daily} platforms={data.platforms} />
      </main>
    </div>
  );
}
