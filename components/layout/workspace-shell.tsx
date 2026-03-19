import type { ReactNode } from "react";
import Link from "next/link";
import { ChartCandlestick, LogOut } from "lucide-react";

import type { AppUser } from "@/lib/domain/types";
import { getTimezoneLabel } from "@/lib/domain/timezones";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarNav } from "@/components/layout/sidebar-nav";

export function WorkspaceShell({
  user,
  children,
}: {
  user: AppUser;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#06080d] text-slate-100">
      <div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[260px_1fr]">
        <aside className="border-b border-white/6 bg-[#080b11] p-6 lg:border-b-0 lg:border-r">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-300">
              <ChartCandlestick className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">TradeTracker</p>
              <p className="text-base font-semibold text-white">Options Journal</p>
            </div>
          </Link>
          <SidebarNav />
          <div className="mt-8 rounded-2xl border border-white/8 bg-[#11161f] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Account</p>
            <p className="mt-3 font-semibold text-slate-50">{user.displayName ?? user.email}</p>
            <p className="text-sm text-slate-500">{user.email}</p>
            <div className="mt-4 flex gap-2">
              <Badge variant="neutral">{user.baseCurrency}</Badge>
              <Badge>{getTimezoneLabel(user.timezone)}</Badge>
            </div>
            <form action="/api/auth/session" method="post" className="mt-5">
              <input type="hidden" name="_method" value="DELETE" />
              <Button type="submit" variant="outline" className="w-full">
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </form>
          </div>
        </aside>
        <div className="flex min-h-screen flex-col">
          <header className="border-b border-white/6 px-6 py-5 lg:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Trading Journal</p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">Options lifecycle tracking without losing the audit trail.</h1>
              </div>
              <div className="flex gap-3">
                <Button asChild variant="secondary">
                  <Link href="/trades/new">Log trade</Link>
                </Button>
                <Button asChild>
                  <Link href="/resources">Study workflows</Link>
                </Button>
              </div>
            </div>
          </header>
          <main className="flex-1 p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
