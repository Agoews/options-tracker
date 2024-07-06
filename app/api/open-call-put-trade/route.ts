import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { tradeid, closedtradeid, closedquantity } = await req.json();
  const closedQuantityNumber = Number(closedquantity);

  try {
    await sql`
      DELETE FROM ClosedTrades WHERE ClosedTradeId = ${closedtradeid};
    `;

    const { rows: currentQuantityRows } = await sql`
      SELECT OpenQuantity FROM OpenTrades WHERE TradeId = ${tradeid};
    `;
    const currentQuantity = Number(currentQuantityRows[0].openquantity);

    await sql`
      UPDATE OpenTrades
        SET OpenQuantity = ${Number(currentQuantity) + closedQuantityNumber}
        WHERE TradeId = ${tradeid};
    `;

    return NextResponse.json(
      { message: "Trade reopened successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error reopening closed trade: ", error);
    return NextResponse.json(
      { error: "Closed trade could not be reopened" },
      { status: 500 }
    );
  }
}
