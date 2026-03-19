"use client";

import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { PerformancePoint } from "@/lib/domain/types";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string; payload: PerformancePoint }>;
}) {
  if (!active || !payload?.length) return null;

  const row = payload[0]?.payload;
  const netGain = row ? row.portfolioValue - row.fundedCapital : 0;

  return (
    <div className="rounded-xl border border-white/8 bg-[#11161f] p-3 shadow-[0_8px_24px_rgba(0,0,0,0.4)] text-xs">
      {row?.date && (
        <p className="mb-2 font-mono text-slate-500">
          {row.date instanceof Date
            ? row.date.toLocaleDateString()
            : new Date(row.date).toLocaleDateString()}
        </p>
      )}
      <div className="space-y-1.5">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="h-0.5 w-3 rounded-full" style={{ background: entry.color }} />
              {entry.name}
            </span>
            <span className="font-mono text-slate-100">{formatCurrency(entry.value)}</span>
          </div>
        ))}
        <div className="mt-2 border-t border-white/6 pt-2 flex items-center justify-between gap-6">
          <span className="text-slate-500">Net gain</span>
          <span className={`font-mono ${netGain >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
            {netGain >= 0 ? "+" : ""}{formatCurrency(netGain)}
          </span>
        </div>
      </div>
    </div>
  );
}

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
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Portfolio Total</p>
              <p className="mt-2 font-mono text-xl text-slate-50">{formatCurrency(latest.portfolioValue)}</p>
              <p className={`mt-2 text-sm ${portfolioDelta >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                {portfolioDelta >= 0 ? "+" : ""}{formatPercent(portfolioReturnPct)} since funding start
              </p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Funded Capital</p>
              <p className="mt-2 font-mono text-xl text-slate-50">{formatCurrency(latest.fundedCapital)}</p>
              <p className="mt-2 text-sm text-slate-400">Cost basis reference</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Unrealized P&amp;L</p>
              <p className={`mt-2 font-mono text-xl ${latest.unrealizedPnl >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                {formatCurrency(latest.unrealizedPnl)}
              </p>
              <p className="mt-2 text-sm text-slate-400">Included in portfolio total</p>
            </div>
          </div>
        ) : null}

        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="transparent"
                tick={{ fill: "#64748b", fontSize: 11, fontFamily: "var(--font-mono, monospace)" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="transparent"
                tick={{ fill: "#64748b", fontSize: 11, fontFamily: "var(--font-mono, monospace)" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCurrency(value, true)}
                width={72}
              />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="portfolioValue"
                name="Portfolio"
                stroke="#38bdf8"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, fill: "#38bdf8", strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="fundedCapital"
                name="Funded capital"
                stroke="#475569"
                strokeWidth={1.5}
                strokeDasharray="5 4"
                dot={false}
                activeDot={{ r: 3, fill: "#475569", strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
