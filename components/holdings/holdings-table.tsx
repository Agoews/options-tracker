"use client";

import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { useState } from "react";

import type { HoldingRow } from "@/lib/domain/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DataTable } from "@/components/tables/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CloseHoldingModal } from "@/components/holdings/close-holding-modal";
import { DeleteHoldingDialog } from "@/components/holdings/delete-holding-dialog";
import { SellCoveredCallModal } from "@/components/holdings/sell-covered-call-modal";

const columnHelper = createColumnHelper<HoldingRow>();

function AcquiredBadge({ acquiredVia }: { acquiredVia: HoldingRow["acquiredVia"] }) {
  return acquiredVia === "ASSIGNMENT" ? (
    <Badge variant="neutral">Assigned</Badge>
  ) : (
    <Badge variant="default">Bought</Badge>
  );
}

function ActionsCell({ row }: { row: HoldingRow }) {
  const [coveredCallOpen, setCoveredCallOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const maxSellableShares = Math.max(row.remainingQuantity - row.reservedShares, 0);
  const canSellCoveredCall = row.status === "OPEN" && maxSellableShares >= 100;
  const canCloseHolding = row.status === "OPEN" && maxSellableShares > 0;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {row.status === "OPEN" ? (
          <Button size="sm" variant="outline" onClick={() => setCloseOpen(true)} disabled={!canCloseHolding}>
            Close
          </Button>
        ) : null}
        {row.status === "OPEN" ? (
          <Button size="sm" variant="outline" onClick={() => setCoveredCallOpen(true)} disabled={!canSellCoveredCall}>
            Sell CC
          </Button>
        ) : null}
        <Button size="sm" variant="danger" onClick={() => setDeleteOpen(true)}>
          Delete
        </Button>
      </div>
      <CloseHoldingModal
        open={closeOpen}
        onOpenChange={setCloseOpen}
        holdingLotId={row.id}
        ticker={row.ticker}
        maxSellableShares={maxSellableShares}
      />
      <DeleteHoldingDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        holdingLotId={row.id}
        ticker={row.ticker}
      />
      {row.status === "OPEN" ? (
        <SellCoveredCallModal
          open={coveredCallOpen}
          onOpenChange={setCoveredCallOpen}
          holdingLotId={row.id}
          ticker={row.ticker}
          availableShares={maxSellableShares}
        />
      ) : null}
    </>
  );
}

const columns = [
  columnHelper.accessor("ticker", {
    header: "Ticker",
    cell: ({ getValue }) => <span className="font-mono font-semibold text-slate-50">{getValue()}</span>,
  }),
  columnHelper.accessor("acquiredVia", {
    header: "Acquired",
    cell: ({ getValue }) => <AcquiredBadge acquiredVia={getValue()} />,
  }),
  columnHelper.accessor("remainingQuantity", {
    header: "Shares",
  }),
  columnHelper.accessor("costBasisPerShare", {
    header: "Cost Basis",
    cell: ({ getValue }) => <span className="font-mono">{formatCurrency(getValue())}</span>,
  }),
  columnHelper.accessor("effectiveCostBasis", {
    header: "Eff. Basis",
    cell: ({ getValue, row }) => (
      <span className={row.original.ccPremiumCollected > 0 ? "font-mono" : "font-mono text-slate-500"}>
        {formatCurrency(getValue())}
      </span>
    ),
  }),
  columnHelper.accessor("currentPrice", {
    header: "Current Price",
    cell: ({ getValue }) => {
      const value = getValue();
      return value === null ? (
        <span className="font-mono text-slate-500">N/A</span>
      ) : (
        <span className="font-mono">{formatCurrency(value)}</span>
      );
    },
  }),
  columnHelper.accessor("ccPremiumCollected", {
    header: "CC Premium",
    cell: ({ getValue }) => (
      <span className={getValue() > 0 ? "font-mono text-emerald-300" : "font-mono text-slate-500"}>
        {formatCurrency(getValue())}
      </span>
    ),
  }),
  columnHelper.accessor("unrealizedPnl", {
    header: "Unrealized",
    cell: ({ getValue }) => {
      const value = getValue();
      return value === null ? (
        <span className="font-mono text-slate-500">N/A</span>
      ) : (
        <span className={value >= 0 ? "font-mono text-emerald-300" : "font-mono text-rose-300"}>
          {formatCurrency(value)}
        </span>
      );
    },
  }),
  columnHelper.accessor("realizedPnl", {
    header: "Realized",
    cell: ({ getValue }) => (
      <span className={getValue() >= 0 ? "font-mono text-emerald-300" : "font-mono text-rose-300"}>
        {formatCurrency(getValue())}
      </span>
    ),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: ({ getValue }) => <Badge variant={getValue() === "OPEN" ? "success" : "default"}>{getValue()}</Badge>,
  }),
  columnHelper.accessor("openedAt", {
    header: "Opened",
    cell: ({ getValue }) => formatDate(getValue()),
  }),
  columnHelper.accessor("closedAt", {
    header: "Closed",
    cell: ({ getValue }) => {
      const value = getValue();
      return value ? formatDate(value) : "—";
    },
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <ActionsCell row={row.original} />,
  }),
] as ColumnDef<HoldingRow, unknown>[];

export function HoldingsTable({ data }: { data: HoldingRow[] }) {
  const openHoldings = data.filter((row) => row.status === "OPEN");
  const closedHoldings = data.filter((row) => row.status === "CLOSED");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Holdings</CardTitle>
        <CardDescription>Assigned and manual share lots with live quotes, basis, covered-call premium, and close/delete controls.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="open">
          <TabsList>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
          <TabsContent value="open">
            <DataTable columns={columns} data={openHoldings} searchPlaceholder="Filter open holdings..." />
          </TabsContent>
          <TabsContent value="closed">
            <DataTable columns={columns} data={closedHoldings} searchPlaceholder="Filter closed holdings..." />
          </TabsContent>
          <TabsContent value="all">
            <DataTable columns={columns} data={data} searchPlaceholder="Filter all holdings..." />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
