"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { readMutationError } from "@/lib/client/mutation-feedback";
import type { FundingRow, PortfolioCapacitySnapshot } from "@/lib/domain/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { FieldError } from "@/components/ui/field-error";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function PortfolioCapitalPanel({
  capacity,
  funding,
}: {
  capacity: PortfolioCapacitySnapshot;
  funding: FundingRow[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; tone: "error" | "success" } | null>(null);
  const [baselineErrors, setBaselineErrors] = useState<Record<string, string>>({});
  const [fundingErrors, setFundingErrors] = useState<Record<string, string>>({});
  const [baselineValue, setBaselineValue] = useState(capacity.baselineValue.toString());
  const [baselineAt, setBaselineAt] = useState<Date | undefined>(capacity.baselineAt ?? new Date());
  const [fundAmount, setFundAmount] = useState("");
  const [fundDate, setFundDate] = useState<Date | undefined>(new Date());
  const [fundNotes, setFundNotes] = useState("");

  function saveBaseline() {
    startTransition(async () => {
      setMessage(null);
      setBaselineErrors({});
      const response = await fetch("/api/portfolio", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          portfolioBaselineValue: baselineValue,
          portfolioBaselineAt: baselineAt,
        }),
      });

      if (!response.ok) {
        const error = await readMutationError(response, "Unable to update portfolio baseline.");
        setBaselineErrors(error.fieldErrors);
        setMessage({ text: error.message, tone: "error" });
        return;
      }

      setMessage({ text: "Portfolio baseline updated.", tone: "success" });
      router.refresh();
    });
  }

  function addFunds() {
    startTransition(async () => {
      setMessage(null);
      setFundingErrors({});
      const response = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: fundAmount,
          occurredAt: fundDate,
          notes: fundNotes || undefined,
        }),
      });

      if (!response.ok) {
        const error = await readMutationError(response, "Unable to add funds.");
        setFundingErrors(error.fieldErrors);
        setMessage({ text: error.message, tone: "error" });
        return;
      }

      setFundAmount("");
      setFundDate(new Date());
      setFundNotes("");
      setMessage({ text: "Funds added.", tone: "success" });
      router.refresh();
    });
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Portfolio Capital</CardTitle>
        <CardDescription>
          Set the tracked portfolio value, record added funds, and keep open asset exposure below the portfolio value.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {capacity.overAllocated ? (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
            Open assets are above the tracked portfolio value by {formatCurrency(Math.abs(capacity.availableCapacity))}. Close older positions or add funds before opening anything new.
          </div>
        ) : (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            Available capacity: {formatCurrency(capacity.availableCapacity)} after accounting for current open assets.
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Open Assets</p>
            <p className="mt-2 font-mono text-xl text-slate-50">{formatCurrency(capacity.openAssetValue)}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Added Funds</p>
            <p className="mt-2 font-mono text-xl text-slate-50">{formatCurrency(capacity.contributedFunds)}</p>
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
          <p className="text-sm font-semibold text-slate-50">Set portfolio value</p>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="portfolio-baseline-value">Tracked portfolio value</Label>
              <Input
                id="portfolio-baseline-value"
                type="number"
                step="0.01"
                value={baselineValue}
                onChange={(event) => setBaselineValue(event.target.value)}
              />
              <FieldError message={baselineErrors.portfolioBaselineValue} />
            </div>
            <div className="space-y-2">
              <Label>As of</Label>
              <DatePicker value={baselineAt} onChange={setBaselineAt} />
              <FieldError message={baselineErrors.portfolioBaselineAt} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button disabled={pending || !baselineAt} onClick={saveBaseline}>
              Save portfolio value
            </Button>
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
          <p className="text-sm font-semibold text-slate-50">Add funds</p>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fund-amount">Amount</Label>
              <Input id="fund-amount" type="number" step="0.01" value={fundAmount} onChange={(event) => setFundAmount(event.target.value)} />
              <FieldError message={fundingErrors.amount} />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <DatePicker value={fundDate} onChange={setFundDate} />
              <FieldError message={fundingErrors.occurredAt} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fund-notes">Notes</Label>
            <Textarea id="fund-notes" value={fundNotes} onChange={(event) => setFundNotes(event.target.value)} />
            <FieldError message={fundingErrors.notes} />
          </div>
          <div className="flex justify-end">
            <Button disabled={pending || !fundDate || !fundAmount} onClick={addFunds}>
              Add funds
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-slate-50">Recent funding</p>
            <p className="text-sm text-slate-400">Most recent deposits added to tracked capital.</p>
          </div>
          {!funding.length ? (
            <p className="text-sm text-slate-400">No funding entries recorded.</p>
          ) : (
            funding
              .slice()
              .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
              .slice(0, 5)
              .map((entry) => (
                <div key={entry.id} className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <div>
                    <p className="font-mono text-sm text-slate-50">{formatCurrency(entry.amount)}</p>
                    <p className="text-xs text-slate-500">{formatDate(entry.occurredAt)}</p>
                    {entry.notes ? <p className="mt-1 text-sm text-slate-400">{entry.notes}</p> : null}
                  </div>
                </div>
              ))
          )}
        </div>

        {message ? <FormMessage tone={message.tone}>{message.text}</FormMessage> : null}
      </CardContent>
    </Card>
  );
}
