"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, Target, BarChart3 } from "lucide-react";
import type { StrategyResult } from "@/lib/ad-strategy";

interface StrategyPanelProps {
  data: { overall: StrategyResult; platforms: Record<string, StrategyResult>; dailyAnalysis: Array<{ date: string; roi: number; action: string }> } | null;
  loading?: boolean;
}

export function StrategyPanel({ data, loading }: StrategyPanelProps) {
  if (loading) {
    return (
      <Card><CardHeader><CardTitle className="text-base">智能投流策略</CardTitle></CardHeader>
        <CardContent><div className="animate-pulse h-20 bg-muted rounded-lg" /></CardContent>
      </Card>
    );
  }

  if (!data || data.overall.reason === "none") {
    return (
      <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4" />智能投流策略</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground text-sm">数据不足，需要更多天数据才能分析趋势</p></CardContent>
      </Card>
    );
  }

  const { overall, platforms } = data;
  const isIncrease = overall.action === "increase";
  const isDecrease = overall.action === "decrease";

  return (
    <div className="space-y-4">
      {/* Overall Strategy */}
      <Card className={isIncrease ? "border-green-300 dark:border-green-800" : isDecrease ? "border-red-300 dark:border-red-800" : ""}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4" />智能投流策略
            <span className="text-xs text-muted-foreground ml-2">置信度 {overall.confidence}%</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className={`h-14 w-14 rounded-xl flex items-center justify-center ${
              isIncrease ? "bg-green-100 text-green-600" : isDecrease ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"
            }`}>
              {isIncrease ? <TrendingUp className="h-7 w-7" /> : isDecrease ? <TrendingDown className="h-7 w-7" /> : <Minus className="h-7 w-7" />}
            </div>
            <div>
              <p className={`text-xl font-bold ${isIncrease ? "text-green-600" : isDecrease ? "text-red-500" : ""}`}>
                {overall.actionLabel}{" "}
                {overall.changePercent !== 0 && `${overall.changePercent > 0 ? "+" : ""}${overall.changePercent}%`}
              </p>
              <p className="text-sm text-muted-foreground">{overall.reasonDetail}</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 text-center text-sm">
            <div className="bg-muted/50 rounded-lg p-2">
              <p className="text-muted-foreground text-xs">当前预算</p>
              <p className="font-bold">¥{overall.currentBudget.toLocaleString()}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-2">
              <p className="text-muted-foreground text-xs">建议预算</p>
              <p className="font-bold">¥{overall.suggestedBudget.toLocaleString()}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-2">
              <p className="text-muted-foreground text-xs">平均ROI</p>
              <p className="font-bold">{(overall.avgROI * 100).toFixed(0)}%</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-2">
              <p className="text-muted-foreground text-xs">连续天数</p>
              <p className="font-bold">{overall.consecutiveDays}天</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Strategies */}
      {Object.keys(platforms).length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />各平台策略
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(platforms).map(([name, s]) => {
                const pInc = s.action === "increase";
                const pDec = s.action === "decrease";
                return (
                  <div key={name} className="flex items-center justify-between p-2 rounded-lg bg-muted/40">
                    <span className="font-medium text-sm">{name}</span>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-muted-foreground">ROI {(s.avgROI * 100).toFixed(0)}%</span>
                      <span>¥{s.currentBudget.toLocaleString()} → ¥{s.suggestedBudget.toLocaleString()}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        pInc ? "bg-green-100 text-green-700" : pDec ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"
                      }`}>
                        {s.actionLabel} {s.changePercent > 0 ? "+" : ""}{s.changePercent}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
