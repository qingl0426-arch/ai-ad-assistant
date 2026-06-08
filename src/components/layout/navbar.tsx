"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Sparkles, Menu, X, User } from "lucide-react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const cb = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", cb, { passive: true });
    return () => window.removeEventListener("scroll", cb);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const links = [
    { label: "\u9996\u9875", href: "/" },
    { label: "\u4ef7\u683c\u65b9\u6848", href: "/pricing" },
    { label: "\u4f1a\u5458\u4e2d\u5fc3", href: "/account" },
    { label: "\u5e2e\u52a9\u4e2d\u5fc3", href: "/help" },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header className={
      "fixed top-0 inset-x-0 z-50 transition-all duration-300 " +
      (scrolled ? "bg-[#09090b]/80 backdrop-blur-xl border-b border-white/[0.06]" : "")
    }>
      <div className="mx-auto max-w-7xl px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-bold text-white text-sm tracking-tight">AI\u7535\u5546\u5229\u6da6\u589e\u957f</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={
              "px-3 py-1.5 rounded-xl text-sm transition-all " +
              (isActive(l.href) ? "bg-white/[0.08] text-white font-medium" : "text-slate-400 hover:text-white hover:bg-white/[0.04]")
            }>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            {user ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/account">
                    <User className="h-4 w-4 mr-1" />{user.email?.split("@")[0]}
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">\u767b\u5f55</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/login">\u514d\u8d39\u6ce8\u518c</Link>
                </Button>
              </>
            )}
          </div>
          <button className="md:hidden h-10 w-10 rounded-2xl hover:bg-white/5 flex items-center justify-center" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-[#0f0f13] border-l border-white/[0.08] shadow-2xl p-4">
            <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-white text-sm">\u5bfc\u822a</span>
              <button className="h-10 w-10 rounded-2xl hover:bg-white/5 flex items-center justify-center" onClick={() => setMobileOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="space-y-1">
              {links.map((l) => (
                <Link key={l.href} href={l.href} className={
                  "block px-3 py-2.5 rounded-xl text-sm transition-colors " +
                  (isActive(l.href) ? "bg-white/[0.08] text-white font-medium" : "text-slate-300 hover:text-white hover:bg-white/5")
                } onClick={() => setMobileOpen(false)}>
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="absolute bottom-4 left-4 right-4">
              {user ? (
                <Button variant="ghost" className="w-full justify-start" size="sm" asChild>
                  <Link href="/account"><User className="h-4 w-4 mr-2" />\u4f1a\u5458\u4e2d\u5fc3</Link>
                </Button>
              ) : (
                <Button className="w-full" size="sm" asChild>
                  <Link href="/login">\u767b\u5f55 / \u6ce8\u518c</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
