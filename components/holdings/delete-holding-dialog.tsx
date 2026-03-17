"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  holdingLotId: string;
  ticker: string;
}

export function DeleteHoldingDialog({ open, onOpenChange, holdingLotId, ticker }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    startTransition(async () => {
      setError(null);

      const response = await fetch(`/api/holdings/${holdingLotId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setError("Unable to delete holding.");
        return;
      }

      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Holding — {ticker}</DialogTitle>
          <DialogDescription>
            Delete removes this lot from holdings views but keeps linked trade history and events.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex items-center justify-between gap-3">
          {error ? <p className="text-sm text-rose-400">{error}</p> : <div />}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" variant="danger" disabled={pending} onClick={handleDelete}>
              Delete holding
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
