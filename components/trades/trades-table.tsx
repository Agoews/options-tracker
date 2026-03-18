"use client";

import Link from "next/link";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";

import type { TradeRow } from "@/lib/domain/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DataTable } from "@/components/tables/data-table";
import { StatusBadge } from "@/components/trades/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const columnHelper = createColumnHelper<TradeRow>();

const columns = [
  columnHelper.accessor("ticker", {
    header: "Ticker",
    cell: ({ row }) => (
      <Link href={`/trades/${row.original.id}`} className="font-mono font-semibold text-slate-50">
        {row.original.ticker}
      </Link>
    ),
  }),
  columnHelper.accessor("strategy", {
    header: "Strategy",
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: ({ getValue, row }) =>
      row.original.archivedAt ? <Badge variant="neutral">Archived</Badge> : <StatusBadge status={getValue()} />,
  }),
  columnHelper.accessor("premiumCollected", {
    header: "Premium",
    cell: ({ getValue }) => <span className="font-mono">{formatCurrency(getValue())}</span>,
  }),
  columnHelper.accessor("realizedPnl", {
    header: "Realized P&L",
    cell: ({ getValue }) => (
      <span className={getValue() >= 0 ? "font-mono text-emerald-300" : "font-mono text-rose-300"}>
        {formatCurrency(getValue())}
      </span>
    ),
  }),
  columnHelper.accessor("openContractCount", {
    header: "Open Cx",
  }),
  columnHelper.accessor("shareExposure", {
    header: "Shares",
  }),
  columnHelper.accessor("nextExpiration", {
    header: "Next Exp.",
    cell: ({ getValue }) => (getValue() ? formatDate(getValue()!) : "N/A"),
  }),
] as ColumnDef<TradeRow, unknown>[];

export function TradesTable({ data }: { data: TradeRow[] }) {
  const archivedTrades = data.filter((row) => Boolean(row.archivedAt));
  const activeTrades = data.filter((row) => !row.archivedAt);
  const openTrades = activeTrades.filter((row) => row.status !== "CLOSED");
  const closedTrades = activeTrades.filter((row) => row.status === "CLOSED");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trades</CardTitle>
        <CardDescription>Filter active and archived trades by ticker, strategy, status, or activity level.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="open">
          <TabsList>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
          <TabsContent value="open">
            <DataTable columns={columns} data={openTrades} searchPlaceholder="Filter open trades..." />
          </TabsContent>
          <TabsContent value="closed">
            <DataTable columns={columns} data={closedTrades} searchPlaceholder="Filter closed trades..." />
          </TabsContent>
          <TabsContent value="all">
            <DataTable columns={columns} data={activeTrades} searchPlaceholder="Filter active trades..." />
          </TabsContent>
          <TabsContent value="archived">
            <DataTable columns={columns} data={archivedTrades} searchPlaceholder="Filter archived trades..." />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
