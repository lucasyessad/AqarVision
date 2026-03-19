import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { routing } from "@/lib/i18n/routing";

const PUBLIC_ROUTES = [
  "/",
  "/auth/login",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/search",
  "/annonce/:path*",
  "/a/:path*",
  "/agences",
  "/estimer",
  "/vendre",
  "/pro",
  "/chaab",
  "/pricing",
  "/deposer",
  "/invite/:path*",
];

function isPublicRoute(pathname: string): boolean {
  const withoutLocale = pathname.replace(/^\/(fr|ar|en|es)/, "") || "/";
  return PUBLIC_ROUTES.some((route) => {
    if (route.includes(":path*")) {
      const base = route.replace("/:path*", "");
      return withoutLocale.startsWith(base);
    }
    return withoutLocale === route;
  });
}

function extractAgencySubdomain(hostname: string): string | null {
  const baseDomain = "aqarvision.com";
  if (!hostname.endsWith(baseDomain)) return null;
  const subdomain = hostname.replace(`.${baseDomain}`, "");
  if (subdomain === hostname || subdomain === "www") return null;
  return subdomain;
}

const intlMiddleware = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  // i18n routing
  const response = intlMiddleware(request);

  // Supabase session refresh
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: Record<string, unknown> }>) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options as Record<string, unknown>);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Agency subdomain context
  const hostname = request.headers.get("host") ?? "";
  const agencySlug = extractAgencySubdomain(hostname);
  if (agencySlug) {
    response.headers.set("x-agency-slug", agencySlug);
  }

  // Auth guard for protected routes
  const pathname = request.nextUrl.pathname;
  if (!user && !isPublicRoute(pathname)) {
    const locale = pathname.split("/")[1] ?? "fr";
    const loginUrl = new URL(`/${locale}/auth/login`, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self)"
  );

  return response;
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|.*\\..*).*)"],
};
