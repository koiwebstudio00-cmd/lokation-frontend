"use server";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { loginRequest, pendingCookie } from "@/lib/login-flow";
import { parseSetCookieHeader, toCookieOptions } from "better-auth/cookies";
import { isGoogleCookie } from "@/lib/google-oauth";
import { getGoogleAuth } from "@/lib/google-auth";

export type LoginState = { error?: string };
export async function passwordSignIn(_state: LoginState, form: FormData): Promise<LoginState> {
  let destination: string;
  try {
    (await cookies()).delete(pendingCookie);
    destination = await loginRequest("/v1/auth/login/start", { email: String(form.get("email") ?? "").trim(), password: String(form.get("password") ?? "") });
  } catch (error) { return { error: error instanceof Error ? error.message : "No se pudo conectar." }; }
  redirect(destination);
}
export async function verifySignIn(_state: LoginState, form: FormData): Promise<LoginState> {
  let destination: string;
  try {
    const challenge = (await cookies()).get(pendingCookie)?.value;
    if (!challenge) return { error: "El acceso venció. Volvé a ingresar con tu contraseña." };
    destination = await loginRequest("/v1/auth/login/verify", { challenge, otp: String(form.get("otp") ?? "").trim() });
  } catch (error) { return { error: error instanceof Error ? error.message : "No se pudo verificar." }; }
  redirect(destination);
}
export async function cancelSignIn() {
  (await cookies()).delete(pendingCookie);
  redirect("/login");
}
export async function googleSignIn(_state: LoginState): Promise<LoginState> {
  void _state;
  let destination: string;
  try {
    (await cookies()).delete(pendingCookie);
    const auth = getGoogleAuth();
    const response = await auth.api.signInSocial({ asResponse: true, headers: await headers(), body: { provider: "google", callbackURL: `${process.env.BETTER_AUTH_URL}/api/auth/google-complete`, errorCallbackURL: `${process.env.BETTER_AUTH_URL}/login?google=error`, disableRedirect: true } });
    if (!response.ok) throw new Error("No se pudo iniciar OAuth.");
    const result = await response.json() as { url?: string };
    const store = await cookies();
    // Only state cookies are created at this stage; account/session cookies stay server-side.
    for (const raw of response.headers.getSetCookie()) {
      for (const [name, value] of parseSetCookieHeader(raw)) {
        if (isGoogleCookie(name)) store.set(name, value.value, toCookieOptions(value));
      }
    }
    if (!result.url) throw new Error("Google no devolvió un enlace de acceso.");
    destination = result.url;
  } catch { return { error: "No se pudo iniciar el acceso con Google. Probá de nuevo." }; }
  redirect(destination);
}
