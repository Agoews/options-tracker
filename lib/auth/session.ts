import "server-only";

import { cookies } from "next/headers";

import { getAdminAuth } from "@/lib/auth/firebase-admin";
import { getServerEnv } from "@/lib/auth/runtime-env";

export async function createSessionCookie(idToken: string) {
  const env = getServerEnv();
  const expiresIn = env.SESSION_COOKIE_EXPIRES_DAYS * 24 * 60 * 60 * 1000;

  return getAdminAuth().createSessionCookie(idToken, { expiresIn });
}

export async function setSessionCookie(value: string) {
  const env = getServerEnv();
  const cookieStore = await cookies();

  cookieStore.set(env.SESSION_COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: env.SESSION_COOKIE_EXPIRES_DAYS * 24 * 60 * 60,
  });
}

export async function clearSessionCookie() {
  const env = getServerEnv();
  const cookieStore = await cookies();
  cookieStore.delete(env.SESSION_COOKIE_NAME);
}

export async function getSessionClaims() {
  const env = getServerEnv();
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(env.SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    return await getAdminAuth().verifySessionCookie(sessionCookie, true);
  } catch {
    return null;
  }
}
