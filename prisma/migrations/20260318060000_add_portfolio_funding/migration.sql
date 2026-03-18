ALTER TABLE "User"
ADD COLUMN "portfolioBaselineValue" DECIMAL(14,2) NOT NULL DEFAULT 0,
ADD COLUMN "portfolioBaselineAt" TIMESTAMP(3);

CREATE TABLE "PortfolioFunding" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "amount" DECIMAL(14,2) NOT NULL,
  "occurredAt" TIMESTAMP(3) NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PortfolioFunding_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PortfolioFunding_userId_occurredAt_idx" ON "PortfolioFunding"("userId", "occurredAt");

ALTER TABLE "PortfolioFunding"
ADD CONSTRAINT "PortfolioFunding_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
