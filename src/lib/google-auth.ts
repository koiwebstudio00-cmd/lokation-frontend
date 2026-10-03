import "server-only";
import { createGoogleOAuth } from "./google-oauth";
export const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.BETTER_AUTH_SECRET && process.env.BETTER_AUTH_URL);
function createGoogleAuth() {
  if (!googleEnabled) throw new Error("El acceso con Google todavía no está configurado.");
  const baseURL = process.env.BETTER_AUTH_URL!.replace(/\/$/, "");
  if (process.env.NODE_ENV === "production" && !baseURL.startsWith("https://")) throw new Error("BETTER_AUTH_URL debe usar HTTPS.");
  return createGoogleOAuth({ baseURL, secret: process.env.BETTER_AUTH_SECRET!,
    clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! });
}
let instance: ReturnType<typeof createGoogleAuth> | undefined;
export function getGoogleAuth() { return instance ??= createGoogleAuth(); }
