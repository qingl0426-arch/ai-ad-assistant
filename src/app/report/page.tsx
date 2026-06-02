"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ReportRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/ai-director"); }, [router]);
  return (
    <div style={{ minHeight: "100vh", background: "#09090b", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#94a3b8", fontSize: 15 }}>报告功能已整合到 AI 投流总监，正在跳转...</p>
    </div>
  );
}
