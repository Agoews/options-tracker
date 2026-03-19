"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { readMutationError } from "@/lib/client/mutation-feedback";
import type { FundingRow, PortfolioCapacitySnapshot } from "@/lib/domain/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field-error";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const [capitalErrors, setCapitalErrors] = useState<Record<string, string>>({});
  const [adjustmentErrors, setAdjustmentErrors] = useState<Record<string, string>>({});
  const [trackedCapital, setTrackedCapital] = useState(capacity.fundedCapital.toString());
  const [adjustmentAmount, setAdjustmentAmount] = useState("");

  const parsedAdjustmentAmount = Number(adjustmentAmount);
  const hasValidAdjustmentAmount =
    adjustmentAmount.trim().length > 0 &&
    Number.isFinite(parsedAdjustmentAmount) &&
    parsedAdjustmentAmount > 0;

  function saveTrackedCapital() {
    startTransition(async () => {
      setMessage(null);
      setCapitalErrors({});
      const response = await fetch("/api/portfolio", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackedCapital,
        }),
      });

      if (!response.ok) {
        const error = await readMutationError(response, "Unable to update tracked capital.");
        setCapitalErrors(error.fieldErrors);
        setMessage({ text: error.message, tone: "error" });
        return;
      }

      setMessage({ text: "Tracked capital updated.", tone: "success" });
      router.refresh();
    });
  }

  function submitAdjustment(direction: "deposit" | "withdrawal") {
    startTransition(async () => {
      setMessage(null);
      setAdjustmentErrors({});
      const response = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: direction === "deposit" ? parsedAdjustmentAmount : -parsedAdjustmentAmount,
        }),
      });

      if (!response.ok) {
        const error = await readMutationError(response, "Unable to update capital.");
        setAdjustmentErrors(error.fieldErrors);
        setMessage({ text: error.message, tone: "error" });
        return;
      }

      setAdjustmentAmount("");
      setMessage({
        text: direction === "deposit" ? "Funds added." : "Withdrawal recorded.",
        tone: "success",
      });
      router.refresh();
    });
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Portfolio Capital</CardTitle>
        <CardDescription>
          Set the tracked capital once, then add or withdraw capital with a single amount field.
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

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Tracked Capital</p>
            <p className="mt-2 font-mono text-xl text-slate-50">{formatCurrency(capacity.fundedCapital)}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Portfolio Value</p>
            <p className="mt-2 font-mono text-xl text-slate-50">{formatCurrency(capacity.currentPortfolioValue)}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Open Assets</p>
            <p className="mt-2 font-mono text-xl text-slate-50">{formatCurrency(capacity.openAssetValue)}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Net Adjustments</p>
            <p className={`mt-2 font-mono text-xl ${capacity.contributedFunds >= 0 ? "text-slate-50" : "text-rose-300"}`}>
              {capacity.contributedFunds >= 0 ? "" : "-"}{formatCurrency(Math.abs(capacity.contributedFunds))}
            </p>
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
          <div>
            <p className="text-sm font-semibold text-slate-50">Current tracked capital</p>
            <p className="mt-1 text-sm text-slate-400">
              This is the total capital you want the app to treat as contributed to the portfolio.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
            <div className="space-y-2">
              <Label htmlFor="tracked-capital">Tracked capital</Label>
              <Input
                id="tracked-capital"
                type="number"
                step="0.01"
                value={trackedCapital}
                onChange={(event) => setTrackedCapital(event.target.value)}
              />
              <FieldError message={capitalErrors.trackedCapital} />
            </div>
            <Button disabled={pending || !trackedCapital.trim()} onClick={saveTrackedCapital}>
              Save capital
            </Button>
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
          <div>
            <p className="text-sm font-semibold text-slate-50">Quick capital adjustment</p>
            <p className="mt-1 text-sm text-slate-400">
              Enter an amount once, then choose whether it was a deposit or a withdrawal.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-end">
            <div className="space-y-2">
              <Label htmlFor="capital-adjustment-amount">Amount</Label>
              <Input
                id="capital-adjustment-amount"
                type="number"
                step="0.01"
                value={adjustmentAmount}
                onChange={(event) => setAdjustmentAmount(event.target.value)}
                placeholder="2500"
              />
              <FieldError message={adjustmentErrors.amount} />
            </div>
            <Button disabled={pending || !hasValidAdjustmentAmount} onClick={() => submitAdjustment("deposit")}>
              Add funds
            </Button>
            <Button
              variant="outline"
              disabled={pending || !hasValidAdjustmentAmount}
              onClick={() => submitAdjustment("withdrawal")}
            >
              Withdraw
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-slate-50">Recent capital changes</p>
            <p className="text-sm text-slate-400">Auto-timestamped deposits and withdrawals applied to tracked capital.</p>
          </div>
          {!funding.length ? (
            <p className="text-sm text-slate-400">No capital changes recorded yet.</p>
          ) : (
            funding
              .slice()
              .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
              .slice(0, 5)
              .map((entry) => (
                <div key={entry.id} className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <div>
                    <p className={`font-mono text-sm ${entry.amount >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                      {entry.amount >= 0 ? "+" : "-"}{formatCurrency(Math.abs(entry.amount))}
                    </p>
                    <p className="text-xs text-slate-500">{formatDateTime(entry.occurredAt)}</p>
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
