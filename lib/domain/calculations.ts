import { format } from "date-fns";

import type {
  FundingRow,
  AppendTradeEventInput,
  DashboardMetric,
  DashboardSnapshot,
  HoldingRow,
  PortfolioCapacitySnapshot,
  PerformancePoint,
  StrategyBreakdownPoint,
  TradeRow,
  TradeWithEvents,
} from "@/lib/domain/types";
import type { StrategyTypeValue, TradeEventTypeValue, TradeStatusValue } from "@/lib/domain/models";
import { formatCurrency, sum, toNumber } from "@/lib/utils";

const PREMIUM_TYPES = new Set<TradeEventTypeValue>([
  "SELL_TO_OPEN",
  "SELL_TO_CLOSE",
  "ROLL",
]);

const SHARE_ENTRY_TYPES = new Set<TradeEventTypeValue>(["ASSIGNMENT", "STOCK_BUY"]);
const COLLATERALIZED_SHORT_STRATEGIES = new Set<StrategyTypeValue>([
  "WHEEL",
  "CASH_SECURED_PUT",
  "SHORT_PUT",
  "SHORT_CALL",
]);

export function calculateAdjustedCostBasis(strikePrice: number, premiumApplied: number, shareQuantity: number) {
  if (!shareQuantity) {
    return strikePrice;
  }

  return strikePrice - premiumApplied / shareQuantity;
}

export function inferStatus(openContracts: number, shareExposure: number): TradeStatusValue {
  if (openContracts !== 0 && shareExposure > 0) {
    return "PARTIAL";
  }

  if (openContracts !== 0) {
    return "OPEN";
  }

  if (shareExposure > 0) {
    return "ASSIGNED";
  }

  return "CLOSED";
}

export function calculateHoldingUnrealizedPnl(holding: HoldingRow) {
  if (holding.currentPrice === null || holding.remainingQuantity === 0) {
    return null;
  }

  return (holding.currentPrice - holding.effectiveCostBasis) * holding.remainingQuantity;
}

export function calculateStrategyBreakdown(trades: TradeRow[]): StrategyBreakdownPoint[] {
  const map = new Map<StrategyTypeValue, StrategyBreakdownPoint>();

  for (const trade of trades) {
    const row = map.get(trade.strategy) ?? {
      strategy: trade.strategy,
      premiumCollected: 0,
      realizedPnl: 0,
      activeTrades: 0,
      closedTrades: 0,
      winRate: null,
      averageClosedPnl: null,
    };

    row.premiumCollected += trade.premiumCollected;
    row.realizedPnl += trade.realizedPnl;
    row.activeTrades += trade.status === "CLOSED" ? 0 : 1;
    row.closedTrades += trade.status === "CLOSED" ? 1 : 0;
    map.set(trade.strategy, row);
  }

  return [...map.values()]
    .map((row) => {
      const closedTrades = trades.filter((trade) => trade.strategy === row.strategy && trade.status === "CLOSED");
      const winningTrades = closedTrades.filter((trade) => trade.realizedPnl > 0).length;

      return {
        ...row,
        winRate: closedTrades.length ? winningTrades / closedTrades.length : null,
        averageClosedPnl: closedTrades.length ? row.realizedPnl / closedTrades.length : null,
      };
    })
    .sort((a, b) => b.realizedPnl - a.realizedPnl);
}

function getOpenTradeStrike(trade: TradeWithEvents) {
  return trade.events.find((event) => event.strikePrice !== null && event.strikePrice !== undefined)?.strikePrice;
}

export function calculateOpenTradeExposure(trade: TradeWithEvents) {
  if (trade.status === "CLOSED" || trade.openContractCount === 0) {
    return 0;
  }

  if (trade.strategy === "COVERED_CALL") {
    return 0;
  }

  if (trade.strategy === "LONG_CALL" || trade.strategy === "LONG_PUT") {
    return calculateOpenOptionPremiumBasis(
      trade.events
        .slice()
        .sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime())
        .map((event) => ({
          type: event.type,
          contractsDelta: event.contractsDelta,
          premium: toNumber(event.premium),
        })),
    ).openPremiumBasis;
  }

  if (COLLATERALIZED_SHORT_STRATEGIES.has(trade.strategy)) {
    const strikePrice = toNumber(getOpenTradeStrike(trade));
    return Math.abs(trade.openContractCount) * strikePrice * 100;
  }

  return 0;
}

export function calculatePortfolioCapacitySnapshot(
  portfolioBaselineValue: number,
  portfolioFundings: FundingRow[],
  trades: TradeWithEvents[],
  holdings: HoldingRow[],
  portfolioBaselineAt: Date | null,
): PortfolioCapacitySnapshot {
  const contributedFunds = sum(portfolioFundings.map((entry) => entry.amount));
  const fundedCapital = portfolioBaselineValue + contributedFunds;
  const realizedPnl = sum(trades.map((trade) => toNumber(trade.realizedPnl)));
  const unrealizedPnl = sum(holdings.map((holding) => holding.unrealizedPnl ?? 0));
  const currentPortfolioValue = fundedCapital + realizedPnl + unrealizedPnl;
  const openHoldingValue = sum(holdings.map((holding) => holding.remainingQuantity * holding.costBasisPerShare));
  const openTradeExposure = sum(trades.map((trade) => calculateOpenTradeExposure(trade)));
  const openAssetValue = openHoldingValue + openTradeExposure;
  const availableCapacity = currentPortfolioValue - openAssetValue;

  return {
    baselineValue: portfolioBaselineValue,
    baselineAt: portfolioBaselineAt,
    contributedFunds,
    fundedCapital,
    realizedPnl,
    unrealizedPnl,
    currentPortfolioValue,
    openAssetValue,
    availableCapacity,
    overAllocated: availableCapacity < 0,
  };
}

export function calculatePortfolioHistory(
  portfolioBaselineValue: number,
  portfolioBaselineAt: Date | null,
  portfolioFundings: FundingRow[],
  trades: TradeWithEvents[],
  holdings: HoldingRow[],
) {
  const datedChanges = new Map<string, { date: Date; fundingDelta: number; realizedDelta: number }>();

  for (const funding of portfolioFundings) {
    const key = format(funding.occurredAt, "yyyy-MM-dd");
    const current = datedChanges.get(key) ?? { date: funding.occurredAt, fundingDelta: 0, realizedDelta: 0 };
    current.fundingDelta += funding.amount;
    datedChanges.set(key, current);
  }

  for (const trade of trades) {
    for (const event of trade.events) {
      const realized = toNumber(event.realizedPnl);
      if (!realized) {
        continue;
      }

      const key = format(event.occurredAt, "yyyy-MM-dd");
      const current = datedChanges.get(key) ?? { date: event.occurredAt, fundingDelta: 0, realizedDelta: 0 };
      current.realizedDelta += realized;
      datedChanges.set(key, current);
    }
  }

  const sortedChanges = [...datedChanges.values()].sort((a, b) => a.date.getTime() - b.date.getTime());
  const startDate =
    portfolioBaselineAt ??
    sortedChanges[0]?.date ??
    holdings[0]?.openedAt ??
    trades[0]?.openedAt ??
    new Date();

  let fundedCapital = portfolioBaselineValue;
  let realizedPnl = 0;
  const points: PerformancePoint[] = [
    {
      label: format(startDate, "MMM d"),
      date: startDate,
      fundedCapital,
      realizedPnl: 0,
      unrealizedPnl: 0,
      portfolioValue: fundedCapital,
    },
  ];

  for (const change of sortedChanges) {
    fundedCapital += change.fundingDelta;
    realizedPnl += change.realizedDelta;
    points.push({
      label: format(change.date, "MMM d"),
      date: change.date,
      fundedCapital,
      realizedPnl,
      unrealizedPnl: 0,
      portfolioValue: fundedCapital + realizedPnl,
    });
  }

  const currentUnrealized = sum(holdings.map((holding) => holding.unrealizedPnl ?? 0));
  const latestDate = new Date();
  const latestPoint = points.at(-1);
  const currentValue = fundedCapital + realizedPnl + currentUnrealized;

  if (!latestPoint || format(latestPoint.date, "yyyy-MM-dd") !== format(latestDate, "yyyy-MM-dd")) {
    points.push({
      label: format(latestDate, "MMM d"),
      date: latestDate,
      fundedCapital,
      realizedPnl,
      unrealizedPnl: currentUnrealized,
      portfolioValue: currentValue,
    });
  } else {
    latestPoint.unrealizedPnl = currentUnrealized;
    latestPoint.portfolioValue = currentValue;
  }

  return points;
}

export function calculateDashboardMetrics(trades: TradeRow[], holdings: HoldingRow[]): DashboardMetric[] {
  const premiumCollected = sum(trades.map((trade) => trade.premiumCollected));
  const realizedPnl = sum(trades.map((trade) => trade.realizedPnl)) + sum(holdings.map((holding) => holding.realizedPnl));
  const unrealizedPnl = sum(holdings.map((holding) => holding.unrealizedPnl ?? 0));
  const assignedShares = sum(holdings.map((holding) => holding.remainingQuantity));
  const openTrades = trades.filter((trade) => trade.status !== "CLOSED").length;

  return [
    {
      label: "Premium Collected",
      value: premiumCollected,
      tone: premiumCollected >= 0 ? "positive" : "negative",
      detail: `${openTrades} active positions`,
    },
    {
      label: "Realized P&L",
      value: realizedPnl,
      tone: realizedPnl >= 0 ? "positive" : "negative",
      detail: "Closed options and sold shares",
    },
    {
      label: "Unrealized P&L",
      value: unrealizedPnl,
      tone: unrealizedPnl >= 0 ? "positive" : "negative",
      detail: `${assignedShares} shares still on book`,
    },
  ];
}

export function buildDashboardSnapshot(
  trades: TradeWithEvents[],
  holdings: HoldingRow[],
  portfolioBaselineValue: number,
  portfolioBaselineAt: Date | null,
  portfolioFundings: FundingRow[],
): DashboardSnapshot {
  const nonStockTrades = trades.filter((trade) => trade.strategy !== "STOCK");
  const tradeRows = nonStockTrades.map<TradeRow>((trade) => {
    const nextExpiration = trade.events
      .filter((event) => Boolean(event.expiration))
      .sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime())
      .at(-1)?.expiration;

    return {
      id: trade.id,
      ticker: trade.ticker,
      strategy: trade.strategy,
      status: trade.status,
      archivedAt: trade.archivedAt,
      openedAt: trade.openedAt,
      nextExpiration,
      premiumCollected: toNumber(trade.premiumCollected),
      realizedPnl: toNumber(trade.realizedPnl),
      openContractCount: trade.openContractCount,
      shareExposure: trade.shareExposure,
      assignmentCount: trade.events.filter((event) => event.type === "ASSIGNMENT").length,
      linkedHoldingLotId: trade.holdingLotId,
    };
  });

  const portfolioCapacity = calculatePortfolioCapacitySnapshot(
    portfolioBaselineValue,
    portfolioFundings,
    trades,
    holdings,
    portfolioBaselineAt,
  );
  const portfolioDelta = portfolioCapacity.currentPortfolioValue - portfolioCapacity.fundedCapital;
  const portfolioReturnPct =
    portfolioCapacity.fundedCapital > 0 ? (portfolioDelta / portfolioCapacity.fundedCapital) * 100 : 0;

  const activity = trades
    .flatMap((trade) =>
      trade.events.map((event) => ({
        id: event.id,
        tradeId: trade.id,
        ticker: trade.ticker,
        type: event.type,
        occurredAt: event.occurredAt,
        premium: toNumber(event.premium),
        realizedPnl: toNumber(event.realizedPnl),
        notes: event.notes,
      })),
    )
    .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
    .slice(0, 12);

  return {
    metrics: [
      {
        label: "Portfolio Total",
        value: portfolioCapacity.currentPortfolioValue,
        tone: portfolioDelta > 0 ? "positive" : portfolioDelta < 0 ? "negative" : "neutral",
        change: portfolioCapacity.fundedCapital > 0 ? portfolioReturnPct : undefined,
        detail: `Funded capital ${formatCurrency(portfolioCapacity.fundedCapital)}`,
      },
      ...calculateDashboardMetrics(tradeRows, holdings),
    ],
    performance: calculatePortfolioHistory(
      portfolioBaselineValue,
      portfolioBaselineAt,
      portfolioFundings,
      trades,
      holdings,
    ),
    portfolioCapacity,
    funding: portfolioFundings,
    strategies: calculateStrategyBreakdown(tradeRows),
    activity,
    trades: tradeRows,
    holdings,
  };
}

export function estimateTradeReturn(premiumCollected: number, capitalAtRisk: number) {
  if (!capitalAtRisk) {
    return 0;
  }

  return (premiumCollected / capitalAtRisk) * 100;
}

export function deriveHoldingFromAssignment({
  strikePrice,
  premiumApplied,
  sharesDelta,
}: {
  strikePrice: number;
  premiumApplied: number;
  sharesDelta: number;
}) {
  const adjustedCostBasis = calculateAdjustedCostBasis(strikePrice, premiumApplied, sharesDelta);

  return {
    costBasisPerShare: adjustedCostBasis,
    notes: `Assigned at ${formatCurrency(strikePrice)} with ${formatCurrency(premiumApplied)} in premium applied.`,
  };
}

export function eventCreatesShares(eventType: TradeEventTypeValue) {
  return SHARE_ENTRY_TYPES.has(eventType);
}

export function calculateReservedShares(openContracts: number) {
  return Math.max(openContracts, 0) * 100;
}

export function calculateAvailableShares(remainingQuantity: number, reservedShares: number) {
  return Math.max(remainingQuantity - reservedShares, 0);
}

export function calculateOpenOptionPremiumBasis(
  events: Array<{
    type: TradeEventTypeValue;
    contractsDelta?: number | null;
    premium?: number | null;
  }>,
) {
  let openContracts = 0;
  let openPremiumBasis = 0;

  for (const event of events) {
    const contractsDelta = event.contractsDelta ?? 0;
    const premium = event.premium ?? 0;

    if (!contractsDelta) {
      if (event.type === "ROLL" && openContracts !== 0) {
        openPremiumBasis += openContracts > 0 ? premium : -premium;
      }
      continue;
    }

    if (openContracts === 0 || Math.sign(contractsDelta) === Math.sign(openContracts)) {
      openContracts += contractsDelta;
      openPremiumBasis += Math.abs(premium);
      continue;
    }

    const contractsClosed = Math.min(Math.abs(openContracts), Math.abs(contractsDelta));
    const averageBasisPerContract = Math.abs(openContracts) > 0 ? openPremiumBasis / Math.abs(openContracts) : 0;

    openPremiumBasis = Math.max(openPremiumBasis - averageBasisPerContract * contractsClosed, 0);
    openContracts += contractsDelta;

    if (openContracts === 0) {
      openPremiumBasis = 0;
    }
  }

  return {
    openContracts,
    openPremiumBasis,
    averageBasisPerContract: Math.abs(openContracts) > 0 ? openPremiumBasis / Math.abs(openContracts) : 0,
  };
}

export function calculateOptionCloseRealizedPnl(openContractCount: number, basisReleased: number, closePremium: number) {
  return openContractCount > 0 ? basisReleased - closePremium : closePremium - basisReleased;
}

export function calculateOptionExpirationRealizedPnl(openContractCount: number, basisReleased: number) {
  return openContractCount > 0 ? basisReleased : -basisReleased;
}

export function aggregateTradeState(events: AppendTradeEventInput[]) {
  return events.reduce(
    (state, event) => {
      const premium = event.premium ?? 0;
      const fees = event.fees ?? 0;
      const realizedPnl = event.realizedPnl ?? 0;

      state.openContractCount += event.contractsDelta ?? 0;
      state.shareExposure += event.sharesDelta ?? 0;
      state.premiumCollected += PREMIUM_TYPES.has(event.type) ? premium : 0;
      state.feesPaid += fees;
      state.realizedPnl += realizedPnl;
      return state;
    },
    {
      openContractCount: 0,
      shareExposure: 0,
      premiumCollected: 0,
      realizedPnl: 0,
      feesPaid: 0,
    },
  );
}
