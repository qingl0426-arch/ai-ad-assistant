"use client";

import { useState, useCallback, useRef } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, CheckCircle2, AlertTriangle,
  ArrowLeft, Loader2, Database, Eye, XCircle,
  FileText, ShieldCheck, Zap,
} from "lucide-react";
import Link from "next/link";
import {
  PLATFORMS, generatePreview,
  type Platform, type FieldMapping, type ImportPreview, type InternalField,
} from "@/lib/data-importer";

const FIELD_LABELS: Record<InternalField, string> = {
  date: "日期", spend: "消耗", impressions: "曝光量", clicks: "点击量",
  gmv: "成交金额", orders: "订单数", roi: "ROI", platform: "平台", campaign: "推广计划",
};

const REQUIRED_FIELDS: InternalField[] = ["date", "spend", "gmv"];

const CONFIDENCE_STYLE: Record<string, string> = {
  high: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  low: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  none: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function SmartImportPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [fileError, setFileError] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [mapping, setMapping] = useState<FieldMapping[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("csv");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ batchId: string; totalRows: number; successCount: number; errors: number; } | null>(null);
  const [importError, setImportError] = useState("");

  const handleFile = useCallback(async (f: File) => {
    setFile(f); setFileError(""); setAnalyzing(true);
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (ext !== "csv" && ext !== "xlsx" && ext !== "xls" && ext !== "txt") {
      setFileError("仅支持 CSV、Excel 或 TXT 文件"); setAnalyzing(false); return;
    }
    try {
      const buffer = await f.arrayBuffer();
      const { preview: p, error } = generatePreview(Buffer.from(buffer), f.name);
      if (error) { setFileError(error); setAnalyzing(false); return; }
      setPreview(p); setMapping(p.mapping); setWarnings(p.warnings);
      setSelectedPlatform(p.detectedPlatform);
      setAnalyzing(false); setStep(2);
    } catch { setFileError("文件解析失败"); setAnalyzing(false); }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0]; if (f) handleFile(f);
  }, [handleFile]);

  const updateMapping = (header: string, field: InternalField | null) => {
    setMapping(prev => prev.map(m => m.header === header ? { ...m, field } : m));
  };

  const handleImport = async () => {
    if (!file || !preview) return;
    setImporting(true); setImportError("");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("platform", selectedPlatform);
    const mapObj: Record<string, string> = {};
    mapping.forEach(m => { if (m.field) mapObj[m.header] = m.field; });
    formData.append("mapping", JSON.stringify(mapObj));
    const res = await fetch("/api/import", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) { setImportError(data.error || "导入失败"); setImporting(false); return; }
    setResult(data); setImporting(false); setStep(3);
  };

  const missingRequired = REQUIRED_FIELDS.filter(f => !mapping.some(m => m.field === f));
  const mappedCount = mapping.filter(m => m.field).length;
  const highConfCount = mapping.filter(m => m.confidence === "high").length;

  return (
    <div className="min-h-screen bg-[#09090b]">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Database className="h-4 w-4 text-indigo-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">智能数据导入</h1>
          </div>
          <p className="text-slate-400 text-sm">
            支持巨量引擎、千川、抖音、快手、腾讯广告、阿里妈妈等平台 · 自动识别编码和字段
          </p>
        </motion.div>

        <div className="flex items-center gap-2 mb-10">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${step >= s ? "bg-indigo-500 text-white" : "bg-white/[0.04] text-slate-600 border border-white/[0.06]"}`}>
                {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
              </div>
              <span className={`text-xs font-medium hidden sm:inline ${step >= s ? "text-white" : "text-slate-600"}`}>
                {s === 1 ? "上传文件" : s === 2 ? "预览映射" : "完成"}
              </span>
              {s < 3 && <div className={`w-8 sm:w-16 h-px ${step > s ? "bg-indigo-500/50" : "bg-white/[0.06]"}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="mb-6">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">选择平台（可选）</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PLATFORMS.filter(p => p.id !== "csv").map(p => (
                    <button key={p.id} onClick={() => setSelectedPlatform(p.id)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all ${selectedPlatform === p.id ? "bg-indigo-500/10 border-indigo-500/30 text-white" : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:border-white/[0.12]"}`}>
                      <span className="text-base">{p.icon}</span><span className="truncate">{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-all ${dragging ? "border-indigo-400 bg-indigo-500/[0.06]" : fileError ? "border-red-500/30 bg-red-500/[0.03]" : "border-white/[0.08] bg-white/[0.01] hover:border-white/[0.16]"}`}>
                <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls,.txt" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                {analyzing ? (
                  <div className="flex flex-col items-center gap-3"><Loader2 className="h-10 w-10 text-indigo-400 animate-spin" /><p className="text-sm text-slate-400">分析中...</p></div>
                ) : (
                  <>
                    <div className="h-14 w-14 mx-auto mb-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center"><Upload className="h-6 w-6 text-indigo-400" /></div>
                    <p className="text-white font-medium mb-1">拖拽文件到此处或点击上传</p>
                    <p className="text-xs text-slate-500">支持 CSV、Excel、TXT · 自动识别 GBK/UTF-8 编码</p>
                  </>
                )}
                {fileError && <div className="mt-4 flex items-center justify-center gap-2 text-sm text-red-400"><AlertTriangle className="h-4 w-4" />{fileError}</div>}
              </div>
              <div className="mt-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5">
                <div className="flex items-center gap-2 mb-3"><ShieldCheck className="h-4 w-4 text-emerald-400" /><span className="text-sm font-medium text-white">智能引擎自动处理</span></div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5"><Zap className="h-3 w-3 text-amber-400" />编码检测</div>
                  <div className="flex items-center gap-1.5"><Zap className="h-3 w-3 text-amber-400" />字段映射</div>
                  <div className="flex items-center gap-1.5"><Zap className="h-3 w-3 text-amber-400" />日期解析</div>
                  <div className="flex items-center gap-1.5"><Zap className="h-3 w-3 text-amber-400" />指标计算</div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && preview && (
            <motion.div key="s2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-center gap-2 text-sm text-slate-300"><FileText className="h-4 w-4 text-slate-500" /><span className="font-medium">{file?.name}</span></div>
                <span className="text-slate-600">·</span><span className="text-sm text-slate-400">{preview.totalRows} 行</span>
                <span className="text-slate-600">·</span>
                <Badge variant="outline" className="text-xs">{preview.detectedEncoding === "gbk" ? "GBK→UTF-8" : preview.detectedEncoding.toUpperCase()}</Badge>
                <span className="text-slate-600">·</span>
                <Badge variant="primary" className="text-xs">{PLATFORMS.find(p => p.id === preview.detectedPlatform)?.name || "通用"}</Badge>
                <span className="text-slate-600">·</span>
                <span className="text-xs text-slate-500">{mappedCount}/{preview.headers.length} 已映射 · {highConfCount} 高置信度</span>
              </div>

              {warnings.length > 0 && (
                <div className="rounded-xl bg-amber-500/[0.04] border border-amber-500/15 p-4">
                  {warnings.map((w, i) => <div key={i} className="flex items-center gap-2 text-sm text-amber-400"><AlertTriangle className="h-4 w-4 shrink-0" />{w}</div>)}
                </div>
              )}

              <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
                <div className="px-6 py-4 border-b border-white/[0.04] flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">字段映射</h2>
                  {missingRequired.length > 0 && <span className="text-xs text-amber-400 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />缺少 {missingRequired.length} 个必填字段</span>}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="border-b border-white/[0.04]"><th className="text-left py-3 px-6 text-xs font-medium text-slate-500">原始字段</th><th className="text-center py-3 px-2 text-xs text-slate-500 w-8"></th><th className="text-left py-3 px-6 text-xs font-medium text-slate-500">映射字段</th><th className="text-left py-3 px-6 text-xs font-medium text-slate-500">置信度</th><th className="text-left py-3 px-6 text-xs font-medium text-slate-500 hidden sm:table-cell">示例</th></tr></thead>
                    <tbody>
                      {mapping.map(m => (
                        <tr key={m.header} className="border-b border-white/[0.02]">
                          <td className="py-3 px-6"><span className="text-sm text-slate-200">{m.header}</span></td>
                          <td className="py-3 px-2 text-center text-slate-600">→</td>
                          <td className="py-3 px-6">
                            <select value={m.field || ""} onChange={e => updateMapping(m.header, (e.target.value || null) as InternalField | null)}
                              className={`rounded-lg text-sm py-1.5 px-3 border ${m.field ? "bg-indigo-500/10 border-indigo-500/30 text-white" : "bg-white/[0.04] border-white/[0.06] text-slate-500"}`}>
                              <option value="">-- 跳过 --</option>
                              {Object.entries(FIELD_LABELS).map(([k, v]) => <option key={k} value={k}>{v} {REQUIRED_FIELDS.includes(k as InternalField) ? "★" : ""}</option>)}
                            </select>
                          </td>
                          <td className="py-3 px-6"><Badge variant="outline" className={`text-[10px] ${CONFIDENCE_STYLE[m.confidence] || ""}`}>{m.confidence === "high" ? "高" : m.confidence === "medium" ? "中" : m.confidence === "low" ? "低" : "无"}</Badge></td>
                          <td className="py-3 px-6 hidden sm:table-cell"><span className="text-xs text-slate-500 truncate max-w-[120px] block">{m.sample || "—"}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
                <div className="px-6 py-4 border-b border-white/[0.04]"><h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">数据预览（前 {Math.min(10, preview.rows.length)} 行）</h2></div>
                <div className="overflow-x-auto max-h-80">
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-white/[0.04] bg-white/[0.01]"><th className="text-left py-2 px-4 text-slate-500 font-medium sticky left-0 bg-[#09090b]">#</th>{preview.headers.map(h => <th key={h} className="text-left py-2 px-4 text-slate-400 font-medium whitespace-nowrap">{h}</th>)}</tr></thead>
                    <tbody>{preview.rows.map((row, ri) => <tr key={ri} className="border-b border-white/[0.02]"><td className="py-2 px-4 text-slate-600 sticky left-0 bg-[#09090b]">{ri + 1}</td>{preview.headers.map(h => <td key={h} className="py-2 px-4 text-slate-400 whitespace-nowrap max-w-[200px] truncate">{row[h] || "—"}</td>)}</tr>)}</tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={() => { setStep(1); setPreview(null); }} className="gap-2"><ArrowLeft className="h-4 w-4" />重新选择</Button>
                <Button onClick={handleImport} disabled={importing || missingRequired.length > 0} variant="gradient" size="lg" className="gap-2">
                  {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
                  {importing ? "导入中..." : `导入 ${preview.totalRows} 条数据`}
                </Button>
              </div>
              {importError && <div className="flex items-center gap-2 text-sm text-red-400 p-4 rounded-xl bg-red-500/[0.04] border border-red-500/15"><XCircle className="h-4 w-4" />{importError}</div>}
            </motion.div>
          )}

          {step === 3 && result && (
            <motion.div key="s3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-10 max-w-md mx-auto">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
                  className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                </motion.div>
                <h2 className="text-xl font-bold text-white mb-2">导入成功！</h2>
                <p className="text-slate-400 text-sm mb-6">成功导入 <span className="text-white font-semibold">{result.successCount}</span> 条数据{result.errors > 0 && <span className="text-amber-400"> · {result.errors} 条跳过</span>}</p>
                <div className="flex flex-col gap-3">
                  <Link href="/dashboard"><Button variant="gradient" size="lg" className="w-full gap-2"><Eye className="h-4 w-4" />查看数据大屏</Button></Link>
                  <Button variant="outline" onClick={() => { setStep(1); setFile(null); setPreview(null); setResult(null); }} className="gap-2"><Upload className="h-4 w-4" />继续导入</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
