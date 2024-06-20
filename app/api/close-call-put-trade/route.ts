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

    return NextResponse.json(
      { message: "Closed trade saved successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving closed trade:", error);
    return NextResponse.json(
      { error: "Closed trade could not be saved!" },
      { status: 500 }
    );
  }
}

export function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
