"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Menu, X, ShoppingBag, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const NAV_LINKS = [
  { label: "首页", href: "/" },
  { label: "爆款榜单", href: "/product-radar" },
  { label: "AI选品", href: "/ai-assistant" },
  { label: "利润测算", href: "/profit-growth" },
  { label: "竞品分析", href: "/roi-analysis" },
  { label: "会员价格", href: "/pricing" },
];

export function HomeNavbar() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser({ email: data.user.email });
    });
  }, []);

  useEffect(() => {
    const cb = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", cb, { passive: true });
    return () => window.removeEventListener("scroll", cb);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    if (typeof window !== "undefined") localStorage.clear();
    setUser(null);
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
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100" : "bg-white"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-sm shadow-orange-500/20">
            <ShoppingBag className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-[#1a1a2e] tracking-tight">WQHub</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive(link.href)
                  ? "text-orange-500 bg-orange-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="hidden sm:flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="border-gray-200 text-gray-700 hover:bg-gray-50">
                  进入后台 <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
              <Link href="/account">
                <Avatar className="h-8 w-8 ring-2 ring-orange-100">
                  <AvatarFallback className="bg-orange-50 text-orange-600 text-xs font-bold">{avatarLetter}</AvatarFallback>
                </Avatar>
              </Link>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">登录</Button>
              </Link>
              <Link href="/login?signup=1">
                <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-500/20 gap-1.5">
                  免费体验 <Sparkles className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive(link.href) ? "text-orange-500 bg-orange-50" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="my-2 border-gray-100" />
              {user ? (
                <>
                  <Link href="/dashboard" className="block px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50">进入后台</Link>
                  <button onClick={handleLogout} className="block w-full text-left px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50">退出登录</button>
                </>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Link href="/login" className="flex-1"><Button variant="outline" size="sm" className="w-full border-gray-200">登录</Button></Link>
                  <Link href="/login?signup=1" className="flex-1"><Button size="sm" className="w-full bg-orange-500 hover:bg-orange-600 text-white">免费体验</Button></Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}