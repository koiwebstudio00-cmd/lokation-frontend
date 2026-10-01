import "server-only";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

export const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.BETTER_AUTH_SECRET && process.env.BETTER_AUTH_URL);
function createGoogleAuth() {
  if (!googleEnabled) throw new Error("El acceso con Google todavía no está configurado.");
  const baseURL = process.env.BETTER_AUTH_URL!;
  if (process.env.NODE_ENV === "production" && !baseURL.startsWith("https://")) throw new Error("BETTER_AUTH_URL debe usar HTTPS.");
  return betterAuth({
    appName: "Ubikka", baseURL, basePath: "/api/auth",
    secret: process.env.BETTER_AUTH_SECRET!, trustedOrigins: [new URL(baseURL).origin],
    // Solo verifica Google; las sesiones y permisos de Ubikka siguen en el backend.
    socialProviders: { google: { clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET!, prompt: "select_account", accessType: "online" } },
    session: { expiresIn: 300, disableSessionRefresh: true, cookieCache: { enabled: true, maxAge: 300, strategy: "jwe", refreshCache: false } },
    account: { storeStateStrategy: "cookie", storeAccountCookie: true },
    advanced: { cookiePrefix: "ubikka_inmo_google" },
    plugins: [nextCookies()],
  });
}
let instance: ReturnType<typeof createGoogleAuth> | undefined;
export function getGoogleAuth() { return instance ??= createGoogleAuth(); }
