import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-sm uppercase tracking-[0.2em] text-slate-500">404</p>
      <h1 className="mt-3 text-4xl font-semibold text-white">Route not found</h1>
      <p className="mt-3 max-w-md text-slate-400">The requested page does not exist in this TradeTracker workspace.</p>
      <Button asChild className="mt-6">
        <Link href="/">Back to home</Link>
      </Button>
    </main>
  );
}
