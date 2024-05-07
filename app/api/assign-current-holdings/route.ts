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
      return NextResponse.json(
        { error: "Missing or invalid required fields" },
        { status: 400 }
      );
    }

    // Add the shares into the CurrentHoldings table
    const result = await sql`
      INSERT INTO CurrentHoldings (
        Email,
        Ticker,
        Quantity,
        EntryPrice,
        TotalValue,
        CostBasis,
        OptionsProfit,
        Profit
        DatePurchased
      ) VALUES (
        ${email},
        ${ticker},
        ${quantity},
        ${entryPrice},
        ${totalValue},
        ${numericOptionPrice},
        ${costBasis},
        CURRENT_TIMESTAMP
      );
    `;

    // Add closed trade into the ClosedTrades table
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

    return NextResponse.json(
      { userEmail, currentprice, optionprice, strike, ticker, openquantity },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
