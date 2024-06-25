import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { tradeid, closingprice, completiondate, closedquantity } =
    await req.json();

  try {
    // Insert the closed trade into the database
    await sql`
      INSERT INTO ClosedTrades (
        TradeID, ClosingPrice, CompletionDate, ClosedQuantity
      )
      VALUES (
        ${tradeid}, ${closingprice}, ${completiondate}, ${closedquantity}
      );
    `;

    // Update the OpenTrades table to decrease the openquantity and set isClosed if necessary
    await sql`
      UPDATE OpenTrades
      SET
        OpenQuantity = OpenQuantity - ${closedquantity},
        isClosed = CASE
                    WHEN OpenQuantity - ${closedquantity} <= 0 THEN true
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

export function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
