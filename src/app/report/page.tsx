"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function ReportPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (!data.user) { setLoading(false); return; }
      fetch("/api/report").then((r) => r.json()).then((d) => { setReport(d); setLoading(false); });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function downloadPDF() {
    if (!reportRef.current) return;
    setDownloading(true);
    const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 10;
    pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight - 20;
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 10;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 20;
    }
    pdf.save(`投流报告_${new Date().toISOString().slice(0, 10)}.pdf`);
    setDownloading(false);
  }

  if (!user && !loading) return <div className="min-h-screen flex items-center justify-center">请先登录</div>;
  if (loading || !report) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">加载中...</div>;

  const { overview, roiAnalysis, strategy, aiSuggestions } = report;

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="h-14 border-b bg-background flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-primary" />
          <span className="font-semibold">投流分析报告</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild><Link href="/dashboard"><ArrowLeft className="h-4 w-4 mr-1" />返回大屏</Link></Button>
          <Button size="sm" onClick={downloadPDF} disabled={downloading}>
            <Download className="h-4 w-4 mr-1" />{downloading ? "生成中..." : "下载PDF"}
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <div ref={reportRef} className="bg-white p-8 rounded-xl shadow-sm space-y-8 text-gray-900">
          <div className="border-b pb-6">
            <h1 className="text-2xl font-bold">直播投流分析报告</h1>
            <p className="text-gray-500 text-sm mt-1">生成时间: {new Date(report.generatedAt).toLocaleString("zh-CN")} | 数据范围: {overview.dateRange.from} ~ {overview.dateRange.to} | 共 {overview.totalDays} 天</p>
          </div>

          <Section title="一、直播概览">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Stat label="总消耗" value={`¥${overview.spend.toLocaleString()}`} />
              <Stat label="总成交" value={`¥${overview.gmv.toLocaleString()}`} color="text-green-600" />
              <Stat label="综合ROI" value={`${(overview.roi * 100).toFixed(1)}%`} color={overview.roi > 2 ? "text-green-600" : "text-red-500"} />
              <Stat label="总订单" value={overview.orders.toLocaleString()} />
              <Stat label="总曝光" value={overview.impressions.toLocaleString()} />
              <Stat label="总点击" value={overview.clicks.toLocaleString()} />
              <Stat label="点击率" value={`${(overview.ctr * 100).toFixed(2)}%`} />
              <Stat label="平台" value={report.platforms.join("、")} />
            </div>
          </Section>

          <Section title="二、ROI 分析">
            <div className={`p-4 rounded-lg text-white ${roiAnalysis.overall.grade === "excellent" ? "bg-green-600" : roiAnalysis.overall.grade === "normal" ? "bg-blue-600" : "bg-red-500"}`}>
              <p className="text-lg font-bold">{roiAnalysis.overall.grade === "excellent" ? "优秀" : roiAnalysis.overall.grade === "normal" ? "正常" : "需要优化"}</p>
              <p className="text-sm mt-1">综合 ROI: {(roiAnalysis.overall.overallROI * 100).toFixed(0)}% | {roiAnalysis.overall.suggestion}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
              <div><span className="text-gray-500">点击率</span><p className="font-bold">{(roiAnalysis.overall.avgCTR * 100).toFixed(2)}%</p></div>
              <div><span className="text-gray-500">转化率</span><p className="font-bold">{(roiAnalysis.overall.avgConversionRate * 100).toFixed(2)}%</p></div>
              <div><span className="text-gray-500">成交率</span><p className="font-bold">{(roiAnalysis.overall.avgDealRate * 100).toFixed(2)}%</p></div>
              <div><span className="text-gray-500">总订单</span><p className="font-bold">{overview.orders}</p></div>
            </div>
          </Section>

          <Section title="三、问题分析">
            {roiAnalysis.overall.grade === "poor" ? (
              <ul className="space-y-1 text-sm">
                <li className="text-red-600">• ROI 偏低（{(roiAnalysis.overall.overallROI * 100).toFixed(0)}%），处于亏损状态</li>
                {roiAnalysis.overall.avgCTR < 0.02 && <li className="text-orange-600">• 点击率偏低（{(roiAnalysis.overall.avgCTR * 100).toFixed(2)}%），素材吸引力不足</li>}
                {roiAnalysis.overall.avgConversionRate < 0.03 && <li className="text-orange-600">• 转化率偏低（{(roiAnalysis.overall.avgConversionRate * 100).toFixed(2)}%），落地页或商品问题</li>}
              </ul>
            ) : <p className="text-green-600 text-sm">✅ 整体数据表现良好，未发现明显问题</p>}
          </Section>

          <Section title="四、投流建议">
            {aiSuggestions ? (
              <div className="space-y-3">
                <p className="font-medium text-sm">{aiSuggestions.summary}</p>
                <div className="bg-blue-50 p-3 rounded-lg text-sm"><p className="font-medium text-blue-700 mb-1">预算建议</p><p className="text-blue-600">{aiSuggestions.budgetAdvice}</p></div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div><p className="font-medium text-green-700 mb-1">投流建议</p>{aiSuggestions.suggestions.map((s: string, i: number) => <p key={i} className="text-gray-600">• {s}</p>)}</div>
                  <div><p className="font-medium text-red-700 mb-1">风险提示</p>{aiSuggestions.risks.map((s: string, i: number) => <p key={i} className="text-gray-600">• {s}</p>)}</div>
                  <div><p className="font-medium text-purple-700 mb-1">优化建议</p>{aiSuggestions.optimizations.map((s: string, i: number) => <p key={i} className="text-gray-600">• {s}</p>)}</div>
                </div>
              </div>
            ) : <p className="text-gray-500 text-sm">AI 分析暂不可用</p>}
          </Section>

          <Section title="五、加投 / 减投建议">
            <div className="flex items-center gap-4 mb-3">
              <span className={`px-3 py-1 rounded-full text-sm font-bold text-white ${strategy.overall.action === "increase" ? "bg-green-600" : strategy.overall.action === "decrease" ? "bg-red-500" : "bg-gray-500"}`}>
                {strategy.overall.actionLabel} {strategy.overall.changePercent > 0 ? "+" : ""}{strategy.overall.changePercent}%
              </span>
              <span className="text-sm text-gray-600">{strategy.overall.reasonDetail}</span>
            </div>
            <div className="grid grid-cols-4 gap-3 text-center text-sm bg-gray-50 p-3 rounded-lg">
              <div><span className="text-gray-500">当前预算</span><p className="font-bold">¥{strategy.overall.currentBudget.toLocaleString()}</p></div>
              <div><span className="text-gray-500">建议预算</span><p className="font-bold">¥{strategy.overall.suggestedBudget.toLocaleString()}</p></div>
              <div><span className="text-gray-500">平均ROI</span><p className="font-bold">{(strategy.overall.avgROI * 100).toFixed(0)}%</p></div>
              <div><span className="text-gray-500">置信度</span><p className="font-bold">{strategy.overall.confidence}%</p></div>
            </div>
            {Object.keys(strategy.platforms).length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-medium">各平台策略</p>
                {Object.entries(strategy.platforms).map(([name, s]: [string, any]) => (
                  <div key={name} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                    <span>{name}</span>
                    <span>ROI {(s.avgROI * 100).toFixed(0)}% → {s.actionLabel} {s.changePercent > 0 ? "+" : ""}{s.changePercent}%</span>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <div className="border-t pt-4 text-xs text-gray-400 text-center">AI Ad Assistant · 自动生成报告</div>
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div><h3 className="text-lg font-bold mb-3 border-b pb-2">{title}</h3>{children}</div>;
}

function Stat({ label, value, color = "" }: { label: string; value: string; color?: string }) {
  return <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500">{label}</p><p className={`text-lg font-bold ${color}`}>{value}</p></div>;
}