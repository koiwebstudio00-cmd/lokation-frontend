import "server-only";
import { cookies } from "next/headers";
import { persistLoginResponse } from "@/lib/api";

export const pendingCookie = "ubikka_inmo_google_pending_2fa";
export async function loginRequest(path: "/v1/auth/login/start" | "/v1/auth/login/verify" | "/v1/auth/google", body: Record<string, unknown>) {
  const response = await fetch(`${(process.env.API_URL ?? "http://localhost:3001").replace(/\/$/, "")}${path}`, { method: "POST", cache: "no-store", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, panel: "dashboard" }) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message ?? "No se pudo iniciar sesión.");
  const store = await cookies();
  if (data.twoFactorRequired === true && typeof data.challenge === "string") {
    store.set(pendingCookie, data.challenge, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 300 });
    return "/login/verificar";
  }
  if (!data.user || (data.user.rol === "super_admin") !== false) throw new Error("Esta cuenta no tiene acceso a este panel.");
  await persistLoginResponse(response);
  store.delete(pendingCookie);
  return "/";
}
