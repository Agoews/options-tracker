import { NextResponse } from "next/server";

import { appendTradeEventSchema } from "@/lib/domain/schemas";
import { requireAppUser } from "@/lib/server/auth-user";
import { appendTradeEvent } from "@/lib/server/trade-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tradeId: string }> },
) {
  const user = await requireAppUser();
  const payload = appendTradeEventSchema.parse(await request.json());
  const { tradeId } = await params;
  const eventId = await appendTradeEvent(user, tradeId, payload);

  return NextResponse.json({ eventId }, { status: 201 });
}
