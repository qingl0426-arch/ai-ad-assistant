"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
  Sparkles, Menu, X, ChevronDown, ArrowRight,
  Zap, Crown, HelpCircle, BookOpen, MessageCircle,
  BarChart3, Upload, User, LogOut, Shield,
  Bot, FileText, TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface NavbarProps {
  user?: { email?: string } | null;
  showAuth?: boolean;
  onLogout?: () => void;
}

const NAV_LINKS = [
  {
    label: "功能菜单",
    href: "/",
    children: [
      { label: "智能投流", desc: "AI 驱动的投流决策", icon: Zap, href: "/" },
      { label: "数据大屏", desc: "实时数据可视化看板", icon: BarChart3, href: "/dashboard" },
      { label: "AI投流总监", desc: "全维度智能投放分析", icon: Sparkles, href: "/ai-director" },
      { label: "AI运营助手", desc: "智能对话投流顾问", icon: Bot, href: "/ai-assistant" },
      { label: "ROI分析", desc: "投入产出比深度诊断", icon: TrendingUp, href: "/roi-analysis" },
      { label: "报告中心", desc: "日报周报数据报表", icon: FileText, href: "/ai-director" },
      { label: "上传数据", desc: "CSV 批量导入分析", icon: Upload, href: "/upload" },
    ],
  },
  { label: "价格方案", href: "/pricing" },
  {
    label: "帮助中心",
    href: "#",
    children: [
      { label: "使用文档", desc: "快速上手指南", icon: BookOpen, href: "#" },
      { label: "常见问题", desc: "FAQ 解答", icon: HelpCircle, href: "#" },
      { label: "联系我们", desc: "技术支持", icon: MessageCircle, href: "#" },
    ],
  },
];

export function Navbar({ user: userProp, showAuth = true, onLogout }: NavbarProps) {
  const [internalUser, setInternalUser] = useState<{ email?: string } | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userMenuTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (userProp !== undefined) {
      setInternalUser(userProp);
      return;
    }
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setInternalUser({ email: data.user.email });
    });
  }, [userProp]);

  const user = internalUser;

  useEffect(() => {
    const cb = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", cb, { passive: true });
    return () => window.removeEventListener("scroll", cb);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setActiveDropdown(null);
    setUserMenuOpen(false);
  }, [pathname]);

  const handleMouseEnter = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveDropdown(label);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setActiveDropdown(null), 150);
  };

  const handleUserMenuEnter = () => {
    if (userMenuTimer.current) clearTimeout(userMenuTimer.current);
    setUserMenuOpen(true);
  };

  const handleUserMenuLeave = () => {
    userMenuTimer.current = setTimeout(() => setUserMenuOpen(false), 150);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    if (typeof window !== "undefined") localStorage.clear();
    setInternalUser(null);
    if (onLogout) onLogout();
    router.push("/login");
    router.refresh();
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const avatarLetter = (user?.email || "U").charAt(0).toUpperCase();

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#09090b]/70 backdrop-blur-2xl border-b border-white/[0.06] shadow-2xl shadow-black/20"
          : ""
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25 flex items-center justify-center group-hover:shadow-indigo-500/40 group-hover:scale-105 transition-all duration-300">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-white text-sm tracking-tight hidden sm:block">
            直播投流AI
          </span>
        </Link>

        {/* ── Desktop Navigation ── */}
        <nav className="hidden lg:flex items-center gap-0.5">
          {NAV_LINKS.map((link) => (
            <div
              key={link.label}
              className="relative"
              onMouseEnter={() => handleMouseEnter(link.label)}
              onMouseLeave={handleMouseLeave}
            >
              {link.children ? (
                <>
                  <button
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive(link.href)
                        ? "text-white bg-white/[0.06]"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {link.label}
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform duration-200 ${
                        activeDropdown === link.label ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {activeDropdown === link.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 rounded-2xl bg-[#0c0c10]/95 backdrop-blur-2xl border border-white/[0.08] shadow-2xl shadow-black/40 p-2"
                      >
                        {link.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            className={`flex items-start gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                              isActive(child.href)
                                ? "bg-white/[0.06] text-white"
                                : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                            }`}
                          >
                            <child.icon className="h-4 w-4 mt-0.5 shrink-0" />
                            <div>
                              <p className="font-medium">{child.label}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">{child.desc}</p>
                            </div>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <Link
                  href={link.href}
                  className={`relative px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(link.href)
                      ? "text-white bg-white/[0.06]"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* ── Right Actions ── */}
        <div className="flex items-center gap-2.5">
          {showAuth && (
            <>
              {user ? (
                <div
                  className="relative"
                  onMouseEnter={handleUserMenuEnter}
                  onMouseLeave={handleUserMenuLeave}
                >
                  <button className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/[0.04] transition-all">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-[11px]">{avatarLetter}</AvatarFallback>
                    </Avatar>
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                        userMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 mt-2 w-56 rounded-2xl bg-[#0c0c10]/95 backdrop-blur-2xl border border-white/[0.08] shadow-2xl shadow-black/40 p-2"
                      >
                        <div className="px-3 py-2.5 border-b border-white/[0.06] mb-1">
                          <p className="text-sm font-medium text-white truncate">{user.email}</p>
                          <p className="text-[11px] text-slate-500">已登录</p>
                        </div>
                        <Link href="/account" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/[0.04] transition-all">
                          <User className="h-4 w-4 text-slate-400" /> 个人中心
                        </Link>
                        <Link href="/pricing" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/[0.04] transition-all">
                          <Crown className="h-4 w-4 text-amber-400" /> 会员中心
                        </Link>
                        {user.email && (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").includes(user.email) && (
                          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/[0.04] transition-all">
                            <Shield className="h-4 w-4 text-indigo-400" /> 管理后台
                          </Link>
                        )}
                        <div className="border-t border-white/[0.06] mt-1 pt-1">
                          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/[0.06] transition-all w-full text-left">
                            <LogOut className="h-4 w-4" /> 退出登录
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="rounded-xl text-slate-300 hover:text-white h-9">登录</Button>
                  </Link>
                  <Link href="/login?signup=1">
                    <Button variant="gradient" size="sm" className="rounded-xl gap-1.5 h-9">免费注册 <ArrowRight className="h-3.5 w-3.5" /></Button>
                  </Link>
                </div>
              )}
            </>
          )}

          {/* ── Mobile hamburger ── */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 -mr-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="absolute top-16 inset-x-0 z-50 lg:hidden max-h-[calc(100vh-4rem)] overflow-y-auto"
            >
              <div className="mx-4 rounded-2xl bg-[#0c0c10]/95 backdrop-blur-2xl border border-white/[0.08] shadow-2xl shadow-black/40 p-4">
                {/* Feature links */}
                <div className="pb-2">
                  <p className="px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">功能菜单</p>
                  {NAV_LINKS[0]?.children?.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                        isActive(item.href) ? "bg-white/[0.06] text-white" : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  ))}
                </div>

                <hr className="border-white/[0.06] my-2" />

                {/* Pricing */}
                <Link
                  href="/pricing"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                    isActive("/pricing") ? "bg-white/[0.06] text-white" : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <Crown className="h-4 w-4 text-amber-400 shrink-0" />
                  <div>
                    <p className="font-medium">价格方案</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">选择适合你的套餐</p>
                  </div>
                </Link>

                <hr className="border-white/[0.06] my-2" />

                {/* Help */}
                <div className="pb-2">
                  <p className="px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">帮助中心</p>
                  {NAV_LINKS[2]?.children?.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all"
                    >
                      <item.icon className="h-4 w-4 text-slate-500 shrink-0" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  ))}
                </div>

                <hr className="border-white/[0.06] my-2" />

                {/* Auth */}
                {showAuth && (
                  <div className="pt-1 pb-2">
                    {user ? (
                      <>
                        <div className="px-3 py-3 border-b border-white/[0.06] mb-1">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">{avatarLetter}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-white truncate max-w-[180px]">{user.email}</p>
                              <p className="text-[11px] text-slate-500">已登录</p>
                            </div>
                          </div>
                        </div>
                        <Link href="/account" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/[0.04] transition-all">
                          <User className="h-4 w-4 text-slate-400" /> 个人中心
                        </Link>
                        <Link href="/pricing" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/[0.04] transition-all">
                          <Crown className="h-4 w-4 text-amber-400" /> 会员中心
                        </Link>
                        {user.email && (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").includes(user.email) && (
                          <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/[0.04] transition-all">
                            <Shield className="h-4 w-4 text-indigo-400" /> 管理后台
                          </Link>
                        )}
                        <div className="border-t border-white/[0.06] mt-1 pt-1">
                          <button onClick={() => { setMobileOpen(false); handleLogout(); }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/[0.06] transition-all w-full text-left">
                            <LogOut className="h-4 w-4" /> 退出登录
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-2 px-1">
                        <Link href="/login" className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] text-white font-medium py-3 text-sm hover:bg-white/[0.04] transition-all">登录</Link>
                        <Link href="/login?signup=1" className="flex items-center justify-center gap-2 rounded-xl bg-white text-black font-semibold py-3 text-sm shadow-lg shadow-white/5">免费注册 <ArrowRight className="h-4 w-4" /></Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
