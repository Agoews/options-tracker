import { archiveEntitySchema, deleteEntitySchema } from "@/lib/domain/schemas";
import { requireAppUser } from "@/lib/server/auth-user";
import { mutationFailure, mutationSuccess } from "@/lib/server/mutation-response";
import { archiveHolding, deleteHolding } from "@/lib/server/trade-service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ holdingLotId: string }> },
) {
  try {
    const user = await requireAppUser();
    const payload = archiveEntitySchema.parse(await request.json());
    const { holdingLotId } = await params;
    const holding = await archiveHolding(user, holdingLotId, payload.archived);
    return mutationSuccess(
      { holdingId: holding.id },
      { message: payload.archived ? "Holding archived." : "Holding restored." },
    );
  } catch (error) {
    return mutationFailure(error, "Unable to update holding archive state.");
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ holdingLotId: string }> },
) {
  try {
    const user = await requireAppUser();
    deleteEntitySchema.parse(await request.json());
    const { holdingLotId } = await params;
    await deleteHolding(user, holdingLotId);
    return mutationSuccess({}, { message: "Holding deleted." });
  } catch (error) {
    return mutationFailure(error, "Unable to delete holding.");
  }
}
