"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { createTradeSchema, type CreateTradeFormValues } from "@/lib/domain/schemas";
import { applyFieldErrors, readMutationError, withStatus } from "@/lib/client/mutation-feedback";
import { STRATEGY_LABELS, STRATEGY_TYPES, type StrategyTypeValue } from "@/lib/domain/models";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { FieldError } from "@/components/ui/field-error";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const OPTION_STRATEGIES = STRATEGY_TYPES.filter((s) => s !== "STOCK");
const STRATEGY_DETAILS: Record<
  StrategyTypeValue,
  {
    description: string;
    entryLabel: string;
  }
> = {
  WHEEL: {
    description: "Use this for cash-secured put entries that may later assign into stock and continue into covered calls.",
    entryLabel: "Credit received per contract",
  },
  CASH_SECURED_PUT: {
    description: "Short put entry backed by cash collateral. Strike and expiration are required to track exposure correctly.",
    entryLabel: "Credit received per contract",
  },
  COVERED_CALL: {
    description: "Covered calls should usually be opened from a holding lot so the trade can reserve shares automatically.",
    entryLabel: "Credit received per contract",
  },
  SHORT_CALL: {
    description: "Short calls carry naked call exposure unless separately collateralized. Enter strike and expiration carefully.",
    entryLabel: "Credit received per contract",
  },
  SHORT_PUT: {
    description: "Short puts should include strike and expiration so portfolio capacity stays accurate.",
    entryLabel: "Credit received per contract",
  },
  LONG_CALL: {
    description: "Long calls track premium paid and optional exit data. Strike and expiration are required for lifecycle reporting.",
    entryLabel: "Premium paid per contract",
  },
  LONG_PUT: {
    description: "Long puts track premium paid and optional exit data. Strike and expiration are required for lifecycle reporting.",
    entryLabel: "Premium paid per contract",
  },
  STOCK: {
    description: "Stock entries should be created from the holdings workflow instead of the trade form.",
    entryLabel: "Price paid per share",
  },
};

export function TradeEntryWorkbench() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; tone: "error" | "success" } | null>(null);

  const form = useForm<CreateTradeFormValues>({
    resolver: zodResolver(createTradeSchema),
    defaultValues: {
      ticker: "",
      accountLabel: "Main",
      strategy: "WHEEL",
      openedAt: new Date(),
      contracts: 1,
      entryPer: 0,
    },
  });
  const strategy = useWatch({ control: form.control, name: "strategy" }) ?? "WHEEL";
  const expiration = useWatch({ control: form.control, name: "expiration" });
  const openedAt = useWatch({ control: form.control, name: "openedAt" });
  const closedAt = useWatch({ control: form.control, name: "closedAt" });
  const strategyDetails = STRATEGY_DETAILS[strategy];

  const submit = form.handleSubmit((values) => {
    startTransition(async () => {
      setMessage(null);
      form.clearErrors();

      const response = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await readMutationError(response, "Trade entry failed. Check required fields and try again.");
        applyFieldErrors(form.setError, error.fieldErrors);
        setMessage({ text: error.message, tone: "error" });
        return;
      }

      const payload = (await response.json()) as { tradeId: string };
      router.push(withStatus(`/trades/${payload.tradeId}`, new URLSearchParams(), "trade-created"));
      router.refresh();
    });
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log a Trade</CardTitle>
        <CardDescription>
          Enter the opening leg. Optionally fill in the exit fields to record a closed trade in one step.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-5 rounded-2xl border border-white/8 bg-white/[0.02] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Strategy context</p>
          <p className="mt-2 font-medium text-slate-100">{STRATEGY_LABELS[strategy]}</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">{strategyDetails.description}</p>
        </div>
        <form className="grid gap-5 md:grid-cols-2" onSubmit={submit}>
          {/* Row 1 */}
          <div className="space-y-2">
            <Label htmlFor="ticker">Ticker</Label>
            <Input id="ticker" placeholder="AAPL" {...form.register("ticker")} />
            <FieldError message={form.formState.errors.ticker?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountLabel">Account</Label>
            <Input id="accountLabel" {...form.register("accountLabel")} />
            <FieldError message={form.formState.errors.accountLabel?.message} />
          </div>

          {/* Row 2 */}
          <div className="space-y-2">
            <Label>Strategy</Label>
            <Select
              value={strategy}
              onValueChange={(value: StrategyTypeValue) =>
                form.setValue("strategy", value, { shouldDirty: true, shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OPTION_STRATEGIES.map((strategy) => (
                  <SelectItem key={strategy} value={strategy}>
                    {STRATEGY_LABELS[strategy] ?? strategy}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs leading-5 text-slate-500">{strategyDetails.description}</p>
            <FieldError message={form.formState.errors.strategy?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contracts">Contracts</Label>
            <Input id="contracts" type="number" min={1} {...form.register("contracts")} />
            <FieldError message={form.formState.errors.contracts?.message} />
          </div>

          {/* Row 3 */}
          <div className="space-y-2">
            <Label htmlFor="strikePrice">
              Strike <span className="text-xs font-normal text-white/40">(required)</span>
            </Label>
            <Input id="strikePrice" type="number" step="0.01" placeholder="Required" {...form.register("strikePrice")} />
            <FieldError message={form.formState.errors.strikePrice?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="entryPer">{strategyDetails.entryLabel}</Label>
            <Input id="entryPer" type="number" step="0.01" {...form.register("entryPer")} />
            <FieldError message={form.formState.errors.entryPer?.message} />
          </div>

          {/* Row 4 */}
          <div className="space-y-2">
            <Label>
              Expiration <span className="text-xs font-normal text-white/40">(required)</span>
            </Label>
            <DatePicker
              value={expiration ?? undefined}
              onChange={(date) => form.setValue("expiration", date, { shouldValidate: true })}
              placeholder="Required"
            />
            <FieldError message={form.formState.errors.expiration?.message} />
          </div>
          <div className="space-y-2">
            <Label>Opened at</Label>
            <DatePicker
              value={openedAt}
              onChange={(date) => form.setValue("openedAt", date ?? new Date(), { shouldValidate: true })}
            />
            <FieldError message={form.formState.errors.openedAt?.message} />
          </div>

          {/* Row 5 — close fields */}
          <div className="space-y-2">
            <Label htmlFor="exitPer">Exit per contract <span className="text-white/40 text-xs font-normal">(optional)</span></Label>
            <Input id="exitPer" type="number" step="0.01" placeholder="Leave blank if still open" {...form.register("exitPer")} />
            <FieldError message={form.formState.errors.exitPer?.message} />
          </div>
          <div className="space-y-2">
            <Label>Closed at <span className="text-white/40 text-xs font-normal">(optional)</span></Label>
            <DatePicker
              value={closedAt ?? undefined}
              onChange={(date) => form.setValue("closedAt", date, { shouldValidate: true })}
              placeholder="Leave blank if still open"
            />
            <FieldError message={form.formState.errors.closedAt?.message} />
          </div>

          {/* Thesis — full width */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="thesis">Thesis</Label>
            <Textarea id="thesis" placeholder="Setup, entry rules, and risk notes..." {...form.register("thesis")} />
            <FieldError message={form.formState.errors.thesis?.message} />
          </div>

          <div className="md:col-span-2 flex items-center justify-between gap-3">
            {message ? <FormMessage tone={message.tone}>{message.text}</FormMessage> : <div />}
            <Button disabled={pending} type="submit">
              Create trade
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
