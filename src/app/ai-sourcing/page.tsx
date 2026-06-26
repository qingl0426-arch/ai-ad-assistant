"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { WorkspaceLayout } from "@/components/layout/workspace-layout";
import { ArrowLeft, Construction } from "lucide-react";

export default function PlaceholderPage() {
  return (
    <WorkspaceLayout>
      <div className="flex items-center justify-center min-h-[70vh]">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[18px] border border-[#e5eaf0] shadow-[0_4px_16px_rgba(15,23,42,0.04)] p-8 md:p-10 text-center max-w-md w-full">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-[#eaf4ff] items-center justify-center mb-5">
            <Construction className="h-7 w-7 text-[#1688ff]" />
          </div>
          <h1 className="text-xl font-bold text-[#0f172a] mb-2">AI找货源</h1>
          <p className="text-sm text-[#64748b] mb-6 leading-relaxed">根据商品关键词，智能匹配可供货平台、价格区间和利润空间。</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f8fafc] border border-[#e5eaf0] text-sm text-[#64748b]">
            即将上线
          </div>
          <div className="mt-6">
            <Link href="/ai-assistant" className="inline-flex items-center gap-2 text-sm font-medium text-[#1688ff] hover:text-[#1670d9] transition-colors">
              <ArrowLeft className="h-4 w-4" /> 返回 AI选品
            </Link>
          </div>
        </motion.div>
      </div>
    </WorkspaceLayout>
  );
}