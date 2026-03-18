import { z } from "zod";

import { usTimezones } from "@/lib/domain/timezones";
import { requireAppUser } from "@/lib/server/auth-user";
import { prisma } from "@/lib/server/db";
import { mutationFailure, mutationSuccess } from "@/lib/server/mutation-response";

const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(60),
  timezone: z.enum(usTimezones.map((entry) => entry.value) as [string, ...string[]]),
  baseCurrency: z.string().length(3),
});

export async function PATCH(request: Request) {
  try {
    const user = await requireAppUser();
    const payload = updateProfileSchema.parse(await request.json());
    await prisma.user.update({
      where: { id: user.id },
      data: {
        displayName: payload.displayName,
        timezone: payload.timezone,
        baseCurrency: payload.baseCurrency.toUpperCase(),
      },
    });
    return mutationSuccess({}, { message: "Profile updated." });
  } catch (error) {
    return mutationFailure(error, "Unable to update profile.");
  }
}
