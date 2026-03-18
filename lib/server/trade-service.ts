import "server-only";

import {
  HoldingStatus,
  OptionType,
  Prisma,
  StrategyType,
  TradeEventType,
  TradeStatus,
} from "@prisma/client";

import {
  calculateHoldingUnrealizedPnl,
  calculateOpenOptionPremiumBasis,
  calculateOptionCloseRealizedPnl,
  calculateOptionExpirationRealizedPnl,
  calculatePortfolioCapacitySnapshot,
  deriveHoldingFromAssignment,
  inferStatus,
} from "@/lib/domain/calculations";
import type {
  AddPortfolioFundingInput,
  AppendTradeEventInput,
  AppUser,
  CloseHoldingInput,
  CreateTradeInput,
  HoldingRow,
  TradeLifecycleActionInput,
  TradeWithEvents,
  UpdatePortfolioBaselineInput,
} from "@/lib/domain/types";
import { getCurrentPrices } from "@/lib/server/quotes";
import { prisma } from "@/lib/server/db";
import { MutationError } from "@/lib/server/mutation-response";
import { formatCurrency, toNumber } from "@/lib/utils";

const LONG_STRATEGIES = new Set<StrategyType>([StrategyType.LONG_CALL, StrategyType.LONG_PUT]);
const SHORT_STRATEGIES = new Set<StrategyType>([
  StrategyType.WHEEL,
  StrategyType.CASH_SECURED_PUT,
  StrategyType.COVERED_CALL,
  StrategyType.SHORT_CALL,
  StrategyType.SHORT_PUT,
]);

function inferOptionType(strategy: StrategyType): OptionType | undefined {
  if (strategy === StrategyType.LONG_CALL || strategy === StrategyType.SHORT_CALL || strategy === StrategyType.COVERED_CALL) {
    return OptionType.CALL;
  }
  if (strategy === StrategyType.LONG_PUT || strategy === StrategyType.SHORT_PUT || strategy === StrategyType.CASH_SECURED_PUT || strategy === StrategyType.WHEEL) {
    return OptionType.PUT;
  }
  return undefined;
}

function initialContractsDelta(strategy: StrategyType, contracts: number) {
  return LONG_STRATEGIES.has(strategy) ? -Math.abs(contracts) : Math.abs(contracts);
}

function initialEventType(strategy: StrategyType) {
  return LONG_STRATEGIES.has(strategy) ? TradeEventType.BUY_TO_OPEN : TradeEventType.SELL_TO_OPEN;
}

function closingEventType(strategy: StrategyType) {
  return LONG_STRATEGIES.has(strategy) ? TradeEventType.SELL_TO_CLOSE : TradeEventType.BUY_TO_CLOSE;
}

function closingRealizedPnl(strategy: StrategyType, entryPer: number, exitPer: number, contracts: number) {
  const multiplier = contracts * 100;
  return SHORT_STRATEGIES.has(strategy)
    ? (entryPer - exitPer) * multiplier
    : (exitPer - entryPer) * multiplier;
}

function getCoveredCallReservedShares(openContractCount: number) {
  return Math.max(openContractCount, 0) * 100;
}

function getOpeningExposure(input: CreateTradeInput) {
  if (input.closedAt && input.exitPer !== undefined) {
    return 0;
  }

  if (input.strategy === StrategyType.COVERED_CALL || input.strategy === StrategyType.STOCK) {
    return 0;
  }

  if (input.strategy === StrategyType.LONG_CALL || input.strategy === StrategyType.LONG_PUT) {
    return input.entryPer * input.contracts * 100;
  }

  if (!input.strikePrice) {
    throw new MutationError("Strike price is required to measure portfolio capacity for this position.", {
      code: "missing_strike_price",
      fieldErrors: {
        strikePrice: "Strike price is required for this strategy.",
      },
    });
  }

  return input.strikePrice * input.contracts * 100;
}

async function getPortfolioCapacityState(tx: Prisma.TransactionClient, userId: string) {
  const [user, trades, holdings, fundingEvents] = await Promise.all([
    tx.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        portfolioBaselineValue: true,
        portfolioBaselineAt: true,
      },
    }),
    tx.trade.findMany({
      where: {
        userId,
        archivedAt: null,
      },
      include: {
        events: {
          orderBy: { occurredAt: "asc" },
        },
      },
    }),
    tx.holdingLot.findMany({
      where: {
        userId,
        archivedAt: null,
      },
      include: {
        coveredCalls: {
          where: { archivedAt: null },
        },
      },
    }),
    tx.portfolioFunding.findMany({
      where: { userId },
      orderBy: { occurredAt: "asc" },
    }),
  ]);

  const currentPrices = await getCurrentPrices(
    holdings.filter((holding) => holding.status === HoldingStatus.OPEN).map((holding) => holding.ticker),
  );

  const holdingRows = holdings.map<HoldingRow>((holding) => {
    const ccPremiumCollected = holding.coveredCalls.reduce((sum, trade) => sum + toNumber(trade.premiumCollected), 0);
    const effectiveCostBasis =
      holding.remainingQuantity > 0
        ? toNumber(holding.costBasisPerShare) - ccPremiumCollected / holding.remainingQuantity
        : toNumber(holding.costBasisPerShare);
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
      activeCoveredCalls: holding.coveredCalls
        .filter((trade) => trade.status !== TradeStatus.CLOSED)
        .map((trade) => ({
          tradeId: trade.id,
          status: trade.status,
          premiumCollected: toNumber(trade.premiumCollected),
          openContracts: trade.openContractCount,
        })),
      reservedShares: holding.coveredCalls
        .filter((trade) => trade.status !== TradeStatus.CLOSED)
        .reduce((total, trade) => total + getCoveredCallReservedShares(trade.openContractCount), 0),
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

  return calculatePortfolioCapacitySnapshot(
    toNumber(user.portfolioBaselineValue),
    fundingEvents.map((event) => ({
      id: event.id,
      amount: toNumber(event.amount),
      occurredAt: event.occurredAt,
      notes: event.notes,
    })),
    trades as TradeWithEvents[],
    holdingRows,
    user.portfolioBaselineAt,
  );
}

async function assertPortfolioCapacity(
  tx: Prisma.TransactionClient,
  userId: string,
  additionalExposure: number,
) {
  if (additionalExposure <= 0) {
    return;
  }

  const capacity = await getPortfolioCapacityState(tx, userId);
  if (capacity.currentPortfolioValue <= 0) {
    throw new MutationError("Set your portfolio value before opening positions.", {
      code: "portfolio_value_required",
    });
  }

  const nextOpenAssetValue = capacity.openAssetValue + additionalExposure;
  if (nextOpenAssetValue > capacity.currentPortfolioValue) {
    throw new MutationError(
      `Open assets would rise to ${formatCurrency(nextOpenAssetValue)}, above your tracked portfolio value of ${formatCurrency(capacity.currentPortfolioValue)}. Close older positions or add funds first.`,
      {
        code: "portfolio_capacity_exceeded",
      },
    );
  }
}

function getTargetHoldingLotId(
  trade: {
    holdingLotId: string | null;
  },
  input: AppendTradeEventInput,
) {
  const metadataHoldingLotId =
    input.metadata && typeof input.metadata.holdingLotId === "string"
      ? input.metadata.holdingLotId
      : null;

  return metadataHoldingLotId ?? trade.holdingLotId ?? null;
}

async function adjustHoldingLotShares(
  tx: Prisma.TransactionClient,
  userId: string,
  trade: {
    id: string;
    ticker: string;
    holdingLotId: string | null;
  },
  input: AppendTradeEventInput,
) {
  if ((input.sharesDelta ?? 0) >= 0) {
    return;
  }

  const sharesToReduce = Math.abs(input.sharesDelta ?? 0);
  const targetHoldingLotId = getTargetHoldingLotId(trade, input);
  const openLot = targetHoldingLotId
    ? await tx.holdingLot.findFirst({
        where: {
          id: targetHoldingLotId,
          userId,
          archivedAt: null,
          status: HoldingStatus.OPEN,
          remainingQuantity: { gt: 0 },
        },
        include: {
          coveredCalls: {
            where: { archivedAt: null },
          },
        },
      })
    : await tx.holdingLot.findFirst({
        where: {
          userId,
          ticker: trade.ticker,
          archivedAt: null,
          status: HoldingStatus.OPEN,
          remainingQuantity: { gt: 0 },
        },
        include: {
          coveredCalls: {
            where: { archivedAt: null },
          },
        },
        orderBy: { openedAt: "asc" },
      });

  if (!openLot) {
    throw new MutationError("No open holding lot was found for this share exit.", {
      code: "holding_lot_not_found",
    });
  }

  const reservedShares = openLot.coveredCalls
    .filter((coveredCall) => coveredCall.id !== trade.id)
    .filter((coveredCall) => coveredCall.status !== TradeStatus.CLOSED)
    .reduce((total, coveredCall) => total + getCoveredCallReservedShares(coveredCall.openContractCount), 0);

  const sharesAvailable = Math.max(openLot.remainingQuantity - reservedShares, 0);
  if (sharesToReduce > openLot.remainingQuantity || sharesToReduce > sharesAvailable) {
    throw new MutationError("Share exit exceeds the available quantity on the linked holding lot.", {
      code: "share_exit_exceeds_available",
    });
  }

  const remainingQuantity = openLot.remainingQuantity - sharesToReduce;
  const sharePrice = input.sharePrice ?? toNumber(openLot.costBasisPerShare);
  const realizedPnl =
    (sharePrice - toNumber(openLot.costBasisPerShare)) * sharesToReduce + (input.realizedPnl ?? 0);

  await tx.holdingLot.update({
    where: { id: openLot.id },
    data: {
      remainingQuantity,
      realizedPnl: {
        increment: realizedPnl,
      },
      closedAt: remainingQuantity === 0 ? input.occurredAt : null,
      status: remainingQuantity === 0 ? HoldingStatus.CLOSED : HoldingStatus.OPEN,
    },
  });
}

async function refreshTradeSummary(tx: Prisma.TransactionClient, tradeId: string) {
  const trade = await tx.trade.findUniqueOrThrow({
    where: { id: tradeId },
    include: {
      events: {
        orderBy: { occurredAt: "asc" },
      },
    },
  });

  const openContractCount = trade.events.reduce((total, event) => total + (event.contractsDelta ?? 0), 0);
  const shareExposure = trade.events.reduce((total, event) => total + (event.sharesDelta ?? 0), 0);
  const premiumCollected = trade.events.reduce((total, event) => {
    const premium = toNumber(event.premium);
    return (
      event.type === TradeEventType.SELL_TO_OPEN ||
      event.type === TradeEventType.SELL_TO_CLOSE ||
      event.type === TradeEventType.ROLL
    )
      ? total + premium
      : total;
  }, 0);
  const feesPaid = trade.events.reduce((total, event) => total + toNumber(event.fees), 0);
  const realizedPnl = trade.events.reduce((total, event) => total + toNumber(event.realizedPnl), 0);
  const status = inferStatus(openContractCount, shareExposure);

  return tx.trade.update({
    where: { id: tradeId },
    data: {
      openContractCount,
      shareExposure,
      premiumCollected,
      feesPaid,
      realizedPnl,
      status,
      closedAt: status === "CLOSED" ? trade.events.at(-1)?.occurredAt ?? new Date() : null,
    },
  });
}

export async function createTrade(user: AppUser, input: CreateTradeInput) {
  return prisma.$transaction(async (tx) => {
    const optionType = inferOptionType(input.strategy);
    const openContractsDelta = initialContractsDelta(input.strategy, input.contracts);
    const openPremium = input.entryPer * input.contracts * 100;
    const openingExposure = getOpeningExposure(input);

    if (input.strategy === StrategyType.COVERED_CALL) {
      if (!input.holdingLotId) {
        throw new MutationError("Covered calls must be linked to a holding lot.", {
          code: "holding_lot_required",
        });
      }

      const holding = await tx.holdingLot.findFirstOrThrow({
        where: {
          id: input.holdingLotId,
          userId: user.id,
          archivedAt: null,
          status: HoldingStatus.OPEN,
        },
        include: {
          coveredCalls: {
            where: {
              archivedAt: null,
            },
          },
        },
      });

      const reservedShares = holding.coveredCalls
        .filter((coveredCall) => coveredCall.status !== TradeStatus.CLOSED)
        .reduce((total, coveredCall) => total + getCoveredCallReservedShares(coveredCall.openContractCount), 0);
      const availableShares = Math.max(holding.remainingQuantity - reservedShares, 0);

      if (input.contracts * 100 > availableShares) {
        throw new MutationError("Not enough uncovered shares are available for this covered call.", {
          code: "insufficient_uncovered_shares",
          fieldErrors: {
            contracts: "That contract count would reserve more shares than this lot has uncovered.",
          },
        });
      }
    }

    await assertPortfolioCapacity(tx, user.id, openingExposure);

    const trade = await tx.trade.create({
      data: {
        userId: user.id,
        ticker: input.ticker,
        accountLabel: input.accountLabel,
        strategy: input.strategy,
        optionType,
        thesis: input.thesis,
        tags: [],
        openedAt: input.openedAt,
        status: TradeStatus.OPEN,
        premiumCollected: 0,
        realizedPnl: 0,
        feesPaid: 0,
        openContractCount: 0,
        shareExposure: 0,
        holdingLotId: input.holdingLotId,
      },
    });

    await tx.tradeEvent.create({
      data: {
        userId: user.id,
        tradeId: trade.id,
        type: initialEventType(input.strategy),
        occurredAt: input.openedAt,
        optionType,
        contractsDelta: openContractsDelta,
        strikePrice: input.strikePrice,
        expiration: input.expiration,
        premium: openPremium,
        fees: 0,
      },
    });

    if (input.closedAt && input.exitPer !== undefined) {
      const closePremium = input.exitPer * input.contracts * 100;
      const realizedPnl = closingRealizedPnl(input.strategy, input.entryPer, input.exitPer, input.contracts);

      await tx.tradeEvent.create({
        data: {
          userId: user.id,
          tradeId: trade.id,
          type: closingEventType(input.strategy),
          occurredAt: input.closedAt,
          optionType,
          contractsDelta: -openContractsDelta,
          strikePrice: input.strikePrice,
          premium: closePremium,
          realizedPnl,
          fees: 0,
        },
      });
    }

    const refreshed = await refreshTradeSummary(tx, trade.id);
    return refreshed.id;
  });
}

export async function appendTradeEvent(user: AppUser, tradeId: string, input: AppendTradeEventInput) {
  return prisma.$transaction(async (tx) => {
    const trade = await tx.trade.findFirstOrThrow({
      where: { id: tradeId, userId: user.id, archivedAt: null },
    });

    const event = await tx.tradeEvent.create({
      data: {
        userId: user.id,
        tradeId: trade.id,
        type: input.type,
        occurredAt: input.occurredAt,
        optionType: input.optionType,
        contractsDelta: input.contractsDelta,
        sharesDelta: input.sharesDelta,
        strikePrice: input.strikePrice,
        expiration: input.expiration,
        premium: input.premium,
        fees: input.fees,
        realizedPnl: input.realizedPnl,
        underlyingPrice: input.underlyingPrice,
        sharePrice: input.sharePrice,
        notes: input.notes,
        metadata: (input.metadata as Prisma.InputJsonValue | undefined) ?? Prisma.JsonNull,
      },
    });

    if (
      input.type === TradeEventType.ASSIGNMENT &&
      input.sharesDelta &&
      input.sharesDelta > 0 &&
      input.strikePrice
    ) {
      const derived = deriveHoldingFromAssignment({
        strikePrice: input.strikePrice,
        premiumApplied: input.premium ?? 0,
        sharesDelta: input.sharesDelta,
      });

      const lot = await tx.holdingLot.create({
        data: {
          userId: user.id,
          tradeId: trade.id,
          ticker: trade.ticker,
          openedAt: input.occurredAt,
          acquiredVia: TradeEventType.ASSIGNMENT,
          quantity: input.sharesDelta,
          remainingQuantity: input.sharesDelta,
          costBasisPerShare: derived.costBasisPerShare,
          realizedPnl: 0,
          status: HoldingStatus.OPEN,
          notes: derived.notes,
        },
      });

      await tx.assignment.create({
        data: {
          userId: user.id,
          tradeEventId: event.id,
          holdingLotId: lot.id,
          ticker: trade.ticker,
          optionType: input.optionType ?? "PUT",
          strikePrice: input.strikePrice,
          shareQuantity: input.sharesDelta,
          premiumApplied: input.premium ?? 0,
          adjustedCostBasis: derived.costBasisPerShare,
          assignedAt: input.occurredAt,
        },
      });
    }

    await adjustHoldingLotShares(tx, user.id, trade, input);

    if (input.type === TradeEventType.ROLL && input.metadata?.fromEventId) {
      await tx.roll.create({
        data: {
          userId: user.id,
          fromEventId: String(input.metadata.fromEventId),
          toEventId: event.id,
          netCredit: input.premium ?? 0,
        },
      });
    }

    await refreshTradeSummary(tx, trade.id);

    return event.id;
  });
}

export async function createHolding(user: AppUser, input: {
  ticker: string;
  quantity: number;
  costBasisPerShare: number;
  notes?: string;
  openedAt: Date;
}) {
  return prisma.$transaction(async (tx) => {
    await assertPortfolioCapacity(tx, user.id, input.quantity * input.costBasisPerShare);

    const trade = await tx.trade.create({
      data: {
        userId: user.id,
        ticker: input.ticker,
        strategy: StrategyType.STOCK,
        status: TradeStatus.OPEN,
        openedAt: input.openedAt,
        premiumCollected: 0,
        realizedPnl: 0,
        feesPaid: 0,
        openContractCount: 0,
        shareExposure: input.quantity,
        notes: input.notes,
      },
    });

    await tx.tradeEvent.create({
      data: {
        userId: user.id,
        tradeId: trade.id,
        type: TradeEventType.STOCK_BUY,
        occurredAt: input.openedAt,
        sharesDelta: input.quantity,
        sharePrice: input.costBasisPerShare,
        notes: input.notes,
      },
    });

    return tx.holdingLot.create({
      data: {
        userId: user.id,
        tradeId: trade.id,
        ticker: input.ticker,
        openedAt: input.openedAt,
        acquiredVia: TradeEventType.STOCK_BUY,
        quantity: input.quantity,
        remainingQuantity: input.quantity,
        costBasisPerShare: input.costBasisPerShare,
        realizedPnl: 0,
        status: HoldingStatus.OPEN,
        notes: input.notes,
      },
    });
  });
}

export async function closeHolding(user: AppUser, holdingLotId: string, input: CloseHoldingInput) {
  return prisma.$transaction(async (tx) => {
    const holding = await tx.holdingLot.findFirstOrThrow({
      where: {
        id: holdingLotId,
        userId: user.id,
        archivedAt: null,
      },
      include: {
        coveredCalls: {
          where: {
            archivedAt: null,
          },
        },
      },
    });

    if (holding.status !== HoldingStatus.OPEN || holding.remainingQuantity <= 0) {
      throw new MutationError("Holding is already closed.", {
        code: "holding_already_closed",
      });
    }

    const reservedShares = holding.coveredCalls
      .filter((trade) => trade.status !== TradeStatus.CLOSED)
      .reduce((total, trade) => total + Math.max(trade.openContractCount, 0) * 100, 0);
    const maxSellableShares = Math.max(holding.remainingQuantity - reservedShares, 0);

    if (input.quantityToSell > maxSellableShares) {
      throw new MutationError("Sell quantity exceeds available uncovered shares.", {
        code: "sell_quantity_exceeds_uncovered",
        fieldErrors: {
          quantityToSell: "Sell quantity exceeds the uncovered shares in this lot.",
        },
      });
    }

    const realizedPnlDelta =
      (input.salePrice - toNumber(holding.costBasisPerShare)) * input.quantityToSell;
    const sharesDelta = -input.quantityToSell;
    const remainingQuantity = holding.remainingQuantity - input.quantityToSell;

    if (holding.tradeId) {
      await tx.tradeEvent.create({
        data: {
          userId: user.id,
          tradeId: holding.tradeId,
          type: TradeEventType.STOCK_SELL,
          occurredAt: input.soldAt,
          sharesDelta,
          sharePrice: input.salePrice,
          realizedPnl: realizedPnlDelta,
          notes: input.notes,
        },
      });

      await refreshTradeSummary(tx, holding.tradeId);
    }

    return tx.holdingLot.update({
      where: { id: holding.id },
      data: {
        remainingQuantity,
        realizedPnl: {
          increment: realizedPnlDelta,
        },
        status: remainingQuantity === 0 ? HoldingStatus.CLOSED : HoldingStatus.OPEN,
        closedAt: remainingQuantity === 0 ? input.soldAt : null,
        notes: input.notes ? `${holding.notes ? `${holding.notes}\n` : ""}${input.notes}` : holding.notes,
      },
    });
  });
}

export async function archiveTrade(user: AppUser, tradeId: string, archived: boolean) {
  const trade = await prisma.trade.findFirstOrThrow({
    where: {
      id: tradeId,
      userId: user.id,
    },
  });

  if (archived && trade.status !== TradeStatus.CLOSED) {
    throw new MutationError("Only closed trades can be archived. Use hard delete for accidental open entries.", {
      code: "trade_archive_requires_closed",
    });
  }

  return prisma.trade.update({
    where: { id: trade.id },
    data: {
      archivedAt: archived ? new Date() : null,
    },
  });
}

export async function updatePortfolioBaseline(user: AppUser, input: UpdatePortfolioBaselineInput) {
  return prisma.user.update({
    where: { id: user.id },
    data: {
      portfolioBaselineValue: input.portfolioBaselineValue,
      portfolioBaselineAt: input.portfolioBaselineAt,
    },
  });
}

export async function addPortfolioFunding(user: AppUser, input: AddPortfolioFundingInput) {
  return prisma.portfolioFunding.create({
    data: {
      userId: user.id,
      amount: input.amount,
      occurredAt: input.occurredAt,
      notes: input.notes,
    },
  });
}

export async function archiveHolding(user: AppUser, holdingLotId: string, archived: boolean) {
  const holding = await prisma.holdingLot.findFirstOrThrow({
    where: {
      id: holdingLotId,
      userId: user.id,
    },
    include: {
      coveredCalls: {
        where: { archivedAt: null },
      },
    },
  });

  if (archived && holding.status !== HoldingStatus.CLOSED) {
    throw new MutationError("Only closed holdings can be archived. Use hard delete for accidental open entries.", {
      code: "holding_archive_requires_closed",
    });
  }

  if (archived && holding.coveredCalls.some((trade) => trade.status !== TradeStatus.CLOSED)) {
    throw new MutationError("Close or archive linked covered calls before archiving this holding.", {
      code: "holding_archive_blocked_by_covered_calls",
    });
  }

  return prisma.holdingLot.update({
    where: { id: holding.id },
    data: {
      archivedAt: archived ? new Date() : null,
    },
  });
}

export async function applyTradeLifecycleAction(
  user: AppUser,
  tradeId: string,
  input: TradeLifecycleActionInput,
) {
  const trade = await prisma.trade.findFirstOrThrow({
    where: {
      id: tradeId,
      userId: user.id,
      archivedAt: null,
    },
    include: {
      events: {
        orderBy: { occurredAt: "asc" },
      },
      holdingLot: {
        include: {
          coveredCalls: {
            where: { archivedAt: null },
          },
        },
      },
    },
  });

  const openContracts = Math.abs(trade.openContractCount);
  if (trade.strategy === StrategyType.STOCK) {
    throw new MutationError("Stock trades do not support option lifecycle actions.", {
      code: "stock_trade_lifecycle_unsupported",
    });
  }

  const lastOptionEvent = trade.events.find((event) => event.optionType);
  const openOptionPosition = calculateOpenOptionPremiumBasis(
    trade.events.map((event) => ({
      type: event.type,
      contractsDelta: event.contractsDelta,
      premium: toNumber(event.premium),
    })),
  );

  switch (input.action) {
    case "close_option": {
      if (!openContracts || input.contracts > openContracts) {
        throw new MutationError("Close quantity exceeds the open contract count.", {
          code: "close_quantity_exceeds_open_contracts",
        });
      }

      const contractsDelta = trade.openContractCount > 0 ? -input.contracts : input.contracts;
      const eventType = trade.openContractCount > 0 ? TradeEventType.BUY_TO_CLOSE : TradeEventType.SELL_TO_CLOSE;
      const basisReleased = openOptionPosition.averageBasisPerContract * input.contracts;
      const realizedPnl = calculateOptionCloseRealizedPnl(trade.openContractCount, basisReleased, input.premium);

      return appendTradeEvent(user, tradeId, {
        type: eventType,
        occurredAt: input.occurredAt,
        optionType: trade.optionType ?? lastOptionEvent?.optionType ?? undefined,
        contractsDelta,
        premium: input.premium,
        realizedPnl,
        notes: input.notes,
      });
    }

    case "expire_option": {
      if (!openContracts || input.contracts > openContracts) {
        throw new MutationError("Expiration quantity exceeds the open contract count.", {
          code: "expiration_quantity_exceeds_open_contracts",
        });
      }

      const contractsDelta = trade.openContractCount > 0 ? -input.contracts : input.contracts;
      const basisReleased = openOptionPosition.averageBasisPerContract * input.contracts;
      const realizedPnl = calculateOptionExpirationRealizedPnl(trade.openContractCount, basisReleased);

      return appendTradeEvent(user, tradeId, {
        type: TradeEventType.EXPIRATION,
        occurredAt: input.occurredAt,
        optionType: trade.optionType ?? lastOptionEvent?.optionType ?? undefined,
        contractsDelta,
        realizedPnl,
        notes: input.notes,
      });
    }

    case "roll_option": {
      const sourceEvent = trade.events.find((event) => event.id === input.fromEventId);
      if (!sourceEvent) {
        throw new MutationError("The selected source leg does not belong to this trade.", {
          code: "invalid_roll_source_leg",
        });
      }

      return appendTradeEvent(user, tradeId, {
        type: TradeEventType.ROLL,
        occurredAt: input.occurredAt,
        optionType: trade.optionType ?? sourceEvent.optionType ?? undefined,
        contractsDelta: 0,
        strikePrice: input.nextStrikePrice,
        expiration: input.nextExpiration,
        premium: input.netCredit,
        notes: input.notes,
        metadata: {
          fromEventId: input.fromEventId,
          holdingLotId: trade.holdingLotId,
        },
      });
    }

    case "assign_put": {
      if ((trade.optionType ?? lastOptionEvent?.optionType) !== OptionType.PUT) {
        throw new MutationError("Only put trades can use put assignment.", {
          code: "put_assignment_requires_put_trade",
        });
      }
      if (!openContracts || input.contracts > openContracts) {
        throw new MutationError("Assignment quantity exceeds the open contract count.", {
          code: "assignment_quantity_exceeds_open_contracts",
        });
      }

      const sharesDelta = input.contracts * 100;
      const premiumApplied = Math.max(toNumber(trade.premiumCollected), 0);

      return appendTradeEvent(user, tradeId, {
        type: TradeEventType.ASSIGNMENT,
        occurredAt: input.occurredAt,
        optionType: OptionType.PUT,
        contractsDelta: -input.contracts,
        sharesDelta,
        strikePrice: input.strikePrice,
        premium: premiumApplied,
        sharePrice: input.strikePrice,
        notes: input.notes,
      });
    }

    case "assign_called_shares": {
      if ((trade.optionType ?? lastOptionEvent?.optionType) !== OptionType.CALL) {
        throw new MutationError("Only call trades can use called-share assignment.", {
          code: "called_shares_requires_call_trade",
        });
      }
      if (!trade.holdingLotId || !trade.holdingLot) {
        throw new MutationError("Covered-call assignments must be tied to a holding lot.", {
          code: "called_shares_requires_linked_holding",
        });
      }
      if (!openContracts || input.contracts > openContracts) {
        throw new MutationError("Assignment quantity exceeds the open contract count.", {
          code: "assignment_quantity_exceeds_open_contracts",
        });
      }

      const sharesDelta = -(input.contracts * 100);
      const linkedReservedShares = trade.holdingLot.coveredCalls
        .filter((coveredCall) => coveredCall.id === trade.id)
        .reduce((total, coveredCall) => total + getCoveredCallReservedShares(coveredCall.openContractCount), 0);

      if (Math.abs(sharesDelta) > linkedReservedShares) {
        throw new MutationError("Assignment quantity exceeds the linked covered-call exposure.", {
          code: "assignment_exceeds_linked_covered_call_exposure",
        });
      }

      return appendTradeEvent(user, tradeId, {
        type: TradeEventType.ASSIGNMENT,
        occurredAt: input.occurredAt,
        optionType: OptionType.CALL,
        contractsDelta: -input.contracts,
        sharesDelta,
        strikePrice: input.strikePrice,
        sharePrice: input.strikePrice,
        notes: input.notes,
        metadata: {
          holdingLotId: trade.holdingLotId,
        },
      });
    }
  }
}

export async function deleteTrade(user: AppUser, tradeId: string) {
  const trade = await prisma.trade.findFirstOrThrow({
    where: {
      id: tradeId,
      userId: user.id,
    },
    include: {
      holdings: true,
    },
  });

  if (trade.strategy === StrategyType.STOCK || trade.holdings.length > 0) {
    throw new MutationError("This trade has dependent holding history and cannot be hard-deleted.", {
      code: "trade_delete_blocked_by_holding_history",
    });
  }

  await prisma.trade.delete({
    where: { id: trade.id },
  });
}

export async function deleteHolding(user: AppUser, holdingLotId: string) {
  const holding = await prisma.holdingLot.findFirstOrThrow({
    where: {
      id: holdingLotId,
      userId: user.id,
    },
    include: {
      coveredCalls: {
        where: { archivedAt: null },
      },
    },
  });

  if (holding.coveredCalls.some((trade) => trade.status !== TradeStatus.CLOSED)) {
    throw new MutationError("Archive or close linked covered calls before deleting this holding lot.", {
      code: "holding_delete_blocked_by_covered_calls",
    });
  }

  await prisma.holdingLot.delete({
    where: { id: holding.id },
  });
}
