import "server-only";

import { MutationError } from "@/lib/server/mutation-response";

function normalizeOrigin(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin.toLowerCase();
  } catch {
    return null;
  }
}

function getExpectedOrigins(request: Request) {
  const expected = new Set<string>();
  const requestOrigin = normalizeOrigin(request.url);

  if (requestOrigin) {
    expected.add(requestOrigin);
  }

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const protocol =
    request.headers.get("x-forwarded-proto") ??
    (requestOrigin ? new URL(requestOrigin).protocol.replace(":", "") : "https");

  if (host) {
    expected.add(`${protocol}://${host}`.toLowerCase());
  }

  const appOrigin = normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL ?? null);
  if (appOrigin) {
    expected.add(appOrigin);
  }

  return expected;
}

export function assertTrustedOrigin(request: Request) {
  const origin = normalizeOrigin(request.headers.get("origin"));

  if (!origin) {
    return;
  }

  if (!getExpectedOrigins(request).has(origin)) {
    throw new MutationError("Cross-origin mutation rejected.", {
      code: "untrusted_origin",
      status: 403,
    });
  }
}
