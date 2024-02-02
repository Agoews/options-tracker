import { sql } from "@vercel/postgres";

export async function PUT(req, res) {
  const {
    tradeid,
    ticker,
    strategy,
    strike,
    totalquantity,
    optionprice,
    closingprice,
    expirationdate,
    completiondate
  } = await req.json();

  const open = closingprice != null ? false : true;

  try {
    // Update the specified trade details in the database
    await sql`
      UPDATE OpenTrades
      SET
        ticker = ${ticker},
        strategy = ${strategy},
        strike = ${strike},
        totalquantity = ${totalquantity},
        optionprice = ${optionprice},
        closingprice = ${closingprice},
        expirationdate = ${expirationdate},
        open = ${open},
        completiondate = CASE WHEN ${closingprice}::text IS NOT NULL THEN CURRENT_TIMESTAMP ELSE completiondate END
      WHERE tradeid = ${tradeid};
    `;

    return new Response("Trade updated successfully!", { status: 200 });
  } catch (error) {
    console.error("Error updating trade:", error);
    return new Response("Trade could not be updated!", { status: 500 });
  }
}
