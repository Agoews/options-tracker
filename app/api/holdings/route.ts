import { createHoldingSchema } from "@/lib/domain/schemas";
import { assertTrustedOrigin } from "@/lib/server/request-origin";
import { requireAppUser } from "@/lib/server/auth-user";
import { mutationFailure, mutationSuccess } from "@/lib/server/mutation-response";
import { createHolding } from "@/lib/server/trade-service";

export async function POST(request: Request) {
  try {
    assertTrustedOrigin(request);
    const user = await requireAppUser();
    const payload = createHoldingSchema.parse(await request.json());
    const holding = await createHolding(user, payload);
    return mutationSuccess({ holdingId: holding.id }, { status: 201, message: "Holding recorded." });
  } catch (error) {
    return mutationFailure(error, "Unable to add holding.");
  }
}
