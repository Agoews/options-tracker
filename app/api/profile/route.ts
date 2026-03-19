import { updateProfileSchema } from "@/lib/domain/schemas";
import { assertTrustedOrigin } from "@/lib/server/request-origin";
import { requireAppUser } from "@/lib/server/auth-user";
import { mutationFailure, mutationSuccess } from "@/lib/server/mutation-response";
import { updateProfile } from "@/lib/server/user-service";

export async function PATCH(request: Request) {
  try {
    assertTrustedOrigin(request);
    const user = await requireAppUser();
    const payload = updateProfileSchema.parse(await request.json());
    await updateProfile(user, payload);
    return mutationSuccess({}, { message: "Profile updated." });
  } catch (error) {
    return mutationFailure(error, "Unable to update profile.");
  }
}
