/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { WorkspaceLayout } from "@/components/layout/workspace-layout";
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
      <div className="min-h-screen bg-[#f3f7fb] flex items-center justify-center">
        <div className="text-center space-y-4"><p className="text-[#64748b]">请先登录</p><Button onClick={() => router.push("/login")} className="rounded-xl bg-[#1688ff] hover:bg-[#1670d9]">去登录</Button></div>
      </div>
    );
  }

  return (
    <WorkspaceLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-xl bg-[#eaf4ff] border border-[#1688ff]/20 flex items-center justify-center"><TrendingUp className="h-4 w-4 text-[#1688ff]" /></div>
            <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight">AI利润增长</h1>
          </div>
          <p className="text-[#64748b] text-sm">AI分析建议 + 可测试爆品推荐，帮你发现新增长机会</p>
        </div>

        {/* Profit growth suggestions */}
        <div className="rounded-[18px] border border-[#e5eaf0] bg-white p-8 text-center mb-6 shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
          <Lightbulb className="h-10 w-10 mx-auto text-[#94a3b8] mb-3" />
          <h3 className="text-lg font-semibold text-[#0f172a] mb-2">上传数据获取利润增长建议</h3>
          <p className="text-[#64748b] text-sm mb-4">AI自动识别亏损计划、高ROI机会，直接告诉你该停什么、该加什么</p>
          <Button onClick={() => router.push("/upload")} className="rounded-xl bg-[#1688ff] hover:bg-[#1670d9] gap-2"><Upload className="h-4 w-4" /> 上传数据</Button>
        </div>

        {/* Recommended products */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-[18px] border border-[#e5eaf0] bg-white p-6 shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-[#eaf4ff] border border-[#1688ff]/20 flex items-center justify-center"><Zap className="h-3.5 w-3.5 text-[#1688ff]" /></div>
              <h3 className="text-sm font-medium text-[#0f172a]">可测试爆品推荐</h3>
            </div>
            <Button variant="outline" size="sm" onClick={fetchRecommendations} disabled={recLoading}
              className="rounded-xl border-[#e5eaf0] text-[#64748b] hover:text-[#0f172a] gap-1.5">
              {recLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}刷新
            </Button>
          </div>

          {recLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => (<div key={i} className="rounded-xl bg-[#f8fafc] border border-[#e5eaf0] p-4 animate-pulse"><div className="h-4 w-36 bg-[#e2e8f0] rounded mb-2" /><div className="h-3 w-48 bg-[#e5eaf0] rounded" /></div>))}</div>
          ) : recResult && recResult.recommendations.length > 0 ? (
            <>
              <div className="mb-4 px-4 py-3 rounded-xl bg-[#eaf4ff] border border-[#1688ff]/15">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-[#1688ff]">{recResult.scenarioLabel}</span>
                </div>
                <p className="text-xs text-[#475569]">{recResult.scenarioHint}</p>
              </div>

              <div className="space-y-3">
                {recResult.recommendations.map((r, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                    className="rounded-xl bg-[#f8fafc] border border-[#e5eaf0] p-4 hover:bg-[#f1f7ff] transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-sm font-semibold text-[#0f172a]">{r.product_name}</span>
                          <span className={cn("text-[11px] px-2 py-0.5 rounded-full border",
                            r.action === "可立即测试" ? "bg-[#f0fdf4] text-[#16a34a] border-[#16a34a]/20" :
                            "bg-[#eaf4ff] text-[#1688ff] border-[#1688ff]/20")}>{r.action}</span>
                        </div>
                        <p className="text-xs text-[#64748b] mb-2">{r.reason}</p>
                        <div className="flex items-center gap-4 text-xs">
                          <span><span className="text-[#94a3b8]">爆款指数：</span><span className="text-[#0f172a] font-medium">{r.hot_score}</span></span>
                          <span><span className="text-[#94a3b8]">利润率：</span><span className="text-[#0f172a] font-medium">{r.estimated_profit_rate}%</span></span>
                          <span><span className="text-[#94a3b8]">竞争：</span><span className={cn("font-medium", r.competition === "低" ? "text-[#16a34a]" : r.competition === "中" ? "text-[#f59e0b]" : "text-[#ef4444]")}>{r.competition}</span></span>
                        </div>
                      </div>
                      <div className="shrink-0 text-center">
                        <div className="bg-[#eaf4ff] rounded-xl px-3 py-2">
                          <p className="text-[10px] text-[#94a3b8]">测试预算</p>
                          <p className="text-sm font-bold text-[#1688ff]">¥{r.suggested_test_budget}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-[#e5eaf0] flex justify-between items-center">
                <span className="text-xs text-[#94a3b8]">共 {recResult.totalAvailable} 个商品可分析</span>
                <Button variant="outline" size="sm" onClick={() => router.push("/product-radar")}
                  className="rounded-xl border-[#e5eaf0] text-[#64748b] hover:text-[#0f172a] gap-1.5">
                  查看全部商品 <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-10">
              <Package className="h-10 w-10 mx-auto text-[#94a3b8] mb-3" />
              <p className="text-[#64748b] text-sm mb-2">暂无推荐商品</p>
              <p className="text-[#94a3b8] text-xs mb-4">上传商品趋势数据后，AI 会自动推荐可测试的爆品</p>
              <Button variant="outline" size="sm" onClick={() => router.push("/upload")}
                className="rounded-xl border-[#e5eaf0] text-[#64748b] hover:text-[#0f172a] gap-1.5">
                <Upload className="h-3.5 w-3.5" /> 上传商品数据
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </WorkspaceLayout>
  );
}
