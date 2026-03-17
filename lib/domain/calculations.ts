import { StrategyType, TradeEventType, TradeStatus } from "@prisma/client";

import type {
  AppendTradeEventInput,
  DashboardMetric,
  DashboardSnapshot,
  HoldingRow,
  PerformancePoint,
  StrategyBreakdownPoint,
  TradeRow,
  TradeWithEvents,
} from "@/lib/domain/types";
import { formatCurrency, sum, toNumber } from "@/lib/utils";

const PREMIUM_TYPES = new Set<TradeEventType>([
  TradeEventType.SELL_TO_OPEN,
  TradeEventType.SELL_TO_CLOSE,
  TradeEventType.ROLL,
]);

const SHARE_ENTRY_TYPES = new Set<TradeEventType>([TradeEventType.ASSIGNMENT, TradeEventType.STOCK_BUY]);

export function calculateAdjustedCostBasis(strikePrice: number, premiumApplied: number, shareQuantity: number) {
  if (!shareQuantity) {
    return strikePrice;
  }

  return strikePrice - premiumApplied / shareQuantity;
}

export function inferStatus(openContracts: number, shareExposure: number): TradeStatus {
  if (openContracts > 0 && shareExposure > 0) {
    return TradeStatus.PARTIAL;
  }

  if (openContracts > 0) {
    return TradeStatus.OPEN;
  }

  if (shareExposure > 0) {
    return TradeStatus.ASSIGNED;
  }

  return TradeStatus.CLOSED;
}

export function calculateHoldingUnrealizedPnl(holding: HoldingRow) {
  if (holding.currentPrice === null || holding.remainingQuantity === 0) {
    return null;
  }

  return (holding.currentPrice - holding.costBasisPerShare) * holding.remainingQuantity;
}

export function calculateStrategyBreakdown(trades: TradeRow[]): StrategyBreakdownPoint[] {
  const map = new Map<StrategyType, StrategyBreakdownPoint>();

  for (const trade of trades) {
    const row = map.get(trade.strategy) ?? {
      strategy: trade.strategy,
      premium: 0,
      realizedPnl: 0,
      activeTrades: 0,
    };

    row.premium += trade.premiumCollected;
    row.realizedPnl += trade.realizedPnl;
    row.activeTrades += trade.status === TradeStatus.CLOSED ? 0 : 1;
    map.set(trade.strategy, row);
  }

  return [...map.values()].sort((a, b) => b.realizedPnl - a.realizedPnl);
}

export function calculatePerformancePoints(trades: TradeWithEvents[], holdings: HoldingRow[]): PerformancePoint[] {
  const tradePoints = trades.map((trade) => ({
    label: trade.ticker,
    realizedPnl: toNumber(trade.realizedPnl),
    premium: toNumber(trade.premiumCollected),
    unrealizedPnl: 0,
  }));

  for (const holding of holdings) {
    tradePoints.push({
      label: holding.ticker,
      realizedPnl: holding.realizedPnl,
      premium: 0,
      unrealizedPnl: calculateHoldingUnrealizedPnl(holding) ?? 0,
    });
  }

  return tradePoints.slice(0, 8);
}

export function calculateDashboardMetrics(trades: TradeRow[], holdings: HoldingRow[]): DashboardMetric[] {
  const premiumCollected = sum(trades.map((trade) => trade.premiumCollected));
  const realizedPnl = sum(trades.map((trade) => trade.realizedPnl)) + sum(holdings.map((holding) => holding.realizedPnl));
  const unrealizedPnl = sum(holdings.map((holding) => holding.unrealizedPnl ?? 0));
  const assignedShares = sum(holdings.map((holding) => holding.remainingQuantity));
  const openTrades = trades.filter((trade) => trade.status !== TradeStatus.CLOSED).length;

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
    {
      label: "Cost Basis at Risk",
      value: sum(holdings.map((holding) => holding.costBasisPerShare * holding.remainingQuantity)),
      tone: "neutral",
      detail: formatCurrency(assignedShares, true),
    },
  ];
}

export function buildDashboardSnapshot(trades: TradeWithEvents[], holdings: HoldingRow[]): DashboardSnapshot {
  const tradeRows = trades.map<TradeRow>((trade) => {
    const nextExpiration = trade.events
      .filter((event) => Boolean(event.expiration))
      .sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime())
      .at(-1)?.expiration;

    return {
      id: trade.id,
      ticker: trade.ticker,
      strategy: trade.strategy,
      status: trade.status,
      openedAt: trade.openedAt,
      nextExpiration,
      premiumCollected: toNumber(trade.premiumCollected),
      realizedPnl: toNumber(trade.realizedPnl),
      openContractCount: trade.openContractCount,
      shareExposure: trade.shareExposure,
      assignmentCount: trade.events.filter((event) => event.type === TradeEventType.ASSIGNMENT).length,
    };
  });

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
    metrics: calculateDashboardMetrics(tradeRows, holdings),
    performance: calculatePerformancePoints(trades, holdings),
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

export function eventCreatesShares(eventType: TradeEventType) {
  return SHARE_ENTRY_TYPES.has(eventType);
}

export function calculateReservedShares(openContracts: number) {
  return Math.max(openContracts, 0) * 100;
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
