import { sql } from "@vercel/postgres";

export async function PUT(req, res) {
  const {
    tradeid,
    closedtradeid,
    closingprice,
    completiondate,
    reopenquantity,
    isClosed,
  } = await req.json();

  try {
    console.log('-----', tradeid,
      closedtradeid,
      closingprice,
      completiondate,
      reopenquantity,
      isClosed)
    // Update the open quantity in the OpenTrades table to reopen the trade
    await sql`
      UPDATE OpenTrades
      SET
        openquantity = openquantity + ${reopenquantity},
        isClosed = FALSE
      WHERE tradeid = ${tradeid};
    `;

    await sql`
      DELETE FROM ClosedTrades
      WHERE ClosedtradeId = ${closedtradeid};
    `;

    return new Response("Trade reopened successfully!", { status: 200 });
  } catch (error) {
    console.error("Error reopening trade:", error);
    return new Response("Trade could not be reopened!", { status: 500 });
  }
}
