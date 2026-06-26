"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Search, Bell, Settings } from "lucide-react";

interface TopbarProps { onMenuClick: () => void; }

export function Topbar({ onMenuClick }: TopbarProps) {
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    import("@/lib/supabase/client").then(({ createClient }) => {
      createClient().auth.getUser().then(({ data }) => {
        if (data.user) setUser({ email: data.user.email });
      });
    });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) router.push(`/ai-assistant?q=${encodeURIComponent(searchValue.trim())}`);
  };

  return (
    <header className="h-[56px] bg-white border-b border-[#e5eaf0] flex items-center justify-between px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-4 flex-1">
        <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg text-[#94a3b8] hover:text-[#475569] hover:bg-[#f8fafc] transition-colors">
          <Menu className="h-5 w-5" />
        </button>
        <form onSubmit={handleSearch} className="hidden sm:flex items-center max-w-[400px] flex-1">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-[#94a3b8]" />
            <input type="text" value={searchValue} onChange={(e) => setSearchValue(e.target.value)}
              placeholder="搜索任务、商品、关键词、货源..."
              className="w-full pl-10 pr-4 h-[38px] rounded-[12px] border border-[#e2e8f0] bg-[#f8fafc] text-[13px] text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:border-[#1688ff] focus:ring-2 focus:ring-[#eaf4ff] focus:bg-white transition-all" />
          </div>
        </form>
      </div>

      <div className="flex items-center gap-0.5 shrink-0">
        <button className="p-2 rounded-[10px] text-[#94a3b8] hover:text-[#475569] hover:bg-[#f8fafc] transition-colors relative">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute top-1.5 right-1.5 h-[8px] w-[8px] rounded-full bg-[#ff7a00] ring-2 ring-white" />
        </button>
        <button className="p-2 rounded-[10px] text-[#94a3b8] hover:text-[#475569] hover:bg-[#f8fafc] transition-colors">
          <Settings className="h-[18px] w-[18px]" />
        </button>
        {user ? (
          <Link href="/account" className="flex items-center gap-2 ml-1.5 pl-2.5 border-l border-[#e5eaf0]">
            <div className="h-[34px] w-[34px] rounded-full bg-gradient-to-br from-[#1688ff] to-[#1d9bf0] flex items-center justify-center text-xs font-bold text-white shadow-sm">
              {(user.email || "U").charAt(0).toUpperCase()}
            </div>
          </Link>
        ) : (
          <Link href="/login" className="ml-1.5 px-4 py-1.5 rounded-[10px] bg-[#1688ff] hover:bg-[#1670d9] text-white text-[13px] font-medium transition-colors shadow-sm">
            登录
          </Link>
        )}
      </div>
    </header>
  );
}