"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { type CloseHoldingFormValues, closeHoldingSchema } from "@/lib/domain/schemas";
import { applyFieldErrors, readMutationError, withStatus } from "@/lib/client/mutation-feedback";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field-error";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  holdingLotId: string;
  ticker: string;
  maxSellableShares: number;
}

export function CloseHoldingModal({
  open,
  onOpenChange,
  holdingLotId,
  ticker,
  maxSellableShares,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<CloseHoldingFormValues>({
    resolver: zodResolver(closeHoldingSchema),
    defaultValues: {
      quantityToSell: maxSellableShares,
      salePrice: undefined,
      soldAt: new Date(),
      notes: "",
    },
  });

  const submit = form.handleSubmit((values) => {
    if (values.quantityToSell > maxSellableShares) {
      setError("Sell quantity exceeds uncovered shares.");
      form.setError("quantityToSell", { type: "manual", message: "Sell quantity exceeds the uncovered shares in this lot." });
      return;
    }

    startTransition(async () => {
      setError(null);
      form.clearErrors();

      const response = await fetch(`/api/holdings/${holdingLotId}/close`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const message = await readMutationError(response, "Unable to close holding.");
        applyFieldErrors(form.setError, message.fieldErrors);
        setError(message.message);
        return;
      }

      form.reset({
        quantityToSell: maxSellableShares,
        salePrice: undefined,
        soldAt: new Date(),
        notes: "",
      });
      onOpenChange(false);
      router.replace(withStatus(pathname, searchParams, "holding-closed"), { scroll: false });
      router.refresh();
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Close Holding — {ticker}</DialogTitle>
          <DialogDescription>
            Sell some or all uncovered shares in this lot. Max sellable now: {maxSellableShares} shares.
          </DialogDescription>
        </DialogHeader>
        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="close-quantity">Quantity to sell</Label>
            <Input id="close-quantity" type="number" min={1} max={maxSellableShares} {...form.register("quantityToSell")} />
            <FieldError message={form.formState.errors.quantityToSell?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="close-price">Sale price</Label>
            <Input id="close-price" type="number" step="0.01" placeholder={formatCurrency(0)} {...form.register("salePrice")} />
            <FieldError message={form.formState.errors.salePrice?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="close-date">Sold at</Label>
            <Input id="close-date" type="date" {...form.register("soldAt", { valueAsDate: true })} />
            <FieldError message={form.formState.errors.soldAt?.message} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="close-notes">Notes</Label>
            <Textarea id="close-notes" {...form.register("notes")} />
            <FieldError message={form.formState.errors.notes?.message} />
          </div>
          <div className="md:col-span-2 flex items-center justify-between">
            {error ? <FormMessage tone="error">{error}</FormMessage> : <div />}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending || maxSellableShares === 0}>
                Close shares
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
