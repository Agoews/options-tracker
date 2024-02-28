import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Assuming the UserID is passed as a query parameter. Adjust as needed.
    const url = new URL(request.url);
    const userEmail = url.searchParams.get("email");

    if (!userEmail) {
      return NextResponse.json(
        { error: "userEmail is required" },
        { status: 400 }
      );
    }

    const result = await sql`
      SELECT
          ot.TradeID,
          ot.Ticker,
          ot.Strike,
          ot.CurrentPrice,
          ot.OpenQuantity,
          ot.OptionPrice,
          ot.Actions,
          ot.Strategy,
          ot.ExpirationDate,
          ot.isClosed,
          ot.CreationDate,
          ct.ClosedTradeID,
          ct.ClosingPrice,
          ct.CompletionDate,
          ct.ClosedQuantity
      FROM
          Users u
      JOIN
          OpenTrades ot ON u.Email = ot.Email
      LEFT JOIN
          ClosedTrades ct ON ot.TradeID = ct.TradeID
      WHERE
          u.Email = ${userEmail};
    `;

    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
