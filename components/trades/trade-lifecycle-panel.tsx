"use client";

import { useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";

import { readMutationError, withStatus } from "@/lib/client/mutation-feedback";
import type { OptionTypeValue, StrategyTypeValue } from "@/lib/domain/models";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type RollCandidate = {
  id: string;
  label: string;
};

type Props = {
  tradeId: string;
  archivedAt: Date | null;
  strategy: StrategyTypeValue;
  optionType: OptionTypeValue | null;
  openContractCount: number;
  linkedHoldingLotId: string | null;
  rollCandidates: RollCandidate[];
  defaultStrikePrice?: number | null;
  defaultExpiration?: string | null;
};

type ActionKey = "close_option" | "expire_option" | "roll_option" | "assign_put" | "assign_called_shares";

const DEFAULT_NOTES = "";

function toDateInputValue(value: Date) {
  return value.toISOString().slice(0, 10);
}

export function TradeLifecyclePanel({
  tradeId,
  archivedAt,
  strategy,
  optionType,
  openContractCount,
  linkedHoldingLotId,
  rollCandidates,
  defaultStrikePrice,
  defaultExpiration,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [action, setAction] = useState<ActionKey>("close_option");
  const [closeValues, setCloseValues] = useState({
    occurredAt: toDateInputValue(new Date()),
    contracts: Math.max(Math.abs(openContractCount), 1),
    closePricePerContract: "0",
    notes: DEFAULT_NOTES,
  });
  const [expireValues, setExpireValues] = useState({
    occurredAt: toDateInputValue(new Date()),
    contracts: Math.max(Math.abs(openContractCount), 1),
    notes: DEFAULT_NOTES,
  });
  const [rollValues, setRollValues] = useState({
    occurredAt: toDateInputValue(new Date()),
    netCredit: "0",
    nextExpiration: defaultExpiration ?? toDateInputValue(new Date()),
    nextStrikePrice: defaultStrikePrice ? defaultStrikePrice.toString() : "",
    fromEventId: rollCandidates[0]?.id ?? "",
    notes: DEFAULT_NOTES,
  });
  const [assignmentValues, setAssignmentValues] = useState({
    occurredAt: toDateInputValue(new Date()),
    contracts: Math.max(Math.abs(openContractCount), 1),
    strikePrice: defaultStrikePrice ? defaultStrikePrice.toString() : "",
    notes: DEFAULT_NOTES,
  });

  const hasOpenContracts = openContractCount !== 0;
  const shortOption = openContractCount > 0;
  const canAssignPut = shortOption && optionType === "PUT";
  const canAssignCall = shortOption && optionType === "CALL" && Boolean(linkedHoldingLotId);
  const enabledActions = useMemo(() => {
    const keys: ActionKey[] = [];

    if (hasOpenContracts) {
      keys.push("close_option", "expire_option", "roll_option");
    }
    if (canAssignPut) {
      keys.push("assign_put");
    }
    if (canAssignCall) {
      keys.push("assign_called_shares");
    }

    return keys;
  }, [canAssignCall, canAssignPut, hasOpenContracts]);

  async function submit(payload: Record<string, unknown>) {
    startTransition(async () => {
      setMessage(null);

      const response = await fetch(`/api/trades/${tradeId}/lifecycle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await readMutationError(response, "Unable to append lifecycle action.");
        setMessage(error.message);
        return;
      }

      setOpen(false);
      router.replace(withStatus(pathname, searchParams, "trade-lifecycle-updated"), { scroll: false });
      router.refresh();
    });
  }

  if (archivedAt || strategy === "STOCK" || !enabledActions.length) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Manage
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Lifecycle</DialogTitle>
          <DialogDescription>
            Use guided actions instead of raw event edits so rolls, assignments, expirations, and closes stay consistent.
          </DialogDescription>
        </DialogHeader>
        <Tabs value={action} onValueChange={(value) => setAction(value as ActionKey)}>
          <TabsList className="flex h-auto flex-wrap">
            {enabledActions.includes("close_option") ? <TabsTrigger value="close_option">Close</TabsTrigger> : null}
            {enabledActions.includes("expire_option") ? <TabsTrigger value="expire_option">Expire</TabsTrigger> : null}
            {enabledActions.includes("roll_option") ? <TabsTrigger value="roll_option">Roll</TabsTrigger> : null}
            {enabledActions.includes("assign_put") ? <TabsTrigger value="assign_put">Assign Put</TabsTrigger> : null}
            {enabledActions.includes("assign_called_shares") ? <TabsTrigger value="assign_called_shares">Call Away</TabsTrigger> : null}
          </TabsList>

          <TabsContent value="close_option">
            <form
              className="mt-4 grid gap-4 md:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault();
                void submit({
                  action: "close_option",
                  occurredAt: closeValues.occurredAt,
                  contracts: closeValues.contracts,
                  premium: Number(closeValues.closePricePerContract || 0) * closeValues.contracts * 100,
                  notes: closeValues.notes || undefined,
                });
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="close-occurredAt">Occurred at</Label>
                <Input
                  id="close-occurredAt"
                  type="date"
                  value={closeValues.occurredAt}
                  onChange={(event) => setCloseValues((current) => ({ ...current, occurredAt: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="close-contracts">Contracts</Label>
                <Input
                  id="close-contracts"
                  type="number"
                  min={1}
                  max={Math.abs(openContractCount)}
                  value={closeValues.contracts}
                  onChange={(event) => setCloseValues((current) => ({ ...current, contracts: Number(event.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="close-premium">Close price / contract</Label>
                <Input
                  id="close-premium"
                  type="number"
                  step="0.01"
                  value={closeValues.closePricePerContract}
                  onChange={(event) => setCloseValues((current) => ({ ...current, closePricePerContract: event.target.value }))}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <p className="text-xs text-slate-500">
                  Realized P&L is calculated automatically from the open premium basis and the entered close price.
                </p>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="close-notes">Notes</Label>
                <Textarea
                  id="close-notes"
                  value={closeValues.notes}
                  onChange={(event) => setCloseValues((current) => ({ ...current, notes: event.target.value }))}
                />
              </div>
              <div className="md:col-span-2 flex items-center justify-between gap-3">
                {message ? <FormMessage tone="error">{message}</FormMessage> : <div />}
                <Button disabled={pending} type="submit">Record Close</Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="expire_option">
            <form
              className="mt-4 grid gap-4 md:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault();
                void submit({
                  action: "expire_option",
                  occurredAt: expireValues.occurredAt,
                  contracts: expireValues.contracts,
                  notes: expireValues.notes || undefined,
                });
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="expire-occurredAt">Expired at</Label>
                <Input
                  id="expire-occurredAt"
                  type="date"
                  value={expireValues.occurredAt}
                  onChange={(event) => setExpireValues((current) => ({ ...current, occurredAt: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expire-contracts">Contracts</Label>
                <Input
                  id="expire-contracts"
                  type="number"
                  min={1}
                  max={Math.abs(openContractCount)}
                  value={expireValues.contracts}
                  onChange={(event) => setExpireValues((current) => ({ ...current, contracts: Number(event.target.value) }))}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <p className="text-xs text-slate-500">
                  Expiration assumes the option expires worthless, so the close value is treated as zero automatically.
                </p>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="expire-notes">Notes</Label>
                <Textarea
                  id="expire-notes"
                  value={expireValues.notes}
                  onChange={(event) => setExpireValues((current) => ({ ...current, notes: event.target.value }))}
                />
              </div>
              <div className="md:col-span-2 flex items-center justify-between gap-3">
                {message ? <FormMessage tone="error">{message}</FormMessage> : <div />}
                <Button disabled={pending} type="submit">Record Expiration</Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="roll_option">
            <form
              className="mt-4 grid gap-4 md:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault();
                void submit({
                  action: "roll_option",
                  occurredAt: rollValues.occurredAt,
                  netCredit: rollValues.netCredit,
                  nextExpiration: rollValues.nextExpiration,
                  nextStrikePrice: rollValues.nextStrikePrice,
                  fromEventId: rollValues.fromEventId,
                  notes: rollValues.notes || undefined,
                });
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="roll-occurredAt">Rolled at</Label>
                <Input
                  id="roll-occurredAt"
                  type="date"
                  value={rollValues.occurredAt}
                  onChange={(event) => setRollValues((current) => ({ ...current, occurredAt: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>From leg</Label>
                <Select
                  value={rollValues.fromEventId}
                  onValueChange={(value) => setRollValues((current) => ({ ...current, fromEventId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source leg" />
                  </SelectTrigger>
                  <SelectContent>
                    {rollCandidates.map((candidate) => (
                      <SelectItem key={candidate.id} value={candidate.id}>
                        {candidate.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="roll-netCredit">Net credit / debit</Label>
                <Input
                  id="roll-netCredit"
                  type="number"
                  step="0.01"
                  value={rollValues.netCredit}
                  onChange={(event) => setRollValues((current) => ({ ...current, netCredit: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roll-strike">Next strike</Label>
                <Input
                  id="roll-strike"
                  type="number"
                  step="0.01"
                  value={rollValues.nextStrikePrice}
                  onChange={(event) => setRollValues((current) => ({ ...current, nextStrikePrice: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roll-nextExpiration">Next expiration</Label>
                <Input
                  id="roll-nextExpiration"
                  type="date"
                  value={rollValues.nextExpiration}
                  onChange={(event) => setRollValues((current) => ({ ...current, nextExpiration: event.target.value }))}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="roll-notes">Notes</Label>
                <Textarea
                  id="roll-notes"
                  value={rollValues.notes}
                  onChange={(event) => setRollValues((current) => ({ ...current, notes: event.target.value }))}
                />
              </div>
              <div className="md:col-span-2 flex items-center justify-between gap-3">
                {message ? <FormMessage tone="error">{message}</FormMessage> : <div />}
                <Button disabled={pending || !rollValues.fromEventId} type="submit">Record Roll</Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="assign_put">
            <form
              className="mt-4 grid gap-4 md:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault();
                void submit({
                  action: "assign_put",
                  occurredAt: assignmentValues.occurredAt,
                  contracts: assignmentValues.contracts,
                  strikePrice: assignmentValues.strikePrice,
                  notes: assignmentValues.notes || undefined,
                });
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="assign-put-occurredAt">Assigned at</Label>
                <Input
                  id="assign-put-occurredAt"
                  type="date"
                  value={assignmentValues.occurredAt}
                  onChange={(event) => setAssignmentValues((current) => ({ ...current, occurredAt: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assign-put-contracts">Contracts</Label>
                <Input
                  id="assign-put-contracts"
                  type="number"
                  min={1}
                  max={Math.abs(openContractCount)}
                  value={assignmentValues.contracts}
                  onChange={(event) => setAssignmentValues((current) => ({ ...current, contracts: Number(event.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assign-put-strike">Strike price</Label>
                <Input
                  id="assign-put-strike"
                  type="number"
                  step="0.01"
                  value={assignmentValues.strikePrice}
                  onChange={(event) => setAssignmentValues((current) => ({ ...current, strikePrice: event.target.value }))}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="assign-put-notes">Notes</Label>
                <Textarea
                  id="assign-put-notes"
                  value={assignmentValues.notes}
                  onChange={(event) => setAssignmentValues((current) => ({ ...current, notes: event.target.value }))}
                />
              </div>
              <div className="md:col-span-2 flex items-center justify-between gap-3">
                {message ? <FormMessage tone="error">{message}</FormMessage> : <div />}
                <Button disabled={pending} type="submit">Record Put Assignment</Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="assign_called_shares">
            <form
              className="mt-4 grid gap-4 md:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault();
                void submit({
                  action: "assign_called_shares",
                  occurredAt: assignmentValues.occurredAt,
                  contracts: assignmentValues.contracts,
                  strikePrice: assignmentValues.strikePrice,
                  notes: assignmentValues.notes || undefined,
                });
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="assign-call-occurredAt">Called away at</Label>
                <Input
                  id="assign-call-occurredAt"
                  type="date"
                  value={assignmentValues.occurredAt}
                  onChange={(event) => setAssignmentValues((current) => ({ ...current, occurredAt: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assign-call-contracts">Contracts</Label>
                <Input
                  id="assign-call-contracts"
                  type="number"
                  min={1}
                  max={Math.abs(openContractCount)}
                  value={assignmentValues.contracts}
                  onChange={(event) => setAssignmentValues((current) => ({ ...current, contracts: Number(event.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assign-call-strike">Strike price</Label>
                <Input
                  id="assign-call-strike"
                  type="number"
                  step="0.01"
                  value={assignmentValues.strikePrice}
                  onChange={(event) => setAssignmentValues((current) => ({ ...current, strikePrice: event.target.value }))}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="assign-call-notes">Notes</Label>
                <Textarea
                  id="assign-call-notes"
                  value={assignmentValues.notes}
                  onChange={(event) => setAssignmentValues((current) => ({ ...current, notes: event.target.value }))}
                />
              </div>
              <div className="md:col-span-2 flex items-center justify-between gap-3">
                {message ? <FormMessage tone="error">{message}</FormMessage> : <div />}
                <Button disabled={pending} type="submit">Record Called Shares</Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
