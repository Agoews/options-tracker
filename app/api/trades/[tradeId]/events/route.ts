import { appendTradeEventSchema } from "@/lib/domain/schemas";
import { requireAppUser } from "@/lib/server/auth-user";
import { mutationFailure, mutationSuccess } from "@/lib/server/mutation-response";
import { appendTradeEvent } from "@/lib/server/trade-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tradeId: string }> },
) {
  try {
    const user = await requireAppUser();
    const payload = appendTradeEventSchema.parse(await request.json());
    const { tradeId } = await params;
    const eventId = await appendTradeEvent(user, tradeId, payload);

    return mutationSuccess({ eventId }, { status: 201, message: "Event recorded." });
  } catch (error) {
    return mutationFailure(error, "Unable to record trade event.");
  }
}
