import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE } from "@/lib/messages/types";
import {
  contentLanguage,
  isLocale,
  isLocaleExemptPath,
  isLikelyBot,
  isPrefixedLocale,
  localizedPath,
  LOCALE_HEADER,
  preferredLocaleFromAcceptLanguage,
} from "@/lib/i18n/routing";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isLocaleExemptPath(pathname)) {
    return NextResponse.next();
  }

  const first = pathname.split("/")[1];

  // After a locale rewrite Next may re-invoke middleware on the bare path.
  // Keep the locale already stamped on the request — do not reset to English.
  const locked = request.headers.get(LOCALE_HEADER);
  if (
    !isPrefixedLocale(first) &&
    first !== "en" &&
    isPrefixedLocale(locked)
  ) {
    const response = NextResponse.next();
    response.headers.set("Content-Language", contentLanguage(locked));
    return response;
  }

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
    // Caddy terminates TLS; Next listens on HTTP. Keep internal rewrites on http.
    url.protocol = "http:";

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

  // Unprefixed: English for crawlers. Visitors keep explicit cookie choice,
  // otherwise use the browser's first supported language.
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  const accept = request.headers.get("accept") ?? "";
  const wantsHtml = accept.includes("text/html");
  const isBot = isLikelyBot(request.headers.get("user-agent"));
  if (
    request.method === "GET" &&
    wantsHtml &&
    isPrefixedLocale(cookieLocale) &&
    !isBot
  ) {
    const url = request.nextUrl.clone();
    url.pathname = localizedPath(cookieLocale, pathname);
    return NextResponse.redirect(url, 307);
  }

  if (request.method === "GET" && wantsHtml && !isLocale(cookieLocale) && !isBot) {
    const preferredLocale = preferredLocaleFromAcceptLanguage(
      request.headers.get("accept-language"),
    );
    if (isPrefixedLocale(preferredLocale)) {
      const url = request.nextUrl.clone();
      url.pathname = localizedPath(preferredLocale, pathname);
      const response = NextResponse.redirect(url, 307);
      response.cookies.set(LOCALE_COOKIE, preferredLocale, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });
      return response;
    }
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
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
