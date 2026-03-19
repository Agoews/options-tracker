import { tradeLifecycleActionSchema } from "@/lib/domain/schemas";
import { assertTrustedOrigin } from "@/lib/server/request-origin";
import { requireAppUser } from "@/lib/server/auth-user";
import { mutationFailure, mutationSuccess } from "@/lib/server/mutation-response";
import { applyTradeLifecycleAction } from "@/lib/server/trade-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tradeId: string }> },
) {
  try {
    assertTrustedOrigin(request);
    const user = await requireAppUser();
    const payload = tradeLifecycleActionSchema.parse(await request.json());
    const { tradeId } = await params;
    const eventId = await applyTradeLifecycleAction(user, tradeId, payload);
    return mutationSuccess({ eventId }, { status: 201, message: "Lifecycle updated." });
  } catch (error) {
    return mutationFailure(error, "Unable to append lifecycle action.");
  }
}
