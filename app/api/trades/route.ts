import { createTradeSchema } from "@/lib/domain/schemas";
import { requireAppUser } from "@/lib/server/auth-user";
import { mutationFailure, mutationSuccess } from "@/lib/server/mutation-response";
import { createTrade } from "@/lib/server/trade-service";

export async function POST(request: Request) {
  try {
    const user = await requireAppUser();
    const payload = createTradeSchema.parse(await request.json());
    const tradeId = await createTrade(user, payload);
    return mutationSuccess({ tradeId }, { status: 201, message: "Trade created." });
  } catch (error) {
    return mutationFailure(error, "Unable to create trade.");
  }
}
