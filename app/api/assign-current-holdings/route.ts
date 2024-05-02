import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { editedTrade, userEmail: rootEmail } = await request.json(); // Extract editedTrade and root userEmail
    const {
      ticker,
      strike,
      currentprice,
      openquantity,
      optionprice,
      userEmail,
    } = editedTrade;

    const numericStrike = parseFloat(strike);
    const numericCurrentPrice = parseFloat(currentprice);
    const numericOptionPrice = parseFloat(optionprice);

    const quantity = openquantity * 100;
    const entryPrice = numericStrike;
    const costBasis = numericStrike - numericOptionPrice;
    const totalValue = quantity * entryPrice;

    console.log(userEmail, ticker, quantity, entryPrice, totalValue, costBasis);

    // Validate all required fields are present and not null
    if (
      !userEmail ||
      !ticker ||
      isNaN(quantity) ||
      isNaN(entryPrice) ||
      isNaN(numericCurrentPrice) ||
      isNaN(numericOptionPrice) ||
      isNaN(numericStrike)
    ) {
      return NextResponse.json(
        { error: "Missing or invalid required fields" },
        { status: 400 }
      );
    }

    // SQL Insert, assuming sql is set up to handle SQL queries
    const result = await sql`
      INSERT INTO CurrentHoldings (
        Email,
        Ticker,
        Quantity,
        EntryPrice,
        TotalValue,
        CostBasis,
        DatePurchased
      ) VALUES (
        ${userEmail},
        ${ticker},
        ${quantity},
        ${entryPrice},
        ${totalValue},
        ${costBasis},
        CURRENT_DATE
      );
    `;
    console.log("result from assignment", result);

    // Return successful response
    return NextResponse.json(
      { userEmail, currentprice, optionprice, strike, ticker, openquantity },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
