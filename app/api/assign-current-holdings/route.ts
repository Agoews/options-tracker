import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { editedTrade, userEmail: email } = await request.json();
    const {
      tradeid,
      ticker,
      actions,
      strategy,
      strike,
      currentprice,
      openquantity,
      isclosed,
      optionprice,
      expirationdate,
      userEmail,
    } = editedTrade;

    const numericStrike = parseFloat(strike);
    const numericCurrentPrice = parseFloat(currentprice);
    const numericOptionPrice = parseFloat(optionprice);

    const quantity = openquantity * 100;
    const entryPrice = numericStrike;
    const costBasis = numericStrike - numericOptionPrice;
    const totalValue = quantity * entryPrice;

    // Validate all required fields are present and not null
    if (
      !email ||
      !ticker ||
      isNaN(quantity) ||
      isNaN(entryPrice) ||
      isNaN(numericCurrentPrice) ||
      isNaN(numericOptionPrice) ||
      isNaN(numericStrike)
    ) {
      console.log(
        "---",
        tradeid,
        email,
        ticker,
        quantity,
        entryPrice,
        numericCurrentPrice,
        numericOptionPrice,
        numericStrike
      );
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
        ${email},
        ${ticker},
        ${quantity},
        ${entryPrice},
        ${totalValue},
        ${costBasis},
        CURRENT_TIMESTAMP
      );
    `;

    await sql`
        INSERT INTO ClosedTrades (TradeID, ClosingPrice, CompletionDate, ClosedQuantity)
        VALUES (${tradeid}, ${costBasis}, CURRENT_TIMESTAMP, ${openquantity});
      `;

    // Update the open quantity in OpenTrades table
    await sql`
        UPDATE OpenTrades
        SET openquantity = 0
        WHERE tradeid = ${tradeid};
      `;

    // Check if the open quantity is now 0 or below, and mark the trade as closed
    await sql`
        UPDATE OpenTrades
        SET isClosed = TRUE
        WHERE tradeid = ${tradeid} AND openquantity <= 0;
      `;

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
