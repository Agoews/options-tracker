import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
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
          *
      FROM
          CurrentStockHoldings
      WHERE
          Email = ${userEmail};
    `;

    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
