import { TradeEventType, TradeStatus } from "@prisma/client";

import {
  aggregateTradeState,
  calculateAdjustedCostBasis,
  calculateHoldingUnrealizedPnl,
  calculateReservedShares,
  inferStatus,
} from "@/lib/domain/calculations";

describe("trade calculations", () => {
  it("adjusts assignment basis by premium collected", () => {
    expect(calculateAdjustedCostBasis(185, 320, 100)).toBeCloseTo(181.8, 5);
  });

  it("aggregates contract, share, premium, fee, and realized state", () => {
    const result = aggregateTradeState([
      {
        type: TradeEventType.SELL_TO_OPEN,
        occurredAt: new Date("2026-01-01"),
        contractsDelta: 1,
        premium: 220,
        fees: 1.25,
      },
      {
        type: TradeEventType.ASSIGNMENT,
        occurredAt: new Date("2026-02-01"),
        sharesDelta: 100,
        premium: 220,
      },
      {
        type: TradeEventType.ROLL,
        occurredAt: new Date("2026-02-15"),
        contractsDelta: 1,
        premium: 50,
        fees: 1.25,
        realizedPnl: 20,
      },
    ]);

    expect(result.openContractCount).toBe(2);
    expect(result.shareExposure).toBe(100);
    expect(result.premiumCollected).toBe(270);
    expect(result.feesPaid).toBe(2.5);
    expect(result.realizedPnl).toBe(20);
  });

  it("infers open, assigned, and closed states", () => {
    expect(inferStatus(1, 0)).toBe(TradeStatus.OPEN);
    expect(inferStatus(0, 100)).toBe(TradeStatus.ASSIGNED);
    expect(inferStatus(0, 0)).toBe(TradeStatus.CLOSED);
  });

  it("calculates unrealized holding pnl from current price and basis", () => {
    expect(
      calculateHoldingUnrealizedPnl({
        id: "lot-1",
        ticker: "AAPL",
        quantity: 100,
        remainingQuantity: 100,
        costBasisPerShare: 180,
        effectiveCostBasis: 176,
        ccPremiumCollected: 400,
        acquiredVia: "ASSIGNMENT",
        activeCoveredCalls: [],
        reservedShares: 0,
        currentPrice: 187.5,
        unrealizedPnl: null,
        realizedPnl: 0,
        status: "OPEN",
        openedAt: new Date("2026-01-01"),
        closedAt: null,
      }),
    ).toBe(750);
  });

  it("returns null unrealized pnl when no quote is available", () => {
    expect(
      calculateHoldingUnrealizedPnl({
        id: "lot-2",
        ticker: "MSFT",
        quantity: 100,
        remainingQuantity: 100,
        costBasisPerShare: 320,
        effectiveCostBasis: 320,
        ccPremiumCollected: 0,
        acquiredVia: "STOCK_BUY",
        activeCoveredCalls: [],
        reservedShares: 0,
        currentPrice: null,
        unrealizedPnl: null,
        realizedPnl: 0,
        status: "OPEN",
        openedAt: new Date("2026-01-01"),
        closedAt: null,
      }),
    ).toBeNull();
  });

  it("converts open covered call contracts into reserved shares", () => {
    expect(calculateReservedShares(1)).toBe(100);
    expect(calculateReservedShares(3)).toBe(300);
  });
});
