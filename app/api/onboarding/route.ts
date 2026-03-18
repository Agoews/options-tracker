import { onboardingSchema } from "@/lib/domain/schemas";
import { requireAppUser } from "@/lib/server/auth-user";
import { prisma } from "@/lib/server/db";
import { mutationFailure, mutationSuccess } from "@/lib/server/mutation-response";

export async function POST(request: Request) {
  try {
    const user = await requireAppUser({ allowIncompleteOnboarding: true });
    const payload = onboardingSchema.parse(await request.json());

    await prisma.user.update({
      where: { id: user.id },
      data: {
        displayName: payload.displayName,
        timezone: payload.timezone,
        baseCurrency: payload.baseCurrency.toUpperCase(),
        portfolioBaselineValue: payload.portfolioBaselineValue,
        portfolioBaselineAt: payload.portfolioBaselineAt,
        onboardingComplete: true,
      },
    });

    return mutationSuccess({}, { message: "Workspace defaults saved." });
  } catch (error) {
    return mutationFailure(error, "Unable to save onboarding details.");
  }
}
