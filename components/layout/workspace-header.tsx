"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";

type PageMeta = {
  eyebrow: string;
  title: string;
  actions?: React.ReactNode;
};

function resolvePageMeta(pathname: string): PageMeta {
  if (pathname === "/dashboard") {
    return {
      eyebrow: "Overview",
      title: "Dashboard",
      actions: (
        <>
          <Button asChild variant="secondary">
            <Link href="/trades/new">Log trade</Link>
          </Button>
          <Button asChild>
            <Link href="/resources">Study workflows</Link>
          </Button>
        </>
      ),
    };
  }

  if (pathname === "/trades/new") {
    return {
      eyebrow: "New Entry",
      title: "Log a Trade",
    };
  }

  if (pathname === "/trades" || pathname.startsWith("/trades/")) {
    // Detail page: /trades/[id]
    if (pathname !== "/trades") {
      return {
        eyebrow: "Trade Detail",
        title: "Position Review",
      };
    }
    return {
      eyebrow: "Positions",
      title: "Trade Log",
      actions: (
        <Button asChild>
          <Link href="/trades/new">Log trade</Link>
        </Button>
      ),
    };
  }

  if (pathname === "/holdings") {
    return {
      eyebrow: "Portfolio",
      title: "Holdings",
    };
  }

  if (pathname === "/history") {
    return {
      eyebrow: "Audit Trail",
      title: "Activity History",
    };
  }

  if (pathname === "/resources") {
    return {
      eyebrow: "Learning",
      title: "Strategy Resources",
    };
  }

  if (pathname === "/profile") {
    return {
      eyebrow: "Settings",
      title: "Your Profile",
    };
  }

  if (pathname === "/onboarding") {
    return {
      eyebrow: "Getting Started",
      title: "Set Up Your Journal",
    };
  }

  return {
    eyebrow: "Trading Journal",
    title: "Options Journal",
  };
}

export function WorkspaceHeader() {
  const pathname = usePathname();
  const { eyebrow, title, actions } = resolvePageMeta(pathname);

  return (
    <header className="border-b border-white/6 px-6 py-5 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{eyebrow}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">{title}</h1>
        </div>
        {actions && <div className="flex gap-3">{actions}</div>}
      </div>
    </header>
  );
}
