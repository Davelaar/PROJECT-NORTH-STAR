import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE } from "@/lib/messages/types";
import {
  contentLanguage,
  isLocaleExemptPath,
  isLikelyBot,
  isPrefixedLocale,
  localizedPath,
  LOCALE_HEADER,
} from "@/lib/i18n/routing";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isLocaleExemptPath(pathname)) {
    return NextResponse.next();
  }

  const first = pathname.split("/")[1];

  // Canonicalize /en/... → unprefixed English URLs
  if (first === "en") {
    const rest =
      pathname === "/en" || pathname === "/en/"
        ? "/"
        : pathname.replace(/^\/en/, "") || "/";
    const url = request.nextUrl.clone();
    url.pathname = rest;
    return NextResponse.redirect(url, 308);
  }

  if (isPrefixedLocale(first)) {
    const rest =
      pathname === `/${first}` || pathname === `/${first}/`
        ? "/"
        : pathname.slice(first.length + 1) || "/";
    const url = request.nextUrl.clone();
    url.pathname = rest;

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(LOCALE_HEADER, first);

    const response = NextResponse.rewrite(url, {
      request: { headers: requestHeaders },
    });
    response.cookies.set(LOCALE_COOKIE, first, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    response.headers.set("Content-Language", contentLanguage(first));
    return response;
  }

  // Unprefixed: English for crawlers. Cookie users (non-bot) → prefixed URL.
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  const accept = request.headers.get("accept") ?? "";
  const wantsHtml = accept.includes("text/html");
  if (
    request.method === "GET" &&
    wantsHtml &&
    isPrefixedLocale(cookieLocale) &&
    !isLikelyBot(request.headers.get("user-agent"))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = localizedPath(cookieLocale, pathname);
    return NextResponse.redirect(url, 307);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(LOCALE_HEADER, "en");
  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("Content-Language", "en");
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except static Next internals already filtered in-code.
     * Keep matcher broad; exemptions are handled in middleware.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
