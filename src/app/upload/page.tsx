"use client";

import { Navbar } from "@/components/layout/navbar";
import { UploadForm } from "@/components/upload/upload-form";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-[#09090b]">
      <Navbar showAuth={false} />
      <main className="mx-auto max-w-3xl px-6 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> 返回数据大屏
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">上传数据</h1>
          <p className="text-slate-400 text-sm mt-1">上传 CSV 文件开始分析</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] p-6"
        >
          <UploadForm />
        </motion.div>
      </main>
    </div>
  );
}