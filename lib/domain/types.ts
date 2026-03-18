import type {
  HoldingStatus,
  OptionType,
  PortfolioFunding,
  StrategyType,
  Trade,
  TradeEvent,
  TradeEventType,
  TradeStatus,
  User,
} from "@prisma/client";

export type AppUser = Pick<
  User,
  | "id"
  | "firebaseUid"
  | "email"
  | "displayName"
  | "avatarUrl"
  | "onboardingComplete"
  | "timezone"
  | "baseCurrency"
  | "portfolioBaselineValue"
  | "portfolioBaselineAt"
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
  premiumCollected: number;
  realizedPnl: number;
  activeTrades: number;
  closedTrades: number;
  winRate: number | null;
  averageClosedPnl: number | null;
};

export type PerformancePoint = {
  label: string;
  portfolioValue: number;
  fundedCapital: number;
  realizedPnl: number;
  unrealizedPnl: number;
  date: Date;
};

export type PortfolioCapacitySnapshot = {
  baselineValue: number;
  baselineAt: Date | null;
  contributedFunds: number;
  fundedCapital: number;
  realizedPnl: number;
  unrealizedPnl: number;
  currentPortfolioValue: number;
  openAssetValue: number;
  availableCapacity: number;
  overAllocated: boolean;
};

export type FundingRow = Pick<PortfolioFunding, "id" | "occurredAt" | "notes"> & {
  amount: number;
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
  archivedAt: Date | null;
  openedAt: Date;
  nextExpiration?: Date | null;
  premiumCollected: number;
  realizedPnl: number;
  openContractCount: number;
  shareExposure: number;
  assignmentCount: number;
  linkedHoldingLotId: string | null;
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
  archivedAt: Date | null;
  openedAt: Date;
  closedAt: Date | null;
};

export type TradeLifecycleActionInput =
  | {
      action: "close_option";
      occurredAt: Date;
      contracts: number;
      premium: number;
      notes?: string;
    }
  | {
      action: "expire_option";
      occurredAt: Date;
      contracts: number;
      notes?: string;
    }
  | {
      action: "roll_option";
      occurredAt: Date;
      netCredit: number;
      nextExpiration: Date;
      nextStrikePrice: number;
      fromEventId: string;
      notes?: string;
    }
  | {
      action: "assign_put";
      occurredAt: Date;
      contracts: number;
      strikePrice: number;
      notes?: string;
    }
  | {
      action: "assign_called_shares";
      occurredAt: Date;
      contracts: number;
      strikePrice: number;
      notes?: string;
    };

export type DashboardSnapshot = {
  metrics: DashboardMetric[];
  performance: PerformancePoint[];
  portfolioCapacity: PortfolioCapacitySnapshot;
  funding: FundingRow[];
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

export type UpdatePortfolioBaselineInput = {
  portfolioBaselineValue: number;
  portfolioBaselineAt: Date;
};

export type AddPortfolioFundingInput = {
  amount: number;
  occurredAt: Date;
  notes?: string;
};
