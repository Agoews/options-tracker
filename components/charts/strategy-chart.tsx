"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { StrategyBreakdownPoint } from "@/lib/domain/types";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function StrategyChart({ data }: { data: StrategyBreakdownPoint[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Strategy Mix</CardTitle>
        <CardDescription>Premium and realized P&L by strategy family.</CardDescription>
      </CardHeader>
      <CardContent className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="strategy" stroke="#64748b" tick={{ fontSize: 11 }} />
            <YAxis stroke="#64748b" tickFormatter={(value) => formatCurrency(value, true)} />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.08)" }}
            />
            <Bar dataKey="premium" fill="#38bdf8" radius={[6, 6, 0, 0]} />
            <Bar dataKey="realizedPnl" fill="#34d399" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
