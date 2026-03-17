import type {
  HoldingStatus,
  OptionType,
  StrategyType,
  Trade,
  TradeEvent,
  TradeEventType,
  TradeStatus,
  User,
} from "@prisma/client";

export type AppUser = Pick<
  User,
  "id" | "firebaseUid" | "email" | "displayName" | "avatarUrl" | "onboardingComplete" | "timezone" | "baseCurrency"
>;

export type TradeWithEvents = Trade & {
  events: TradeEvent[];
};

export type DashboardMetric = {
  label: string;
  value: number;
  change?: number;
  tone: "neutral" | "positive" | "negative";
  detail: string;
};

export type StrategyBreakdownPoint = {
  strategy: StrategyType;
  premium: number;
  realizedPnl: number;
  activeTrades: number;
};

export type PerformancePoint = {
  label: string;
  realizedPnl: number;
  premium: number;
  unrealizedPnl: number;
};

export type ActivityItem = {
  id: string;
  tradeId: string;
  ticker: string;
  type: TradeEventType;
  occurredAt: Date;
  premium: number;
  realizedPnl: number;
  notes: string | null;
};

export type TradeRow = {
  id: string;
  ticker: string;
  strategy: StrategyType;
  status: TradeStatus;
  openedAt: Date;
  nextExpiration?: Date | null;
  premiumCollected: number;
  realizedPnl: number;
  openContractCount: number;
  shareExposure: number;
  assignmentCount: number;
};

export type LinkedCoveredCall = {
  tradeId: string;
  status: TradeStatus;
  premiumCollected: number;
  openContracts: number;
};

export type HoldingRow = {
  id: string;
  ticker: string;
  quantity: number;
  remainingQuantity: number;
  costBasisPerShare: number;
  effectiveCostBasis: number;
  ccPremiumCollected: number;
  acquiredVia: "STOCK_BUY" | "ASSIGNMENT";
  activeCoveredCalls: LinkedCoveredCall[];
  reservedShares: number;
  currentPrice: number | null;
  unrealizedPnl: number | null;
  realizedPnl: number;
  status: HoldingStatus;
  openedAt: Date;
  closedAt: Date | null;
};

export type DashboardSnapshot = {
  metrics: DashboardMetric[];
  performance: PerformancePoint[];
  strategies: StrategyBreakdownPoint[];
  activity: ActivityItem[];
  trades: TradeRow[];
  holdings: HoldingRow[];
};

export type CreateTradeInput = {
  ticker: string;
  accountLabel?: string;
  strategy: StrategyType;
  openedAt: Date;
  expiration?: Date;
  strikePrice?: number;
  contracts: number;
  entryPer: number;
  exitPer?: number;
  closedAt?: Date;
  thesis?: string;
  holdingLotId?: string;
};

export type AppendTradeEventInput = {
  type: TradeEventType;
  occurredAt: Date;
  optionType?: OptionType;
  contractsDelta?: number;
  sharesDelta?: number;
  strikePrice?: number;
  expiration?: Date;
  premium?: number;
  fees?: number;
  realizedPnl?: number;
  underlyingPrice?: number;
  sharePrice?: number;
  notes?: string;
  metadata?: Record<string, unknown>;
};

export type CloseHoldingInput = {
  quantityToSell: number;
  salePrice: number;
  soldAt: Date;
  notes?: string;
};
