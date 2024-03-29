import { sql } from "@vercel/postgres";

export async function PUT(req, res) {
  const {
    tradeid,
    ticker,
    strategy,
    strike,
    currentprice,
    openquantity,
    optionprice,
    closingprice,
    expirationdate,
    completiondate,
    closedquantity
  } = await req.json();

  try {
    // If there's a closing price, it means we're closing the trade
    if (closingprice != null) {
      // Insert into ClosedTrades table
      await sql`
        INSERT INTO ClosedTrades (TradeID, ClosingPrice, CompletionDate, ClosedQuantity)
        VALUES (${tradeid}, ${closingprice}, CURRENT_TIMESTAMP, ${closedquantity});
      `;

      // Update the open quantity in OpenTrades table
      await sql`
        UPDATE OpenTrades
        SET openquantity = openquantity - ${closedquantity}
        WHERE tradeid = ${tradeid};
      `;

      // Check if the open quantity is now 0 or below, and mark the trade as closed
      await sql`
        UPDATE OpenTrades
        SET isClosed = TRUE
        WHERE tradeid = ${tradeid} AND openquantity <= 0;
      `;
    } else {
      // If not closing, just update the trade as before
      await sql`
        UPDATE OpenTrades
        SET
          ticker = ${ticker},
          strategy = ${strategy},
          strike = ${strike},
          currentprice = ${currentprice},
          openquantity = ${openquantity},
          optionprice = ${optionprice},
          expirationdate = ${expirationdate}
        WHERE tradeid = ${tradeid};
      `;
    }

    return new Response("Trade updated successfully!", { status: 200 });
  } catch (error) {
    console.error("Error updating trade:", error);
    return new Response("Trade could not be updated!", { status: 500 });
  }
}
