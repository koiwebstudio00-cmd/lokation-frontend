import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getGoogleAuth, googleEnabled } from "@/lib/google-auth";
import { loginRequest } from "@/lib/login-flow";
export async function GET(request: Request) {
  let destination = "/login?google=error";
  if (googleEnabled) {
    const auth = getGoogleAuth();
    const requestHeaders = await headers();
    try {
      const token = await auth.api.getAccessToken({ headers: requestHeaders, body: { useAccountCookie: true } });
      if (!token.idToken) throw new Error("Google no devolvió identidad verificada.");
      destination = await loginRequest("/v1/auth/google", { idToken: token.idToken });
    } catch { /* El login muestra un mensaje seguro, sin tokens ni datos del proveedor. */ }
    finally { await auth.api.signOut({ headers: requestHeaders }).catch(() => undefined); }
  }
  const response = NextResponse.redirect(new URL(destination, process.env.BETTER_AUTH_URL ?? request.url));
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
