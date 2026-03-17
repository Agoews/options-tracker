import "server-only";

import { HoldingStatus, StrategyType, TradeStatus, TradeEventType } from "@prisma/client";

import { buildDashboardSnapshot, calculateHoldingUnrealizedPnl, calculateReservedShares } from "@/lib/domain/calculations";
import type { HoldingRow, LinkedCoveredCall } from "@/lib/domain/types";
import { prisma } from "@/lib/server/db";
import { getCurrentPrices } from "@/lib/server/quotes";
import { toNumber } from "@/lib/utils";

export async function getDashboardSnapshot(userId: string) {
  const [trades, holdings] = await Promise.all([
    prisma.trade.findMany({
      where: { userId },
      include: {
        events: {
          orderBy: { occurredAt: "desc" },
        },
      },
      orderBy: { openedAt: "desc" },
    }),
    prisma.holdingLot.findMany({
      where: { userId },
      include: { coveredCalls: true },
      orderBy: { openedAt: "desc" },
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

    const activeCoveredCalls: LinkedCoveredCall[] = holding.coveredCalls.map((cc) => ({
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
      openedAt: holding.openedAt,
      closedAt: holding.closedAt,
    };

    return {
      ...row,
      unrealizedPnl: calculateHoldingUnrealizedPnl(row),
    };
  });

  const nonStockTrades = trades.filter((t) => t.strategy !== StrategyType.STOCK);

  return buildDashboardSnapshot(nonStockTrades, holdingRows);
}

export async function getTradeDetail(userId: string, tradeId: string) {
  return prisma.trade.findFirst({
    where: { userId, id: tradeId },
    include: {
      events: {
        orderBy: { occurredAt: "desc" },
      },
      holdings: {
        orderBy: { openedAt: "desc" },
      },
    },
  });
}
