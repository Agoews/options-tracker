import { NextResponse } from "next/server";

import { closeHoldingSchema } from "@/lib/domain/schemas";
import { requireAppUser } from "@/lib/server/auth-user";
import { closeHolding } from "@/lib/server/trade-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ holdingLotId: string }> },
) {
  const user = await requireAppUser();
  const payload = closeHoldingSchema.parse(await request.json());
  const { holdingLotId } = await params;

  try {
    const holding = await closeHolding(user, holdingLotId, payload);
    return NextResponse.json({ holdingId: holding.id }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to close holding.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
