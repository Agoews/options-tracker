import { EmptyState } from "@/components/ui/empty-state";
import { TradesTable } from "@/components/trades/trades-table";
import { requireAppUser } from "@/lib/server/auth-user";
import { getDashboardSnapshot } from "@/lib/server/queries";

export default async function TradesPage() {
  const user = await requireAppUser();
  const snapshot = await getDashboardSnapshot(user.id);

  if (!snapshot.trades.length) {
    return (
      <EmptyState
        title="No trades logged"
        description="Create the first trade and TradeTracker will start preserving lifecycle events from entry through final exit."
        actionHref="/trades/new"
        actionLabel="Create trade"
      />
    );
  }

  return <TradesTable data={snapshot.trades} />;
}
