// ── Design System Tokens ──
// 直播投流AI · Dark Theme · Linear/Stripe/Vercel inspired

export const colors = {
  bg: "#09090b",
  surface: "rgba(255,255,255,0.02)",
  surfaceHover: "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.06)",
  borderHover: "rgba(255,255,255,0.10)",
  text: "#ffffff",
  textSecondary: "#94a3b8",
  textMuted: "#64748b",
  accent: {
    indigo: "#818cf8",
    purple: "#a78bfa",
    pink: "#f472b6",
    emerald: "#34d399",
    amber: "#fbbf24",
  },
  gradient: {
    primary: "from-indigo-600 to-purple-600",
    subtle: "from-indigo-500/10 to-purple-500/10",
  },
  status: {
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    error: "bg-red-500/10 text-red-400 border-red-500/20",
    info: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  },
} as const;

export const radius = {
  sm: "0.5rem",
  md: "0.75rem",
  lg: "1rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
  full: "9999px",
} as const;

export const spacing = {
  xs: "0.25rem",
  sm: "0.5rem",
  md: "0.75rem",
  lg: "1rem",
  xl: "1.5rem",
  "2xl": "2rem",
  "3xl": "3rem",
  "4xl": "4rem",
} as const;

export const shadows = {
  sm: "0 1px 2px rgba(0,0,0,0.3)",
  md: "0 4px 16px rgba(0,0,0,0.4)",
  lg: "0 8px 32px rgba(0,0,0,0.5)",
  xl: "0 16px 48px rgba(0,0,0,0.6)",
  glow: (color: string = "indigo") => `0 0 40px -8px var(--color-${color}-500)`,
} as const;

export const typography = {
  fontFamily: '"Geist", "Geist Fallback", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  mono: '"Geist Mono", "Fira Code", monospace',
  h1: "text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight",
  h2: "text-3xl font-bold tracking-tight",
  h3: "text-2xl font-bold",
  h4: "text-xl font-semibold",
  body: "text-sm leading-relaxed",
  caption: "text-xs",
  label: "text-xs font-medium uppercase tracking-wider",
} as const;

export const glass = {
  card: "bg-white/[0.02] backdrop-blur-xl border border-white/[0.06]",
  hover: "hover:bg-white/[0.04] hover:border-white/[0.10]",
  dropdown: "bg-[#0c0c10]/95 backdrop-blur-2xl border border-white/[0.08]",
} as const;
