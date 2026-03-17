import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { EmptyState } from "@/components/ui/empty-state";
import { requireAppUser } from "@/lib/server/auth-user";
import { getDashboardSnapshot } from "@/lib/server/queries";

export default async function HistoryPage() {
  const user = await requireAppUser();
  const snapshot = await getDashboardSnapshot(user.id);

  if (!snapshot.activity.length) {
    return (
      <EmptyState
        title="No historical activity"
        description="Lifecycle events will appear here once trades are logged."
        actionHref="/trades/new"
        actionLabel="Create trade"
      />
    );
  }

  return <ActivityFeed items={snapshot.activity} />;
}
