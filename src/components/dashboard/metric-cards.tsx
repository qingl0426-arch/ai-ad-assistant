import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DollarSign, TrendingUp, MousePointer, ShoppingCart, BarChart3 } from "lucide-react";

interface MetricCardsProps {
  totals: {
    spend: number;
    impressions: number;
    clicks: number;
    gmv: number;
    orders: number;
    roi: number;
    ctr: number;
  } | null;
}

export function MetricCards({ totals }: MetricCardsProps) {
  const cards = useMemo(() => {
    if (!totals) return [];
    return [
      { title: "总消耗", value: `¥${totals.spend.toLocaleString()}`, icon: DollarSign, color: "text-orange-500", bg: "bg-orange-500/10" },
      { title: "总成交", value: `¥${totals.gmv.toLocaleString()}`, icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
      { title: "ROI", value: `${(totals.roi * 100).toFixed(1)}%`, icon: BarChart3, color: totals.roi > 0 ? "text-green-500" : "text-red-500", bg: totals.roi > 0 ? "bg-green-500/10" : "bg-red-500/10" },
      { title: "CTR", value: `${(totals.ctr * 100).toFixed(2)}%`, icon: MousePointer, color: "text-blue-500", bg: "bg-blue-500/10" },
      { title: "订单数", value: totals.orders.toLocaleString(), icon: ShoppingCart, color: "text-purple-500", bg: "bg-purple-500/10" },
    ];
  }, [totals]);

  if (!totals) {
    return (
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6 h-24" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
      {cards.map((c) => (
        <Card key={c.title} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-4">
            <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center shrink-0", c.bg)}>
              <c.icon className={cn("h-5 w-5", c.color)} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{c.title}</p>
              <p className="text-lg font-bold">{c.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
