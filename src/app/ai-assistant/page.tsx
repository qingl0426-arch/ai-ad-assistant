"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, User, Bot, Plus, Trash2, MessageSquare,
  Zap, TrendingUp, Target, BarChart3, ChevronRight,
  Loader2, Brain, Copy, Check
} from "lucide-react";
import Link from "next/link";

/* ── Types ── */
interface Message { id: string; role: "user" | "assistant"; content: string; timestamp: number }
interface Conversation { id: string; title: string; messages: Message[]; createdAt: number }

const QUICK_PROMPTS = [
  { icon: TrendingUp, text: "如何提升直播间ROI？" },
  { icon: Target, text: "怎么判断素材是否该加投？" },
  { icon: BarChart3, text: "帮我分析最近的投流数据" },
  { icon: Zap, text: "有哪些降低投流成本的方法？" },
];

/* ── Load conversations from localStorage ── */
function loadConversations(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("ai-chat-conversations");
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveConversations(convs: Conversation[]) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem("ai-chat-conversations", JSON.stringify(convs)); } catch {}
}

function generateId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

/* ── Streaming hook ── */
function useChatStream() {
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (
    userMessage: string,
    history: Message[],
    onToken: (token: string) => void,
    onDone: () => void,
    onError: (err: string) => void,
  ) => {
    setStreaming(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, messages: history }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "请求失败" }));
        onError(errData.error || "请求失败");
        setStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) { onError("无法读取响应"); setStreaming(false); return; }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") { onDone(); setStreaming(false); return; }
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) onToken(parsed.content);
              if (parsed.error) { onError(parsed.error); setStreaming(false); return; }
            } catch {}
          }
        }
      }
      onDone();
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      onError("网络连接异常");
    } finally {
      setStreaming(false);
    }
  }, []);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setStreaming(false);
  }, []);

  return { streaming, sendMessage, abort };
}

/* ═══════════════════════════════════════
   MESSAGE BUBBLE
   ═══════════════════════════════════════ */
function MessageBubble({ msg, isLast, streaming }: { msg: Message; isLast: boolean; streaming: boolean }) {
  const isUser = msg.role === "user";
  const [copied, setCopied] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {/* AI Avatar */}
      {!isUser && (
        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 mt-0.5 shadow-lg shadow-indigo-500/20">
          <Bot className="h-4 w-4 text-white" />
        </div>
      )}

      {/* Bubble */}
      <div className={`max-w-[85%] sm:max-w-[75%] ${isUser ? "order-first" : ""}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/15"
              : "bg-white/[0.04] border border-white/[0.06] text-slate-200"
          }`}
        >
          {/* Streaming cursor */}
          <span className="whitespace-pre-wrap break-words">
            {msg.content}
            {isLast && streaming && (
              <span className="inline-block w-2 h-4 ml-0.5 bg-indigo-400 animate-pulse rounded-sm align-middle" />
            )}
          </span>
        </div>

        {/* Actions */}
        {!isUser && msg.content && !streaming && (
          <div className="flex items-center gap-2 mt-1.5 ml-1">
            <button
              onClick={() => { navigator.clipboard.writeText(msg.content); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="p-1 rounded-md text-slate-600 hover:text-slate-400 transition-colors"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </button>
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="h-8 w-8 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0 mt-0.5">
          <User className="h-4 w-4 text-slate-400" />
        </div>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════
   EMPTY STATE
   ═══════════════════════════════════════ */
function EmptyState({ onPrompt }: { onPrompt: (text: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center mb-6">
        <Brain className="h-8 w-8 text-indigo-400" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">AI 投流助手</h2>
      <p className="text-slate-400 text-sm text-center max-w-md mb-8">
        我是你的专属投流顾问，可以帮你分析数据、优化策略、解答任何投流相关问题。
      </p>

      {/* Quick prompts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg">
        {QUICK_PROMPTS.map((p, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => onPrompt(p.text)}
            className="flex items-center gap-3 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all text-left group"
          >
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <p.icon className="h-4 w-4 text-indigo-400" />
            </div>
            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{p.text}</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600 ml-auto shrink-0" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════ */
export default function AIAssistantPage() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const supabase = createClient();
  const { streaming, sendMessage, abort } = useChatStream();

  /* Auth */
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
  }, []);

  /* Load conversations */
  useEffect(() => {
    const convs = loadConversations();
    setConversations(convs);
    if (convs.length > 0) setActiveConvId(convs[0]?.id ?? null);
  }, []);

  /* Scroll to bottom */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, activeConvId, streaming]);

  const activeConv = conversations.find(c => c.id === activeConvId);
  const messages = activeConv?.messages || [];

  /* Send message */
  const handleSend = useCallback(async (text?: string) => {
    const msgText = (text || input).trim();
    if (!msgText || streaming) return;
    setInput("");

    const userMsg: Message = { id: generateId(), role: "user", content: msgText, timestamp: Date.now() };

    let targetConvId = activeConvId;
    let updatedConvs = [...conversations];

    if (!targetConvId) {
      // Create new conversation
      const newConv: Conversation = {
        id: generateId(),
        title: msgText.slice(0, 30) + (msgText.length > 30 ? "..." : ""),
        messages: [userMsg],
        createdAt: Date.now(),
      };
      updatedConvs = [newConv, ...updatedConvs];
      targetConvId = newConv.id;
    } else {
      updatedConvs = updatedConvs.map(c =>
        c.id === targetConvId ? { ...c, messages: [...c.messages, userMsg] } : c
      );
    }

    setConversations(updatedConvs);
    setActiveConvId(targetConvId);
    saveConversations(updatedConvs);

    // Create placeholder for AI response
    const aiMsg: Message = { id: generateId(), role: "assistant", content: "", timestamp: Date.now() };

    const convWithPlaceholder = updatedConvs.map(c =>
      c.id === targetConvId ? { ...c, messages: [...c.messages, aiMsg] } : c
    );
    setConversations(convWithPlaceholder);
    saveConversations(convWithPlaceholder);

    let fullContent = "";

    await sendMessage(
      msgText,
      updatedConvs.find(c => c.id === targetConvId)?.messages || [],
      (token) => {
        fullContent += token;
        setConversations(prev => {
          const updated = prev.map(c =>
            c.id === targetConvId ? {
              ...c,
              messages: c.messages.map(m => m.id === aiMsg.id ? { ...m, content: fullContent } : m),
              title: c.messages.length <= 2 ? (fullContent.slice(0, 30) || c.title) : c.title,
            } : c
          );
          saveConversations(updated);
          return updated;
        });
      },
      () => {},
      (err) => {
        setConversations(prev => {
          const updated = prev.map(c =>
            c.id === targetConvId ? {
              ...c,
              messages: c.messages.map(m => m.id === aiMsg.id ? { ...m, content: `❌ ${err}` } : m),
            } : c
          );
          saveConversations(updated);
          return updated;
        });
      },
    );
  }, [input, streaming, activeConvId, conversations, sendMessage]);

  /* Delete conversation */
  const deleteConv = (id: string) => {
    const updated = conversations.filter(c => c.id !== id);
    setConversations(updated);
    saveConversations(updated);
    if (activeConvId === id) setActiveConvId(updated[0]?.id || null);
  };

  /* New chat */
  const newChat = () => {
    setActiveConvId(null);
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  /* Key handler */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-5">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center mx-auto">
            <Brain className="h-8 w-8 text-indigo-400" />
          </div>
          <p className="text-slate-400 text-lg">请先登录</p>
          <Link href="/login"><Button className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600">去登录</Button></Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col">
      <Navbar user={user} showAuth={false} onLogout={async () => { await supabase.auth.signOut(); router.push("/login"); }} />

      <div className="flex flex-1 pt-16 h-[calc(100vh-4rem)]">
        {/* ── Sidebar ── */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
              <motion.aside
                initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ duration: 0.2 }}
                className="fixed lg:static inset-y-16 lg:inset-y-0 left-0 w-[280px] bg-[#0a0a0f] border-r border-white/[0.06] z-50 flex flex-col"
              >
                <div className="p-4">
                  <button onClick={newChat} className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] text-sm text-slate-300 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all font-medium">
                    <Plus className="h-4 w-4" /> 新对话
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-3 space-y-1">
                  {conversations.map(conv => (
                    <div key={conv.id} className="group relative">
                      <button
                        onClick={() => { setActiveConvId(conv.id); setSidebarOpen(false); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all text-left ${
                          activeConvId === conv.id ? "bg-white/[0.06] text-white" : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                        }`}
                      >
                        <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{conv.title || "新对话"}</span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteConv(conv.id); }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {conversations.length === 0 && (
                    <p className="text-xs text-slate-600 text-center py-8">暂无对话记录</p>
                  )}
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Always visible on desktop */}
        <aside className="hidden lg:flex w-[280px] bg-[#0a0a0f] border-r border-white/[0.06] flex-col shrink-0">
          <div className="p-4">
            <button onClick={newChat} className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] text-sm text-slate-300 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all font-medium">
              <Plus className="h-4 w-4" /> 新对话
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-3 space-y-1">
            {conversations.map(conv => (
              <div key={conv.id} className="group relative">
                <button
                  onClick={() => setActiveConvId(conv.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all text-left ${
                    activeConvId === conv.id ? "bg-white/[0.06] text-white" : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                  }`}
                >
                  <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{conv.title || "新对话"}</span>
                </button>
                <button
                  onClick={() => deleteConv(conv.id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
            {conversations.length === 0 && (
              <p className="text-xs text-slate-600 text-center py-8">暂无对话记录</p>
            )}
          </div>
        </aside>

        {/* ── Main Chat Area ── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
            <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg border border-white/[0.06] text-slate-400">
              <MessageSquare className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-white truncate">{activeConv?.title || "AI 投流助手"}</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.length === 0 ? (
                <EmptyState onPrompt={(text) => handleSend(text)} />
              ) : (
                messages.map((msg, i) => (
                  <MessageBubble key={msg.id} msg={msg} isLast={i === messages.length - 1} streaming={streaming && i === messages.length - 1 && msg.role === "assistant"} />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input area */}
          <div className="border-t border-white/[0.06] bg-[#09090b]/80 backdrop-blur-xl p-4">
            <div className="max-w-3xl mx-auto">
              <div className="relative flex items-end gap-2 bg-white/[0.03] border border-white/[0.08] rounded-2xl px-4 py-3 focus-within:border-indigo-500/30 focus-within:bg-white/[0.04] transition-all">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="输入你的问题..."
                  rows={1}
                  className="flex-1 bg-transparent text-white placeholder:text-slate-600 text-sm resize-none outline-none max-h-32 py-0.5"
                  style={{ scrollbarWidth: "none" }}
                />
                {streaming ? (
                  <button onClick={abort} className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all shrink-0">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleSend()}
                    disabled={!input.trim()}
                    className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0 shadow-lg shadow-indigo-500/20"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                )}
              </div>
              <p className="text-[10px] text-slate-600 text-center mt-2">
                AI 投流助手 · 基于 GPT 驱动 · 仅供参考
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
