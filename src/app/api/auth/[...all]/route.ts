import { NextResponse } from "next/server";
import { getGoogleAuth, googleEnabled } from "@/lib/google-auth";
import { exchangeGoogleIdentity, expiredGoogleCookies } from "@/lib/google-oauth";
import { loginRequest } from "@/lib/login-flow";
export async function GET(request: Request) {
  if (!googleEnabled || new URL(request.url).pathname !== "/api/auth/callback/google") return new Response(null, { status: 404 });
  const baseURL = process.env.BETTER_AUTH_URL!.replace(/\/$/, "");
  let destination = "/login?google=error";
  try {
    const idToken = await exchangeGoogleIdentity(getGoogleAuth(), request, baseURL);
    // Lokation validates Google's signature, active account, panel permissions and 2FA.
    destination = await loginRequest("/v1/auth/google", { idToken });
  } catch { /* Do not log provider tokens, authorization codes or account data. */ }
  const response = NextResponse.redirect(new URL(destination, baseURL));
  for (const cookie of expiredGoogleCookies(request.headers.get("cookie") ?? "", baseURL.startsWith("https:"))) response.headers.append("Set-Cookie", cookie);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
