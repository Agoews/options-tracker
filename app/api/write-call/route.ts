import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const {
      userEmail,
      ticker,
      coveredCallStockPrice,
      coveredCallStrike,
      coveredCallPremium,
      coveredCallQuantity,
      coveredCallExpiration,
    } = await request.json();

    // Update CurrentStockHoldings table
    await sql`
      UPDATE CurrentStockHoldings
      SET
        Quantity = ${quantity},
        EntryPrice = ${entryPrice},
        OptionsProfit = ${optionsProfit},
        TotalValue = ${totalValue},
        CostBasis = ${costBasis},
        OpenOptions = ${openOptions},
        MaxOptions = ${maxOptions},
        DatePurchased = ${datePurchased}
      WHERE
        Email = ${userEmail} AND Ticker = ${ticker}
    `;

    // Update OpenTrades table
    await sql`
      INSERT INTO OpenTrades (
        email, ticker, actions, strike, currentprice, openquantity, optionprice, expirationdate, strategy, isClosed
      )
      VALUES (
        ${userEmail}, ${ticker}, 'COVERED CALL', ${coveredCallStrike}, ${coveredCallStockPrice}, ${coveredCallQuantity}, ${coveredCallPremium}, ${coveredCallExpiration}, 'WHEEL', 'FALSE'
      );
    `;

    return NextResponse.json(
      { message: "Stock holding and trade updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
