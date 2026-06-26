"use client";

import { useState, Suspense } from "react";
import { Sidebar } from "@/components/workspace/sidebar";
import { Topbar } from "@/components/workspace/topbar";

interface WorkspaceLayoutProps { children: React.ReactNode; }

export function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f3f7fb]">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className={`transition-all duration-300 ${sidebarCollapsed ? "lg:ml-[64px]" : "lg:ml-[248px]"}`}>
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="p-5">
          <Suspense fallback={<div className="flex items-center justify-center py-16"><div className="animate-spin rounded-full h-6 w-6 border-2 border-[#1688ff] border-t-transparent" /></div>}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}