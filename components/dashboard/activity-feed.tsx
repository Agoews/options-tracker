import Link from "next/link";

import type { ActivityItem } from "@/lib/domain/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Append-only lifecycle events across trades, rolls, assignments, and exits.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/trades/${item.tradeId}`}
            className="flex items-start justify-between gap-4 rounded-xl border border-white/6 bg-white/[0.02] px-4 py-3"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm font-semibold text-slate-50">{item.ticker}</p>
                <Badge variant="neutral">{item.type.replaceAll("_", " ")}</Badge>
              </div>
              <p className="mt-1 text-xs text-slate-500">{formatDateTime(item.occurredAt)}</p>
              {item.notes ? <p className="mt-2 text-sm text-slate-400">{item.notes}</p> : null}
            </div>
            <div className="text-right">
              <p className="font-mono text-sm text-slate-200">{formatCurrency(item.premium)}</p>
              <p className={item.realizedPnl >= 0 ? "font-mono text-xs text-emerald-300" : "font-mono text-xs text-rose-300"}>
                {formatCurrency(item.realizedPnl)}
              </p>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
