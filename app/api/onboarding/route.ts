import { NextResponse } from "next/server";

import { onboardingSchema } from "@/lib/domain/schemas";
import { requireAppUser } from "@/lib/server/auth-user";
import { prisma } from "@/lib/server/db";

export async function POST(request: Request) {
  const user = await requireAppUser({ allowIncompleteOnboarding: true });
  const payload = onboardingSchema.parse(await request.json());

  await prisma.user.update({
    where: { id: user.id },
    data: {
      displayName: payload.displayName,
      timezone: payload.timezone,
      baseCurrency: payload.baseCurrency.toUpperCase(),
      onboardingComplete: true,
    },
  });

  return NextResponse.json({ ok: true });
}
