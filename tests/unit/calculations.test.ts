import {
  calculateAvailableShares,
  aggregateTradeState,
  calculateAdjustedCostBasis,
  calculateHoldingUnrealizedPnl,
  calculateOpenOptionPremiumBasis,
  calculateOptionCloseRealizedPnl,
  calculateOptionExpirationRealizedPnl,
  calculatePortfolioCapacitySnapshot,
  calculatePortfolioHistory,
  calculateReservedShares,
  calculateStrategyBreakdown,
  buildDashboardSnapshot,
  inferStatus,
} from "@/lib/domain/calculations";

describe("trade calculations", () => {
  it("adjusts assignment basis by premium collected", () => {
    expect(calculateAdjustedCostBasis(185, 320, 100)).toBeCloseTo(181.8, 5);
  });

  it("aggregates contract, share, premium, fee, and realized state", () => {
    const result = aggregateTradeState([
      {
        type: "SELL_TO_OPEN",
        occurredAt: new Date("2026-01-01"),
        contractsDelta: 1,
        premium: 220,
        fees: 1.25,
      },
      {
        type: "ASSIGNMENT",
        occurredAt: new Date("2026-02-01"),
        sharesDelta: 100,
        premium: 220,
      },
      {
        type: "ROLL",
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
    expect(inferStatus(1, 0)).toBe("OPEN");
    expect(inferStatus(-1, 0)).toBe("OPEN");
    expect(inferStatus(-2, 100)).toBe("PARTIAL");
    expect(inferStatus(0, 100)).toBe("ASSIGNED");
    expect(inferStatus(0, 0)).toBe("CLOSED");
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
    ).toBe(1150);
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

  it("calculates uncovered shares after reserving contracts", () => {
    expect(calculateAvailableShares(300, 100)).toBe(200);
    expect(calculateAvailableShares(100, 200)).toBe(0);
  });

  it("tracks premium basis for the still-open option contracts", () => {
    const result = calculateOpenOptionPremiumBasis([
      { type: "SELL_TO_OPEN", contractsDelta: 2, premium: 400 },
      { type: "BUY_TO_CLOSE", contractsDelta: -1, premium: 80 },
      { type: "ROLL", contractsDelta: 0, premium: 30 },
    ]);

    expect(result.openContracts).toBe(1);
    expect(result.openPremiumBasis).toBeCloseTo(230, 5);
    expect(result.averageBasisPerContract).toBeCloseTo(230, 5);
  });

  it("derives close and expiration pnl from remaining premium basis", () => {
    expect(calculateOptionCloseRealizedPnl(1, 230, 40)).toBe(190);
    expect(calculateOptionExpirationRealizedPnl(1, 230)).toBe(230);
    expect(calculateOptionCloseRealizedPnl(-1, 180, 250)).toBe(70);
    expect(calculateOptionExpirationRealizedPnl(-1, 180)).toBe(-180);
  });

  it("builds strategy summaries that emphasize closed results", () => {
    const result = calculateStrategyBreakdown([
      {
        id: "trade-1",
        ticker: "AAPL",
        strategy: "COVERED_CALL",
        status: "OPEN",
        archivedAt: null,
        openedAt: new Date("2026-01-01"),
        premiumCollected: 300,
        realizedPnl: 0,
        openContractCount: 1,
        shareExposure: 0,
        assignmentCount: 0,
        linkedHoldingLotId: "lot-1",
      },
      {
        id: "trade-2",
        ticker: "AAPL",
        strategy: "COVERED_CALL",
        status: "CLOSED",
        archivedAt: null,
        openedAt: new Date("2026-01-15"),
        premiumCollected: 220,
        realizedPnl: 180,
        openContractCount: 0,
        shareExposure: 0,
        assignmentCount: 0,
        linkedHoldingLotId: "lot-1",
      },
      {
        id: "trade-3",
        ticker: "MSFT",
        strategy: "SHORT_PUT",
        status: "CLOSED",
        archivedAt: null,
        openedAt: new Date("2026-02-01"),
        premiumCollected: 160,
        realizedPnl: -40,
        openContractCount: 0,
        shareExposure: 0,
        assignmentCount: 0,
        linkedHoldingLotId: null,
      },
    ]);

    expect(result[0]).toMatchObject({
      strategy: "COVERED_CALL",
      activeTrades: 1,
      closedTrades: 1,
      winRate: 1,
      averageClosedPnl: 180,
      realizedPnl: 180,
    });
  });

  it("builds portfolio value history from baseline, funding, realized, and unrealized", () => {
    const result = calculatePortfolioHistory(
      10000,
      new Date("2026-01-01"),
      [
        {
          id: "fund-1",
          amount: 2500,
          occurredAt: new Date("2026-01-10"),
          notes: "Deposit",
        },
      ],
      [
        {
          id: "trade-1",
          userId: "user-1",
          ticker: "AAPL",
          accountLabel: null,
          strategy: "COVERED_CALL",
          optionType: "CALL",
          thesis: null,
          notes: null,
          tags: [],
          status: "OPEN",
          openedAt: new Date("2026-01-01"),
          closedAt: null,
          openContractCount: 1,
          shareExposure: 0,
          premiumCollected: 300 as never,
          realizedPnl: 40 as never,
          feesPaid: 0 as never,
          createdAt: new Date("2026-01-01"),
          updatedAt: new Date("2026-01-01"),
          archivedAt: null,
          holdingLotId: "lot-1",
          events: [
            {
              id: "event-1",
              userId: "user-1",
              tradeId: "trade-1",
              type: "SELL_TO_OPEN",
              occurredAt: new Date("2026-01-01"),
              optionType: "CALL",
              contractsDelta: 1,
              sharesDelta: null,
              strikePrice: 180 as never,
              expiration: null,
              premium: 300 as never,
              fees: 0 as never,
              realizedPnl: 0 as never,
              underlyingPrice: null,
              sharePrice: null,
              notes: null,
              metadata: null,
              createdAt: new Date("2026-01-01"),
            },
          ],
        },
        {
          id: "trade-2",
          userId: "user-1",
          ticker: "MSFT",
          accountLabel: null,
          strategy: "SHORT_PUT",
          optionType: "PUT",
          thesis: null,
          notes: null,
          tags: [],
          status: "CLOSED",
          openedAt: new Date("2026-01-01"),
          closedAt: new Date("2026-01-15"),
          openContractCount: 0,
          shareExposure: 0,
          premiumCollected: 180 as never,
          realizedPnl: 180 as never,
          feesPaid: 0 as never,
          createdAt: new Date("2026-01-01"),
          updatedAt: new Date("2026-01-15"),
          archivedAt: null,
          holdingLotId: null,
          events: [
            {
              id: "event-2",
              userId: "user-1",
              tradeId: "trade-2",
              type: "BUY_TO_CLOSE",
              occurredAt: new Date("2026-01-15"),
              optionType: "PUT",
              contractsDelta: -1,
              sharesDelta: null,
              strikePrice: 170 as never,
              expiration: null,
              premium: 50 as never,
              fees: 0 as never,
              realizedPnl: 180 as never,
              underlyingPrice: null,
              sharePrice: null,
              notes: null,
              metadata: null,
              createdAt: new Date("2026-01-15"),
            },
          ],
        },
      ],
      [
        {
          id: "lot-1",
          ticker: "AAPL",
          quantity: 100,
          remainingQuantity: 100,
          costBasisPerShare: 180,
          effectiveCostBasis: 176,
          ccPremiumCollected: 300,
          acquiredVia: "STOCK_BUY",
          activeCoveredCalls: [],
          reservedShares: 100,
          currentPrice: 170,
          unrealizedPnl: -600,
          realizedPnl: 0,
          status: "OPEN",
          archivedAt: null,
          openedAt: new Date("2026-01-01"),
          closedAt: null,
        },
      ],
    );

    expect(result[0]).toMatchObject({
      fundedCapital: 10000,
      portfolioValue: 10000,
    });
    expect(result[1]).toMatchObject({
      fundedCapital: 12500,
      portfolioValue: 12500,
    });
    expect(result.at(-1)).toMatchObject({
      realizedPnl: 180,
      unrealizedPnl: -600,
      portfolioValue: 12080,
    });
  });

  it("calculates portfolio capacity against current open assets", () => {
    const result = calculatePortfolioCapacitySnapshot(
      10000,
      [
        {
          id: "fund-1",
          amount: 2500,
          occurredAt: new Date("2026-01-10"),
          notes: "Deposit",
        },
      ],
      [
        {
          id: "trade-1",
          userId: "user-1",
          ticker: "AAPL",
          accountLabel: null,
          strategy: "COVERED_CALL",
          optionType: "CALL",
          thesis: null,
          notes: null,
          tags: [],
          status: "OPEN",
          openedAt: new Date("2026-01-01"),
          closedAt: null,
          openContractCount: 1,
          shareExposure: 0,
          premiumCollected: 300 as never,
          realizedPnl: 40 as never,
          feesPaid: 0 as never,
          createdAt: new Date("2026-01-01"),
          updatedAt: new Date("2026-01-01"),
          archivedAt: null,
          holdingLotId: "lot-1",
          events: [],
        },
        {
          id: "trade-2",
          userId: "user-1",
          ticker: "MSFT",
          accountLabel: null,
          strategy: "SHORT_PUT",
          optionType: "PUT",
          thesis: null,
          notes: null,
          tags: [],
          status: "OPEN",
          openedAt: new Date("2026-01-01"),
          closedAt: null,
          openContractCount: 1,
          shareExposure: 0,
          premiumCollected: 180 as never,
          realizedPnl: 180 as never,
          feesPaid: 0 as never,
          createdAt: new Date("2026-01-01"),
          updatedAt: new Date("2026-01-15"),
          archivedAt: null,
          holdingLotId: null,
          events: [
            {
              id: "event-2",
              userId: "user-1",
              tradeId: "trade-2",
              type: "SELL_TO_OPEN",
              occurredAt: new Date("2026-01-15"),
              optionType: "PUT",
              contractsDelta: 1,
              sharesDelta: null,
              strikePrice: 170 as never,
              expiration: null,
              premium: 180 as never,
              fees: 0 as never,
              realizedPnl: 0 as never,
              underlyingPrice: null,
              sharePrice: null,
              notes: null,
              metadata: null,
              createdAt: new Date("2026-01-15"),
            },
          ],
        },
      ],
      [
        {
          id: "lot-1",
          ticker: "AAPL",
          quantity: 100,
          remainingQuantity: 100,
          costBasisPerShare: 180,
          effectiveCostBasis: 176,
          ccPremiumCollected: 300,
          acquiredVia: "STOCK_BUY",
          activeCoveredCalls: [],
          reservedShares: 100,
          currentPrice: 170,
          unrealizedPnl: -600,
          realizedPnl: 0,
          status: "OPEN",
          archivedAt: null,
          openedAt: new Date("2026-01-01"),
          closedAt: null,
        },
      ],
      new Date("2026-01-01"),
    );

    expect(result).toMatchObject({
      fundedCapital: 12500,
      realizedPnl: 220,
      unrealizedPnl: -600,
      currentPortfolioValue: 12120,
      openAssetValue: 35000,
      overAllocated: true,
    });
  });

  it("builds dashboard metrics with portfolio total and percentage return", () => {
    const snapshot = buildDashboardSnapshot(
      [
        {
          id: "trade-1",
          userId: "user-1",
          ticker: "MSFT",
          accountLabel: null,
          strategy: "SHORT_PUT",
          optionType: "PUT",
          thesis: null,
          notes: null,
          tags: [],
          status: "CLOSED",
          openedAt: new Date("2026-01-01"),
          closedAt: new Date("2026-01-15"),
          openContractCount: 0,
          shareExposure: 0,
          premiumCollected: 180 as never,
          realizedPnl: 180 as never,
          feesPaid: 0 as never,
          createdAt: new Date("2026-01-01"),
          updatedAt: new Date("2026-01-15"),
          archivedAt: null,
          holdingLotId: null,
          events: [
            {
              id: "event-2",
              userId: "user-1",
              tradeId: "trade-2",
              type: "BUY_TO_CLOSE",
              occurredAt: new Date("2026-01-15"),
              optionType: "PUT",
              contractsDelta: -1,
              sharesDelta: null,
              strikePrice: 170 as never,
              expiration: null,
              premium: 50 as never,
              fees: 0 as never,
              realizedPnl: 180 as never,
              underlyingPrice: null,
              sharePrice: null,
              notes: null,
              metadata: null,
              createdAt: new Date("2026-01-15"),
            },
          ],
        },
      ],
      [
        {
          id: "lot-1",
          ticker: "AAPL",
          quantity: 100,
          remainingQuantity: 100,
          costBasisPerShare: 180,
          effectiveCostBasis: 176,
          ccPremiumCollected: 300,
          acquiredVia: "STOCK_BUY",
          activeCoveredCalls: [],
          reservedShares: 0,
          currentPrice: 170,
          unrealizedPnl: -600,
          realizedPnl: 0,
          status: "OPEN",
          archivedAt: null,
          openedAt: new Date("2026-01-01"),
          closedAt: null,
        },
      ],
      10000,
      new Date("2026-01-01"),
      [
        {
          id: "fund-1",
          amount: 2500,
          occurredAt: new Date("2026-01-10"),
          notes: "Deposit",
        },
      ],
    );

    expect(snapshot.metrics[0]).toMatchObject({
      label: "Portfolio Total",
      value: 12080,
      detail: "Funded capital $12,500.00",
    });
    expect(snapshot.metrics[0]?.change).toBeCloseTo(-3.36, 2);
    expect(snapshot.metrics.some((metric) => metric.label === "Cost Basis at Risk")).toBe(false);
  });
});
