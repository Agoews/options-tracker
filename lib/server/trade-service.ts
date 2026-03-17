import "server-only";

import {
  HoldingStatus,
  OptionType,
  Prisma,
  StrategyType,
  TradeEventType,
  TradeStatus,
} from "@prisma/client";

import { deriveHoldingFromAssignment, inferStatus } from "@/lib/domain/calculations";
import type {
  AppendTradeEventInput,
  AppUser,
  CloseHoldingInput,
  CreateTradeInput,
} from "@/lib/domain/types";
import { prisma } from "@/lib/server/db";
import { toNumber } from "@/lib/utils";

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
      where: { id: tradeId, userId: user.id },
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

    if ((input.sharesDelta ?? 0) < 0) {
      const openLot = await tx.holdingLot.findFirst({
        where: {
          userId: user.id,
          ticker: trade.ticker,
          status: HoldingStatus.OPEN,
          remainingQuantity: { gt: 0 },
        },
        orderBy: { openedAt: "asc" },
      });

      if (openLot) {
        const remainingQuantity = Math.max(openLot.remainingQuantity + (input.sharesDelta ?? 0), 0);
        const soldQuantity = openLot.remainingQuantity - remainingQuantity;
        const sharePrice = input.sharePrice ?? toNumber(openLot.costBasisPerShare);
        const realizedPnl =
          (sharePrice - toNumber(openLot.costBasisPerShare)) * soldQuantity + (input.realizedPnl ?? 0);

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
    }

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
  const trade = await prisma.trade.create({
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

  await prisma.tradeEvent.create({
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

  return prisma.holdingLot.create({
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
}

export async function closeHolding(user: AppUser, holdingLotId: string, input: CloseHoldingInput) {
  return prisma.$transaction(async (tx) => {
    const holding = await tx.holdingLot.findFirstOrThrow({
      where: {
        id: holdingLotId,
        userId: user.id,
      },
      include: {
        coveredCalls: true,
      },
    });

    if (holding.status !== HoldingStatus.OPEN || holding.remainingQuantity <= 0) {
      throw new Error("Holding is already closed.");
    }

    const reservedShares = holding.coveredCalls
      .filter((trade) => trade.status !== TradeStatus.CLOSED)
      .reduce((total, trade) => total + Math.max(trade.openContractCount, 0) * 100, 0);
    const maxSellableShares = Math.max(holding.remainingQuantity - reservedShares, 0);

    if (input.quantityToSell > maxSellableShares) {
      throw new Error("Sell quantity exceeds available uncovered shares.");
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

export async function deleteHolding(user: AppUser, holdingLotId: string) {
  const holding = await prisma.holdingLot.findFirstOrThrow({
    where: {
      id: holdingLotId,
      userId: user.id,
    },
  });

  await prisma.holdingLot.delete({
    where: { id: holding.id },
  });
}
