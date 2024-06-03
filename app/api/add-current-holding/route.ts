import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, response: NextResponse) {
  const { userEmail, ticker, quantity, entryPrice } = await request.json();

  // Convert incoming data to numbers
  const quantityNum = Number(quantity);
  const entryPriceNum = Number(entryPrice);

  const totalValue = quantityNum * entryPriceNum;
  const maxOptions = Math.floor(quantityNum / 100);

  try {
    // Check if the record already exists
    const existingRecord = await sql`
      SELECT * FROM CurrentStockHoldings
      WHERE Email = ${userEmail} AND Ticker = ${ticker};
    `;

    if (existingRecord.rowCount > 0) {
      // Update the existing record
      const newQuantity = Number(existingRecord.rows[0].quantity) + quantityNum;
      const newTotalValue =
        Number(existingRecord.rows[0].totalvalue) + totalValue;
      const newMaxOptions = Math.floor(newQuantity / 100);

      await sql`
        UPDATE CurrentStockHoldings
        SET
          Quantity = ${newQuantity},
          TotalValue = ${newTotalValue},
          CostBasis = ${
            (quantityNum * entryPriceNum +
              existingRecord.rows[0].entryprice *
                existingRecord.rows[0].quantity) /
            newQuantity
          },
          MaxOptions = ${newMaxOptions}
        WHERE
          Email = ${userEmail} AND Ticker = ${ticker};
      `;
    } else {
      // Insert a new record
      await sql`
        INSERT INTO CurrentStockHoldings (
          Email, Ticker, Quantity, EntryPrice, TotalValue, CostBasis, OpenOptions, MaxOptions, DatePurchased
        )
        VALUES (
          ${userEmail}, ${ticker}, ${quantityNum}, ${entryPriceNum}, ${totalValue}, ${entryPriceNum}, 0, ${maxOptions}, CURRENT_DATE
        );
      `;
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
