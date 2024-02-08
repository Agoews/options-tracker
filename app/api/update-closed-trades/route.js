import { sql } from "@vercel/postgres";

export async function PUT(req, res) {
  const {
    tradeid,
    reopenquantity,
  } = await req.json();

  try {
    console.log('-----', tradeid, reopenquantity)
    // Update the open quantity in the OpenTrades table to reopen the trade
    await sql`
      UPDATE OpenTrades
      SET
        openquantity = openquantity + ${reopenquantity},
        isClosed = FALSE
      WHERE tradeid = ${tradeid};
    `;

    await sql`
      UPDATE ClosedTrades
      SET ClosedQuantity = ClosedQuantity - ${reopenquantity}
      WHERE TradeID = ${tradeid};
    `;

    // Note: You might need additional logic to handle cases where the reopen quantity exceeds the closed quantity
    // or to properly track reopened trades if using a separate table for closed trades.

    return new Response("Trade reopened successfully!", { status: 200 });
  } catch (error) {
    console.error("Error reopening trade:", error);
    return new Response("Trade could not be reopened!", { status: 500 });
  }
}
