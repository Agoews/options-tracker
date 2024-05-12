import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  try {
    const currentstockholdingsid = await request.json();

    console.log("current holding id in try block: ", currentstockholdingsid);
    const result =
      await sql`DELETE FROM currentstockholdings WHERE currentstockholdingsid = ${currentstockholdingsid}`;

    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
