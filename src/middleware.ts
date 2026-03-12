import acceptLanguage from "accept-language";
import { type NextRequest, NextResponse } from "next/server";
import { fallbackLng, languages } from "./i18n/settings";
import { getLanguageFromAcceptHeader, getLanguageFromCookie } from "./i18n";
import { langaugeCookieExpirationTimeMs } from "./providers/I18NextProvider/I18NextProvider";
import { shouldSkipLogging } from "./middleware/performance-logger.middleware";

acceptLanguage.languages(languages as unknown as string[]);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js).*)"],
};

const cookieName = "i18next";
const searchParamName = "lng";

const hasLanguageInHeader = (req: NextRequest) => {
  const nextUrlHeader =
    req.headers.has("next-url") && req.headers.get("next-url");

  return nextUrlHeader && nextUrlHeader.indexOf(`"lng":"`) > -1;
};

export async function middleware(req: NextRequest) {
  // Start performance tracking
  const startTime = performance.now();
  
  const response = NextResponse.next();

  if (
    req.nextUrl.pathname.indexOf("icon") > -1 ||
    req.nextUrl.pathname.indexOf("chrome") > -1
  ) {
    return NextResponse.next();
  }

  const languageInSearchParams = acceptLanguage.get(
    req.nextUrl.searchParams.get(searchParamName),
  );
  const languageInAcceptHeader = getLanguageFromAcceptHeader(req.headers);
  const languageInCookie = getLanguageFromCookie(req.cookies);
  const language =
    languageInSearchParams ||
    languageInCookie ||
    languageInAcceptHeader ||
    fallbackLng;

  if (hasLanguageInHeader(req) || !languageInCookie) {
    response.cookies.set(cookieName, language, {
      expires: new Date(Date.now() + langaugeCookieExpirationTimeMs),
    });
  }

  // Add performance logging
  if (!shouldSkipLogging(req.nextUrl.pathname)) {
    const duration = Math.round(performance.now() - startTime);

    response.headers.set('X-Response-Time', `${duration}ms`);
    
    // Log performance in development
    if (process.env.NODE_ENV === 'development') {
      let color = '\x1b[31m';

      if (duration < 100) {
        color = '\x1b[32m';
      } else if (duration < 500) {
        color = '\x1b[33m';
      }

      const reset = '\x1b[0m';

      console.log(
        `${color}[PERF]${reset} ${req.method} ${req.nextUrl.pathname} - ${duration}ms`
      );
    }
  }

  return response;
}
