import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // const { updatedStartingFunds } = await req.json();
  const url = new URL(req.url);
  const userEmail = url.searchParams.get("email");

  try {
    if (!userEmail) {
      return NextResponse.json(
        { error: "userEmail is required" },
        { status: 400 }
      );
    }

    const result = await sql`
      SELECT
        Funds
      FROM
        Users
      WHERE
       Email = ${userEmail};
    `;

    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
