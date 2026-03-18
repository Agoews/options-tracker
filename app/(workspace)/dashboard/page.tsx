import { redirect } from "next/navigation";

import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { PerformanceChart } from "@/components/charts/performance-chart";
import { StrategyChart } from "@/components/charts/strategy-chart";
import { EmptyState } from "@/components/ui/empty-state";
import { requireAppUser } from "@/lib/server/auth-user";
import { getDashboardSnapshot } from "@/lib/server/queries";

export default async function DashboardPage() {
  const user = await requireAppUser();
  const snapshot = await getDashboardSnapshot(user.id);

  if (!user.onboardingComplete) {
    redirect("/onboarding");
  }

  const hasTradeData = snapshot.trades.length > 0 || snapshot.holdings.length > 0;

  return (
    <div className="space-y-6">
      <SummaryCards metrics={snapshot.metrics} />
      <PerformanceChart data={snapshot.performance} />
      {hasTradeData ? (
        <>
          <StrategyChart data={snapshot.strategies} />
          <ActivityFeed items={snapshot.activity} />
        </>
      ) : (
        <EmptyState
          title="No trade data yet"
          description="Set your tracked portfolio value, add funds if needed, and log the first position when you are ready."
          actionHref="/trades/new"
          actionLabel="Log first trade"
        />
      )}
    </div>
  );
}
