"use client";

import Link from "next/link";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";

import type { TradeRow } from "@/lib/domain/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DataTable } from "@/components/tables/data-table";
import { StatusBadge } from "@/components/trades/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
    cell: ({ getValue }) => <StatusBadge status={getValue()} />,
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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trades</CardTitle>
        <CardDescription>Filter by ticker, strategy, status, or activity level.</CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={data} searchPlaceholder="Filter trades..." />
      </CardContent>
    </Card>
  );
}
