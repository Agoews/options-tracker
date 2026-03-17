-- CreateEnum
CREATE TYPE "StrategyType" AS ENUM ('WHEEL', 'CASH_SECURED_PUT', 'COVERED_CALL', 'LONG_CALL', 'LONG_PUT', 'SHORT_CALL', 'SHORT_PUT', 'STOCK');

-- CreateEnum
CREATE TYPE "TradeStatus" AS ENUM ('OPEN', 'PARTIAL', 'ASSIGNED', 'CLOSED');

-- CreateEnum
CREATE TYPE "TradeEventType" AS ENUM ('SELL_TO_OPEN', 'BUY_TO_OPEN', 'SELL_TO_CLOSE', 'BUY_TO_CLOSE', 'PARTIAL_CLOSE', 'REOPEN', 'ROLL', 'ASSIGNMENT', 'EXERCISE', 'EXPIRATION', 'STOCK_BUY', 'STOCK_SELL', 'DIVIDEND', 'NOTE');

-- CreateEnum
CREATE TYPE "OptionType" AS ENUM ('CALL', 'PUT');

-- CreateEnum
CREATE TYPE "HoldingStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firebaseUid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'America/Los_Angeles',
    "baseCurrency" TEXT NOT NULL DEFAULT 'USD',
    "onboardingComplete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trade" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "accountLabel" TEXT,
    "strategy" "StrategyType" NOT NULL,
    "optionType" "OptionType",
    "thesis" TEXT,
    "notes" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "TradeStatus" NOT NULL DEFAULT 'OPEN',
    "openedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),
    "openContractCount" INTEGER NOT NULL DEFAULT 0,
    "shareExposure" INTEGER NOT NULL DEFAULT 0,
    "premiumCollected" DECIMAL(14,2) NOT NULL,
    "realizedPnl" DECIMAL(14,2) NOT NULL,
    "feesPaid" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradeEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tradeId" TEXT NOT NULL,
    "type" "TradeEventType" NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "optionType" "OptionType",
    "contractsDelta" INTEGER,
    "sharesDelta" INTEGER,
    "strikePrice" DECIMAL(12,2),
    "expiration" TIMESTAMP(3),
    "premium" DECIMAL(14,2),
    "fees" DECIMAL(14,2),
    "realizedPnl" DECIMAL(14,2),
    "underlyingPrice" DECIMAL(12,2),
    "sharePrice" DECIMAL(12,2),
    "notes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TradeEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HoldingLot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tradeId" TEXT,
    "ticker" TEXT NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),
    "acquiredVia" "TradeEventType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "remainingQuantity" INTEGER NOT NULL,
    "costBasisPerShare" DECIMAL(12,2) NOT NULL,
    "realizedPnl" DECIMAL(14,2) NOT NULL,
    "status" "HoldingStatus" NOT NULL DEFAULT 'OPEN',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HoldingLot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tradeEventId" TEXT NOT NULL,
    "holdingLotId" TEXT,
    "ticker" TEXT NOT NULL,
    "optionType" "OptionType" NOT NULL,
    "strikePrice" DECIMAL(12,2) NOT NULL,
    "shareQuantity" INTEGER NOT NULL,
    "premiumApplied" DECIMAL(14,2) NOT NULL,
    "adjustedCostBasis" DECIMAL(12,2) NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Roll" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fromEventId" TEXT NOT NULL,
    "toEventId" TEXT NOT NULL,
    "netCredit" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Roll_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_firebaseUid_key" ON "User"("firebaseUid");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Trade_userId_status_idx" ON "Trade"("userId", "status");

-- CreateIndex
CREATE INDEX "Trade_userId_ticker_idx" ON "Trade"("userId", "ticker");

-- CreateIndex
CREATE INDEX "TradeEvent_userId_occurredAt_idx" ON "TradeEvent"("userId", "occurredAt");

-- CreateIndex
CREATE INDEX "TradeEvent_tradeId_occurredAt_idx" ON "TradeEvent"("tradeId", "occurredAt");

-- CreateIndex
CREATE INDEX "HoldingLot_userId_ticker_idx" ON "HoldingLot"("userId", "ticker");

-- CreateIndex
CREATE INDEX "HoldingLot_userId_status_idx" ON "HoldingLot"("userId", "status");

-- CreateIndex
CREATE INDEX "Assignment_userId_assignedAt_idx" ON "Assignment"("userId", "assignedAt");

-- CreateIndex
CREATE INDEX "Roll_userId_createdAt_idx" ON "Roll"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeEvent" ADD CONSTRAINT "TradeEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeEvent" ADD CONSTRAINT "TradeEvent_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "Trade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HoldingLot" ADD CONSTRAINT "HoldingLot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HoldingLot" ADD CONSTRAINT "HoldingLot_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "Trade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_tradeEventId_fkey" FOREIGN KEY ("tradeEventId") REFERENCES "TradeEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_holdingLotId_fkey" FOREIGN KEY ("holdingLotId") REFERENCES "HoldingLot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Roll" ADD CONSTRAINT "Roll_fromEventId_fkey" FOREIGN KEY ("fromEventId") REFERENCES "TradeEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Roll" ADD CONSTRAINT "Roll_toEventId_fkey" FOREIGN KEY ("toEventId") REFERENCES "TradeEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Roll" ADD CONSTRAINT "Roll_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
