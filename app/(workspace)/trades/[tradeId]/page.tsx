import { notFound } from "next/navigation";

import { DeleteTradeButton } from "@/components/trades/delete-trade-button";
import { EventTimeline } from "@/components/trades/event-timeline";
import { StatusBadge } from "@/components/trades/status-badge";
import { TradeLifecyclePanel } from "@/components/trades/trade-lifecycle-panel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageStatusBanner } from "@/components/ui/page-status-banner";
import { requireAppUser } from "@/lib/server/auth-user";
import { getTradeDetail } from "@/lib/server/queries";
import { formatCurrency, formatDate, toNumber } from "@/lib/utils";

export default async function TradeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ tradeId: string }>;
  searchParams?: Promise<{ status?: string }>;
}) {
  const user = await requireAppUser();
  const { tradeId } = await params;
  const trade = await getTradeDetail(user.id, tradeId);
  const query = searchParams ? await searchParams : undefined;

  if (!trade) {
    notFound();
  }

  const currentOptionLeg = trade.events.find(
    (event: (typeof trade.events)[number]) => event.optionType && event.contractsDelta,
  );

  return (
    <div className="space-y-6">
      <PageStatusBanner status={query?.status ?? null} />
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-sm uppercase tracking-[0.18em] text-slate-500">{trade.ticker}</p>
                  <CardTitle className="mt-2 text-3xl">{trade.strategy}</CardTitle>
                  <CardDescription className="mt-2">Opened {formatDate(trade.openedAt)} with {trade.events.length} recorded events.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={trade.status} />
                  <TradeLifecyclePanel
                    tradeId={trade.id}
                    archivedAt={trade.archivedAt}
                    strategy={trade.strategy}
                    optionType={trade.optionType}
                    openContractCount={trade.openContractCount}
                    linkedHoldingLotId={trade.holdingLotId}
                    defaultStrikePrice={currentOptionLeg ? toNumber(currentOptionLeg.strikePrice) : null}
                    defaultExpiration={currentOptionLeg?.expiration ? currentOptionLeg.expiration.toISOString().slice(0, 10) : null}
                    rollCandidates={trade.events
                      .filter((event) => event.optionType)
                      .map((event) => ({
                        id: event.id,
                        label: `${event.type.replaceAll("_", " ")} · ${formatDate(event.occurredAt)}`,
                      }))}
                  />
                  <DeleteTradeButton tradeId={trade.id} archivedAt={trade.archivedAt} status={trade.status} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-white/6 bg-white/[0.02] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Premium Collected</p>
                <p className="mt-2 font-mono text-2xl text-slate-50">{formatCurrency(toNumber(trade.premiumCollected))}</p>
              </div>
              <div className="rounded-xl border border-white/6 bg-white/[0.02] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Realized P&L</p>
                <p className={toNumber(trade.realizedPnl) >= 0 ? "mt-2 font-mono text-2xl text-emerald-300" : "mt-2 font-mono text-2xl text-rose-300"}>
                  {formatCurrency(toNumber(trade.realizedPnl))}
                </p>
              </div>
              <div className="rounded-xl border border-white/6 bg-white/[0.02] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Open Contracts</p>
                <p className="mt-2 font-mono text-2xl text-slate-50">{trade.openContractCount}</p>
              </div>
              <div className="rounded-xl border border-white/6 bg-white/[0.02] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Share Exposure</p>
                <p className="mt-2 font-mono text-2xl text-slate-50">{trade.shareExposure}</p>
              </div>
              <div className="rounded-xl border border-white/6 bg-white/[0.02] p-4 sm:col-span-2">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Linked Holding</p>
                <p className="mt-2 text-sm text-slate-300">
                  {trade.holdingLot ? `${trade.holdingLot.ticker} lot with ${trade.holdingLot.remainingQuantity} shares remaining.` : "No linked holding lot."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        <EventTimeline events={trade.events} />
      </div>
    </div>
  );
}
