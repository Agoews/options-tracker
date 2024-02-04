import { sql } from "@vercel/postgres";

export async function POST(req, res) {
  const { ticker, actions, strike, openquantity, optionprice, expiration, strategy } = await req.json();

  try {
    // Insert the new trade into the database
    await sql`
      INSERT INTO OpenTrades (userid, ticker, actions, strike, openquantity, optionprice, expirationdate, strategy)
      VALUES ('1', ${ticker}, ${actions}, ${strike}, ${openquantity}, ${optionprice}, ${expiration}, ${strategy});
    `;

    return new Response("Trade submitted successfully!", { status: 200 });
  } catch (error) {
    console.error("Error submitting trade:", error);
    return new Response("Trade could not be submitted!", { status: 500 });
  }
}
