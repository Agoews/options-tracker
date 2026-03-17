import Link from "next/link";
import { ArrowRight, BookOpen, ChartCandlestick, ShieldCheck } from "lucide-react";

import { ResourceGrid } from "@/components/resources/resource-grid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "Wheel lifecycle tracking",
    description: "Capture short puts, assignment, covered calls, rolls, partial closes, reopenings, and exits as immutable trade events.",
    icon: ChartCandlestick,
  },
  {
    title: "Portfolio-grade analytics",
    description: "Premium collected, realized and unrealized P&L, assignment-adjusted basis, and strategy returns stay visible at every step.",
    icon: ShieldCheck,
  },
  {
    title: "Practical strategy education",
    description: "Pair the journal with concise workflow guides for wheel trades, covered calls, and standalone calls or puts.",
    icon: BookOpen,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-white/6">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">TradeTracker</p>
            <p className="text-lg font-semibold text-white">Options Journal</p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="ghost">
              <Link href="/resources">Resources</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </div>
        </div>
      </header>
      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
        <div className="space-y-6">
          <p className="text-sm uppercase tracking-[0.22em] text-sky-300">Production-ready trade journaling</p>
          <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-white lg:text-6xl">
            Journal the entire options lifecycle without flattening it into a spreadsheet.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-400">
            TradeTracker is built for retail options traders managing wheels, standalone calls and puts, stock holdings, and assignment-driven basis changes in one audit-friendly workspace.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/sign-in">
                Open workspace
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/resources">Review strategy guides</Link>
            </Button>
          </div>
        </div>
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>What ships in this scaffold</CardTitle>
            <CardDescription>Typed auth, normalized trade history, portfolio summaries, structured entry flows, and testable server boundaries.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div key={feature.title} className="rounded-2xl border border-white/6 bg-white/[0.02] p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-sky-500/10 p-2 text-sky-300">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h2 className="font-semibold text-slate-50">{feature.title}</h2>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{feature.description}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Resources</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Strategy workflows</h2>
          </div>
        </div>
        <ResourceGrid />
      </section>
    </main>
  );
}
