import { archiveEntitySchema, deleteEntitySchema } from "@/lib/domain/schemas";
import { assertTrustedOrigin } from "@/lib/server/request-origin";
import { requireAppUser } from "@/lib/server/auth-user";
import { mutationFailure, mutationSuccess } from "@/lib/server/mutation-response";
import { archiveTrade, deleteTrade } from "@/lib/server/trade-service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ tradeId: string }> },
) {
  try {
    assertTrustedOrigin(request);
    const user = await requireAppUser();
    const payload = archiveEntitySchema.parse(await request.json());
    const { tradeId } = await params;
    const trade = await archiveTrade(user, tradeId, payload.archived);
    return mutationSuccess(
      { tradeId: trade.id },
      { message: payload.archived ? "Trade archived." : "Trade restored." },
    );
  } catch (error) {
    return mutationFailure(error, "Unable to update trade archive state.");
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ tradeId: string }> },
) {
  try {
    assertTrustedOrigin(request);
    const user = await requireAppUser();
    deleteEntitySchema.parse(await request.json());
    const { tradeId } = await params;
    await deleteTrade(user, tradeId);
    return mutationSuccess({}, { message: "Trade deleted." });
  } catch (error) {
    return mutationFailure(error, "Unable to delete trade.");
  }
}
