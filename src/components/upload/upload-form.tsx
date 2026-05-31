"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
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
      setError("仅支持 CSV 文件");
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

      if (!res.ok) {
        setError(data.error || "上传失败");
        return;
      }

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
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        className={cn(
          "relative rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer",
          dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
          file && "border-green-500 bg-green-50 dark:bg-green-950/20",
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

        {file ? (
          <div className="flex items-center justify-center gap-4">
            <FileText className="h-10 w-10 text-green-500" />
            <div className="text-left">
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="ml-4 shrink-0"
              onClick={(e) => { e.stopPropagation(); clearFile(); }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
            <div>
              <p className="font-medium">拖拽 CSV 文件到此处</p>
              <p className="text-sm text-muted-foreground mt-1">或点击选择文件</p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {file && !result && (
        <Button
          className="w-full"
          onClick={handleUpload}
          disabled={uploading}
        >
          {uploading ? "上传中..." : `上传 ${file.name}`}
        </Button>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <Card className="border-green-200 dark:border-green-900">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">上传完成</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">总行数</p>
                <p className="font-medium">{result.totalRows}</p>
              </div>
              <div>
                <p className="text-muted-foreground">成功</p>
                <p className="font-medium text-green-600">{result.successCount}</p>
              </div>
              <div>
                <p className="text-muted-foreground">失败</p>
                <p className={cn("font-medium", result.errorCount > 0 ? "text-red-500" : "")}>
                  {result.errorCount}
                </p>
              </div>
            </div>
            {result.errors.length > 0 && (
              <div className="mt-2 max-h-32 overflow-y-auto space-y-1">
                {result.errors.map((e, i) => (
                  <p key={i} className="text-xs text-red-500">
                    第 {e.row} 行: {e.message}
                  </p>
                ))}
              </div>
            )}
            <Button variant="outline" size="sm" className="mt-2" onClick={clearFile}>
              继续上传
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

