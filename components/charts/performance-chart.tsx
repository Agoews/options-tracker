"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { PerformancePoint } from "@/lib/domain/types";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function PerformanceChart({ data }: { data: PerformancePoint[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Performance</CardTitle>
        <CardDescription>Premium, realized, and unrealized contribution by active ticker.</CardDescription>
      </CardHeader>
      <CardContent className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="premium" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="realized" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="label" stroke="#64748b" />
            <YAxis stroke="#64748b" tickFormatter={(value) => formatCurrency(value, true)} />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.08)" }}
            />
            <Area type="monotone" dataKey="premium" stroke="#38bdf8" fill="url(#premium)" strokeWidth={2} />
            <Area type="monotone" dataKey="realizedPnl" stroke="#34d399" fill="url(#realized)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
