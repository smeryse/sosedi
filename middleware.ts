import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { isDemoMode } from "@/lib/utils";

export async function middleware(request: NextRequest) {
  // In demo mode, allow all requests to pass through
  if (isDemoMode()) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh session if expired - required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Define protected routes and their required roles
  const protectedRoutes: Record<string, string[]> = {
    "/app": ["tenant", "owner", "admin"],
    "/owner": ["owner", "admin"],
  };

  // Check if the current path matches a protected route
  const path = request.nextUrl.pathname;
  const matchedRoute = Object.keys(protectedRoutes).find((route) =>
    path.startsWith(route),
  );

  if (matchedRoute) {
    const allowedRoles = protectedRoutes[matchedRoute];

    if (!user) {
      // No user - redirect to login with return URL
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", path);
      return NextResponse.redirect(loginUrl);
    }

    // Get user roles from database
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const userRoles = roles?.map((r) => r.role) || [];
    const hasAccess = userRoles.some((role) => allowedRoles.includes(role));

    if (!hasAccess) {
      // User doesn't have required role - redirect to appropriate dashboard
      const redirectUrl = new URL(
        userRoles.includes("owner") ? "/owner" : "/app",
        request.url,
      );
      return NextResponse.redirect(redirectUrl);
    }

    // Check if profile is complete for tenant routes
    if (matchedRoute === "/app" && userRoles.includes("tenant")) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, display_name, lifestyle_answers(question_key)")
        .eq("id", user.id)
        .single();

      // Skip onboarding check for these paths
      const skipOnboardingPaths = [
        "/app/compatibility",
        "/app/profile",
        "/app/settings",
      ];
      const shouldCheckOnboarding = !skipOnboardingPaths.some((p) =>
        path.startsWith(p),
      );

      if (
        shouldCheckOnboarding &&
        profile &&
        (!profile.lifestyle_answers || profile.lifestyle_answers.length < 5)
      ) {
        // Redirect to compatibility questionnaire if not completed
        const onboardingUrl = new URL("/app/compatibility", request.url);
        return NextResponse.redirect(onboardingUrl);
      }
    }
  }

  // Auth routes - redirect authenticated users away from login/signup
  const authRoutes = ["/auth/login", "/auth/sign-up", "/auth/forgot-password"];
  if (authRoutes.some((route) => path.startsWith(route)) && user) {
    const userRoles = (
      await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
    ).data?.map((r) => r.role) || [];

    const redirectUrl = new URL(
      userRoles.includes("owner") ? "/owner" : "/app",
      request.url,
    );
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|public/|api/).*)",
  ],
};
