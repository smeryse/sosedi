import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./database.types";

const FALLBACK_SUPABASE_URL = "https://xyzxxxxxxxxxxxxxxxxx.supabase.co";
const FALLBACK_SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5enh4eHh4eHh4eHh4eHh4eHgiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoyMDAwMDAwMDAwfQ.placeholder";

function getValidConfig() {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const url =
    envUrl && envUrl.trim().length > 10 && envUrl.startsWith("http")
      ? envUrl.trim()
      : FALLBACK_SUPABASE_URL;

  const key = envKey && envKey.trim().length > 20 ? envKey.trim() : FALLBACK_SUPABASE_KEY;

  return { url, key };
}

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request });
  const { url, key } = getValidConfig();

  const supabase = createServerClient<Database>(
    url,
    key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let user = null;
  try {
    const { data } = await supabase.auth.getClaims();
    user = data?.claims;
  } catch {
    // If Supabase credentials are unavailable or fallback is active, pass session silently
  }

  const publicPath = ["/", "/about", "/safety", "/owners", "/faq", "/auth"];
  const isPublic = publicPath.some(
    (path) =>
      request.nextUrl.pathname === path ||
      request.nextUrl.pathname.startsWith(`${path}/`)
  );

  if (!isPublic && !user && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth/login";
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}