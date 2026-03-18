"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { readMutationError, withStatus } from "@/lib/client/mutation-feedback";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  holdingLotId: string;
  ticker: string;
  archivedAt: Date | null;
  status: "OPEN" | "CLOSED";
}

export function DeleteHoldingDialog({ open, onOpenChange, holdingLotId, ticker, archivedAt, status }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState("");

  function handleArchive(archived: boolean) {
    startTransition(async () => {
      setError(null);

      const response = await fetch(`/api/holdings/${holdingLotId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived }),
      });

      if (!response.ok) {
        const message = await readMutationError(response, "Unable to update holding archive state.");
        setError(message.message);
        return;
      }

      onOpenChange(false);
      router.replace(withStatus(pathname, searchParams, archived ? "holding-archived" : "holding-restored"), {
        scroll: false,
      });
      router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      setError(null);

      const response = await fetch(`/api/holdings/${holdingLotId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmText }),
      });

      if (!response.ok) {
        const message = await readMutationError(response, "Unable to delete holding.");
        setError(message.message);
        return;
      }

      onOpenChange(false);
      router.push(withStatus("/holdings", new URLSearchParams(), "holding-deleted"));
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{archivedAt ? "Restore or delete holding" : `Archive or delete ${ticker}`}</DialogTitle>
          <DialogDescription>
            Archive hides resolved lots from normal views while preserving basis history. Permanent delete is only for accidental entries.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          {status !== "CLOSED" && !archivedAt ? (
            <p className="text-sm text-slate-400">Open holdings cannot be archived. Close the remaining uncovered shares first, or hard-delete only if this was an accidental entry.</p>
          ) : null}
          {status === "CLOSED" || archivedAt ? (
            <div className="flex justify-start">
              <Button type="button" variant="outline" disabled={pending} onClick={() => handleArchive(!archivedAt)}>
                {archivedAt ? "Restore holding" : "Archive holding"}
              </Button>
            </div>
          ) : null}
          <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
            <div className="space-y-2">
              <Label htmlFor="holding-delete-confirm">Type DELETE to permanently remove this holding</Label>
              <Input
                id="holding-delete-confirm"
                value={confirmText}
                onChange={(event) => setConfirmText(event.target.value)}
                placeholder="DELETE"
              />
            </div>
            <div className="mt-3 flex justify-end">
              <Button type="button" variant="danger" disabled={pending || confirmText !== "DELETE"} onClick={handleDelete}>
                Delete permanently
              </Button>
            </div>
          </div>
          {error ? <FormMessage tone="error">{error}</FormMessage> : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
