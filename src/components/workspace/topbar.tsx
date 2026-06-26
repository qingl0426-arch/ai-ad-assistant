"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Search, Bell, Settings } from "lucide-react";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    import("@/lib/supabase/client").then(({ createClient }) => {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) setUser({ email: data.user.email });
      });
    });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/ai-assistant?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  const avatarLetter = (user?.email || "U").charAt(0).toUpperCase();

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6 shrink-0">
      {/* Left: menu toggle */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search */}
        <form onSubmit={handleSearch} className="hidden sm:flex items-center flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="搜索任务、商品、信号、关键词..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm text-[#1a1a2e] placeholder-gray-400 focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 focus:bg-white transition-all"
            />
          </div>
        </form>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1.5">
        <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors relative">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-orange-500 ring-2 ring-white" />
        </button>
        <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <Settings className="h-4.5 w-4.5" />
        </button>

        {user ? (
          <Link href="/account" className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-100">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center text-xs font-bold text-white shadow-sm">
              {avatarLetter}
            </div>
          </Link>
        ) : (
          <Link
            href="/login"
            className="ml-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors shadow-sm"
          >
            登录
          </Link>
        )}
      </div>
    </header>
  );
}