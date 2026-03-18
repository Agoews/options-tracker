import { closeHoldingSchema } from "@/lib/domain/schemas";
import { requireAppUser } from "@/lib/server/auth-user";
import { mutationFailure, mutationSuccess } from "@/lib/server/mutation-response";
import { closeHolding } from "@/lib/server/trade-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ holdingLotId: string }> },
) {
  try {
    const user = await requireAppUser();
    const payload = closeHoldingSchema.parse(await request.json());
    const { holdingLotId } = await params;
    const holding = await closeHolding(user, holdingLotId, payload);
    return mutationSuccess({ holdingId: holding.id }, { status: 201, message: "Holding closed." });
  } catch (error) {
    return mutationFailure(error, "Unable to close holding.");
  }
}
