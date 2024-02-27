import { sql } from "@vercel/postgres";
import { NextResponse } from 'next/server'

export async function POST(req, res) {
  const { email, name } = await req.json();

  try {
    // Insert the new user into the database
    const result = await sql`
      INSERT INTO Users (Email, Name) VALUES (${email}, ${name}) RETURNING *`;

    const newUser = result.rows[0];
    return new NextResponse(JSON.stringify({ message: 'Created new user!', user: newUser }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    if (error.code === '23505') {
      return NextResponse.json({ message: 'User already exists!' }, { status: 409 })
    } else {
      console.error(error);
      return NextResponse.json({ error: 'User could not be created!' }, { status: 500 })
    }
  }
}
