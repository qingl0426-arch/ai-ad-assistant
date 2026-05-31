"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { BatchAnalysisResult, PlatformResult } from "@/lib/roi-engine";

interface AnalysisPanelProps {
  data: BatchAnalysisResult | null;
  loading?: boolean;
}

export function AnalysisPanel({ data, loading }: AnalysisPanelProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse"><CardContent className="p-6 h-32" /></Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <Card><CardContent className="p-6 text-center text-muted-foreground">暂无分析数据</CardContent></Card>
    );
  }

  const { overall, platformAnalysis } = data;

  return (
    <div className="space-y-6">
      {/* Overall Grade */}
      <div className={cn(
        "rounded-xl p-6 text-white",
        overall.grade === "excellent" ? "bg-green-600" : overall.grade === "normal" ? "bg-blue-600" : "bg-red-500"
      )}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">综合评级</p>
            <p className="text-3xl font-bold">
              {overall.grade === "excellent" ? "优秀" : overall.grade === "normal" ? "正常" : "需要优化"}
            </p>
            <p className="text-sm mt-1 opacity-90">{overall.suggestion}</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-80">综合 ROI</p>
            <p className="text-2xl font-bold">{(overall.overallROI * 100).toFixed(0)}%</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricBlock label="点击率 CTR" value={`${(overall.avgCTR * 100).toFixed(2)}%`} color="text-blue-500" />
        <MetricBlock label="转化率" value={`${(overall.avgConversionRate * 100).toFixed(2)}%`} color="text-purple-500" />
        <MetricBlock label="成交率" value={`${(overall.avgDealRate * 100).toFixed(2)}%`} color="text-green-500" />
        <MetricBlock label="总订单" value={overall.totalOrders.toLocaleString()} color="text-orange-500" />
      </div>

      {/* Platform Rankings */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">平台表现排名</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {platformAnalysis.map((p, i) => (
              <PlatformRow key={p.platform} data={p} rank={i + 1} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricBlock({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn("text-xl font-bold mt-1", color)}>{value}</p>
      </CardContent>
    </Card>
  );
}

function PlatformRow({ data, rank }: { data: PlatformResult; rank: number }) {
  const gradeColor = data.grade === "excellent" ? "bg-green-100 text-green-700" : data.grade === "normal" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700";
  const gradeLabel = data.grade === "excellent" ? "优秀" : data.grade === "normal" ? "正常" : "需优化";

  return (
    <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
      <span className="text-sm font-bold w-6">#{rank}</span>
      <span className="font-medium flex-1">{data.platform}</span>
      <span className="text-sm text-muted-foreground">消耗 ¥{data.spend.toLocaleString()}</span>
      <span className="text-sm text-muted-foreground">GMV ¥{data.gmv.toLocaleString()}</span>
      <span className="text-sm font-medium">ROI {(data.roi * 100).toFixed(0)}%</span>
      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", gradeColor)}>{gradeLabel}</span>
    </div>
  );
}


