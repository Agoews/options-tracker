import { NextResponse } from "next/server";

import { requireAppUser } from "@/lib/server/auth-user";
import { deleteHolding } from "@/lib/server/trade-service";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ holdingLotId: string }> },
) {
  const user = await requireAppUser();
  const { holdingLotId } = await params;

  await deleteHolding(user, holdingLotId);

  return NextResponse.json({ ok: true });
}
