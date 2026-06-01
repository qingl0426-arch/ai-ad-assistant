import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium border transition-colors",
  {
    variants: {
      variant: {
        default: "bg-white/[0.04] text-slate-300 border-white/[0.06]",
        primary: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
        purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        danger: "bg-red-500/10 text-red-400 border-red-500/20",
        outline: "bg-transparent text-slate-400 border-white/[0.08]",
        gradient: "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-300 border-indigo-500/20",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
