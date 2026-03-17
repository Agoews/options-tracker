import { NextResponse } from "next/server";

import { createSessionCookie, clearSessionCookie, setSessionCookie } from "@/lib/auth/session";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const payload = (await request.json()) as { idToken?: string };

    if (!payload.idToken) {
      return NextResponse.json({ error: "Missing Firebase ID token." }, { status: 400 });
    }

    const sessionCookie = await createSessionCookie(payload.idToken);
    await setSessionCookie(sessionCookie);
    return NextResponse.json({ ok: true });
  }

  const formData = await request.formData();

  if (formData.get("_method") === "DELETE") {
    await clearSessionCookie();
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.json({ error: "Unsupported payload." }, { status: 400 });
}

export async function DELETE() {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
