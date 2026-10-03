import { NextResponse } from "next/server";
import { expiredGoogleCookies } from "@/lib/google-oauth";
// Legacy in-flight attempts must restart. New callbacks finish server-side.
export async function GET(request: Request) {
  const baseURL = process.env.BETTER_AUTH_URL ?? new URL(request.url).origin;
  const response = NextResponse.redirect(new URL("/login?google=error", baseURL));
  for (const cookie of expiredGoogleCookies(request.headers.get("cookie") ?? "", baseURL.startsWith("https:"))) response.headers.append("Set-Cookie", cookie);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
