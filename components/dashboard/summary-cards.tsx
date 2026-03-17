import { ArrowDownRight, ArrowUpRight, Dot } from "lucide-react";

import type { DashboardMetric } from "@/lib/domain/types";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SummaryCards({ metrics }: { metrics: DashboardMetric[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {metrics.map((metric) => {
        const positive = metric.tone === "positive";
        const negative = metric.tone === "negative";

        return (
          <Card key={metric.label}>
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{metric.label}</p>
                <CardTitle className="mt-3 font-mono text-2xl">
                  {formatCurrency(metric.value)}
                </CardTitle>
              </div>
              <div
                className={[
                  "rounded-full p-2",
                  positive ? "bg-emerald-500/10 text-emerald-300" : "",
                  negative ? "bg-rose-500/10 text-rose-300" : "",
                  !positive && !negative ? "bg-sky-500/10 text-sky-300" : "",
                ].join(" ")}
              >
                {positive ? <ArrowUpRight className="h-4 w-4" /> : null}
                {negative ? <ArrowDownRight className="h-4 w-4" /> : null}
                {!positive && !negative ? <Dot className="h-4 w-4" /> : null}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">{metric.detail}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
