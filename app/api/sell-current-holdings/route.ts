import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userEmail, ticker, closedQuantity, exitPrice } =
      await request.json();
    if (!userEmail || !ticker || !closedQuantity || !exitPrice) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Convert closedQuantity and exitPrice to numbers
    const closedQuantityNum = Number(closedQuantity);
    const exitPriceNum = Number(exitPrice);

    // Check if the ticker already exists in the SoldStockHoldings for the user
    const existingSoldHolding = await sql`
      SELECT * FROM SoldStockHoldings
      WHERE Email = ${userEmail} AND Ticker = ${ticker}
    `;

    const existingCurrentHolding = await sql`
      SELECT * FROM CurrentStockHoldings
      WHERE Email = ${userEmail} AND Ticker = ${ticker}
    `;
    console.log("existingSoldHolding: ", existingSoldHolding.rows[0]);
    if (existingSoldHolding.rowCount > 0) {
      // Update the existing sold holding
      const soldHolding = existingSoldHolding.rows[0];
      const existingHolding = existingCurrentHolding.rows[0];
      console.log("existingHolding: ", existingHolding);
      const newQuantity =
        Number(soldHolding.quantity) + Number(closedQuantityNum);

      console.log("holdings: ", soldHolding, newQuantity);
      await sql`
        UPDATE SoldStockHoldings
        SET Quantity = ${newQuantity}, EntryPrice = ${soldHolding.entryprice}
        WHERE SoldStockHoldingsID = ${soldHolding.soldstockholdingsid}
      `;

      console.log(Number(existingHolding.quantity), closedQuantityNum);
      if (Number(existingHolding.quantity) === closedQuantityNum) {
        await sql`
          DELETE FROM CurrentStockHoldings
          WHERE Email = ${userEmail} AND Ticker = ${ticker}
        `;
      } else {
        await sql`
          UPDATE CurrentStockHoldings
          SET
            Quantity = ${existingHolding.quantity - closedQuantityNum},
            MaxOptions = ${(existingHolding.quantity - closedQuantityNum) / 100}
          WHERE
            Email = ${userEmail} AND Ticker = ${ticker}
        `;
      }
    } else {
      const existingHolding = await sql`
        SELECT * FROM CurrentStockHoldings
        WHERE Email = ${userEmail} AND Ticker = ${ticker}
      `;

      if (existingHolding.rowCount > 0) {
        const soldHolding = existingHolding.rows[0];

        await sql`
          INSERT INTO SoldStockHoldings (
            Email, Ticker, Quantity, ExitPrice, SaleDate
          ) VALUES (
            ${userEmail}, ${ticker}, ${closedQuantityNum}, ${exitPriceNum}, NOW()
          )
        `;

        if (Number(soldHolding.quantity) === Number(closedQuantityNum)) {
          // Delete the holding from CurrentStockHoldings if quantities are equal
          await sql`
            DELETE FROM CurrentStockHoldings
            WHERE Email = ${userEmail} AND Ticker = ${ticker}
          `;
        } else {
          await sql`
            UPDATE CurrentStockHoldings
            SET
              Quantity = ${soldHolding.quantity - closedQuantityNum},
              MaxOptions = ${(soldHolding.quantity - closedQuantityNum) / 100}
            WHERE
              Email = ${userEmail} AND Ticker = ${ticker}
          `;
        }
      }
    }

    return NextResponse.json(
      { message: "Stock holding updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
