import { EmptyState } from "@/components/ui/empty-state";
import { PageStatusBanner } from "@/components/ui/page-status-banner";
import { HoldingsTable } from "@/components/holdings/holdings-table";
import { requireAppUser } from "@/lib/server/auth-user";
import { getDashboardSnapshot } from "@/lib/server/queries";

export default async function HoldingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>;
}) {
  const user = await requireAppUser();
  const snapshot = await getDashboardSnapshot(user.id, { includeArchived: true });
  const params = searchParams ? await searchParams : undefined;

  if (!snapshot.holdings.length) {
    return (
      <div className="space-y-6">
        <PageStatusBanner status={params?.status ?? null} />
        <EmptyState
          title="No holdings recorded"
          description="Add an existing stock lot or log an assignment to start basis tracking."
          actionHref="/trades/new"
          actionLabel="Add holding"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageStatusBanner status={params?.status ?? null} />
      <HoldingsTable data={snapshot.holdings} />
    </div>
  );
}
