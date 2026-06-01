"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/layout/navbar";
import { motion } from "framer-motion";
import {
  CreditCard, RefreshCw, ChevronLeft, ChevronRight, Shield,
  LayoutDashboard, Users, TrendingUp, DollarSign, BarChart3,
  FileText, Search, Crown, Calendar
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const TABS = [
  { id: "overview", label: "概览", icon: LayoutDashboard },
  { id: "users", label: "用户管理", icon: Users },
  { id: "orders", label: "订单管理", icon: CreditCard },
  { id: "logs", label: "系统日志", icon: FileText },
] as const;

interface OverviewStats {
  totalUsers: number;
  totalRevenue: number;
  totalOrders: number;
  planCounts: Record<string, number>;
  planRevenue: Record<string, number>;
  userPlanCounts: Record<string, number>;
  dailyRevenue: Record<string, number>;
  recentOrders: Record<string, unknown>[];
}

export default function AdminPage() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<string>("overview");

  // Overview
  const [stats, setStats] = useState<OverviewStats | null>(null);

  // Users
  const [users, setUsers] = useState<Record<string, unknown>[]>([]);
  const [userTotal, setUserTotal] = useState(0);
  const [userPage, setUserPage] = useState(1);
  const [userSearch, setUserSearch] = useState("");
  const [usersLoading, setUsersLoading] = useState(false);

  // Orders
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [orderTotal, setOrderTotal] = useState(0);
  const [orderPage, setOrderPage] = useState(1);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Logs
  const [logs, setLogs] = useState<Record<string, unknown>[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (!data.user) { setLoading(false); return; }
      fetch("/api/admin/orders?limit=1").then(r => {
        setIsAdmin(r.status !== 403);
        setLoading(false);
      }).catch(() => { setIsAdmin(false); setLoading(false); });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch overview stats
  const fetchStats = useCallback(async () => {
    const r = await fetch("/api/admin/stats");
    if (r.ok) setStats(await r.json());
  }, []);

  useEffect(() => { if (isAdmin && tab === "overview") fetchStats(); }, [tab, isAdmin, fetchStats]);

  // Users
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    const p = new URLSearchParams();
    p.set("page", String(userPage));
    p.set("limit", "20");
    if (userSearch) p.set("search", userSearch);
    const r = await fetch("/api/admin/users?" + p.toString());
    if (r.ok) {
      const d = await r.json();
      setUsers(d.users || []);
      setUserTotal(d.total || 0);
    }
    setUsersLoading(false);
  }, [userPage, userSearch]);

  useEffect(() => { if (isAdmin && tab === "users") fetchUsers(); }, [tab, isAdmin, userPage, fetchUsers]);

  // Orders
  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    const p = new URLSearchParams();
    p.set("page", String(orderPage));
    p.set("limit", "20");
    const r = await fetch("/api/admin/orders?" + p.toString());
    const d = await r.json();
    setOrders(d.orders || []);
    setOrderTotal(d.total || 0);
    setOrdersLoading(false);
  }, [orderPage]);

  useEffect(() => { if (isAdmin && tab === "orders") fetchOrders(); }, [tab, isAdmin, fetchOrders]);

  // Logs
  const fetchLogs = useCallback(async () => {
    setLogsLoading(true);
    const p = new URLSearchParams();
    p.set("limit", "50");
    const r = await fetch("/api/admin/logs?" + p.toString());
    const d = await r.json();
    setLogs(d.logs || []);
    setLogsLoading(false);
  }, []);

  useEffect(() => { if (isAdmin && tab === "logs") fetchLogs(); }, [tab, isAdmin, fetchLogs]);

  const totalOrderPages = Math.ceil(orderTotal / 20);
  const totalUserPages = Math.ceil(userTotal / 20);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-5">
          <Shield className="h-16 w-16 mx-auto text-slate-700" />
          <h1 className="text-2xl font-bold text-white">无访问权限</h1>
          <p className="text-slate-400">此页面仅限管理员访问</p>
          <Link href="/dashboard" className="inline-flex">
            <span className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/20">
              返回数据大屏
            </span>
          </Link>
        </motion.div>
      </div>
    );
  }

  const fmt = (d: unknown) => (d ? new Date(d as string).toLocaleString("zh-CN") : "");
  const fmtDate = (d: unknown) => (d ? new Date(d as string).toLocaleDateString("zh-CN") : "");

  const statCards = [
    { label: "总用户数", value: stats?.totalUsers?.toLocaleString() || "—", icon: Users, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
    { label: "总收入", value: stats ? `¥${stats.totalRevenue.toLocaleString()}` : "—", icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { label: "总订单", value: stats?.totalOrders?.toLocaleString() || "—", icon: TrendingUp, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { label: "付费用户", value: stats ? ((stats.userPlanCounts?.pro || 0) + (stats.userPlanCounts?.enterprise || 0)).toString() : "—", icon: Crown, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  ];

  return (
    <div className="min-h-screen bg-[#09090b]">
      <Navbar
        user={user}
        showAuth={false}
        onLogout={async () => { await supabase.auth.signOut(); router.push("/login"); }}
      />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-24 pb-16">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-9 w-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
              <LayoutDashboard className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">管理后台</h1>
              <p className="text-slate-500 text-xs mt-0.5">系统管理与数据分析</p>
            </div>
          </div>
        </motion.div>

        {/* Tab bar */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] w-fit mb-8 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${tab === t.id ? "bg-white/[0.08] text-white shadow-sm" : "text-slate-400 hover:text-white"}`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {tab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {statCards.map((card, i) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] p-5 hover:bg-white/[0.03] transition-all"
                >
                  <div className={`h-9 w-9 rounded-xl ${card.bg} ${card.border} border flex items-center justify-center mb-3`}>
                    <card.icon className={`h-4.5 w-4.5 ${card.color}`} />
                  </div>
                  <p className="text-xs text-slate-500 mb-1">{card.label}</p>
                  <p className="text-2xl font-bold text-white tracking-tight">{card.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Plan breakdown panels */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User plan distribution */}
                <div className="rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] p-6">
                  <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <Users className="h-4 w-4 text-indigo-400" /> 用户分布
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: "免费版", key: "free", color: "bg-slate-500" },
                      { label: "专业版", key: "pro", color: "bg-indigo-500" },
                      { label: "企业版", key: "enterprise", color: "bg-purple-500" },
                    ].map((plan) => {
                      const count = stats.userPlanCounts?.[plan.key] || 0;
                      const pct = stats.totalUsers > 0 ? (count / stats.totalUsers * 100) : 0;
                      return (
                        <div key={plan.key} className="flex items-center gap-3">
                          <span className="text-xs text-slate-400 w-14">{plan.label}</span>
                          <div className="flex-1 h-2 rounded-full bg-white/[0.04] overflow-hidden">
                            <div className={`h-full rounded-full ${plan.color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-slate-300 w-16 text-right">{count} ({pct.toFixed(1)}%)</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Revenue breakdown */}
                <div className="rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] p-6">
                  <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-emerald-400" /> 收入构成
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: "专业版", key: "pro", color: "bg-indigo-500" },
                      { label: "企业版", key: "enterprise", color: "bg-purple-500" },
                    ].map((plan) => {
                      const amount = stats.planRevenue?.[plan.key] || 0;
                      const pct = stats.totalRevenue > 0 ? (amount / stats.totalRevenue * 100) : 0;
                      return (
                        <div key={plan.key} className="flex items-center gap-3">
                          <span className="text-xs text-slate-400 w-14">{plan.label}</span>
                          <div className="flex-1 h-2 rounded-full bg-white/[0.04] overflow-hidden">
                            <div className={`h-full rounded-full ${plan.color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-slate-300 w-24 text-right">¥{amount.toLocaleString()} ({pct.toFixed(1)}%)</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Recent orders */}
            {stats?.recentOrders && stats.recentOrders.length > 0 && (
              <div className="rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] p-6">
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-amber-400" /> 最近订单
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-500 text-xs">
                        <th className="text-left py-2 font-medium">时间</th>
                        <th className="text-left py-2 font-medium">方案</th>
                        <th className="text-right py-2 font-medium">金额</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentOrders.map((o: Record<string, unknown>, i: number) => (
                        <tr key={i} className="border-t border-white/[0.02]">
                          <td className="py-2.5 text-slate-400 text-xs">{fmtDate(o.created_at)}</td>
                          <td className="py-2.5">
                            <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-white/[0.04] border border-white/[0.06] text-slate-300">{o.plan as string}</span>
                          </td>
                          <td className="py-2.5 text-right text-white font-medium">¥{o.amount as number}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── USERS TAB ── */}
        {tab === "users" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="搜索邮箱..."
                  value={userSearch}
                  onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/30 transition-all"
                />
              </div>
              <button onClick={fetchUsers} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all">
                <RefreshCw className={`h-4 w-4 ${usersLoading ? "animate-spin" : ""}`} /> 刷新
              </button>
            </div>

            <div className="rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-white/[0.01] border-b border-white/[0.04] text-slate-500 text-xs">
                      {["邮箱", "方案", "注册时间", "最后登录", "状态"].map((h) => (
                        <th key={h} className="text-left px-5 py-3.5 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-16 text-slate-500">暂无用户数据</td></tr>
                    ) : (
                      users.map((u: Record<string, unknown>, i: number) => (
                        <motion.tr
                          key={u.id as string}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.02 }}
                          className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-5 py-3.5 text-sm text-white">{u.email as string}</td>
                          <td className="px-5 py-3.5">
                            <Badge variant={u.plan === "enterprise" ? "purple" : u.plan === "pro" ? "primary" : "outline"}>
                              {u.plan === "enterprise" ? "企业版" : u.plan === "pro" ? "专业版" : "免费版"}
                            </Badge>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-slate-400">{fmtDate(u.createdAt)}</td>
                          <td className="px-5 py-3.5 text-xs text-slate-500">{u.lastSignIn ? fmtDate(u.lastSignIn) : "—"}</td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center gap-1.5 text-xs ${u.confirmed ? "text-emerald-400" : "text-amber-400"}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${u.confirmed ? "bg-emerald-400" : "bg-amber-400"}`} />
                              {u.confirmed ? "已激活" : "待验证"}
                            </span>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {totalUserPages > 1 && (
              <div className="flex items-center justify-between mt-5">
                <span className="text-sm text-slate-500">共 {userTotal} 个用户</span>
                <div className="flex gap-2">
                  <button onClick={() => setUserPage((p) => Math.max(1, p - 1))} disabled={userPage === 1} className="p-2 rounded-lg border border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.04] disabled:opacity-30 disabled:cursor-not-allowed transition-all"><ChevronLeft className="h-4 w-4" /></button>
                  <span className="flex items-center px-3 text-sm text-slate-400">{userPage} / {totalUserPages}</span>
                  <button onClick={() => setUserPage((p) => p + 1)} disabled={userPage >= totalUserPages} className="p-2 rounded-lg border border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.04] disabled:opacity-30 disabled:cursor-not-allowed transition-all"><ChevronRight className="h-4 w-4" /></button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── ORDERS TAB ── */}
        {tab === "orders" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <button onClick={fetchOrders} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all">
                <RefreshCw className={`h-4 w-4 ${ordersLoading ? "animate-spin" : ""}`} /> 刷新
              </button>
              <span className="text-sm text-slate-600 ml-auto">共 {orderTotal} 条订单</span>
            </div>

            <div className="rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-white/[0.01] border-b border-white/[0.04] text-slate-500 text-xs">
                      {["订单号", "用户邮箱", "方案", "金额", "状态", "时间"].map((h) => (
                        <th key={h} className="text-left px-5 py-3.5 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-16 text-slate-500">暂无订单数据</td></tr>
                    ) : (
                      orders.map((o: Record<string, unknown>, i: number) => (
                        <motion.tr
                          key={o.id as string}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.02 }}
                          className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-5 py-3.5 text-white font-mono text-xs">{(o.out_trade_no as string || "").slice(0, 24)}</td>
                          <td className="px-5 py-3.5 text-slate-300 text-xs">{o.user_email as string || "—"}</td>
                          <td className="px-5 py-3.5">
                            <Badge variant="outline">{o.plan as string}</Badge>
                          </td>
                          <td className="px-5 py-3.5 text-white font-semibold">¥{o.amount as number}</td>
                          <td className="px-5 py-3.5">
                            <Badge variant={o.status === "paid" ? "success" : "warning"}>
                              {o.status === "paid" ? "已支付" : (o.status as string)}
                            </Badge>
                          </td>
                          <td className="px-5 py-3.5 text-slate-500 text-xs">{fmt(o.created_at)}</td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {totalOrderPages > 1 && (
              <div className="flex items-center justify-between mt-5">
                <span className="text-sm text-slate-500">共 {orderTotal} 条</span>
                <div className="flex gap-2">
                  <button onClick={() => setOrderPage((p) => Math.max(1, p - 1))} disabled={orderPage === 1} className="p-2 rounded-lg border border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.04] disabled:opacity-30 disabled:cursor-not-allowed transition-all"><ChevronLeft className="h-4 w-4" /></button>
                  <span className="flex items-center px-3 text-sm text-slate-400">{orderPage} / {totalOrderPages}</span>
                  <button onClick={() => setOrderPage((p) => p + 1)} disabled={orderPage >= totalOrderPages} className="p-2 rounded-lg border border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.04] disabled:opacity-30 disabled:cursor-not-allowed transition-all"><ChevronRight className="h-4 w-4" /></button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── LOGS TAB ── */}
        {tab === "logs" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center gap-3 mb-6">
              <button onClick={fetchLogs} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all">
                <RefreshCw className={`h-4 w-4 ${logsLoading ? "animate-spin" : ""}`} /> 刷新
              </button>
            </div>
            <div className="space-y-2">
              {logs.length === 0 ? (
                <div className="rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] p-16 text-center text-slate-500">暂无日志记录</div>
              ) : (
                logs.map((l: Record<string, unknown>, i: number) => (
                  <motion.div
                    key={l.id as string}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="rounded-xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] p-4 hover:bg-white/[0.03] transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium border ${
                        (l.event as string) === "error" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                        "bg-white/[0.04] text-slate-300 border-white/[0.06]"
                      }`}>
                        {l.event as string}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-slate-500 font-mono">{l.out_trade_no as string || "—"}</span>
                          <span className="text-xs text-slate-400">{l.plan as string || ""}</span>
                          <span className="text-xs text-slate-600 ml-auto">{fmt(l.created_at)}</span>
                        </div>
                        {l.error ? (<p className="text-xs text-red-400 mt-1.5 font-mono">{l.error as string}</p>) : null}
                        {l.result ? (<p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{l.result as string}</p>) : null}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
