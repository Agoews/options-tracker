import { NextResponse } from "next/server";

import { createHoldingSchema } from "@/lib/domain/schemas";
import { requireAppUser } from "@/lib/server/auth-user";
import { createHolding } from "@/lib/server/trade-service";

export async function POST(request: Request) {
  const user = await requireAppUser();
  const payload = createHoldingSchema.parse(await request.json());
  const holding = await createHolding(user, payload);

  return NextResponse.json({ holdingId: holding.id }, { status: 201 });
}
