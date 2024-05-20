import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userEmail, ticker, closedQuantity, exitPrice, holdingId } =
      await request.json();
    if (!userEmail || !ticker || !closedQuantity || !exitPrice || !holdingId) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Retrieve current holding
    const currentHolding = await sql`
      SELECT * FROM CurrentStockHoldings
      WHERE CurrentStockHoldingsID = ${holdingId}
    `;

    if (currentHolding.rowCount === 0) {
      throw new Error("Holding not found");
    }

    const holding = currentHolding.rows[0];

    // Insert into SoldStockHoldings
    await sql`
      INSERT INTO SoldStockHoldings (
        Email, Ticker, Quantity, EntryPrice, ExitPrice, SaleDate, CostBasis
      ) VALUES (
        ${userEmail}, ${ticker}, ${closedQuantity}, ${holding.entryprice}, ${exitPrice}, NOW(), ${holding.costbasis}
      )
    `;

    // Update the quantity in CurrentStockHoldings or delete if fully sold
    const remainingQuantity = holding.quantity - closedQuantity;
    if (remainingQuantity > 0) {
      await sql`
        UPDATE CurrentStockHoldings
        SET Quantity = ${remainingQuantity}
        WHERE CurrentStockHoldingsID = ${holdingId}
      `;
    } else {
      await sql`
        DELETE FROM CurrentStockHoldings
        WHERE CurrentStockHoldingsID = ${holdingId}
      `;
    }

    return NextResponse.json(
      { message: "Stock sold successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
