import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const result = await sql`
      SELECT t.TradeID, t.Ticker, t.Strike, t.ClosingPrice, t.ExpirationDate, t.Open, u.Email, u.Name
      FROM Trades t
      INNER JOIN Users u ON t.UserID = u.UserID;
    `;

    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
