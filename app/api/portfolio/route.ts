import { addCapitalAdjustmentSchema, setTrackedCapitalSchema } from "@/lib/domain/schemas";
import { assertTrustedOrigin } from "@/lib/server/request-origin";
import { requireAppUser } from "@/lib/server/auth-user";
import { mutationFailure, mutationSuccess } from "@/lib/server/mutation-response";
import { addCapitalAdjustment, setTrackedCapital } from "@/lib/server/portfolio-service";

export async function PATCH(request: Request) {
  try {
    assertTrustedOrigin(request);
    const user = await requireAppUser();
    const payload = setTrackedCapitalSchema.parse(await request.json());
    await setTrackedCapital(user, payload);
    return mutationSuccess({}, { message: "Tracked capital updated." });
  } catch (error) {
    return mutationFailure(error, "Unable to update tracked capital.");
  }
}

export async function POST(request: Request) {
  try {
    assertTrustedOrigin(request);
    const user = await requireAppUser();
    const payload = addCapitalAdjustmentSchema.parse(await request.json());
    await addCapitalAdjustment(user, payload);
    return mutationSuccess({}, { status: 201, message: "Capital adjustment recorded." });
  } catch (error) {
    return mutationFailure(error, "Unable to update capital.");
  }
}
