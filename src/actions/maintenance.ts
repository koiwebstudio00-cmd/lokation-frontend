"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ApiError, apiFetch } from "@/lib/api";

export type MaintenanceState = { error?: string };
const uuid = z.string().uuid();

export async function createMaintenanceRequest(_previous: MaintenanceState, formData: FormData): Promise<MaintenanceState> {
  const schema = z.object({
    property_id: uuid,
    contract_id: z.union([uuid, z.literal("")]),
    title: z.string().trim().min(1).max(160),
    description: z.string().trim().min(1).max(5000),
    priority: z.enum(["baja", "normal", "alta", "urgente"]),
    note: z.string().trim().min(5, "Escribí una nota de al menos 5 caracteres.").max(2000)
  });
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  let id: string;
  try {
    const result = await apiFetch<{ item: { id: string } }>("/v1/maintenance-requests", {
      method: "POST", body: { ...parsed.data, contract_id: parsed.data.contract_id || undefined }
    });
    id = result.item.id;
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : "No pudimos crear el pedido." };
  }
  revalidatePath("/alquileres/mantenimiento");
  redirect(`/alquileres/mantenimiento/${id}`);
}

export async function transitionMaintenance(id: string, _previous: MaintenanceState,
  formData: FormData): Promise<MaintenanceState> {
  if (!uuid.safeParse(id).success) return { error: "El pedido no es válido." };
  const parsed = z.object({
    status: z.enum(["en_gestion", "resuelta", "cancelada"]),
    note: z.string().trim().min(5).max(2000)
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  try {
    await apiFetch(`/v1/maintenance-requests/${id}/transition`, { method: "POST", body: parsed.data });
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : "No pudimos cambiar el estado." };
  }
  revalidatePath("/alquileres/mantenimiento");
  revalidatePath(`/alquileres/mantenimiento/${id}`);
  return {};
}
