import { sql } from "@vercel/postgres";

export async function PUT(req, res) {
  const {
    tradeid,
    ticker,
    strategy,
    strike,
    optionprice,
    closingprice,
    expirationdate
  } = await req.json();

  const open = closingprice != null ? false : true;

  try {
    // Update the specified trade details in the database
    await sql`
      UPDATE Trades
      SET
        ticker = ${ticker},
        strategy = ${strategy},
        strike = ${strike},
        optionprice = ${optionprice},
        closingprice = ${closingprice},
        expirationdate = ${expirationdate},
        open = ${open}
      WHERE tradeid = ${tradeid};
    `;

    return new Response("Trade updated successfully!", { status: 200 });
  } catch (error) {
    console.error("Error updating trade:", error);
    return new Response("Trade could not be updated!", { status: 500 });
  }
}
