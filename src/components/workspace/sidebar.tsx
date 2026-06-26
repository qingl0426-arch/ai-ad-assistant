"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Target, FolderOpen, History, Search,
  Flame, Calculator, Eye, BarChart3, AlertCircle,
  Crown, User, ChevronLeft, ShoppingBag,
} from "lucide-react";

interface MenuItem { label: string; href: string; icon: typeof Sparkles; }
interface MenuGroup { label: string; items: MenuItem[]; }

const menuGroups: MenuGroup[] = [
  {
    label: "智能选品",
    items: [
      { label: "AI智能选品", href: "/ai-assistant", icon: Sparkles },
      { label: "选品计划", href: "/selection-plan", icon: Target },
      { label: "选品库", href: "/selection-library", icon: FolderOpen },
      { label: "历史查询", href: "/selection-history", icon: History },
      { label: "AI找货源", href: "/ai-sourcing", icon: Search },
    ],
  },
  {
    label: "分析决策",
    items: [
      { label: "爆款榜单", href: "/product-radar", icon: Flame },
      { label: "利润测算", href: "/profit-growth", icon: Calculator },
      { label: "竞品分析", href: "/roi-analysis", icon: Eye },
      { label: "指标总览", href: "/dashboard", icon: BarChart3 },
      { label: "分析诊断", href: "/analysis-diagnosis", icon: AlertCircle },
    ],
  },
  {
    label: "会员与账号",
    items: [
      { label: "会员价格", href: "/pricing", icon: Crown },
      { label: "账号中心", href: "/account", icon: User },
    ],
  },
];

interface SidebarProps { collapsed: boolean; onToggle: () => void; mobileOpen: boolean; onMobileClose: () => void; }

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<{ email?: string } | null>(null);

  // Close mobile menu on route change
  useEffect(() => { onMobileClose(); }, [pathname]); // eslint-disable-line

  useEffect(() => {
    import("@/lib/supabase/client").then(({ createClient }) => {
      createClient().auth.getUser().then(({ data }) => {
        if (data.user) setUser({ email: data.user.email });
      });
    });
  }, []);

  const isActive = (href: string) => {
    // Exact match or startsWith for nested routes
    if (href === "/ai-assistant") return pathname.startsWith("/ai-assistant");
    if (href === "/dashboard") return pathname.startsWith("/dashboard");
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white">
      {/* Brand */}
      <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} px-4 h-[60px] border-b border-[#e5eaf0] shrink-0`}>
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-[10px] bg-gradient-to-br from-[#1688ff] to-[#1d9bf0] flex items-center justify-center shadow-sm">
              <ShoppingBag className="h-4 w-4 text-white" />
            </div>
            <div className="leading-tight">
              <div className="text-[15px] font-bold text-[#0f172a]">WQHub</div>
              <div className="text-[10px] text-[#94a3b8] font-medium">AI电商工作台</div>
            </div>
          </Link>
        )}
        {collapsed && (
          <Link href="/" className="h-8 w-8 rounded-[10px] bg-gradient-to-br from-[#1688ff] to-[#1d9bf0] flex items-center justify-center shadow-sm">
            <ShoppingBag className="h-4 w-4 text-white" />
          </Link>
        )}
        {!collapsed && (
          <button onClick={onToggle} className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#475569] hover:bg-[#f8fafc] transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
        {menuGroups.map((group, _gi) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-semibold text-[#94a3b8] uppercase tracking-[0.12em]">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    prefetch={true}
                    className={`relative flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[13px] font-medium transition-all duration-150 ${
                      collapsed ? "justify-center px-2" : ""
                    } ${
                      active
                        ? "bg-[#eaf4ff] text-[#1688ff]"
                        : "text-[#475569] hover:bg-[#f1f7ff] hover:text-[#0f172a]"
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    {active && (
                      <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-[#1688ff]" />
                    )}
                    <item.icon className={`h-[18px] w-[18px] shrink-0 ${active ? "text-[#1688ff]" : "text-[#94a3b8]"}`} />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      {user && !collapsed && (
        <div className="p-3 border-t border-[#e5eaf0]">
          <Link href="/account" className="flex items-center gap-2.5 p-2 rounded-[10px] hover:bg-[#f8fafc] transition-colors">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#1688ff] to-[#1d9bf0] flex items-center justify-center text-xs font-bold text-white shadow-sm">
              {(user.email || "U").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[#0f172a] truncate">{user.email}</p>
              <p className="text-[10px] text-[#94a3b8]">已登录</p>
            </div>
          </Link>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className={`hidden lg:flex flex-col fixed top-0 left-0 bottom-0 z-40 border-r border-[#e5eaf0] transition-all duration-300 ${
        collapsed ? "w-[64px]" : "w-[248px]"
      }`}>
        {sidebarContent}
      </aside>

      {/* Mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40 lg:hidden"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-[280px] border-r border-[#e5eaf0] lg:hidden bg-white"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}