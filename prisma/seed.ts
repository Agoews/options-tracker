import { PrismaClient, StrategyType, TradeEventType, TradeStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { firebaseUid: "demo-trader" },
    update: {},
    create: {
      firebaseUid: "demo-trader",
      email: "demo@tradetracker.app",
      displayName: "Demo Trader",
      onboardingComplete: true,
      timezone: "America/New_York",
      baseCurrency: "USD",
    },
  });

  const trade = await prisma.trade.upsert({
    where: { id: "demo-wheel-trade" },
    update: {},
    create: {
      id: "demo-wheel-trade",
      userId: user.id,
      ticker: "AAPL",
      accountLabel: "IRA",
      strategy: StrategyType.WHEEL,
      status: TradeStatus.ASSIGNED,
      openedAt: new Date("2026-01-05T14:30:00.000Z"),
      premiumCollected: 740.0,
      realizedPnl: 285.0,
      feesPaid: 10.5,
      openContractCount: 1,
      shareExposure: 100,
      thesis: "Wheel liquid megacaps with 25-30 delta entries.",
      tags: ["income", "core"],
    },
  });

  const sellPut = await prisma.tradeEvent.upsert({
    where: { id: "evt-sell-put" },
    update: {},
    create: {
      id: "evt-sell-put",
      userId: user.id,
      tradeId: trade.id,
      type: TradeEventType.SELL_TO_OPEN,
      occurredAt: new Date("2026-01-05T14:30:00.000Z"),
      optionType: "PUT",
      contractsDelta: 1,
      strikePrice: 185,
      expiration: new Date("2026-02-20T21:00:00.000Z"),
      premium: 320,
      fees: 1.25,
      underlyingPrice: 191.4,
      notes: "Opened 30 DTE cash-secured put.",
    },
  });

  const assignment = await prisma.tradeEvent.upsert({
    where: { id: "evt-assignment" },
    update: {},
    create: {
      id: "evt-assignment",
      userId: user.id,
      tradeId: trade.id,
      type: TradeEventType.ASSIGNMENT,
      occurredAt: new Date("2026-02-20T21:00:00.000Z"),
      optionType: "PUT",
      sharesDelta: 100,
      strikePrice: 185,
      premium: 320,
      sharePrice: 185,
      notes: "Assigned into 100 shares.",
    },
  });

  const coveredCall = await prisma.tradeEvent.upsert({
    where: { id: "evt-covered-call" },
    update: {},
    create: {
      id: "evt-covered-call",
      userId: user.id,
      tradeId: trade.id,
      type: TradeEventType.SELL_TO_OPEN,
      occurredAt: new Date("2026-02-24T15:00:00.000Z"),
      optionType: "CALL",
      contractsDelta: 1,
      strikePrice: 192.5,
      expiration: new Date("2026-03-27T20:00:00.000Z"),
      premium: 420,
      fees: 1.25,
      underlyingPrice: 188.6,
      notes: "Sold covered call after assignment.",
    },
  });

  await prisma.holdingLot.upsert({
    where: { id: "lot-aapl-wheel" },
    update: {},
    create: {
      id: "lot-aapl-wheel",
      userId: user.id,
      tradeId: trade.id,
      ticker: "AAPL",
      openedAt: assignment.occurredAt,
      acquiredVia: TradeEventType.ASSIGNMENT,
      quantity: 100,
      remainingQuantity: 100,
      costBasisPerShare: 181.8,
      realizedPnl: 0,
      notes: "Assignment basis adjusted by collected put premium.",
    },
  });

  await prisma.assignment.upsert({
    where: { id: "asg-aapl-wheel" },
    update: {},
    create: {
      id: "asg-aapl-wheel",
      userId: user.id,
      tradeEventId: assignment.id,
      holdingLotId: "lot-aapl-wheel",
      ticker: "AAPL",
      optionType: "PUT",
      strikePrice: 185,
      shareQuantity: 100,
      premiumApplied: 320,
      adjustedCostBasis: 181.8,
      assignedAt: assignment.occurredAt,
    },
  });

  await prisma.roll.upsert({
    where: { id: "roll-aapl-cc" },
    update: {},
    create: {
      id: "roll-aapl-cc",
      userId: user.id,
      fromEventId: coveredCall.id,
      toEventId: sellPut.id,
      netCredit: 40,
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
