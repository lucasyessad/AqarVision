import { type NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { updateSession } from "@/lib/supabase/middleware";
import { routing } from "@/lib/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

// Public route patterns (no auth required)
const PUBLIC_PATTERNS = [
  /^\/[a-z]{2}\/?$/, // / or /fr, /ar, /en, /es
  /^\/[a-z]{2}\/auth(\/|$)/, // /[locale]/auth/*
  /^\/[a-z]{2}\/search(\/|$)/, // /[locale]/search/*
  /^\/[a-z]{2}\/l(\/|$)/, // /[locale]/l/*
  /^\/[a-z]{2}\/a(\/|$)/, // /[locale]/a/*
  /^\/$/, // bare root
];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_PATTERNS.some((pattern) => pattern.test(pathname));
}

function extractLocale(pathname: string): string {
  const match = pathname.match(/^\/([a-z]{2})(\/|$)/);
  return match?.[1] ?? routing.defaultLocale;
}

export async function middleware(request: NextRequest) {
  // First, refresh the Supabase auth session
  const supabaseResponse = await updateSession(request);

  // Then, run the next-intl middleware for locale routing
  const intlResponse = intlMiddleware(request);

  // Copy Supabase auth cookies to the intl response
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value, {
      ...cookie,
    });
  });

  const { pathname } = request.nextUrl;

  // Check if route requires auth (e.g. /dashboard/*)
  if (!isPublicRoute(pathname)) {
    // Create a lightweight supabase client to check session
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {
            // No-op in middleware check
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const locale = extractLocale(pathname);
      const loginUrl = new URL(`/${locale}/auth/login`, request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return intlResponse;
}

export const config = {
  matcher: [
    // Match all pathnames except static files and API routes
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
