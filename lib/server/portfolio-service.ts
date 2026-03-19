import "server-only";

import { calculateBaselineValueForTrackedCapital } from "@/lib/domain/portfolio-capital";
import type { AppUser, AddCapitalAdjustmentInput, SetTrackedCapitalInput } from "@/lib/domain/types";
import { prisma } from "@/lib/server/db";
import { toNumber } from "@/lib/utils";

export async function setTrackedCapital(user: AppUser, input: SetTrackedCapitalInput) {
  return prisma.$transaction(async (tx) => {
    const [existingUser, fundingTotals] = await Promise.all([
      tx.user.findUniqueOrThrow({
        where: { id: user.id },
        select: {
          portfolioBaselineAt: true,
        },
      }),
      tx.portfolioFunding.aggregate({
        where: { userId: user.id },
        _sum: {
          amount: true,
        },
      }),
    ]);

    const contributedFunds = toNumber(fundingTotals._sum.amount);

    return tx.user.update({
      where: { id: user.id },
      data: {
        portfolioBaselineValue: calculateBaselineValueForTrackedCapital(input.trackedCapital, contributedFunds),
        portfolioBaselineAt: existingUser.portfolioBaselineAt ?? new Date(),
      },
    });
  });
}

export async function addCapitalAdjustment(user: AppUser, input: AddCapitalAdjustmentInput) {
  return prisma.portfolioFunding.create({
    data: {
      userId: user.id,
      amount: input.amount,
      occurredAt: new Date(),
    },
  });
}
