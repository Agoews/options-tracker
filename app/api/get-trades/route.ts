import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Assuming the UserID is passed as a query parameter. Adjust as needed.
    const url = new URL(request.url);
    // const userID = url.searchParams.get("userid");
    const userID = 1;

    if (!userID) {
      return NextResponse.json(
        { error: "UserID is required" },
        { status: 400 }
      );
    }

    const result = await sql`
      SELECT o.TradeID, o.Ticker, o.Actions, o.Strategy, o.TotalQuantity, o.Strike, o.OptionPrice, o.ExpirationDate, o.CreationDate,
             c.ClosingPrice, c.CompletionDate
      FROM OpenTrades o
      LEFT JOIN ClosedTrades c ON o.TradeID = c.TradeID
      WHERE o.UserID = ${userID};
    `;

    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
