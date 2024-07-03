import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { tradeid, reopenquantity } = await req.json();

  // Ensure reopenquantity is treated as a number
  const reopenQuantityNumber = Number(reopenquantity);

  if (isNaN(reopenQuantityNumber)) {
    return NextResponse.json(
      { error: "Invalid reopen quantity" },
      { status: 400 }
    );
  }

  try {
    // Retrieve the closed trade
    const closedTrade = await sql`
      SELECT * FROM ClosedTrades WHERE TradeID = ${tradeid};
    `;

    if (closedTrade.rows.length === 0) {
      return NextResponse.json(
        { error: "Closed trade not found" },
        { status: 404 }
      );
    }

    const closedTradeData = closedTrade.rows[0];

    // Update ClosedTrades to reflect the reopened quantity
    const remainingClosedQuantity =
      Number(closedTradeData.closedquantity) - reopenQuantityNumber;

    if (remainingClosedQuantity < 0) {
      return NextResponse.json(
        { error: "Reopen quantity exceeds closed quantity" },
        { status: 400 }
      );
    } else if (remainingClosedQuantity === 0) {
      // Delete the closed trade if all quantities are reopened
      await sql`
        DELETE FROM ClosedTrades WHERE TradeID = ${tradeid};
      `;
    } else {
      // Update the closed trade with the remaining quantity
      await sql`
        UPDATE ClosedTrades
        SET ClosedQuantity = ${remainingClosedQuantity}
        WHERE TradeID = ${tradeid};
      `;
    }

    // Update OpenTrades to reflect the reopened quantity
    const openTrade = await sql`
      SELECT * FROM OpenTrades WHERE TradeID = ${tradeid};
    `;

    if (openTrade.rows.length === 0) {
      return NextResponse.json(
        { error: "Open trade not found" },
        { status: 404 }
      );
    }

    const openTradeData = openTrade.rows[0];
    const newOpenQuantity =
      Number(openTradeData.openquantity) + reopenQuantityNumber;

    await sql`
      UPDATE OpenTrades
      SET OpenQuantity = ${newOpenQuantity},
          isClosed = ${false}
      WHERE TradeID = ${tradeid};
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
