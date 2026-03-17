"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { createHoldingSchema, type CreateHoldingFormValues } from "@/lib/domain/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function HoldingEntryForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const form = useForm<CreateHoldingFormValues>({
    resolver: zodResolver(createHoldingSchema),
    defaultValues: {
      ticker: "",
      quantity: 100,
      costBasisPerShare: 0,
      openedAt: new Date(),
    },
  });

  const submit = form.handleSubmit((values) => {
    startTransition(async () => {
      const response = await fetch("/api/holdings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        setMessage("Unable to add holding.");
        return;
      }

      setMessage("Holding recorded.");
      router.refresh();
    });
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manual Holding Entry</CardTitle>
        <CardDescription>Capture existing stock lots so covered calls, assigned positions, and sold holdings stay tied to basis history.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="holding-ticker">Ticker</Label>
            <Input id="holding-ticker" {...form.register("ticker")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="holding-quantity">Quantity</Label>
            <Input id="holding-quantity" type="number" {...form.register("quantity")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cost-basis">Cost basis / share</Label>
            <Input id="cost-basis" type="number" step="0.01" {...form.register("costBasisPerShare")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="holding-openedAt">Opened at</Label>
            <Input id="holding-openedAt" type="date" {...form.register("openedAt", { valueAsDate: true })} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="holding-notes">Notes</Label>
            <Textarea id="holding-notes" {...form.register("notes")} />
          </div>
          <div className="md:col-span-2 flex items-center justify-between">
            {message ? <p className="text-sm text-slate-400">{message}</p> : <div />}
            <Button disabled={pending} type="submit">
              Save holding
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
