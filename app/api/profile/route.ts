import { NextResponse } from "next/server";
import { z } from "zod";

import { usTimezones } from "@/lib/domain/timezones";
import { requireAppUser } from "@/lib/server/auth-user";
import { prisma } from "@/lib/server/db";

const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(60),
  timezone: z.enum(usTimezones.map((entry) => entry.value) as [string, ...string[]]),
  baseCurrency: z.string().length(3),
});

export async function PATCH(request: Request) {
  const user = await requireAppUser();
  const payload = updateProfileSchema.parse(await request.json());

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        displayName: payload.displayName,
        timezone: payload.timezone,
        baseCurrency: payload.baseCurrency.toUpperCase(),
      },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update profile.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
