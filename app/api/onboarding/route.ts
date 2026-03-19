import { onboardingSchema } from "@/lib/domain/schemas";
import { assertTrustedOrigin } from "@/lib/server/request-origin";
import { requireAppUser } from "@/lib/server/auth-user";
import { mutationFailure, mutationSuccess } from "@/lib/server/mutation-response";
import { completeOnboarding } from "@/lib/server/user-service";

export async function POST(request: Request) {
  try {
    assertTrustedOrigin(request);
    const user = await requireAppUser({ allowIncompleteOnboarding: true });
    const payload = onboardingSchema.parse(await request.json());
    await completeOnboarding(user, payload);
    return mutationSuccess({}, { message: "Workspace defaults saved." });
  } catch (error) {
    return mutationFailure(error, "Unable to save onboarding details.");
  }
}
