import { EmptyState } from "@/components/ui/empty-state";
import { HoldingsTable } from "@/components/holdings/holdings-table";
import { requireAppUser } from "@/lib/server/auth-user";
import { getDashboardSnapshot } from "@/lib/server/queries";

export default async function HoldingsPage() {
  const user = await requireAppUser();
  const snapshot = await getDashboardSnapshot(user.id);

  if (!snapshot.holdings.length) {
    return (
      <EmptyState
        title="No holdings recorded"
        description="Add an existing stock lot or log an assignment to start basis tracking."
        actionHref="/trades/new"
        actionLabel="Add holding"
      />
    );
  }

  return <HoldingsTable data={snapshot.holdings} />;
}
