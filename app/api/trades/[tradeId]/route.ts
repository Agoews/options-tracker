import { NextResponse } from "next/server";

import { requireAppUser } from "@/lib/server/auth-user";
import { prisma } from "@/lib/server/db";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ tradeId: string }> },
) {
  const user = await requireAppUser();
  const { tradeId } = await params;

  await prisma.trade.deleteMany({
    where: { id: tradeId, userId: user.id },
  });

  return new NextResponse(null, { status: 204 });
}
