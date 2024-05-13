import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, response: NextResponse) {
  const { userEmail, ticker, quantity, entryPrice } = await request.json();

  const totalValue = quantity * entryPrice;
  const maxOptions = Math.floor(quantity / 100) * 100;

  try {
    // Insert the new trade into the database
    const result = await sql`
      INSERT INTO CurrentStockHoldings (
        email, ticker, quantity, entryprice, totalvalue, costbasis, openoptions, maxoptions, datepurchased
      )
      VALUES (
        ${userEmail}, ${ticker}, ${quantity}, ${entryPrice}, ${totalValue}, ${entryPrice}, 0, ${maxOptions}, CURRENT_DATE
      );
    `;

    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
