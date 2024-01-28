import { sql } from "@vercel/postgres";

export async function POST(req, res) {
  const { ticker, strike, optionprice, expiration, strategy } = await req.json();

  try {
    // Insert the new trade into the database
    await sql`
      INSERT INTO Trades (userid, ticker, strike, optionprice, expirationdate, strategy, open)
      VALUES ('1', ${ticker}, ${strike}, ${optionprice}, ${expiration}, ${strategy}, 'true');
    `;

    return new Response("Trade submitted successfully!", { status: 200 });
  } catch (error) {
    console.error("Error submitting trade:", error);
    return new Response("Trade could not be submitted!", { status: 500 });
  }
}