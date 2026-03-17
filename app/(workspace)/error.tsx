"use client";

import { Button } from "@/components/ui/button";

export default function WorkspaceError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6">
      <h2 className="text-xl font-semibold text-white">Workspace load failed</h2>
      <p className="mt-2 text-sm text-slate-400">Check your database and Firebase configuration, then retry.</p>
      <Button className="mt-4" variant="danger" onClick={reset}>
        Retry
      </Button>
    </div>
  );
}
