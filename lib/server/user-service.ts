import "server-only";

import type { AppUser } from "@/lib/domain/types";
import type { OnboardingInput, UpdateProfileInput } from "@/lib/domain/schemas";
import { prisma } from "@/lib/server/db";

export async function completeOnboarding(user: AppUser, input: OnboardingInput) {
  return prisma.user.update({
    where: { id: user.id },
    data: {
      displayName: input.displayName,
      timezone: input.timezone,
      baseCurrency: input.baseCurrency.toUpperCase(),
      portfolioBaselineValue: input.portfolioBaselineValue,
      portfolioBaselineAt: input.portfolioBaselineAt,
      onboardingComplete: true,
    },
  });
}

export async function updateProfile(user: AppUser, input: UpdateProfileInput) {
  return prisma.user.update({
    where: { id: user.id },
    data: {
      displayName: input.displayName,
      timezone: input.timezone,
      baseCurrency: input.baseCurrency.toUpperCase(),
    },
  });
}
