"use client";

import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReactNode } from "react";

interface DailyRow { date: string; spend: number; gmv: number; roi: number; orders: number; impressions: number; clicks: number }
interface PlatformRow { name: string; spend: number; gmv: number; roi: number; orders: number }

interface ChartsProps { daily: DailyRow[]; platforms: PlatformRow[] }

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }): ReactNode {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#f1f5f9" }}>
      <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ display: "flex", gap: 8, margin: 0 }}>
          <span style={{ color: entry.color || "#94a3b8" }}>●</span>
          {entry.name}: <strong>{typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}</strong>
        </p>
      ))}
    </div>
  );
}

export function DashboardCharts({ daily, platforms }: ChartsProps) {
  if (daily.length === 0) {
    return <div className="text-center text-muted-foreground py-12">暂无数据，请先上传 CSV</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base font-medium">消耗 vs 成交 趋势</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="gmv" name="成交额" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="spend" name="消耗" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base font-medium">各平台对比</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={platforms}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="gmv" name="成交额" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="spend" name="消耗" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base font-medium">ROI 趋势</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={daily}>
              <defs>
                <linearGradient id="roiGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area type="monotone" dataKey="roi" name="ROI" stroke="#3b82f6" fill="url(#roiGradient)" strokeWidth={2} dot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
