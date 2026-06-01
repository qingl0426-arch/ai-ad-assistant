"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertTriangle, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  toast: (type: ToastType, title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() { return useContext(ToastContext); }

const ICONS: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2, error: XCircle, warning: AlertTriangle, info: Info,
};

const STYLES: Record<ToastType, string> = {
  success: "border-emerald-500/20 bg-emerald-500/[0.06]",
  error: "border-red-500/20 bg-red-500/[0.06]",
  warning: "border-amber-500/20 bg-amber-500/[0.06]",
  info: "border-indigo-500/20 bg-indigo-500/[0.06]",
};

const ICON_COLORS: Record<ToastType, string> = {
  success: "text-emerald-400", error: "text-red-400", warning: "text-amber-400", info: "text-indigo-400",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  }, []);

  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = ICONS[t.type];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className={cn(
                  "pointer-events-auto flex items-start gap-3 rounded-2xl border backdrop-blur-2xl p-4 shadow-2xl shadow-black/30 min-w-[320px] max-w-[420px]",
                  STYLES[t.type]
                )}
              >
                <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", ICON_COLORS[t.type])} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{t.title}</p>
                  {t.message && <p className="text-xs text-slate-400 mt-0.5">{t.message}</p>}
                </div>
                <button onClick={() => removeToast(t.id)} className="shrink-0 p-1 rounded-lg hover:bg-white/[0.06] text-slate-500 hover:text-white transition-all">
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
