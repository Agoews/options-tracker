import { addPortfolioFundingSchema, updatePortfolioBaselineSchema } from "@/lib/domain/schemas";
import { requireAppUser } from "@/lib/server/auth-user";
import { mutationFailure, mutationSuccess } from "@/lib/server/mutation-response";
import { addPortfolioFunding, updatePortfolioBaseline } from "@/lib/server/trade-service";

export async function PATCH(request: Request) {
  try {
    const user = await requireAppUser();
    const payload = updatePortfolioBaselineSchema.parse(await request.json());
    await updatePortfolioBaseline(user, payload);
    return mutationSuccess({}, { message: "Portfolio baseline updated." });
  } catch (error) {
    return mutationFailure(error, "Unable to update portfolio baseline.");
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAppUser();
    const payload = addPortfolioFundingSchema.parse(await request.json());
    await addPortfolioFunding(user, payload);
    return mutationSuccess({}, { status: 201, message: "Funds added." });
  } catch (error) {
    return mutationFailure(error, "Unable to add funds.");
  }
}
