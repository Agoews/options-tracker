import "server-only";

import { redirect } from "next/navigation";

import type { AppUser } from "@/lib/domain/types";
import { getSessionClaims } from "@/lib/auth/session";
import { prisma } from "@/lib/server/db";

const appUserSelect = {
  id: true,
  firebaseUid: true,
  email: true,
  displayName: true,
  avatarUrl: true,
  onboardingComplete: true,
  timezone: true,
  baseCurrency: true,
  portfolioBaselineValue: true,
  portfolioBaselineAt: true,
} as const;

export async function syncUserFromSession() {
  const claims = await getSessionClaims();

  if (!claims?.uid || !claims.email) {
    return null;
  }

  const nextValues = {
    firebaseUid: claims.uid,
    email: claims.email,
    displayName: claims.name ?? undefined,
    avatarUrl: claims.picture ?? undefined,
  };

  return prisma.$transaction(async (tx) => {
    const existingByUid = await tx.user.findUnique({
      where: { firebaseUid: claims.uid },
      select: appUserSelect,
    });

    if (existingByUid) {
      return tx.user.update({
        where: { id: existingByUid.id },
        data: nextValues,
        select: appUserSelect,
      });
    }

    const existingByEmail = await tx.user.findUnique({
      where: { email: claims.email },
      select: appUserSelect,
    });

    if (existingByEmail) {
      return tx.user.update({
        where: { id: existingByEmail.id },
        data: nextValues,
        select: appUserSelect,
      });
    }

    return tx.user.create({
      data: nextValues,
      select: appUserSelect,
    });
  });
}

export async function requireAppUser(options?: { allowIncompleteOnboarding?: boolean }) {
  const user = await syncUserFromSession();

  if (!user) {
    redirect("/sign-in");
  }

  if (!options?.allowIncompleteOnboarding && !user.onboardingComplete) {
    redirect("/onboarding");
  }

  return user as AppUser;
}
