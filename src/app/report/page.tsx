"use client";

import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { FileText, Upload, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ReportPage() {
  return (
    <div className="min-h-screen bg-[#09090b]">
      <Navbar showAuth={false} />
      <main className="mx-auto max-w-5xl px-6 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-10"
        >
          <Link
            href="/dashboard"
            className="p-2 rounded-xl border border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">分析报告</h1>
            <p className="text-slate-400 text-sm mt-1">投流数据综合报告</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] p-16 text-center"
        >
          <div className="h-16 w-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-5">
            <FileText className="h-8 w-8 text-slate-600" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">上传数据生成报告</h3>
          <p className="text-slate-400 text-sm mb-8 max-w-md mx-auto">
            上传 CSV 文件后，系统将自动分析并生成详细的数据报告
          </p>
          <Link href="/upload">
            <Button className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 h-12 px-8 text-base font-semibold shadow-lg shadow-indigo-500/20 gap-2">
              <Upload className="h-4 w-4" /> 上传数据
            </Button>
          </Link>
        </motion.div>
      </main>
    </div>
  );
}