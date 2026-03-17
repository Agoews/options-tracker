"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const sellCoveredCallSchema = z.object({
  contracts: z.coerce.number().int().min(1).max(100),
  strikePrice: z.coerce.number().positive(),
  entryPer: z.coerce.number().positive(),
  expiration: z.coerce.date(),
  openedAt: z.coerce.date(),
  thesis: z.string().max(500).optional(),
});

type SellCoveredCallFormValues = z.infer<typeof sellCoveredCallSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  holdingLotId: string;
  ticker: string;
  availableShares: number;
}

export function SellCoveredCallModal({ open, onOpenChange, holdingLotId, ticker, availableShares }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SellCoveredCallFormValues>({
    resolver: zodResolver(sellCoveredCallSchema),
    defaultValues: {
      contracts: 1,
      strikePrice: undefined,
      entryPer: undefined,
      expiration: undefined,
      openedAt: new Date(),
      thesis: "",
    },
  });

  const submit = form.handleSubmit((values) => {
    setError(null);

    if (availableShares < values.contracts * 100) {
      setError("Not enough uncovered shares for that many covered call contracts.");
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker,
          strategy: "COVERED_CALL",
          holdingLotId,
          contracts: values.contracts,
          strikePrice: values.strikePrice,
          entryPer: values.entryPer,
          expiration: values.expiration,
          openedAt: values.openedAt,
          thesis: values.thesis,
        }),
      });

      if (!response.ok) {
        setError("Failed to create covered call trade.");
        return;
      }

      form.reset();
      onOpenChange(false);
      router.refresh();
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sell Covered Call — {ticker}</DialogTitle>
          <DialogDescription>
            Write a covered call against your {ticker} shares. The position will be linked to this holding lot.
          </DialogDescription>
        </DialogHeader>

        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={submit}>
          <div className="space-y-2">
            <Label>Ticker</Label>
            <Input value={ticker} readOnly className="opacity-60" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cc-contracts">Contracts</Label>
            <Input id="cc-contracts" type="number" min={1} {...form.register("contracts")} />
            {form.formState.errors.contracts && (
              <p className="text-xs text-rose-400">{form.formState.errors.contracts.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cc-strike">Strike Price</Label>
            <Input id="cc-strike" type="number" step="0.01" {...form.register("strikePrice")} />
            {form.formState.errors.strikePrice && (
              <p className="text-xs text-rose-400">{form.formState.errors.strikePrice.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cc-entry">Premium / Contract</Label>
            <Input id="cc-entry" type="number" step="0.01" {...form.register("entryPer")} />
            {form.formState.errors.entryPer && (
              <p className="text-xs text-rose-400">{form.formState.errors.entryPer.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cc-expiration">Expiration</Label>
            <Input id="cc-expiration" type="date" {...form.register("expiration", { valueAsDate: true })} />
            {form.formState.errors.expiration && (
              <p className="text-xs text-rose-400">{form.formState.errors.expiration.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cc-openedAt">Opened At</Label>
            <Input id="cc-openedAt" type="date" {...form.register("openedAt", { valueAsDate: true })} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="cc-thesis">Thesis</Label>
            <Textarea id="cc-thesis" {...form.register("thesis")} />
          </div>

          <div className="md:col-span-2 flex items-center justify-between">
            {error ? <p className="text-sm text-rose-400">{error}</p> : <div />}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending || availableShares < 100}>
                Sell Covered Call
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
