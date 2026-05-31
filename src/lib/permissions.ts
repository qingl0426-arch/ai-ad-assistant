import { PLANS } from "@/lib/alipay/config";
import type { PlanTier } from "@/lib/alipay/config";

export type { PlanTier };

export function checkLimit(userPlan: PlanTier, action: "dailyUploads" | "csvRows" | "aiAnalysis" | "historyDays"): number {
  return PLANS[userPlan]?.limits?.[action] ?? 0;
}

export function isPro(userPlan: PlanTier): boolean {
  return userPlan === "pro" || userPlan === "enterprise";
}

export function isEnterprise(userPlan: PlanTier): boolean {
  return userPlan === "enterprise";
}

export function getPlanName(plan: PlanTier): string {
  return PLANS[plan]?.name || "免费版";
}
