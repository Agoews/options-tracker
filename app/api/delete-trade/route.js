import { sql } from "@vercel/postgres";

export async function DELETE(req, res) {
  const { tradeid } = await req.json();

  try {
    await sql`
      DELETE FROM OpenTrades WHERE TradeID = ${tradeid}`;

    return new Response("Trade deleted successfully!", { status: 200 });
  } catch (error) {
    console.error("Error deleting trade:", error);
    return new Response("Trade could not be deleted!", { status: 500 });
  }
}
