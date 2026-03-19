import "server-only";

import type { AppUser, AddPortfolioFundingInput, UpdatePortfolioBaselineInput } from "@/lib/domain/types";
import { prisma } from "@/lib/server/db";

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
