import "server-only";

import { HoldingStatus } from "@prisma/client";

import {
  buildDashboardSnapshot,
} from "@/lib/domain/calculations";
import { buildHoldingRows } from "@/lib/server/holding-rows";
import { prisma } from "@/lib/server/db";
import { getCurrentPrices } from "@/lib/server/quotes";
import { toNumber } from "@/lib/utils";

export async function getDashboardSnapshot(userId: string, { includeArchived = false }: { includeArchived?: boolean } = {}) {
  const [user, trades, holdings, fundingEvents] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        portfolioBaselineValue: true,
        portfolioBaselineAt: true,
      },
    }),
    prisma.trade.findMany({
      where: {
        userId,
        ...(includeArchived ? {} : { archivedAt: null }),
      },
      include: {
        events: {
          orderBy: { occurredAt: "desc" },
        },
      },
      orderBy: { openedAt: "desc" },
    }),
    prisma.holdingLot.findMany({
      where: {
        userId,
        ...(includeArchived ? {} : { archivedAt: null }),
      },
      include: { coveredCalls: true },
      orderBy: { openedAt: "desc" },
    }),
    prisma.portfolioFunding.findMany({
      where: { userId },
      orderBy: { occurredAt: "asc" },
    }),
  ]);

  const currentPrices = await getCurrentPrices(
    holdings.filter((holding) => holding.status === HoldingStatus.OPEN).map((holding) => holding.ticker),
  );
  const holdingRows = buildHoldingRows(holdings, currentPrices);

  return buildDashboardSnapshot(
    trades,
    holdingRows,
    toNumber(user.portfolioBaselineValue),
    user.portfolioBaselineAt,
    fundingEvents.map((event) => ({
      id: event.id,
      amount: toNumber(event.amount),
      occurredAt: event.occurredAt,
      notes: event.notes,
    })),
  );
}

export async function getTradeDetail(userId: string, tradeId: string) {
  return prisma.trade.findFirst({
    where: { userId, id: tradeId },
    include: {
      events: {
        orderBy: { occurredAt: "desc" },
      },
      holdingLot: true,
      holdings: {
        orderBy: { openedAt: "desc" },
      },
    },
  });
}
