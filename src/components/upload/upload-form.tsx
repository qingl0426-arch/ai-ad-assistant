"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, X, CloudUpload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import type { UploadResult } from "@/types/database";

interface UploadFormProps {
  onSuccess?: (result: UploadResult) => void;
}

export function UploadForm({ onSuccess }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File | null) => {
    setError(null);
    setResult(null);
    if (f && f.name.endsWith(".csv")) {
      setFile(f);
    } else if (f) {
      setError("仅支持 CSV 文件格式");
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0] ?? null);
  }, [handleFile]);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.status === 401) { window.location.href = "/login"; return; }
      const data = await res.json();
      if (!res.ok) { setError(data.error || "上传失败"); return; }
      setResult(data);
      onSuccess?.(data);
    } catch {
      setError("网络错误，请重试");
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
    setResult(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-5">
      {/* Drop zone */}
      <motion.div
        whileTap={{ scale: 0.995 }}
        className={cn(
          "relative rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200 cursor-pointer",
          dragOver
            ? "border-indigo-400/50 bg-indigo-500/[0.06]"
            : file
            ? "border-emerald-500/30 bg-emerald-500/[0.03]"
            : "border-white/[0.08] hover:border-white/[0.14] bg-white/[0.01]"
        )}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />

        <AnimatePresence mode="wait">
          {file ? (
            <motion.div
              key="file"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center justify-center gap-5"
            >
              <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <FileText className="h-7 w-7 text-emerald-400" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-white text-lg">{file.name}</p>
                <p className="text-sm text-slate-500 mt-0.5">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="ml-4 shrink-0 rounded-xl hover:bg-white/[0.06]"
                onClick={(e) => { e.stopPropagation(); clearFile(); }}
              >
                <X className="h-5 w-5 text-slate-400" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="drop"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="h-16 w-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto">
                <CloudUpload className="h-8 w-8 text-slate-500" />
              </div>
              <div>
                <p className="font-semibold text-white text-base">拖拽 CSV 文件到此处</p>
                <p className="text-sm text-slate-500 mt-1.5">或点击选择文件 · 仅支持 .csv 格式</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Upload button */}
      <AnimatePresence>
        {file && !result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            <Button
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 h-12 text-base font-semibold shadow-lg shadow-indigo-500/20 gap-2"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                  上传中...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" /> 上传 {file.name}
                </>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-red-500/[0.08] text-red-400 border border-red-500/[0.15] text-sm"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            <Card className="border-emerald-500/20 bg-emerald-500/[0.03]">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2.5 text-emerald-400">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold text-sm">上传完成</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs mb-0.5">总行数</p>
                    <p className="font-semibold text-white">{result.totalRows}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs mb-0.5">成功</p>
                    <p className="font-semibold text-emerald-400">{result.successCount}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs mb-0.5">跳过</p>
                    <p className="font-semibold text-amber-400">{result.errorCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}