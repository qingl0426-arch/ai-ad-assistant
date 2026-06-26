"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Target, FolderOpen, History, Search,
  Flame, Calculator,
  Eye, BarChart3, AlertCircle, Crown, User, ChevronLeft,
  ShoppingBag,
} from "lucide-react";

interface MenuItem {
  label: string;
  href: string;
  icon: typeof Sparkles;
}
interface MenuGroup {
  label: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    label: "智能选品",
    items: [
      { label: "AI智能选品", href: "/ai-assistant", icon: Sparkles },
      { label: "选品计划", href: "/ai-assistant?tab=plan", icon: Target },
      { label: "选品库", href: "/ai-assistant?tab=library", icon: FolderOpen },
      { label: "历史查询", href: "/ai-assistant?tab=history", icon: History },
      { label: "AI找货源", href: "/ai-assistant?tab=source", icon: Search },
    ],
  },
  {
    label: "分析决策",
    items: [
      { label: "爆款榜单", href: "/product-radar", icon: Flame },
      { label: "利润测算", href: "/profit-growth", icon: Calculator },
      { label: "竞品分析", href: "/roi-analysis", icon: Eye },
      { label: "指标总览", href: "/dashboard", icon: BarChart3 },
      { label: "分析诊断", href: "/ai-director", icon: AlertCircle },
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

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<{ email?: string } | null>(null);

  useEffect(() => {
    import("@/lib/supabase/client").then(({ createClient }) => {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) setUser({ email: data.user.email });
      });
    });
  }, []);

  const isActive = (href: string) => {
    const base = href.split("?")[0] || "";
    if (base === "/ai-assistant") return pathname.startsWith("/ai-assistant");
    if (base === "/") return pathname === "/";
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} px-4 h-16 border-b border-gray-100 shrink-0`}>
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center shadow-sm">
              <ShoppingBag className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold text-[#1a1a2e]">WQHub</div>
              <div className="text-[10px] text-gray-400">AI电商工作台</div>
            </div>
          </Link>
        )}
        {collapsed && (
          <Link href="/" className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center shadow-sm">
            <ShoppingBag className="h-3.5 w-3.5 text-white" />
          </Link>
        )}
        {!collapsed && (
          <button onClick={onToggle} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Menus */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-5">
        {menuGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
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
                    onClick={onMobileClose}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                      active
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    } ${collapsed ? "justify-center px-2" : ""}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className={`h-4.5 w-4.5 shrink-0 ${active ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"}`} />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom user area */}
      {user && !collapsed && (
        <div className="p-3 border-t border-gray-100">
          <Link href="/account" className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
              {(user.email || "U").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[#1a1a2e] truncate">{user.email}</p>
              <p className="text-[10px] text-gray-400">已登录</p>
            </div>
          </Link>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed top-0 left-0 bottom-0 z-40 bg-white border-r border-gray-100 transition-all duration-300 ${
          collapsed ? "w-[64px]" : "w-[248px]"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40 lg:hidden"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-[280px] bg-white border-r border-gray-100 lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
