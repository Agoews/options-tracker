import { sql } from "@vercel/postgres";
import { NextResponse } from 'next/server';

export async function POST(req) {
  const body = await req.json();
  // console.log('req.json: ', body);
  const { email } = body;
  // console.log('email: ', email);
  try {
    console.log('email: ', email)
    // Select the user ID from the database where the email matches
    const result = await sql`
      SELECT UserId FROM Users WHERE Email = ${email} LIMIT 1`;
    const user = result.rows[0];
    console.log('user: ', user)
    if (user) {
      return new NextResponse(JSON.stringify({ message: 'User exists!', userId: user.userid }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } else {
      return new NextResponse(JSON.stringify({ message: 'User not found!' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  } catch (error) {
    console.error(error);
    return new NextResponse(JSON.stringify({ error: 'Server error on checking user!' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
