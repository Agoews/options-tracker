import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // const log = await request.json();
    // console.log("request.json(): ", log);
    const { userEmail, ticker, closedQuantity, exitPrice } =
      await request.json();
    if (!userEmail || !ticker || !closedQuantity || !exitPrice) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if the ticker already exists in the SoldStockHoldings for the user
    const existingSoldHolding = await sql`
      SELECT * FROM SoldStockHoldings
      WHERE Email = ${userEmail} AND Ticker = ${ticker}
    `;

    console.log("existingSoldHolding: ", existingSoldHolding.rows[0]);
    if (existingSoldHolding.rowCount > 0) {
      // Update the existing sold holding
      const holding = existingSoldHolding.rows[0];
      const newQuantity = holding.quantity + closedQuantity;
      const newCostBasis =
        (holding.costbasis * holding.quantity +
          holding.entryPrice * closedQuantity) /
        newQuantity;

      console.log("holdings: ", holding);
      await sql`
        UPDATE SoldStockHoldings
        SET Quantity = ${newQuantity}, EntryPrice = ${holding.entryprice}, CostBasis = ${newCostBasis}
        WHERE SoldStockHoldingsID = ${holding.soldstockholdingsid}
      `;

      await sql`
        UPDATE CurrentStockHoldings
        SET
          Quantity = ${existingSoldHolding.rows[0].quantity - closedQuantity},
          MaxOptions = ${
            (existingSoldHolding.rows[0].quantity - closedQuantity) / 100
          }
        WHERE
          Email = ${userEmail} AND Ticker = ${ticker}
      `;
    } else {
      const existingSoldHolding = await sql`
        SELECT * FROM CurrentStockHoldings
        WHERE Email = ${userEmail} AND Ticker = ${ticker}
      `;

      // console.log(
      //   "existingSoldHolding after: ",
      //   existingSoldHolding.rows[0],
      //   "userEmail: ",
      //   userEmail,
      //   "ticker: ",
      //   ticker,
      //   "closedQuantity: ",
      //   closedQuantity,
      //   "entryPrice: ",
      //   existingSoldHolding.rows[0].entryprice,
      //   "costbasis: ",
      //   existingSoldHolding.rows[0].costbasis
      // );
      // Insert a new holding into CurrentStockHoldings
      await sql`
        INSERT INTO SoldStockHoldings (
          Email, Ticker, Quantity, ExitPrice, EntryPrice, SaleDate, CostBasis
        ) VALUES (
          ${userEmail}, ${ticker}, ${closedQuantity}, ${exitPrice}, ${Number(
        existingSoldHolding.rows[0].entryprice
      )}, NOW(), ${Number(existingSoldHolding.rows[0].costbasis)}
        )
      `;

      await sql`
        UPDATE CurrentStockHoldings
        SET
          Quantity = ${existingSoldHolding.rows[0].quantity - closedQuantity},
          MaxOptions = ${
            (existingSoldHolding.rows[0].quantity - closedQuantity) / 100
          }
        WHERE
          Email = ${userEmail} AND Ticker = ${ticker}
      `;
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
