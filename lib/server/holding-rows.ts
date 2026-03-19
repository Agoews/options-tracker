import "server-only";

import { Prisma, TradeEventType, TradeStatus } from "@prisma/client";

import { calculateHoldingUnrealizedPnl, calculateReservedShares } from "@/lib/domain/calculations";
import type { HoldingRow, LinkedCoveredCall } from "@/lib/domain/types";
import { toNumber } from "@/lib/utils";

type HoldingLotWithCoveredCalls = Prisma.HoldingLotGetPayload<{
  include: { coveredCalls: true };
}>;

export function buildHoldingRows(
  holdings: HoldingLotWithCoveredCalls[],
  currentPrices: Map<string, number | null>,
) {
  return holdings.map<HoldingRow>((holding) => {
    const ccPremiumCollected = holding.coveredCalls.reduce(
      (sum, coveredCall) => sum + toNumber(coveredCall.premiumCollected),
      0,
    );
    const effectiveCostBasis =
      holding.remainingQuantity > 0
        ? toNumber(holding.costBasisPerShare) - ccPremiumCollected / holding.remainingQuantity
        : toNumber(holding.costBasisPerShare);

    const activeCoveredCalls: LinkedCoveredCall[] = holding.coveredCalls
      .filter((coveredCall) => coveredCall.status !== TradeStatus.CLOSED && !coveredCall.archivedAt)
      .map((coveredCall) => ({
        tradeId: coveredCall.id,
        status: coveredCall.status,
        premiumCollected: toNumber(coveredCall.premiumCollected),
        openContracts: coveredCall.openContractCount,
      }));
    const reservedShares = activeCoveredCalls.reduce(
      (total, coveredCall) => total + calculateReservedShares(coveredCall.openContracts),
      0,
    );
    const currentPrice =
      holding.status === "OPEN" ? currentPrices.get(holding.ticker.toUpperCase()) ?? null : null;

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
}
