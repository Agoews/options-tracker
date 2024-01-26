import { sql } from "@vercel/postgres";

export async function updateTrade(req, res) {
  const { tradeid, closingprice } = await req.json();

  try {
    // Update the closing price of the specified trade in the database
    await sql`
      UPDATE Trades
      SET closingprice = ${closingprice}, open = 'false'
      WHERE tradeid = ${tradeid};
    `;

    return new Response("Trade updated successfully!", { status: 200 });
  } catch (error) {
    console.error("Error updating trade:", error);
    return new Response("Trade could not be updated!", { status: 500 });
  }
}