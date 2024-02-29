import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  const { updatedStartingFunds } = await req.json();
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
      UPDATE Users
      SET Funds = ${updatedStartingFunds}
      WHERE Email = ${userEmail};
    `;

    return NextResponse.json(
      { message: "Starting funds updated!" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
