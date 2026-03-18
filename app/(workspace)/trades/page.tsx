import { EmptyState } from "@/components/ui/empty-state";
import { PageStatusBanner } from "@/components/ui/page-status-banner";
import { TradesTable } from "@/components/trades/trades-table";
import { requireAppUser } from "@/lib/server/auth-user";
import { getDashboardSnapshot } from "@/lib/server/queries";

export default async function TradesPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>;
}) {
  const user = await requireAppUser();
  const snapshot = await getDashboardSnapshot(user.id, { includeArchived: true });
  const params = searchParams ? await searchParams : undefined;

  if (!snapshot.trades.length) {
    return (
      <div className="space-y-6">
        <PageStatusBanner status={params?.status ?? null} />
        <EmptyState
          title="No trades logged"
          description="Create the first trade and TradeTracker will start preserving lifecycle events from entry through final exit."
          actionHref="/trades/new"
          actionLabel="Create trade"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageStatusBanner status={params?.status ?? null} />
      <TradesTable data={snapshot.trades} />
    </div>
  );
}
