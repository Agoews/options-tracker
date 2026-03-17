"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TradeEventType } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Plus } from "lucide-react";

import { appendTradeEventSchema, type AppendTradeEventFormValues } from "@/lib/domain/schemas";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const eventPresets = [
  TradeEventType.ASSIGNMENT,
  TradeEventType.ROLL,
  TradeEventType.PARTIAL_CLOSE,
  TradeEventType.REOPEN,
  TradeEventType.BUY_TO_CLOSE,
  TradeEventType.SELL_TO_CLOSE,
  TradeEventType.STOCK_SELL,
];

export function TradeLifecyclePanel({ tradeId }: { tradeId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const form = useForm<AppendTradeEventFormValues>({
    resolver: zodResolver(appendTradeEventSchema),
    defaultValues: {
      type: TradeEventType.ROLL,
      occurredAt: new Date(),
      premium: 0,
      fees: 0,
    },
  });

  const submit = form.handleSubmit((values) => {
    startTransition(async () => {
      const response = await fetch(`/api/trades/${tradeId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        setMessage("Unable to append lifecycle event.");
        return;
      }

      setOpen(false);
      form.reset();
      setMessage(null);
      router.refresh();
    });
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Add event
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Append Lifecycle Event</DialogTitle>
          <DialogDescription>
            Record an assignment, roll, partial close, or exit without mutating earlier history.
          </DialogDescription>
        </DialogHeader>
        <form className="mt-2 grid gap-4 md:grid-cols-2" onSubmit={submit}>
          <div className="space-y-2">
            <Label>Event type</Label>
            <Select
              defaultValue={TradeEventType.ROLL}
              onValueChange={(value: TradeEventType) => form.setValue("type", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {eventPresets.map((eventType) => (
                  <SelectItem key={eventType} value={eventType}>
                    {eventType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="occurredAt">Occurred at</Label>
            <Input id="occurredAt" type="datetime-local" {...form.register("occurredAt", { valueAsDate: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contractsDelta">Contracts delta</Label>
            <Input id="contractsDelta" type="number" {...form.register("contractsDelta")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sharesDelta">Shares delta</Label>
            <Input id="sharesDelta" type="number" {...form.register("sharesDelta")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="strikePrice">Strike</Label>
            <Input id="strikePrice" type="number" step="0.01" {...form.register("strikePrice")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="premium">Premium / Net credit</Label>
            <Input id="premium" type="number" step="0.01" {...form.register("premium")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="realizedPnl">Realized P&L</Label>
            <Input id="realizedPnl" type="number" step="0.01" {...form.register("realizedPnl")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sharePrice">Share price</Label>
            <Input id="sharePrice" type="number" step="0.01" {...form.register("sharePrice")} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...form.register("notes")} />
          </div>
          <div className="md:col-span-2 flex items-center justify-between gap-3">
            {message ? <p className="text-sm text-rose-300">{message}</p> : <div />}
            <div className="flex gap-3">
              <DialogClose asChild>
                <Button type="button" variant="ghost">Cancel</Button>
              </DialogClose>
              <Button disabled={pending} type="submit">Append event</Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
