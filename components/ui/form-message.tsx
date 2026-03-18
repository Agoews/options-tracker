import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function FormMessage({
  tone,
  children,
  className,
}: {
  tone: "error" | "success" | "info";
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-sm",
        tone === "error" && "text-rose-300",
        tone === "success" && "text-emerald-300",
        tone === "info" && "text-slate-300",
        className,
      )}
    >
      {children}
    </p>
  );
}
