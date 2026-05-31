"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, Check, Sparkles, Building2, ArrowLeft, Crown, QrCode, ExternalLink, RefreshCw } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PlanCard {
  id: string;
  name: string;
  price: string;
  unit: string;
  description: string;
  features: string[];
  popular?: boolean;
  icon: typeof BarChart3;
}

const plans: PlanCard[] = [
  {
    id: "free",
    name: "免费版",
    price: "0",
    unit: "",
    description: "适合个人体验",
    features: ["每日分析 1 次", "基础数据大屏", "CSV 上传（单次100行）", "基础 ROI 分析"],
    icon: BarChart3,
  },
  {
    id: "pro",
    name: "专业版",
    price: "299",
    unit: "/月",
    description: "适合中小团队",
    features: ["无限数据分析", "AI 智能投流建议", "实时数据大屏", "CSV 批量上传（单次1000行）", "自动报告下载", "30天历史数据"],
    popular: true,
    icon: Sparkles,
  },
  {
    id: "enterprise",
    name: "企业版",
    price: "999",
    unit: "/月",
    description: "适合大型运营团队",
    features: ["全部专业版功能", "无限 AI 分析", "API 接口访问", "多平台数据聚合", "专属数据看板", "90天历史数据", "优先客服支持"],
    icon: Building2,
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [qrModal, setQrModal] = useState<{ plan: string; planName: string; qrCode: string; outTradeNo: string } | null>(null);
  const [payUrl, setPayUrl] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const router = useRouter();
  const supabase = createClient();

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = undefined;
    }
  }, []);

  async function handleSubscribe(planId: string) {
    setLoading(planId);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    if (planId === "free") {
      const res = await fetch("/api/alipay/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "free" }),
      });
      if (res.ok) router.push("/dashboard");
      else setError("操作失败");
      setLoading(null);
      return;
    }

    const res = await fetch("/api/alipay/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: planId, payType: "qr" }),
    });

    const data = await res.json();
    if (data.error) {
      setError(data.error);
      setLoading(null);
      return;
    }

    if (data.url) {
      setPayUrl(data.url);
      setLoading(null);
      return;
    }

    if (data.qrCode) {
      setQrModal({
        plan: planId,
        planName: plans.find((p) => p.id === planId)?.name || "",
        qrCode: data.qrCode,
        outTradeNo: data.outTradeNo,
      });

      // Start polling payment status
      pollingRef.current = setInterval(async () => {
        const pollRes = await fetch(`/api/alipay/query?out_trade_no=${data.outTradeNo}`);
        const pollData = await pollRes.json();
        if (pollData.status === "paid") {
          stopPolling();
          setQrModal(null);
          router.push("/dashboard?alipay=success");
        }
      }, 3000);
    }

    setLoading(null);
  }

  function closeModal() {
    stopPolling();
    setQrModal(null);
    setPayUrl(null);
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="h-14 border-b bg-background flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-5 w-5 text-primary" />
          <span className="font-semibold">AI Ad Assistant</span>
        </div>
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />返回大屏
        </Link>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center space-y-3 mb-12">
          <h1 className="text-3xl font-bold tracking-tight">选择适合你的套餐</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            从小团队到企业级，灵活适配你的投放规模
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 text-sm rounded-lg bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400 text-center max-w-md mx-auto">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={cn(
                "relative flex flex-col transition-shadow hover:shadow-lg",
                plan.popular && "border-primary shadow-md shadow-primary/10",
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                    <Crown className="h-3 w-3" />推荐
                  </span>
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <div className="flex justify-center mb-2">
                  <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center",
                    plan.popular ? "bg-primary text-primary-foreground" : "bg-muted",
                  )}>
                    <plan.icon className="h-5 w-5" />
                  </div>
                </div>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-3">
                  <span className="text-4xl font-bold">
                    {plan.price === "0" ? "免费" : `¥${plan.price}`}
                  </span>
                  {plan.unit && <span className="text-muted-foreground ml-1">{plan.unit}</span>}
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-6">
                <ul className="space-y-2 flex-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading === plan.id}
                >
                  {loading === plan.id
                    ? "处理中..."
                    : plan.price === "0"
                      ? "免费使用"
                      : "支付宝扫码支付"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 text-center space-y-3">
          <p className="text-xs text-muted-foreground">安全支付由支付宝提供</p>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400 text-sm font-medium">
            支付宝
          </span>
        </div>
      </main>

      {/* QR Code Modal */}
      {qrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeModal}>
          <div className="bg-background rounded-2xl p-8 max-w-sm w-full mx-4 text-center space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-center gap-2 text-blue-600 font-medium">
              <QrCode className="h-5 w-5" />支付宝扫码支付
            </div>
            <p className="text-lg font-bold">{qrModal.planName} · ¥{plans.find((p) => p.id === qrModal.plan)?.price}/月</p>
            <div className="bg-white p-4 rounded-xl inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`data:image/png;base64,${qrModal.qrCode}`} alt="支付宝扫码" className="w-48 h-48" />
            </div>
            <p className="text-sm text-muted-foreground">打开支付宝扫一扫</p>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <RefreshCw className="h-3 w-3 animate-spin" />
              等待支付中...
            </div>
            <Button variant="ghost" size="sm" onClick={closeModal}>取消</Button>
          </div>
        </div>
      )}

      {/* PC Page Pay Redirect Modal */}
      {payUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeModal}>
          <div className="bg-background rounded-2xl p-8 max-w-sm w-full mx-4 text-center space-y-4" onClick={(e) => e.stopPropagation()}>
            <ExternalLink className="h-8 w-8 mx-auto text-blue-600" />
            <p className="font-medium">即将跳转到支付宝收银台</p>
            <Button className="w-full" onClick={() => window.open(payUrl, "_self")}>
              前往支付宝支付
            </Button>
            <Button variant="ghost" size="sm" onClick={closeModal}>取消</Button>
          </div>
        </div>
      )}
    </div>
  );
}


