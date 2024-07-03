import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { tradeid, closingprice, completiondate, closedquantity } =
    await req.json();

  // Ensure closingprice and closedquantity are treated as numbers
  const closingPriceNumber = Number(closingprice);
  const closedQuantityNumber = Number(closedquantity);

  if (isNaN(closingPriceNumber) || isNaN(closedQuantityNumber)) {
    return NextResponse.json(
      { error: "Invalid closing price or closed quantity" },
      { status: 400 }
    );
  }

  try {
    // Check if the closed trade already exists
    const existingTrade = await sql`
      SELECT * FROM ClosedTrades WHERE TradeID = ${tradeid};
    `;

    if (existingTrade.rowCount > 0) {
      const existingTradeData = existingTrade.rows[0];
      const newClosedQuantity =
        existingTradeData.closedquantity + closedQuantityNumber;
      const newAverageClosingPrice =
        (existingTradeData.averageclosingprice *
          existingTradeData.closedquantity +
          closingPriceNumber * closedQuantityNumber) /
        newClosedQuantity;

      // Update the existing closed trade
      await sql`
        UPDATE ClosedTrades
        SET
          ClosingPrice = ${closingPriceNumber},
          AverageClosingPrice = ${newAverageClosingPrice},
          CompletionDate = ${completiondate},
          ClosedQuantity = ${newClosedQuantity}
        WHERE TradeID = ${tradeid};
      `;
    } else {
      // Insert the new closed trade
      await sql`
        INSERT INTO ClosedTrades (
          TradeID, ClosingPrice, AverageClosingPrice, CompletionDate, ClosedQuantity
        )
        VALUES (
          ${tradeid}, ${closingPriceNumber}, ${closingPriceNumber}, ${completiondate}, ${closedQuantityNumber}
        );
      `;
    }

    // Update the OpenTrades table to decrease the open quantity and set isClosed if necessary
    await sql`
      UPDATE OpenTrades
      SET
        OpenQuantity = OpenQuantity - ${closedQuantityNumber},
        isClosed = CASE
                    WHEN OpenQuantity - ${closedQuantityNumber} <= 0 THEN true
                    ELSE isClosed
                   END
      WHERE TradeID = ${tradeid};
    `;

    return NextResponse.json(
      { message: "Closed trade saved and open trade updated successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving closed trade or updating open trade:", error);
    return NextResponse.json(
      {
        error:
          "Closed trade could not be saved or open trade could not be updated!",
      },
      { status: 500 }
    );
  }
}
