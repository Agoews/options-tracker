export const OPTION_TYPES = ["CALL", "PUT"] as const;
export type OptionTypeValue = (typeof OPTION_TYPES)[number];

export const STRATEGY_TYPES = [
  "WHEEL",
  "CASH_SECURED_PUT",
  "COVERED_CALL",
  "SHORT_CALL",
  "SHORT_PUT",
  "LONG_CALL",
  "LONG_PUT",
  "STOCK",
] as const;
export type StrategyTypeValue = (typeof STRATEGY_TYPES)[number];

export const TRADE_EVENT_TYPES = [
  "BUY_TO_OPEN",
  "SELL_TO_OPEN",
  "BUY_TO_CLOSE",
  "SELL_TO_CLOSE",
  "PARTIAL_CLOSE",
  "REOPEN",
  "ASSIGNMENT",
  "EXERCISE",
  "EXPIRATION",
  "ROLL",
  "STOCK_BUY",
  "STOCK_SELL",
  "DIVIDEND",
  "NOTE",
] as const;
export type TradeEventTypeValue = (typeof TRADE_EVENT_TYPES)[number];

export const TRADE_STATUSES = ["OPEN", "PARTIAL", "ASSIGNED", "CLOSED"] as const;
export type TradeStatusValue = (typeof TRADE_STATUSES)[number];

export const HOLDING_STATUSES = ["OPEN", "CLOSED"] as const;
export type HoldingStatusValue = (typeof HOLDING_STATUSES)[number];

export const STRATEGY_LABELS: Record<StrategyTypeValue, string> = {
  WHEEL: "Wheel",
  CASH_SECURED_PUT: "Cash-Secured Put",
  COVERED_CALL: "Covered Call",
  SHORT_CALL: "Short Call",
  SHORT_PUT: "Short Put",
  LONG_CALL: "Long Call",
  LONG_PUT: "Long Put",
  STOCK: "Stock",
};
