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
      SELECT TradeID, Ticker, Strategy, Strike, ClosingPrice, ExpirationDate, Open
      FROM Trades
      WHERE UserID = ${userID};
    `;

    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
