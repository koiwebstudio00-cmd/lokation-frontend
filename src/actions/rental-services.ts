"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ApiError, apiFetch } from "@/lib/api";

export type ServiceState = { error?: string; success?: boolean };
const uuid = z.string().uuid();
const schema = z.object({
  type: z.enum(["luz", "gas", "agua", "internet", "otro"]),
  provider: z.string().trim().min(1, "Ingresá el prestador.").max(120),
  account_number: z.string().trim().max(100),
  meter_number: z.string().trim().max(100),
  holder_name: z.string().trim().max(200),
  visibility: z.enum(["interna", "inquilino", "propietario", "ambos"])
}).refine((data) => !!data.account_number || !!data.meter_number, {
  message: "Ingresá un número de cuenta o medidor."
});

export async function createRentalService(propertyId: string, contractId: string,
  _previous: ServiceState, formData: FormData): Promise<ServiceState> {
  if (!uuid.safeParse(propertyId).success || !uuid.safeParse(contractId).success) return { error: "La propiedad no es válida." };
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  try {
    await apiFetch(`/v1/rental-properties/${propertyId}/services`, { method: "POST", body: parsed.data });
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : "No pudimos guardar el servicio." };
  }
  revalidatePath(`/alquileres/contratos/${contractId}`);
  return { success: true };
}

export async function deactivateRentalService(propertyId: string, contractId: string, id: string,
  previous: ServiceState): Promise<ServiceState> {
  void previous;
  if (![propertyId, contractId, id].every((value) => uuid.safeParse(value).success)) return { error: "El servicio no es válido." };
  try {
    await apiFetch(`/v1/rental-properties/${propertyId}/services/${id}/deactivate`, { method: "POST" });
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : "No pudimos desactivar el servicio." };
  }
  revalidatePath(`/alquileres/contratos/${contractId}`);
  return { success: true };
}
