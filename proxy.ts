import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const APEX_DOMAIN = "optiontradetracker.com";
const WWW_DOMAIN = "www.optiontradetracker.com";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0];

  if (host === APEX_DOMAIN) {
    const url = request.nextUrl.clone();
    url.host = WWW_DOMAIN;
    url.protocol = "https";
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
