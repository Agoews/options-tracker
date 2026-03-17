import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ResourceGrid } from "@/components/resources/resource-grid";

export default function ResourcesPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-16">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">TradeTracker Resources</p>
          <h1 className="mt-3 text-4xl font-semibold text-white">Options strategy workflows</h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-400">Use these pages to standardize how you log wheel trades, covered calls, short puts, and standalone directional options.</p>
        </div>
        <Button asChild variant="secondary">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
      <div className="mt-10">
        <ResourceGrid />
      </div>
    </main>
  );
}
