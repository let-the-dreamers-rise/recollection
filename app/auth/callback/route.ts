import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/app";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/app";
  const response = NextResponse.redirect(new URL(safeNext, requestUrl.origin));
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || !code) return NextResponse.redirect(new URL("/login?error=invalid-link", requestUrl.origin));
  const supabase = createServerClient(url, key, { cookies: { getAll: () => cookieStore.getAll(), setAll: (values: { name: string; value: string; options?: Record<string, unknown> }[]) => values.forEach(({ name, value, options }) => response.cookies.set(name, value, options as never)) } });
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  return error ? NextResponse.redirect(new URL("/login?error=expired-link", requestUrl.origin)) : response;
}
