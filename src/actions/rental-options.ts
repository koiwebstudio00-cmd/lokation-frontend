"use server";
import { apiFetch, ApiError } from "@/lib/api";
import { revalidatePath } from "next/cache";
export type RentalOption = { id: string; label: string };
export async function searchRentalOptions(kind: "property" | "propietario" | "inquilino" | "garante" | "all-properties", q: string, page: number): Promise<{ options: RentalOption[]; more: boolean; error?: string }> {
  try {
    if (kind === "property" || kind === "all-properties") {
      const result = await apiFetch<{ data: { id: string; titulo: string; direccion: string | null; administrationOnly: boolean }[]; meta: { total: number; limit: number } }>("/v1/rental-properties", { query: { q, page, scope: kind === "property" ? "eligible" : "all" } });
      return { options: result.data.map(p => ({ id: p.id, label: `${p.titulo}${p.direccion ? ` · ${p.direccion}` : ""}${p.administrationOnly ? " · Administración privada" : ""}` })), more: page * result.meta.limit < result.meta.total };
    }
    const result = await apiFetch<{ data: { id: string; nombre: string; email: string | null }[]; meta: { total: number; limit: number } }>("/v1/rental-people", { query: { ...(q ? { q: q.slice(0,100) } : {}), page, role: kind } });
    return { options: result.data.map(p => ({ id: p.id, label: `${p.nombre}${p.email ? ` · ${p.email}` : ""}` })), more: page * result.meta.limit < result.meta.total };
  } catch (error) { return { options: [], more: false, error: error instanceof ApiError ? error.message : "No pudimos cargar las opciones." }; }
}
export async function createManagedProperty(_state: { error?: string; success?: string }, form: FormData): Promise<{ error?: string; success?: string }> {
  try {
    await apiFetch("/v1/rental-properties", { method: "POST", body: { titulo: form.get("titulo"), direccion: form.get("direccion"), tipo: form.get("tipo") } });
    revalidatePath("/alquileres/propiedades");
    return { success: "Propiedad privada creada." };
  } catch (error) { return { error: error instanceof ApiError ? error.message : "No pudimos crear la propiedad." }; }
}
export async function adoptManagedProperty(_state: { error?: string; success?: string }, form: FormData): Promise<{ error?: string; success?: string }> {
  const id = String(form.get("property_id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { error: "Elegí una propiedad." };
  try {
    await apiFetch(`/v1/rental-properties/${id}/manage`, { method: "POST" });
    revalidatePath("/alquileres/propiedades");
    return { success: "Propiedad incorporada. Su publicación comercial no cambió." };
  } catch (error) { return { error: error instanceof ApiError ? error.message : "No pudimos incorporar la propiedad." }; }
}
