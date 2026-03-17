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

  if (!snapshot.trades.length && !snapshot.holdings.length) {
    return (
      <EmptyState
        title="No trade data yet"
        description="Start with a wheel trade, a standalone option, or an existing holding to populate the dashboard."
        actionHref="/trades/new"
        actionLabel="Log first trade"
      />
    );
  }

  if (!user.onboardingComplete) {
    redirect("/onboarding");
  }

  return (
    <div className="space-y-6">
      <SummaryCards metrics={snapshot.metrics} />
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <PerformanceChart data={snapshot.performance} />
        <StrategyChart data={snapshot.strategies} />
      </div>
      <ActivityFeed items={snapshot.activity} />
    </div>
  );
}
