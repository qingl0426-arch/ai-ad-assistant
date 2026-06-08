/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  TrendingUp, Zap, Lightbulb, Loader2, Package, Upload, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { RecommendationResult, ProductRecommendation } from "@/lib/product-recommend";

export default function ProfitGrowthPage() {
  const router = useRouter(); const supabase = createClient();
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [recResult, setRecResult] = useState<RecommendationResult | null>(null);
  const [recLoading, setRecLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (!data.user) return;
      setLoading(false);
      // 自动加载推荐
      fetchRecommendations();
    });
  }, []);

  const fetchRecommendations = async () => {
    setRecLoading(true);
    try {
      const res = await fetch("/api/product-trends/recommend");
      const data = await res.json();
      if (res.ok) setRecResult(data);
    } catch (err) { console.error(err); }
    finally { setRecLoading(false); }
  };

  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="text-center space-y-4"><p className="text-slate-400">请先登录</p><Button onClick={() => router.push("/login")} className="rounded-xl bg-indigo-600 hover:bg-indigo-500">去登录</Button></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b]">
      <Navbar showAuth={false} />
      <main className="mx-auto max-w-5xl px-6 pt-20 pb-12">
        {/* 页头 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center"><TrendingUp className="h-4 w-4 text-indigo-400" /></div>
            <h1 className="text-2xl font-bold text-white tracking-tight">AI利润增长</h1>
          </div>
          <p className="text-slate-400 text-sm">AI分析建议 + 可测试爆品推荐，帮你发现新增长机会</p>
        </div>

        {/* 利润增长建议（占位） */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 text-center mb-6">
          <Lightbulb className="h-10 w-10 mx-auto text-slate-600 mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">上传数据获取利润增长建议</h3>
          <p className="text-slate-400 text-sm mb-4">AI自动识别亏损计划、高ROI机会，直接告诉你该停什么、该加什么</p>
          <Button onClick={() => router.push("/upload")} className="rounded-xl bg-indigo-600 hover:bg-indigo-500 gap-2"><Upload className="h-4 w-4" /> 上传数据</Button>
        </div>

        {/* 可测试爆品推荐 */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/[0.03] to-indigo-500/[0.03] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center"><Zap className="h-3.5 w-3.5 text-purple-400" /></div>
              <h3 className="text-sm font-medium text-white">可测试爆品推荐</h3>
            </div>
            <Button variant="outline" size="sm" onClick={fetchRecommendations} disabled={recLoading}
              className="rounded-xl border-white/[0.08] text-slate-400 hover:text-white gap-1.5">
              {recLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}刷新
            </Button>
          </div>

          {recLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => (<div key={i} className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-4 animate-pulse"><div className="h-4 w-36 bg-white/[0.04] rounded mb-2" /><div className="h-3 w-48 bg-white/[0.03] rounded" /></div>))}</div>
          ) : recResult && recResult.recommendations.length > 0 ? (
            <>
              {/* 场景说明 */}
              <div className="mb-4 px-4 py-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-purple-300">{recResult.scenarioLabel}</span>
                </div>
                <p className="text-xs text-purple-400/70">{recResult.scenarioHint}</p>
              </div>

              <div className="space-y-3">
                {recResult.recommendations.map((r, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                    className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-4 hover:bg-white/[0.04] transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-sm font-semibold text-white">{r.product_name}</span>
                          <span className={cn("text-[11px] px-2 py-0.5 rounded-full border",
                            r.action === "可立即测试" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                            "bg-indigo-500/10 text-indigo-400 border-indigo-500/20")}>{r.action}</span>
                        </div>
                        <p className="text-xs text-slate-400 mb-2">{r.reason}</p>
                        <div className="flex items-center gap-4 text-xs">
                          <span><span className="text-slate-500">爆款指数：</span><span className="text-white font-medium">{r.hot_score}</span></span>
                          <span><span className="text-slate-500">利润率：</span><span className="text-white font-medium">{r.estimated_profit_rate}%</span></span>
                          <span><span className="text-slate-500">竞争：</span><span className={cn("font-medium", r.competition === "低" ? "text-emerald-400" : r.competition === "中" ? "text-amber-400" : "text-red-400")}>{r.competition}</span></span>
                        </div>
                      </div>
                      <div className="shrink-0 text-center">
                        <div className="bg-white/[0.03] rounded-xl px-3 py-2">
                          <p className="text-[10px] text-slate-500">测试预算</p>
                          <p className="text-sm font-bold text-white">¥{r.suggested_test_budget}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06] flex justify-between items-center">
                <span className="text-xs text-slate-500">共 {recResult.totalAvailable} 个商品可分析</span>
                <Button variant="outline" size="sm" onClick={() => router.push("/product-radar")}
                  className="rounded-xl border-white/[0.08] text-slate-400 hover:text-white gap-1.5">
                  查看全部商品 <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-10">
              <Package className="h-10 w-10 mx-auto text-slate-600 mb-3" />
              <p className="text-slate-500 text-sm mb-2">暂无推荐商品</p>
              <p className="text-slate-600 text-xs mb-4">上传商品趋势数据后，AI 会自动推荐可测试的爆品</p>
              <Button variant="outline" size="sm" onClick={() => router.push("/upload")}
                className="rounded-xl border-white/[0.08] text-slate-400 hover:text-white gap-1.5">
                <Upload className="h-3.5 w-3.5" /> 上传商品数据
              </Button>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
