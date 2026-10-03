import { betterAuth } from "better-auth";
import { applySetCookies, parseCookies } from "better-auth/cookies";

export const googleCookiePrefix = "ubikka_inmo_google";
export function isGoogleCookie(name: string) {
  return name.replace(/^__Secure-/, "").startsWith(`${googleCookiePrefix}.`);
}

/** No nextCookies plugin: provider tokens must never be copied to the browser. */
export function createGoogleOAuth(options: { baseURL: string; secret: string; clientId: string; clientSecret: string }) {
  return betterAuth({
    appName: "Lokation", baseURL: options.baseURL, basePath: "/api/auth",
    secret: options.secret, trustedOrigins: [new URL(options.baseURL).origin],
    socialProviders: { google: { clientId: options.clientId, clientSecret: options.clientSecret, prompt: "select_account", accessType: "online" } },
    session: { expiresIn: 300, disableSessionRefresh: true, cookieCache: { enabled: true, maxAge: 300, strategy: "jwe", refreshCache: false } },
    account: { storeStateStrategy: "cookie", storeAccountCookie: true },
    advanced: { cookiePrefix: googleCookiePrefix, defaultCookieAttributes: { path: "/api/auth" } },
  });
}

/** Complete the provider exchange in this server request, before any redirect.
 * The encrypted account/session cookies exist only in these in-memory Headers.
 * We never accept account cookies supplied by a previous browser request.
 */
export async function exchangeGoogleIdentity(auth: ReturnType<typeof createGoogleOAuth>, request: Request, baseURL: string) {
  const result = await auth.handler(request);
  if (result.status < 300 || result.status >= 400 ||
      result.headers.get("location") !== `${baseURL.replace(/\/$/, "")}/api/auth/google-complete`) {
    throw new Error("OAuth callback was not successful");
  }
  const internalHeaders = new Headers();
  applySetCookies(internalHeaders, result.headers.getSetCookie().filter(raw => isGoogleCookie(raw.slice(0, raw.indexOf("=")))));
  const token = await auth.api.getAccessToken({ headers: internalHeaders, body: { useAccountCookie: true } });
  if (!token.idToken) throw new Error("Google did not return an ID token");
  return token.idToken;
}

/** Clear only this panel's temporary OAuth cookies, including legacy chunks. */
export function expiredGoogleCookies(cookieHeader: string, secure: boolean): string[] {
  return [...parseCookies(cookieHeader).keys()].filter(isGoogleCookie).flatMap(name =>
    ["/", "/api/auth"].map(path => `${name}=; Max-Age=0; Path=${path}; HttpOnly; SameSite=Lax${secure ? "; Secure" : ""}`));
}
