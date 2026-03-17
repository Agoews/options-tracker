import "server-only";

import { redirect } from "next/navigation";

import type { AppUser } from "@/lib/domain/types";
import { getSessionClaims } from "@/lib/auth/session";
import { prisma } from "@/lib/server/db";

export async function syncUserFromSession() {
  const claims = await getSessionClaims();

  if (!claims?.uid || !claims.email) {
    return null;
  }

  return prisma.user.upsert({
    where: { firebaseUid: claims.uid },
    update: {
      email: claims.email,
      displayName: claims.name ?? undefined,
      avatarUrl: claims.picture ?? undefined,
    },
    create: {
      firebaseUid: claims.uid,
      email: claims.email,
      displayName: claims.name,
      avatarUrl: claims.picture,
    },
    select: {
      id: true,
      firebaseUid: true,
      email: true,
      displayName: true,
      avatarUrl: true,
      onboardingComplete: true,
      timezone: true,
      baseCurrency: true,
    },
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
