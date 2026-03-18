"use client";

import type { Route } from "next";
import { X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { getPageStatus } from "@/lib/domain/page-status";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const toneClasses = {
  success: "border-emerald-500/25 bg-emerald-500/10 text-emerald-100",
  info: "border-sky-500/25 bg-sky-500/10 text-sky-100",
  error: "border-rose-500/25 bg-rose-500/10 text-rose-100",
} as const;

export function PageStatusBanner({ status }: { status: string | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const config = getPageStatus(status);

  if (!config) {
    return null;
  }

  function dismiss() {
    const next = new URLSearchParams(searchParams.toString());
    next.delete("status");
    const query = next.toString();
    router.replace((query ? `${pathname}?${query}` : pathname) as Route, { scroll: false });
  }

  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 rounded-2xl border p-4",
        toneClasses[config.tone as keyof typeof toneClasses],
      )}
      >
      <div>
        <p className="text-sm font-semibold">{config.title}</p>
        <p className="mt-1 text-sm opacity-80">{config.description}</p>
      </div>
      <Button type="button" variant="ghost" size="sm" className="h-8 w-8 px-0" onClick={dismiss}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
