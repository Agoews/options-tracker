import { NextResponse } from "next/server";

import { createSessionCookie, clearSessionCookie, setSessionCookie } from "@/lib/auth/session";
import { assertTrustedOrigin } from "@/lib/server/request-origin";
import { mutationFailure, mutationSuccess, MutationError } from "@/lib/server/mutation-response";

export async function POST(request: Request) {
  try {
    assertTrustedOrigin(request);
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const payload = (await request.json()) as { idToken?: string };

      if (!payload.idToken) {
        throw new MutationError("Missing Firebase ID token.", { code: "missing_id_token" });
      }

      const sessionCookie = await createSessionCookie(payload.idToken);
      await setSessionCookie(sessionCookie);
      return mutationSuccess({}, { message: "Session created." });
    }

    const formData = await request.formData();

    if (formData.get("_method") === "DELETE") {
      await clearSessionCookie();
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    throw new MutationError("Unsupported payload.", { code: "unsupported_payload" });
  } catch (error) {
    return mutationFailure(error, "Unable to create session.");
  }
}

export async function DELETE(request: Request) {
  assertTrustedOrigin(request);
  await clearSessionCookie();
  return mutationSuccess({}, { message: "Session cleared." });
}
