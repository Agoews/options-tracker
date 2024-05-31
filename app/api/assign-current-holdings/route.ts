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
    const maxOptions = quantity / 100;

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

    if (actions === "CASH SECURED PUT") {
      // Check if the record already exists
      const existingRecord = await sql`
        SELECT * FROM CurrentStockHoldings
        WHERE Email = ${email} AND Ticker = ${ticker};
      `;

      if (existingRecord.rowCount > 0) {
        // Update the existing record
        const newQuantity = Number(existingRecord.rows[0].quantity) + quantity;
        const newTotalValue =
          Number(existingRecord.rows[0].totalvalue) + totalValue;
        const newCostBasis =
          (quantity * entryPrice +
            existingRecord.rows[0].entryprice *
              existingRecord.rows[0].quantity) /
          newQuantity;
        const newMaxOptions = Math.floor(newQuantity / 100) * 100;

        await sql`
          UPDATE CurrentStockHoldings
          SET
            Quantity = ${newQuantity},
            TotalValue = ${newTotalValue},
            CostBasis = ${newCostBasis},
            MaxOptions = ${newMaxOptions}
          WHERE
            Email = ${email} AND Ticker = ${ticker};
        `;
      } else {
        // Insert a new record
        await sql`
          INSERT INTO CurrentStockHoldings (
            Email,
            Ticker,
            Quantity,
            EntryPrice,
            TotalValue,
            CostBasis,
            OptionsProfit,
            OpenOptions,
            MaxOptions,
            DatePurchased
          ) VALUES (
            ${email},
            ${ticker},
            ${quantity},
            ${entryPrice},
            ${totalValue},
            ${costBasis},
            ${numericOptionPrice},
            0,
            ${maxOptions},
            CURRENT_TIMESTAMP
          );
        `;
      }

      // Add closed trade into the ClosedTrades table
      await sql`
        INSERT INTO ClosedTrades (TradeID, ClosingPrice, CompletionDate, ClosedQuantity)
        VALUES (${tradeid}, 0, CURRENT_TIMESTAMP, ${openquantity});
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
    }

    return NextResponse.json(
      { userEmail, currentprice, optionprice, strike, ticker, openquantity },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
