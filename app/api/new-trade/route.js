import { sql } from "@vercel/postgres";

export async function POST(req, res) {
  const { userEmail, ticker, actions, strike, currentprice, openquantity, optionprice, expiration, strategy, isClosed } = await req.json();

  try {
    // Insert the new trade into the database
    await sql`
      INSERT INTO OpenTrades (
        email, ticker, actions, strike, currentprice, openquantity, optionprice, expirationdate, strategy, isClosed
      )
      VALUES (
        ${userEmail}, ${ticker}, ${actions}, ${strike}, ${currentprice}, ${openquantity}, ${optionprice}, ${expiration}, ${strategy}, 'FALSE'
      );
    `;

    return new Response("Trade submitted successfully!", { status: 200 });
  } catch (error) {
    console.error("Error submitting trade:", error);
    return new Response("Trade could not be submitted!", { status: 500 });
  }
}
