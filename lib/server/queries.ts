import "server-only";

import { HoldingStatus, TradeStatus, TradeEventType } from "@prisma/client";

import {
  buildDashboardSnapshot,
  calculateHoldingUnrealizedPnl,
  calculateReservedShares,
} from "@/lib/domain/calculations";
import type { HoldingRow, LinkedCoveredCall } from "@/lib/domain/types";
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

  const holdingRows = holdings.map<HoldingRow>((holding) => {
    const ccPremiumCollected = holding.coveredCalls.reduce(
      (sum, cc) => sum + toNumber(cc.premiumCollected),
      0,
    );
    const effectiveCostBasis =
      holding.remainingQuantity > 0
        ? toNumber(holding.costBasisPerShare) - ccPremiumCollected / holding.remainingQuantity
        : toNumber(holding.costBasisPerShare);

    const activeCoveredCalls: LinkedCoveredCall[] = holding.coveredCalls
      .filter((cc) => cc.status !== TradeStatus.CLOSED && !cc.archivedAt)
      .map((cc) => ({
        tradeId: cc.id,
        status: cc.status,
        premiumCollected: toNumber(cc.premiumCollected),
        openContracts: cc.openContractCount,
      }));
    const reservedShares = activeCoveredCalls
      .filter((cc) => cc.status !== TradeStatus.CLOSED)
      .reduce((total, cc) => total + calculateReservedShares(cc.openContracts), 0);
    const currentPrice =
      holding.status === HoldingStatus.OPEN ? currentPrices.get(holding.ticker.toUpperCase()) ?? null : null;

    const row: HoldingRow = {
      id: holding.id,
      ticker: holding.ticker,
      quantity: holding.quantity,
      remainingQuantity: holding.remainingQuantity,
      costBasisPerShare: toNumber(holding.costBasisPerShare),
      effectiveCostBasis,
      ccPremiumCollected,
      acquiredVia: holding.acquiredVia === TradeEventType.STOCK_BUY ? "STOCK_BUY" : "ASSIGNMENT",
      activeCoveredCalls,
      reservedShares,
      currentPrice,
      unrealizedPnl: null,
      realizedPnl: toNumber(holding.realizedPnl),
      status: holding.status,
      archivedAt: holding.archivedAt,
      openedAt: holding.openedAt,
      closedAt: holding.closedAt,
    };

    return {
      ...row,
      unrealizedPnl: calculateHoldingUnrealizedPnl(row),
    };
  });

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
