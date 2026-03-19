"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ChartCandlestick, History, LayoutDashboard, User, Wallet } from "lucide-react";
import type { Route } from "next";

import { cn } from "@/lib/utils";

const navigation: Array<{ href: Route; label: string; icon: typeof ChartCandlestick }> = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/trades", label: "Trades", icon: ChartCandlestick },
  { href: "/holdings", label: "Holdings", icon: Wallet },
  { href: "/history", label: "History", icon: History },
  { href: "/resources", label: "Resources", icon: BookOpen },
  { href: "/profile", label: "Profile", icon: User },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-8 space-y-1">
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/");

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-150",
              isActive
                ? "bg-sky-500/10 text-white"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200",
            )}
          >
            {isActive && (
              <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-sky-400" />
            )}
            <Icon
              className={cn(
                "h-4 w-4 shrink-0 transition-colors duration-150",
                isActive ? "text-sky-400" : "text-slate-500",
              )}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
