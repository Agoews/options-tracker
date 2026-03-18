"use client";

import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { PerformancePoint } from "@/lib/domain/types";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function PerformanceChart({ data }: { data: PerformancePoint[] }) {
  const latest = data.at(-1);
  const portfolioDelta = latest ? latest.portfolioValue - latest.fundedCapital : 0;
  const portfolioReturnPct =
    latest && latest.fundedCapital > 0 ? (portfolioDelta / latest.fundedCapital) * 100 : 0;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Portfolio Value</CardTitle>
        <CardDescription>
          Tracked portfolio value over time based on the starting portfolio value, added funds, realized P&amp;L, and current unrealized P&amp;L.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {latest ? (
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Portfolio Total</p>
              <p className="mt-2 font-mono text-xl text-slate-50">{formatCurrency(latest.portfolioValue)}</p>
              <p className="mt-2 text-sm text-slate-400">Funded capital {formatCurrency(latest.fundedCapital)}</p>
              <p className={portfolioDelta >= 0 ? "mt-1 text-sm text-emerald-300" : "mt-1 text-sm text-rose-300"}>
                {formatPercent(portfolioReturnPct)} since funding start
              </p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Current Unrealized</p>
              <p className={latest.unrealizedPnl >= 0 ? "mt-2 font-mono text-xl text-emerald-300" : "mt-2 font-mono text-xl text-rose-300"}>
                {formatCurrency(latest.unrealizedPnl)}
              </p>
              <p className="mt-2 text-sm text-slate-400">Included in the total portfolio value above.</p>
            </div>
          </div>
        ) : null}

        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="label" stroke="#64748b" />
              <YAxis stroke="#64748b" tickFormatter={(value) => formatCurrency(value, true)} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(_, payload) => {
                  const row = payload?.[0]?.payload as PerformancePoint | undefined;
                  return row?.date ? row.date.toLocaleDateString() : "";
                }}
                contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.08)" }}
              />
              <Line type="monotone" dataKey="portfolioValue" stroke="#38bdf8" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
