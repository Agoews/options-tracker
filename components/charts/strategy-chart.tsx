"use client";

import type { StrategyType } from "@prisma/client";

import type { StrategyBreakdownPoint } from "@/lib/domain/types";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const STRATEGY_LABELS: Record<StrategyType, string> = {
  WHEEL: "Wheel",
  CASH_SECURED_PUT: "Cash-Secured Put",
  COVERED_CALL: "Covered Call",
  LONG_CALL: "Long Call",
  LONG_PUT: "Long Put",
  SHORT_CALL: "Short Call",
  SHORT_PUT: "Short Put",
  STOCK: "Stock",
};

function formatWinRate(value: number | null) {
  if (value === null) {
    return "N/A";
  }

  return `${Math.round(value * 100)}%`;
}

export function StrategyChart({ data }: { data: StrategyBreakdownPoint[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Strategy Mix</CardTitle>
        <CardDescription>
          Ranked by realized P&amp;L so you can see which playbooks are producing results, not just collecting premium.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!data.length ? (
          <p className="text-sm text-slate-400">No strategy data yet.</p>
        ) : (
          <div className="space-y-3">
            <div className="hidden grid-cols-[1.4fr_0.7fr_0.8fr_1fr_1fr] gap-4 px-4 text-[11px] uppercase tracking-[0.18em] text-slate-500 md:grid">
              <span>Strategy</span>
              <span>Open / Closed</span>
              <span>Win Rate</span>
              <span>Avg Closed</span>
              <span>Realized</span>
            </div>
            {data.map((row) => (
              <div
                key={row.strategy}
                className="grid gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4 md:grid-cols-[1.4fr_0.7fr_0.8fr_1fr_1fr] md:items-center"
              >
                <div>
                  <p className="font-semibold text-slate-50">{STRATEGY_LABELS[row.strategy] ?? row.strategy}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Premium: <span className="font-mono text-slate-300">{formatCurrency(row.premiumCollected)}</span>
                  </p>
                </div>
                <div className="text-sm text-slate-300">
                  <span className="font-mono text-slate-50">{row.activeTrades}</span> open /{" "}
                  <span className="font-mono text-slate-50">{row.closedTrades}</span> closed
                </div>
                <div className="text-sm text-slate-300">{formatWinRate(row.winRate)}</div>
                <div className={row.averageClosedPnl !== null && row.averageClosedPnl >= 0 ? "font-mono text-emerald-300" : "font-mono text-rose-300"}>
                  {row.averageClosedPnl === null ? "N/A" : formatCurrency(row.averageClosedPnl)}
                </div>
                <div className={row.realizedPnl >= 0 ? "font-mono text-emerald-300" : "font-mono text-rose-300"}>
                  {formatCurrency(row.realizedPnl)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
