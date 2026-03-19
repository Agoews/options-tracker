import {
  HoldingStatus,
  OptionType,
  PrismaClient,
  StrategyType,
  TradeEventType,
  TradeStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const seedUserEmail = process.env.SEED_USER_EMAIL?.trim().toLowerCase();
  const seedNamespace = (seedUserEmail ?? "demo-trader").replace(/[^a-z0-9]+/g, "-");
  const sid = (value: string) => `${seedNamespace}-${value}`;

  const user = seedUserEmail
    ? await prisma.user.update({
        where: { email: seedUserEmail },
        data: {
          onboardingComplete: true,
          portfolioBaselineValue: 45000,
          portfolioBaselineAt: new Date("2026-01-02T14:30:00.000Z"),
        },
      })
    : await prisma.user.upsert({
        where: { firebaseUid: "demo-trader" },
        update: {
          email: "demo@tradetracker.app",
          displayName: "Demo Trader",
          onboardingComplete: true,
          timezone: "America/New_York",
          baseCurrency: "USD",
          portfolioBaselineValue: 45000,
          portfolioBaselineAt: new Date("2026-01-02T14:30:00.000Z"),
        },
        create: {
          firebaseUid: "demo-trader",
          email: "demo@tradetracker.app",
          displayName: "Demo Trader",
          onboardingComplete: true,
          timezone: "America/New_York",
          baseCurrency: "USD",
          portfolioBaselineValue: 45000,
          portfolioBaselineAt: new Date("2026-01-02T14:30:00.000Z"),
        },
      });

  console.log(
    `Seeding portfolio data for ${seedUserEmail ? `existing user ${seedUserEmail}` : "demo-trader"}...`,
  );

  await prisma.$transaction([
    prisma.roll.deleteMany({ where: { userId: user.id } }),
    prisma.assignment.deleteMany({ where: { userId: user.id } }),
    prisma.tradeEvent.deleteMany({ where: { userId: user.id } }),
    prisma.holdingLot.deleteMany({ where: { userId: user.id } }),
    prisma.trade.deleteMany({ where: { userId: user.id } }),
    prisma.portfolioFunding.deleteMany({ where: { userId: user.id } }),
  ]);

  await prisma.portfolioFunding.createMany({
    data: [
      {
        id: sid("fund-january-deposit"),
        userId: user.id,
        amount: 5000,
        occurredAt: new Date("2026-01-15T17:00:00.000Z"),
        notes: "January contribution",
      },
      {
        id: sid("fund-february-withdrawal"),
        userId: user.id,
        amount: -1500,
        occurredAt: new Date("2026-02-28T19:30:00.000Z"),
        notes: "Taxes and cash transfer",
      },
      {
        id: sid("fund-march-deposit"),
        userId: user.id,
        amount: 2500,
        occurredAt: new Date("2026-03-10T16:15:00.000Z"),
        notes: "March top-up",
      },
    ],
  });

  const aaplWheelTrade = await prisma.trade.create({
    data: {
      id: sid("wheel-aapl"),
      userId: user.id,
      ticker: "AAPL",
      accountLabel: "IRA",
      strategy: StrategyType.WHEEL,
      optionType: OptionType.PUT,
      status: TradeStatus.PARTIAL,
      openedAt: new Date("2026-01-05T14:30:00.000Z"),
      openContractCount: 1,
      shareExposure: 100,
      premiumCollected: 740.0,
      realizedPnl: 0,
      feesPaid: 2.5,
      thesis: "Wheel liquid megacaps with 25-30 delta entries.",
      tags: ["income", "core"],
    },
  });

  const aaplPutOpen = await prisma.tradeEvent.create({
    data: {
      id: sid("evt-aapl-put-open"),
      userId: user.id,
      tradeId: aaplWheelTrade.id,
      type: TradeEventType.SELL_TO_OPEN,
      occurredAt: new Date("2026-01-05T14:30:00.000Z"),
      optionType: OptionType.PUT,
      contractsDelta: 1,
      strikePrice: 185,
      expiration: new Date("2026-02-20T21:00:00.000Z"),
      premium: 320,
      fees: 1.25,
      underlyingPrice: 191.4,
      notes: "Opened 30 DTE cash-secured put.",
    },
  });

  const aaplAssignment = await prisma.tradeEvent.create({
    data: {
      id: sid("evt-aapl-assignment"),
      userId: user.id,
      tradeId: aaplWheelTrade.id,
      type: TradeEventType.ASSIGNMENT,
      occurredAt: new Date("2026-02-20T21:00:00.000Z"),
      optionType: OptionType.PUT,
      contractsDelta: -1,
      sharesDelta: 100,
      strikePrice: 185,
      premium: 320,
      sharePrice: 185,
      notes: "Assigned into 100 shares.",
    },
  });

  const aaplCoveredCallOpen = await prisma.tradeEvent.create({
    data: {
      id: sid("evt-aapl-covered-call-open"),
      userId: user.id,
      tradeId: aaplWheelTrade.id,
      type: TradeEventType.SELL_TO_OPEN,
      occurredAt: new Date("2026-02-24T15:00:00.000Z"),
      optionType: OptionType.CALL,
      contractsDelta: 1,
      strikePrice: 192.5,
      expiration: new Date("2026-03-27T20:00:00.000Z"),
      premium: 420,
      fees: 1.25,
      underlyingPrice: 188.6,
      notes: "Sold covered call after assignment.",
    },
  });

  await prisma.holdingLot.create({
    data: {
      id: sid("lot-aapl-wheel"),
      userId: user.id,
      tradeId: aaplWheelTrade.id,
      ticker: "AAPL",
      openedAt: aaplAssignment.occurredAt,
      acquiredVia: TradeEventType.ASSIGNMENT,
      quantity: 100,
      remainingQuantity: 100,
      costBasisPerShare: 181.8,
      realizedPnl: 0,
      status: HoldingStatus.OPEN,
      notes: "Assignment basis adjusted by collected put premium.",
    },
  });

  await prisma.trade.update({
    where: { id: aaplWheelTrade.id },
    data: {
      holdingLotId: sid("lot-aapl-wheel"),
    },
  });

  await prisma.assignment.create({
    data: {
      id: sid("asg-aapl-wheel"),
      userId: user.id,
      tradeEventId: aaplAssignment.id,
      holdingLotId: sid("lot-aapl-wheel"),
      ticker: "AAPL",
      optionType: OptionType.PUT,
      strikePrice: 185,
      shareQuantity: 100,
      premiumApplied: 320,
      adjustedCostBasis: 181.8,
      assignedAt: aaplAssignment.occurredAt,
    },
  });

  const msftShortPutTrade = await prisma.trade.create({
    data: {
      id: sid("msft-short-put"),
      userId: user.id,
      ticker: "MSFT",
      accountLabel: "Main",
      strategy: StrategyType.SHORT_PUT,
      optionType: OptionType.PUT,
      status: TradeStatus.CLOSED,
      openedAt: new Date("2026-01-20T15:20:00.000Z"),
      closedAt: new Date("2026-02-14T20:45:00.000Z"),
      openContractCount: 0,
      shareExposure: 0,
      premiumCollected: 185,
      realizedPnl: 140,
      feesPaid: 2.5,
      thesis: "Take premium on quality names into earnings drift and close early if IV contracts.",
      tags: ["income", "short-premium"],
    },
  });

  await prisma.tradeEvent.createMany({
    data: [
      {
        id: sid("evt-msft-put-open"),
        userId: user.id,
        tradeId: msftShortPutTrade.id,
        type: TradeEventType.SELL_TO_OPEN,
        occurredAt: new Date("2026-01-20T15:20:00.000Z"),
        optionType: OptionType.PUT,
        contractsDelta: 1,
        strikePrice: 405,
        expiration: new Date("2026-02-21T21:00:00.000Z"),
        premium: 185,
        fees: 1.25,
        underlyingPrice: 411.7,
        notes: "Opened short put on post-pullback support.",
      },
      {
        id: sid("evt-msft-put-close"),
        userId: user.id,
        tradeId: msftShortPutTrade.id,
        type: TradeEventType.BUY_TO_CLOSE,
        occurredAt: new Date("2026-02-14T20:45:00.000Z"),
        optionType: OptionType.PUT,
        contractsDelta: -1,
        strikePrice: 405,
        premium: 45,
        fees: 1.25,
        realizedPnl: 140,
        underlyingPrice: 418.9,
        notes: "Closed before expiration after most premium decayed.",
      },
    ],
  });

  await prisma.trade.create({
    data: {
      id: sid("nvda-long-call"),
      userId: user.id,
      ticker: "NVDA",
      accountLabel: "Main",
      strategy: StrategyType.LONG_CALL,
      optionType: OptionType.CALL,
      status: TradeStatus.OPEN,
      openedAt: new Date("2026-03-02T18:40:00.000Z"),
      openContractCount: -1,
      shareExposure: 0,
      premiumCollected: 0,
      realizedPnl: 0,
      feesPaid: 1.25,
      thesis: "Directional swing exposure into AI infrastructure demand momentum.",
      tags: ["directional", "momentum"],
      events: {
        create: {
          id: sid("evt-nvda-call-open"),
          userId: user.id,
          type: TradeEventType.BUY_TO_OPEN,
          occurredAt: new Date("2026-03-02T18:40:00.000Z"),
          optionType: OptionType.CALL,
          contractsDelta: -1,
          strikePrice: 132,
          expiration: new Date("2026-04-17T20:00:00.000Z"),
          premium: 610,
          fees: 1.25,
          underlyingPrice: 128.5,
          notes: "Bought call for continuation breakout exposure.",
        },
      },
    },
  });

  const koStockTrade = await prisma.trade.create({
    data: {
      id: sid("ko-stock"),
      userId: user.id,
      ticker: "KO",
      accountLabel: "Taxable",
      strategy: StrategyType.STOCK,
      status: TradeStatus.ASSIGNED,
      openedAt: new Date("2026-01-08T16:00:00.000Z"),
      openContractCount: 0,
      shareExposure: 200,
      premiumCollected: 0,
      realizedPnl: 0,
      feesPaid: 0,
      thesis: "Core dividend name used as covered-call inventory.",
      tags: ["stock", "dividend"],
      events: {
        create: {
          id: sid("evt-ko-stock-buy"),
          userId: user.id,
          type: TradeEventType.STOCK_BUY,
          occurredAt: new Date("2026-01-08T16:00:00.000Z"),
          sharesDelta: 200,
          sharePrice: 62.4,
          notes: "Accumulated shares for income overlay.",
        },
      },
    },
  });

  await prisma.holdingLot.create({
    data: {
      id: sid("lot-ko-core"),
      userId: user.id,
      tradeId: koStockTrade.id,
      ticker: "KO",
      openedAt: new Date("2026-01-08T16:00:00.000Z"),
      acquiredVia: TradeEventType.STOCK_BUY,
      quantity: 200,
      remainingQuantity: 200,
      costBasisPerShare: 62.4,
      realizedPnl: 0,
      status: HoldingStatus.OPEN,
      notes: "Core share lot reserved for covered call income.",
    },
  });

  await prisma.trade.create({
    data: {
      id: sid("ko-covered-call"),
      userId: user.id,
      ticker: "KO",
      accountLabel: "Taxable",
      strategy: StrategyType.COVERED_CALL,
      optionType: OptionType.CALL,
      status: TradeStatus.OPEN,
      openedAt: new Date("2026-03-06T17:10:00.000Z"),
      openContractCount: 1,
      shareExposure: 0,
      premiumCollected: 110,
      realizedPnl: 0,
      feesPaid: 1.25,
      holdingLotId: sid("lot-ko-core"),
      thesis: "Generate income on the upper half of the stock lot while preserving downside cushion.",
      tags: ["income", "covered-call"],
      events: {
        create: {
          id: sid("evt-ko-covered-call-open"),
          userId: user.id,
          type: TradeEventType.SELL_TO_OPEN,
          occurredAt: new Date("2026-03-06T17:10:00.000Z"),
          optionType: OptionType.CALL,
          contractsDelta: 1,
          strikePrice: 67,
          expiration: new Date("2026-04-17T20:00:00.000Z"),
          premium: 110,
          fees: 1.25,
          underlyingPrice: 63.1,
          notes: "Wrote one call against 100 shares of the core lot.",
        },
      },
    },
  });

  const amznRolledPutTrade = await prisma.trade.create({
    data: {
      id: sid("amzn-rolled-put"),
      userId: user.id,
      ticker: "AMZN",
      accountLabel: "Main",
      strategy: StrategyType.CASH_SECURED_PUT,
      optionType: OptionType.PUT,
      status: TradeStatus.OPEN,
      openedAt: new Date("2026-01-30T18:05:00.000Z"),
      openContractCount: 1,
      shareExposure: 0,
      premiumCollected: 265,
      realizedPnl: 0,
      feesPaid: 2.5,
      thesis: "Willing to own on weakness, but roll down and out if price breaks lower support.",
      tags: ["income", "rolled"],
    },
  });

  const amznPutOpen = await prisma.tradeEvent.create({
    data: {
      id: sid("evt-amzn-put-open"),
      userId: user.id,
      tradeId: amznRolledPutTrade.id,
      type: TradeEventType.SELL_TO_OPEN,
      occurredAt: new Date("2026-01-30T18:05:00.000Z"),
      optionType: OptionType.PUT,
      contractsDelta: 1,
      strikePrice: 175,
      expiration: new Date("2026-02-20T21:00:00.000Z"),
      premium: 210,
      fees: 1.25,
      underlyingPrice: 178.2,
      notes: "Initial short put entry below support.",
    },
  });

  const amznPutRoll = await prisma.tradeEvent.create({
    data: {
      id: sid("evt-amzn-put-roll"),
      userId: user.id,
      tradeId: amznRolledPutTrade.id,
      type: TradeEventType.ROLL,
      occurredAt: new Date("2026-02-20T20:55:00.000Z"),
      optionType: OptionType.PUT,
      contractsDelta: 0,
      strikePrice: 170,
      expiration: new Date("2026-03-20T20:00:00.000Z"),
      premium: 55,
      fees: 1.25,
      underlyingPrice: 171.3,
      notes: "Rolled down and out for a net credit to keep assignment basis attractive.",
      metadata: {
        fromEventId: sid("evt-amzn-put-open"),
      },
    },
  });

  await prisma.roll.create({
    data: {
      id: sid("roll-amzn-put"),
      userId: user.id,
      fromEventId: amznPutOpen.id,
      toEventId: amznPutRoll.id,
      netCredit: 55,
    },
  });

  const amdWheelTrade = await prisma.trade.create({
    data: {
      id: sid("wheel-amd"),
      userId: user.id,
      ticker: "AMD",
      accountLabel: "IRA",
      strategy: StrategyType.WHEEL,
      optionType: OptionType.PUT,
      status: TradeStatus.PARTIAL,
      openedAt: new Date("2026-02-03T16:10:00.000Z"),
      openContractCount: 1,
      shareExposure: 100,
      premiumCollected: 480,
      realizedPnl: 0,
      feesPaid: 2.5,
      thesis: "Run shorter-dated wheel entries in high-liquidity semis with support nearby.",
      tags: ["wheel", "semis"],
    },
  });

  const amdPutOpen = await prisma.tradeEvent.create({
    data: {
      id: sid("evt-amd-put-open"),
      userId: user.id,
      tradeId: amdWheelTrade.id,
      type: TradeEventType.SELL_TO_OPEN,
      occurredAt: new Date("2026-02-03T16:10:00.000Z"),
      optionType: OptionType.PUT,
      contractsDelta: 1,
      strikePrice: 122,
      expiration: new Date("2026-03-20T20:00:00.000Z"),
      premium: 295,
      fees: 1.25,
      underlyingPrice: 126.2,
      notes: "Opened put under the prior month range low.",
    },
  });

  const amdAssignment = await prisma.tradeEvent.create({
    data: {
      id: sid("evt-amd-assignment"),
      userId: user.id,
      tradeId: amdWheelTrade.id,
      type: TradeEventType.ASSIGNMENT,
      occurredAt: new Date("2026-03-20T20:00:00.000Z"),
      optionType: OptionType.PUT,
      contractsDelta: -1,
      sharesDelta: 100,
      strikePrice: 122,
      premium: 295,
      sharePrice: 122,
      notes: "Accepted assignment into 100 shares.",
    },
  });

  await prisma.tradeEvent.create({
    data: {
      id: sid("evt-amd-covered-call-open"),
      userId: user.id,
      tradeId: amdWheelTrade.id,
      type: TradeEventType.SELL_TO_OPEN,
      occurredAt: new Date("2026-03-23T15:45:00.000Z"),
      optionType: OptionType.CALL,
      contractsDelta: 1,
      strikePrice: 128,
      expiration: new Date("2026-04-17T20:00:00.000Z"),
      premium: 185,
      fees: 1.25,
      underlyingPrice: 124.1,
      notes: "Wrote the first covered call after assignment.",
    },
  });

  await prisma.holdingLot.create({
    data: {
      id: sid("lot-amd-wheel"),
      userId: user.id,
      tradeId: amdWheelTrade.id,
      ticker: "AMD",
      openedAt: amdAssignment.occurredAt,
      acquiredVia: TradeEventType.ASSIGNMENT,
      quantity: 100,
      remainingQuantity: 100,
      costBasisPerShare: 119.05,
      realizedPnl: 0,
      status: HoldingStatus.OPEN,
      notes: "Assignment basis reduced by collected put premium.",
    },
  });

  await prisma.trade.update({
    where: { id: amdWheelTrade.id },
    data: {
      holdingLotId: sid("lot-amd-wheel"),
    },
  });

  await prisma.assignment.create({
    data: {
      id: sid("asg-amd-wheel"),
      userId: user.id,
      tradeEventId: amdAssignment.id,
      holdingLotId: sid("lot-amd-wheel"),
      ticker: "AMD",
      optionType: OptionType.PUT,
      strikePrice: 122,
      shareQuantity: 100,
      premiumApplied: 295,
      adjustedCostBasis: 119.05,
      assignedAt: amdAssignment.occurredAt,
    },
  });

  const pepStockTrade = await prisma.trade.create({
    data: {
      id: sid("pep-stock"),
      userId: user.id,
      ticker: "PEP",
      accountLabel: "Taxable",
      strategy: StrategyType.STOCK,
      status: TradeStatus.ASSIGNED,
      openedAt: new Date("2026-01-12T17:00:00.000Z"),
      openContractCount: 0,
      shareExposure: 100,
      premiumCollected: 0,
      realizedPnl: 0,
      feesPaid: 0,
      thesis: "Defensive consumer staple shares held as conservative covered-call inventory.",
      tags: ["stock", "defensive"],
      events: {
        create: {
          id: sid("evt-pep-stock-buy"),
          userId: user.id,
          type: TradeEventType.STOCK_BUY,
          occurredAt: new Date("2026-01-12T17:00:00.000Z"),
          sharesDelta: 100,
          sharePrice: 171.2,
          notes: "Built a core lot after earnings.",
        },
      },
    },
  });

  await prisma.holdingLot.create({
    data: {
      id: sid("lot-pep-core"),
      userId: user.id,
      tradeId: pepStockTrade.id,
      ticker: "PEP",
      openedAt: new Date("2026-01-12T17:00:00.000Z"),
      acquiredVia: TradeEventType.STOCK_BUY,
      quantity: 100,
      remainingQuantity: 100,
      costBasisPerShare: 171.2,
      realizedPnl: 0,
      status: HoldingStatus.OPEN,
      notes: "Core defensive lot reserved for occasional covered calls.",
    },
  });

  await prisma.trade.create({
    data: {
      id: sid("pep-covered-call"),
      userId: user.id,
      ticker: "PEP",
      accountLabel: "Taxable",
      strategy: StrategyType.COVERED_CALL,
      optionType: OptionType.CALL,
      status: TradeStatus.OPEN,
      openedAt: new Date("2026-03-11T18:15:00.000Z"),
      openContractCount: 1,
      shareExposure: 0,
      premiumCollected: 95,
      realizedPnl: 0,
      feesPaid: 1.25,
      holdingLotId: sid("lot-pep-core"),
      thesis: "Sell conservative upside against the staple name while collecting carry.",
      tags: ["covered-call", "defensive"],
      events: {
        create: {
          id: sid("evt-pep-covered-call-open"),
          userId: user.id,
          type: TradeEventType.SELL_TO_OPEN,
          occurredAt: new Date("2026-03-11T18:15:00.000Z"),
          optionType: OptionType.CALL,
          contractsDelta: 1,
          strikePrice: 176,
          expiration: new Date("2026-04-17T20:00:00.000Z"),
          premium: 95,
          fees: 1.25,
          underlyingPrice: 172.6,
          notes: "One conservative covered call against the PEP lot.",
        },
      },
    },
  });

  await prisma.trade.create({
    data: {
      id: sid("iwm-long-put"),
      userId: user.id,
      ticker: "IWM",
      accountLabel: "Main",
      strategy: StrategyType.LONG_PUT,
      optionType: OptionType.PUT,
      status: TradeStatus.OPEN,
      openedAt: new Date("2026-03-04T19:20:00.000Z"),
      openContractCount: -2,
      shareExposure: 0,
      premiumCollected: 0,
      realizedPnl: 0,
      feesPaid: 2.5,
      thesis: "Put hedge against broad small-cap weakness while keeping gross long exposure on.",
      tags: ["hedge", "long-premium"],
      events: {
        create: {
          id: sid("evt-iwm-put-open"),
          userId: user.id,
          type: TradeEventType.BUY_TO_OPEN,
          occurredAt: new Date("2026-03-04T19:20:00.000Z"),
          optionType: OptionType.PUT,
          contractsDelta: -2,
          strikePrice: 205,
          expiration: new Date("2026-04-17T20:00:00.000Z"),
          premium: 360,
          fees: 2.5,
          underlyingPrice: 209.4,
          notes: "Opened two puts as a portfolio hedge.",
        },
      },
    },
  });

  const nflxShortPutTrade = await prisma.trade.create({
    data: {
      id: sid("nflx-short-put"),
      userId: user.id,
      ticker: "NFLX",
      accountLabel: "Main",
      strategy: StrategyType.SHORT_PUT,
      optionType: OptionType.PUT,
      status: TradeStatus.CLOSED,
      openedAt: new Date("2026-01-28T16:50:00.000Z"),
      closedAt: new Date("2026-02-18T19:40:00.000Z"),
      openContractCount: 0,
      shareExposure: 0,
      premiumCollected: 210,
      realizedPnl: 150,
      feesPaid: 2.5,
      thesis: "Short premium on momentum names after sharp IV expansion.",
      tags: ["short-premium", "closed-winner"],
    },
  });

  await prisma.tradeEvent.createMany({
    data: [
      {
        id: sid("evt-nflx-put-open"),
        userId: user.id,
        tradeId: nflxShortPutTrade.id,
        type: TradeEventType.SELL_TO_OPEN,
        occurredAt: new Date("2026-01-28T16:50:00.000Z"),
        optionType: OptionType.PUT,
        contractsDelta: 1,
        strikePrice: 920,
        expiration: new Date("2026-02-20T21:00:00.000Z"),
        premium: 210,
        fees: 1.25,
        underlyingPrice: 936,
        notes: "Entered put after IV spike into support.",
      },
      {
        id: sid("evt-nflx-put-close"),
        userId: user.id,
        tradeId: nflxShortPutTrade.id,
        type: TradeEventType.BUY_TO_CLOSE,
        occurredAt: new Date("2026-02-18T19:40:00.000Z"),
        optionType: OptionType.PUT,
        contractsDelta: -1,
        strikePrice: 920,
        premium: 60,
        fees: 1.25,
        realizedPnl: 150,
        underlyingPrice: 948.4,
        notes: "Closed after most premium decayed.",
      },
    ],
  });

  const metaShortCallTrade = await prisma.trade.create({
    data: {
      id: sid("meta-short-call"),
      userId: user.id,
      ticker: "META",
      accountLabel: "Main",
      strategy: StrategyType.SHORT_CALL,
      optionType: OptionType.CALL,
      status: TradeStatus.CLOSED,
      openedAt: new Date("2026-01-22T18:30:00.000Z"),
      closedAt: new Date("2026-02-06T20:20:00.000Z"),
      openContractCount: 0,
      shareExposure: 0,
      premiumCollected: 165,
      realizedPnl: 105,
      feesPaid: 2.5,
      thesis: "Fade exhaustion at the top of an earnings gap while keeping size small.",
      tags: ["short-call", "closed"],
    },
  });

  await prisma.tradeEvent.createMany({
    data: [
      {
        id: sid("evt-meta-call-open"),
        userId: user.id,
        tradeId: metaShortCallTrade.id,
        type: TradeEventType.SELL_TO_OPEN,
        occurredAt: new Date("2026-01-22T18:30:00.000Z"),
        optionType: OptionType.CALL,
        contractsDelta: 1,
        strikePrice: 685,
        expiration: new Date("2026-02-13T21:00:00.000Z"),
        premium: 165,
        fees: 1.25,
        underlyingPrice: 672.3,
        notes: "Small bearish call sale into exhaustion move.",
      },
      {
        id: sid("evt-meta-call-close"),
        userId: user.id,
        tradeId: metaShortCallTrade.id,
        type: TradeEventType.BUY_TO_CLOSE,
        occurredAt: new Date("2026-02-06T20:20:00.000Z"),
        optionType: OptionType.CALL,
        contractsDelta: -1,
        strikePrice: 685,
        premium: 60,
        fees: 1.25,
        realizedPnl: 105,
        underlyingPrice: 650.1,
        notes: "Covered after the reversal confirmed.",
      },
    ],
  });

  await prisma.trade.create({
    data: {
      id: sid("avgo-long-call"),
      userId: user.id,
      ticker: "AVGO",
      accountLabel: "Main",
      strategy: StrategyType.LONG_CALL,
      optionType: OptionType.CALL,
      status: TradeStatus.OPEN,
      openedAt: new Date("2026-03-09T17:35:00.000Z"),
      openContractCount: -1,
      shareExposure: 0,
      premiumCollected: 0,
      realizedPnl: 0,
      feesPaid: 1.25,
      thesis: "Long call swing into strong relative strength and AI exposure.",
      tags: ["long-premium", "semis"],
      events: {
        create: {
          id: sid("evt-avgo-call-open"),
          userId: user.id,
          type: TradeEventType.BUY_TO_OPEN,
          occurredAt: new Date("2026-03-09T17:35:00.000Z"),
          optionType: OptionType.CALL,
          contractsDelta: -1,
          strikePrice: 1610,
          expiration: new Date("2026-04-17T20:00:00.000Z"),
          premium: 440,
          fees: 1.25,
          underlyingPrice: 1588,
          notes: "Bought call after reclaim of trend support.",
        },
      },
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
