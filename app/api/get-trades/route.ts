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
      SELECT
          ot.Tradeid,
          ot.Ticker,
          ot.Actions,
          ot.Strategy,
          ot.Strike,
          ot.OpenQuantity,
          ot.OptionPrice,
          ot.ExpirationDate,
          ot.CreationDate,
          ct.ClosingPrice,
          ct.CompletionDate,
          ct.ClosedQuantity
      FROM
          OpenTrades ot
      LEFT JOIN
          ClosedTrades ct ON ot.TradeID = ct.TradeID
      WHERE
          ot.UserID = ${userID};
    `;

    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
