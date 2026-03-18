"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Archive, Trash2 } from "lucide-react";

import { readMutationError, withStatus } from "@/lib/client/mutation-feedback";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DeleteTradeButton({
  tradeId,
  archivedAt,
  status,
}: {
  tradeId: string;
  archivedAt: Date | null;
  status: "OPEN" | "PARTIAL" | "ASSIGNED" | "CLOSED";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [confirmText, setConfirmText] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function archiveTrade(archived: boolean) {
    startTransition(async () => {
      setMessage(null);
      const response = await fetch(`/api/trades/${tradeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived }),
      });

      if (!response.ok) {
        const error = await readMutationError(response, "Unable to update trade archive state.");
        setMessage(error.message);
        return;
      }

      setOpen(false);
      router.replace(withStatus(pathname, searchParams, archived ? "trade-archived" : "trade-restored"), { scroll: false });
      router.refresh();
    });
  }

  async function hardDeleteTrade() {
    startTransition(async () => {
      setMessage(null);
      const response = await fetch(`/api/trades/${tradeId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmText }),
      });

      if (!response.ok) {
        const error = await readMutationError(response, "Unable to delete trade.");
        setMessage(error.message);
        return;
      }

      setOpen(false);
      router.push(withStatus("/trades", new URLSearchParams(), "trade-deleted"));
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 w-9 px-0" title="Trade actions">
          {archivedAt ? <Archive className="h-4 w-4 text-amber-400" /> : <Trash2 className="h-4 w-4 text-slate-500" />}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{archivedAt ? "Restore or delete trade" : "Archive or delete trade"}</DialogTitle>
          <DialogDescription>
            Archive removes resolved trades from normal views but keeps their history. Hard delete is only for accidental entries.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {status !== "CLOSED" && !archivedAt ? (
            <p className="text-sm text-slate-400">Open trades cannot be archived. Close the position first, or hard-delete only if this was an accidental entry.</p>
          ) : null}
          {status === "CLOSED" || archivedAt ? (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled={pending} onClick={() => void archiveTrade(!archivedAt)}>
                {archivedAt ? "Restore trade" : "Archive trade"}
              </Button>
            </div>
          ) : null}

          <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
            <div className="space-y-2">
              <Label htmlFor="trade-delete-confirm">Type DELETE to permanently remove this trade</Label>
              <Input
                id="trade-delete-confirm"
                value={confirmText}
                onChange={(event) => setConfirmText(event.target.value)}
                placeholder="DELETE"
              />
            </div>
            <div className="mt-3 flex justify-end">
              <Button
                variant="danger"
                disabled={pending || confirmText !== "DELETE"}
                onClick={() => void hardDeleteTrade()}
              >
                Delete permanently
              </Button>
            </div>
          </div>

          {message ? <FormMessage tone="error">{message}</FormMessage> : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
