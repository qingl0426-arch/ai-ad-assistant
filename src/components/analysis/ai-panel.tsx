"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Lightbulb, AlertTriangle, TrendingUp, BarChart3 } from "lucide-react";
import type { AISuggestionResult } from "@/lib/openai.service";

interface AIPanelProps {
  data: AISuggestionResult | null;
  loading?: boolean;
  onRefresh?: () => void;
}

export function AIPanel({ data, loading, onRefresh }: AIPanelProps) {
  if (loading) {
    return (
      <Card className="border-primary/30">
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" />AI 分析</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
            正在分析数据...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />AI 投流分析
          </CardTitle>
          <div className="flex items-center gap-3">
            {data && <span className="text-xs text-muted-foreground">置信度 {data.confidence}%</span>}
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
              <Sparkles className="h-3 w-3 mr-1" />重新分析
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!data ? (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>点击"重新分析"获取 AI 投流建议</p>
            <p className="text-xs mt-1">需要配置 OPENAI_API_KEY</p>
          </div>
        ) : (
          <>
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-sm font-medium">{data.summary}</p>
            </div>

            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-400">预算建议</span>
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-400">{data.budgetAdvice}</p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-sm font-medium text-green-700 dark:text-green-400">
                  <Lightbulb className="h-3 w-3" />投流建议
                </div>
                <ul className="space-y-1">
                  {data.suggestions.map((s, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex gap-1">
                      <span className="text-green-500 shrink-0">{i + 1}.</span>{s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1 text-sm font-medium text-red-700 dark:text-red-400">
                  <AlertTriangle className="h-3 w-3" />风险提示
                </div>
                <ul className="space-y-1">
                  {data.risks.map((s, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex gap-1">
                      <span className="text-red-500 shrink-0">{i + 1}.</span>{s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1 text-sm font-medium text-purple-700 dark:text-purple-400">
                  <TrendingUp className="h-3 w-3" />优化建议
                </div>
                <ul className="space-y-1">
                  {data.optimizations.map((s, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex gap-1">
                      <span className="text-purple-500 shrink-0">{i + 1}.</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
