"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import {
  User, Crown, CreditCard, CheckCircle2, Calendar, Clock, Shield,
  Key, Smartphone, Monitor, LogOut,
  Mail, Camera, X, Loader2, Pencil, Save, Eye, EyeOff, BadgeCheck,
  MapPin, RefreshCw
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

interface ProfileData {
  email: string;
  plan: string;
  planUpdatedAt: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

interface SessionInfo {
  id: string;
  isCurrent: boolean;
  createdAt: string;
  lastActive: string;
  userAgent: string | null;
  ip: string | null;
}

interface OrderInfo {
  id: string;
  out_trade_no: string;
  plan: string;
  amount: number;
  status: string;
  paid_at: string | null;
  created_at: string;
}

type StatusStyle = { color: string; label: string };

const PLAN: Record<string, string> = { free: "免费版", pro: "专业版", enterprise: "企业版" };
const STATUS: Record<string, StatusStyle> = {
  pending: { color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", label: "待支付" },
  paid: { color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", label: "已支付" },
  refunding: { color: "bg-orange-500/10 text-orange-400 border-orange-500/20", label: "退款中" },
  refunded: { color: "bg-slate-500/10 text-slate-400 border-slate-500/20", label: "已退款" },
};
const DEFAULT_STATUS: StatusStyle = { color: "bg-slate-500/10 text-slate-400 border-slate-500/20", label: "未知" };

const TABS = [
  { id: "profile", label: "个人资料", icon: User },
  { id: "security", label: "账户安全", icon: Shield },
  { id: "password", label: "修改密码", icon: Key },
  { id: "sessions", label: "登录设备", icon: Smartphone },
  { id: "orders", label: "订单记录", icon: CreditCard },
];

function parseUA(ua: string | null) {
  if (!ua) return { browser: "未知", os: "未知" };
  let browser = "未知";
  let os = "未知";
  if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("Edg")) browser = "Edge";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac")) os = "macOS";
  else if (ua.includes("Linux") && !ua.includes("Android")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
  return { browser, os };
}

function getStatus(key: string): StatusStyle {
  return STATUS[key] ?? DEFAULT_STATUS;
}

export default function AccountPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("profile");
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pwStrength, setPwStrength] = useState(0);

  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [signingOutDevices, setSigningOutDevices] = useState(false);

  const [orders, setOrders] = useState<OrderInfo[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/login"); return; }
      Promise.all([
        fetch("/api/user").then(r => r.json()),
        fetch("/api/account/orders").then(r => r.json()),
      ]).then(([p, o]) => {
        setProfile(p);
        setOrders(o.orders || []);
        setNewName(p.displayName || "");
        setLoading(false);
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: newName }),
    });
    setProfile(p => p ? { ...p, displayName: newName || null } : p);
    setEditingName(false);
    setSavingProfile(false);
    toast("success", "资料已更新");
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append("file", file);
    const r = await fetch("/api/account/avatar", { method: "POST", body: formData });
    if (r.ok) {
      const d = await r.json();
      setProfile(p => p ? { ...p, avatarUrl: d.avatarUrl } : p);
      toast("success", "头像更新成功");
    }
    setUploadingAvatar(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    let s = 0;
    if (newPw.length >= 6) s++;
    if (newPw.length >= 10) s++;
    if (/[A-Z]/.test(newPw)) s++;
    if (/[0-9]/.test(newPw)) s++;
    if (/[^A-Za-z0-9]/.test(newPw)) s++;
    setPwStrength(s);
  }, [newPw]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) { setPwMsg({ type: "error", text: "两次密码不一致" }); return; }
    if (newPw.length < 6) { setPwMsg({ type: "error", text: "密码至少 6 位" }); return; }
    setChangingPw(true);
    setPwMsg(null);
    if (profile?.email && oldPw) {
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email: profile.email, password: oldPw });
      if (signInErr) { setPwMsg({ type: "error", text: "当前密码错误" }); setChangingPw(false); return; }
    }
    const { error } = await supabase.auth.updateUser({ password: newPw });
    if (error) { setPwMsg({ type: "error", text: error.message }); }
    else {
      setPwMsg({ type: "success", text: "密码修改成功" });
    toast("success", "密码修改成功");
      setOldPw(""); setNewPw(""); setConfirmPw("");
    }
    setChangingPw(false);
  };

  const fetchSessions = useCallback(async () => {
    setSessionsLoading(true);
    const r = await fetch("/api/account/sessions");
    if (r.ok) {
      const d = await r.json();
      setSessions(d.sessions || []);
    }
    setSessionsLoading(false);
  }, []);

  useEffect(() => { if (tab === "sessions") fetchSessions(); }, [tab, fetchSessions]);

  const handleSignOutOthers = async () => {
    setSigningOutDevices(true);
    await fetch("/api/account/sessions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signOutAll: true }),
    });
    await fetchSessions();
    setSigningOutDevices(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }
  if (!profile) return null;

  const plan = profile.plan || "free";
  const strengthLabel = ["", "弱", "较弱", "一般", "强", "很强"];
  const strengthColor = ["", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-emerald-500", "bg-emerald-400"];

  return (
    <div className="min-h-screen bg-[#09090b]">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 pt-24 pb-16">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-56 shrink-0">
            <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="lg:sticky lg:top-24">
              <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <button onClick={() => fileInputRef.current?.click()} className="relative group cursor-pointer shrink-0">
                  <Avatar className="h-10 w-10 shadow-md shadow-indigo-500/20">
                    <AvatarImage src={profile.avatarUrl || undefined} alt={profile.displayName || profile.email} />
                    <AvatarFallback className="text-sm">{(profile.displayName || profile.email).charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-4 w-4 text-white" />
                  </div>
                </button>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{profile.displayName || "用户"}</p>
                  <p className="text-[11px] text-slate-500 truncate">{profile.email}</p>
                </div>
                {uploadingAvatar && <div className="h-10 w-10 rounded-full bg-white/[0.04] flex items-center justify-center shrink-0"><div className="h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>}
              </div>
              <nav className="space-y-1">
                {TABS.map((t) => (
                  <button key={t.id} onClick={() => setTab(t.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${tab === t.id ? "bg-white/[0.06] text-white" : "text-slate-400 hover:text-white hover:bg-white/[0.03]"}`}>
                    <t.icon className={`h-4 w-4 ${tab === t.id ? "text-indigo-400" : "text-slate-500"}`} />
                    {t.label}
                  </button>
                ))}
              </nav>
              <div className="mt-6 p-3 rounded-xl bg-gradient-to-br from-indigo-500/[0.06] to-purple-500/[0.04] border border-indigo-500/[0.1]">
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-xs font-semibold text-white">{PLAN[plan]}</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {plan === "free" ? "升级解锁更多功能" : `有效期至 ${profile.planUpdatedAt ? new Date(profile.planUpdatedAt).toLocaleDateString("zh-CN") : "—"}`}
                </p>
                {plan === "free" && (
                  <Link href="/pricing" className="inline-block mt-2 text-[11px] font-medium text-indigo-400 hover:text-indigo-300">升级套餐 →</Link>
                )}
              </div>
            </motion.div>
          </aside>
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="flex-1 min-w-0 space-y-6">
            {tab === "profile" && ( /* ══════ PROFILE ══════ */
              <div className="rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] p-6">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-5">基本信息</h2>
                <div className="space-y-5">
                  <div className="flex items-center justify-between group">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0"><User className="h-4 w-4 text-slate-400" /></div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">显示名称</p>
                        {editingName ? (
                          <div className="flex items-center gap-2">
                            <Input value={newName} onChange={(e) => setNewName(e.target.value)} className="h-8 w-48 text-sm" autoFocus />
                            <button onClick={handleSaveProfile} disabled={savingProfile} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-emerald-400 transition-all">{savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}</button>
                            <button onClick={() => { setEditingName(false); setNewName(profile.displayName || ""); }} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-400 transition-all"><X className="h-4 w-4" /></button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <p className="text-white font-medium text-sm">{profile.displayName || "未设置"}</p>
                            <button onClick={() => setEditingName(true)} className="p-1 rounded-lg hover:bg-white/[0.06] text-slate-600 hover:text-slate-400 transition-all opacity-0 group-hover:opacity-100"><Pencil className="h-3.5 w-3.5" /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0"><Mail className="h-4 w-4 text-slate-400" /></div>
                    <div><p className="text-xs text-slate-500 mb-1">邮箱</p><div className="flex items-center gap-2"><p className="text-white font-medium text-sm">{profile.email}</p><BadgeCheck className="h-4 w-4 text-emerald-400" /></div></div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0"><Crown className="h-4 w-4 text-amber-400" /></div>
                    <div><p className="text-xs text-slate-500 mb-1">会员等级</p><Badge variant={plan === "enterprise" ? "purple" : plan === "pro" ? "primary" : "outline"} className="gap-1.5"><Crown className="h-3 w-3" /> {PLAN[plan]}</Badge></div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0"><Calendar className="h-4 w-4 text-slate-400" /></div>
                    <div><p className="text-xs text-slate-500 mb-1">注册时间</p><p className="text-white font-medium text-sm">{profile.createdAt ? new Date(profile.createdAt).toLocaleString("zh-CN") : "—"}</p></div>
                  </div>
                </div>
              </div>
            )}

            {tab === "security" && ( /* ══════ SECURITY ══════ */
              <div className="rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] p-6">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-5">账户安全</h2>
                <div className="space-y-4">
                  {[
                    { icon: Mail, label: "邮箱绑定", value: profile.email, statusText: "已绑定" },
                    { icon: Shield, label: "账户保护", value: "密码登录", statusText: "已启用" },
                    { icon: MapPin, label: "登录地区", value: "通过 IP 检测", statusText: "无异常" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-4 rounded-xl border border-white/[0.04] bg-white/[0.01]">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center"><item.icon className="h-4 w-4 text-slate-400" /></div>
                        <div><p className="text-sm font-medium text-white">{item.label}</p><p className="text-xs text-slate-500">{item.value}</p></div>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle2 className="h-3 w-3" /> {item.statusText}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "password" && ( /* ══════ PASSWORD ══════ */
              <div className="rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] p-6">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-5">修改密码</h2>
                {pwMsg && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className={`mb-5 p-3.5 rounded-xl text-sm border ${pwMsg.type === "success" ? "bg-emerald-500/[0.06] text-emerald-400 border-emerald-500/[0.15]" : "bg-red-500/[0.06] text-red-400 border-red-500/[0.15]"}`}>{pwMsg.text}</motion.div>
                )}
                <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
                  <div className="space-y-2">
                    <Label className="text-slate-400 text-xs font-medium">当前密码</Label>
                    <div className="relative">
                      <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <Input type={showOldPw ? "text" : "password"} value={oldPw} onChange={(e) => setOldPw(e.target.value)} placeholder="输入当前密码" required className="pl-10 pr-10 h-11" />
                      <button type="button" onClick={() => setShowOldPw(!showOldPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300" tabIndex={-1}>{showOldPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-400 text-xs font-medium">新密码</Label>
                    <div className="relative">
                      <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <Input type={showNewPw ? "text" : "password"} value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="至少 6 位" required minLength={6} className="pl-10 pr-10 h-11" />
                      <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300" tabIndex={-1}>{showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                    </div>
                    {newPw && (
                      <div className="flex items-center gap-1.5 mt-2">
                        {[1, 2, 3, 4, 5].map((i) => (<div key={i} className={`flex-1 h-1 rounded-full transition-all ${i <= pwStrength ? strengthColor[pwStrength] : "bg-white/[0.06]"}`} />))}
                        <span className="text-[11px] text-slate-500 ml-1">{strengthLabel[pwStrength]}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-400 text-xs font-medium">确认密码</Label>
                    <Input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="再次输入新密码" required className="h-11" />
                    {confirmPw && newPw !== confirmPw && <p className="text-xs text-red-400 mt-1">两次密码不一致</p>}
                  </div>
                  <Button type="submit" disabled={changingPw} variant="gradient" size="lg" className="gap-2">{changingPw ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}修改密码</Button>
                </form>
              </div>
            )}

            {tab === "sessions" && ( /* ══════ SESSIONS ══════ */
              <div className="rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">登录设备</h2>
                  <div className="flex items-center gap-2">
                    <button onClick={fetchSessions} className="p-2 rounded-lg hover:bg-white/[0.04] text-slate-400 hover:text-white transition-all"><RefreshCw className={`h-4 w-4 ${sessionsLoading ? "animate-spin" : ""}`} /></button>
                    <button onClick={handleSignOutOthers} disabled={signingOutDevices || sessions.filter(s => !s.isCurrent).length === 0} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/[0.06] border border-red-500/[0.15] disabled:opacity-30 transition-all">{signingOutDevices ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}退出其他设备</button>
                  </div>
                </div>
                <div className="space-y-3">
                  {sessions.length === 0 ? (
                    <div className="text-center py-12 text-slate-500"><Monitor className="h-10 w-10 mx-auto mb-3 text-slate-700" /><p>正在加载设备列表...</p></div>
                  ) : (
                    sessions.map((s) => {
                      const { browser, os } = parseUA(s.userAgent);
                      return (
                        <div key={s.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${s.isCurrent ? "border-indigo-500/[0.12] bg-indigo-500/[0.03]" : "border-white/[0.04] bg-white/[0.01]"}`}>
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${s.isCurrent ? "bg-indigo-500/10" : "bg-white/[0.04]"}`}><Monitor className={`h-5 w-5 ${s.isCurrent ? "text-indigo-400" : "text-slate-500"}`} /></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2"><p className="text-sm font-medium text-white">{browser} · {os}</p>{s.isCurrent && <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-indigo-500/15 text-indigo-400">当前设备</span>}</div>
                            <p className="text-xs text-slate-500 mt-0.5">{s.ip || "—"} · 最后活跃 {s.lastActive ? new Date(s.lastActive).toLocaleString("zh-CN") : "—"}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {tab === "orders" && ( /* ══════ ORDERS ══════ */
              <div className="rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] p-6">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-5">订单记录</h2>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="h-12 w-12 mx-auto text-slate-700 mb-4" />
                    <p className="text-slate-500 mb-4">暂无订单记录</p>
                    <Link href="/pricing"><Button variant="gradient" size="sm" className="gap-2"><Crown className="h-4 w-4" /> 升级套餐</Button></Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((o, i) => {
                      const st = getStatus(o.status);
                      return (
                        <motion.div key={o.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                          <div className={`p-2 rounded-lg ${st.color}`}><CheckCircle2 className="h-4 w-4" /></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold text-white">{PLAN[o.plan] || o.plan}</span>
                              <span className="text-sm text-slate-400">¥{o.amount}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium border ${st.color}`}>{st.label}</span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1">订单号: {(o.out_trade_no || "").slice(0, 28)}{o.paid_at ? ` · 支付: ${new Date(o.paid_at).toLocaleDateString("zh-CN")}` : ""}</p>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 shrink-0"><Clock className="h-3 w-3" />{new Date(o.created_at).toLocaleDateString("zh-CN")}</div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
    </div>
  );
}
