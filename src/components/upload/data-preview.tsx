"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AdTrafficRow } from "@/types/database";

function formatCurrency(v: number) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    minimumFractionDigits: 0,
  }).format(v);
}

function formatROI(v: number) {
  return `${(v * 100).toFixed(1)}%`;
}

export function DataPreview() {
  const [rows, setRows] = useState<AdTrafficRow[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("ad_traffic")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(50);

    setRows(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">加载中...</CardContent>
      </Card>
    );
  }

  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          暂无数据，请上传 CSV 文件
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">已上传数据 ({rows.length} 条)</CardTitle>
        <Button variant="ghost" size="icon" onClick={fetchData}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>日期</TableHead>
                <TableHead className="text-right">消耗</TableHead>
                <TableHead className="text-right">曝光</TableHead>
                <TableHead className="text-right">点击</TableHead>
                <TableHead className="text-right">成交金额</TableHead>
                <TableHead className="text-right">订单数</TableHead>
                <TableHead className="text-right">ROI</TableHead>
                <TableHead>平台</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.date}</TableCell>
                  <TableCell className="text-right">{formatCurrency(row.spend)}</TableCell>
                  <TableCell className="text-right">{row.impressions.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{row.clicks.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{formatCurrency(row.gmv)}</TableCell>
                  <TableCell className="text-right">{row.orders}</TableCell>
                  <TableCell
                    className={cn("text-right font-medium", row.roi > 0 ? "text-green-600" : "text-red-500")}
                  >
                    {formatROI(row.roi)}
                  </TableCell>
                  <TableCell>{row.platform || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}