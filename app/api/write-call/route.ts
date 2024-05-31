// update current holding table
// update opentrades table

import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    return NextResponse.json(
      { message: "Stock holding updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
