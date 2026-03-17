import { NextResponse } from "next/server";

import { createTradeSchema } from "@/lib/domain/schemas";
import { requireAppUser } from "@/lib/server/auth-user";
import { createTrade } from "@/lib/server/trade-service";

export async function POST(request: Request) {
  const user = await requireAppUser();
  const payload = createTradeSchema.parse(await request.json());
  const tradeId = await createTrade(user, payload);

  return NextResponse.json({ tradeId }, { status: 201 });
}
