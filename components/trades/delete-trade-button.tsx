"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DeleteTradeButton({ tradeId }: { tradeId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 w-9 px-0" title="Delete trade">
          <Trash2 className="h-4 w-4 text-slate-500" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete trade?</DialogTitle>
          <DialogDescription>
            This will permanently remove the trade and all its events. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex justify-end gap-3">
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button
            variant="danger"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await fetch(`/api/trades/${tradeId}`, { method: "DELETE" });
                router.push("/trades");
                router.refresh();
              })
            }
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
