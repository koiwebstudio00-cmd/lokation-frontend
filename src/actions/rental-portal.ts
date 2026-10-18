"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ApiError } from "@/lib/api";
import { API_URL } from "@/lib/session-cookies";
import { PORTAL_COOKIE, portalRequest } from "@/lib/rental-portal";

export type PortalState = { error?: string; success?: string; devUrl?: string };
const slugSchema = z.string().regex(/^[a-z0-9][a-z0-9-]{1,48}$/);
const uuid = z.string().uuid();
function message(error: unknown) { return error instanceof ApiError ? error.message : "No pudimos completar la operación."; }

export async function portalLogin(slug: string, _state: PortalState, form: FormData): Promise<PortalState> {
  if (!slugSchema.safeParse(slug).success) return { error: "Portal inválido." };
  const parsed = z.object({ email: z.email(), password: z.string().min(1) }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Ingresá correo y contraseña." };
  let token: string;
  try { ({ token } = await portalRequest<{ token: string }>(slug, "/login", { method: "POST", body: parsed.data })); }
  catch (error) { return { error: message(error) }; }
  (await cookies()).set(PORTAL_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production",
    sameSite: "lax", path: "/portal", maxAge: 7 * 24 * 60 * 60 });
  redirect(`/portal/${slug}`);
}

export async function portalAccept(slug: string, token: string, _state: PortalState, form: FormData): Promise<PortalState> {
  if (!slugSchema.safeParse(slug).success || !/^[a-f0-9]{64}$/.test(token)) return { error: "Invitación inválida." };
  const parsed = z.object({ password: z.string().min(10).max(200) }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Usá una contraseña de al menos 10 caracteres." };
  try {
    const response = await fetch(`${API_URL}/v1/portal/invitations/accept`, { method: "POST",
      headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, slug, ...parsed.data }), cache: "no-store" });
    const result = await response.json() as { slug?: string; error?: { message?: string } };
    if (!response.ok) return { error: result.error?.message ?? "No pudimos activar el acceso." };
    if (result.slug !== slug) return { error: "La invitación pertenece a otra inmobiliaria." };
  } catch { return { error: "No pudimos activar el acceso." }; }
  redirect(`/portal/${slug}/ingresar?activado=1`);
}

export async function portalLogout(slug: string) {
  if (!slugSchema.safeParse(slug).success) return;
  try { await portalRequest(slug, "/logout", { method: "POST", authenticated: true }); }
  catch { /* La sesión local se cierra igual si la API no responde. */ }
  (await cookies()).set(PORTAL_COOKIE, "", { path: "/portal", maxAge: 0, httpOnly: true,
    secure: process.env.NODE_ENV === "production", sameSite: "lax" });
  redirect(`/portal/${slug}/ingresar`);
}

export async function portalInquiry(slug: string, contractId: string,
  _state: PortalState, form: FormData): Promise<PortalState> {
  if (!slugSchema.safeParse(slug).success || !uuid.safeParse(contractId).success) return { error: "Contrato inválido." };
  const parsed = z.object({ category: z.enum(["consulta", "reclamo"]), title: z.string().trim().min(5).max(160),
    description: z.string().trim().min(10).max(5000) }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  try { await portalRequest(slug, `/contracts/${contractId}/inquiries`, {
    method: "POST", body: parsed.data, authenticated: true }); }
  catch (error) { return { error: message(error) }; }
  revalidatePath(`/portal/${slug}/contratos/${contractId}`);
  return { success: "Recibimos tu consulta. Podés seguir el estado acá." };
}

export async function portalForgotPassword(slug: string, _state: PortalState, form: FormData): Promise<PortalState> {
  if (!slugSchema.safeParse(slug).success) return { error: "Portal inválido." };
  const parsed = z.object({ email: z.email() }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Ingresá un correo válido." };
  try {
    const result = await portalRequest<{ dev_reset_url?: string }>(slug, "/forgot-password", {
      method: "POST", body: parsed.data });
    return { success: "Si la cuenta existe, vas a recibir un enlace para restablecer el acceso.",
      devUrl: result.dev_reset_url };
  } catch (error) { return { error: message(error) }; }
}

export async function portalResetPassword(slug: string, token: string,
  _state: PortalState, form: FormData): Promise<PortalState> {
  if (!slugSchema.safeParse(slug).success || !/^[a-f0-9]{64}$/.test(token)) return { error: "Enlace inválido." };
  const parsed = z.object({ password: z.string().min(10).max(200) }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Usá una contraseña de al menos 10 caracteres." };
  try { await portalRequest(slug, "/reset-password", { method: "POST", body: { token, ...parsed.data } }); }
  catch (error) { return { error: message(error) }; }
  (await cookies()).set(PORTAL_COOKIE, "", { path: "/portal", maxAge: 0, httpOnly: true,
    secure: process.env.NODE_ENV === "production", sameSite: "lax" });
  redirect(`/portal/${slug}/ingresar?clave=actualizada`);
}
