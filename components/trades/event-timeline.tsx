import { TradeEventType } from "@prisma/client";

import { formatCurrency, formatDateTime, toNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type EventItem = {
  id: string;
  type: TradeEventType;
  occurredAt: Date;
  premium: unknown;
  realizedPnl: unknown;
  notes: string | null;
};

export function EventTimeline({ events }: { events: EventItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lifecycle Timeline</CardTitle>
        <CardDescription>Every event is preserved as an immutable ledger entry.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {events.map((event) => (
          <div key={event.id} className="flex flex-col gap-3 rounded-xl border border-white/6 bg-white/[0.02] p-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="neutral">{event.type.replaceAll("_", " ")}</Badge>
                <p className="text-sm text-slate-500">{formatDateTime(event.occurredAt)}</p>
              </div>
              {event.notes ? <p className="mt-2 text-sm text-slate-300">{event.notes}</p> : null}
            </div>
            <div className="text-right">
              <p className="font-mono text-sm text-slate-200">{formatCurrency(toNumber(event.premium))}</p>
              <p className={toNumber(event.realizedPnl) >= 0 ? "font-mono text-xs text-emerald-300" : "font-mono text-xs text-rose-300"}>
                {formatCurrency(toNumber(event.realizedPnl))}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
