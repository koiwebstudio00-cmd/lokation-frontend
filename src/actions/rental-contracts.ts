"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ApiError, apiFetch } from "@/lib/api";

export type ContractFormState = { error?: string };

const formSchema = z.object({
  property_id: z.string().uuid("Elegí una propiedad."),
  owner_person_id: z.string().uuid("Elegí un propietario."),
  tenant_person_id: z.string().uuid("Elegí un inquilino."),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ingresá la fecha de inicio."),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ingresá la fecha de fin."),
  monthly_rent: z.string().regex(/^\d{1,12}(\.\d{1,2})?$/, "Ingresá un importe válido."),
  currency: z.enum(["ARS", "USD"]),
  due_day: z.coerce.number().int().min(1).max(28)
}).refine((input) => input.end_date > input.start_date, {
  message: "La fecha de fin debe ser posterior al inicio."
}).refine((input) => input.owner_person_id !== input.tenant_person_id, {
  message: "Propietario e inquilino deben ser personas distintas."
});

export async function createRentalContract(_previous: ContractFormState, formData: FormData): Promise<ContractFormState> {
  const parsed = formSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  let id: string;
  try {
    const result = await apiFetch<{ contract: { id: string } }>("/v1/rental-contracts", {
      method: "POST", body: parsed.data
    });
    id = result.contract.id;
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : "No pudimos crear el borrador." };
  }
  revalidatePath("/alquileres/contratos");
  redirect(`/alquileres/contratos/${id}`);
}

export async function updateRentalContract(id: string, _previous: ContractFormState, formData: FormData): Promise<ContractFormState> {
  if (!z.string().uuid().safeParse(id).success) return { error: "El contrato no es válido." };
  const parsed = formSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  try {
    await apiFetch(`/v1/rental-contracts/${id}`, { method: "PATCH", body: parsed.data });
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : "No pudimos actualizar el borrador." };
  }
  revalidatePath("/alquileres/contratos");
  revalidatePath(`/alquileres/contratos/${id}`);
  redirect(`/alquileres/contratos/${id}`);
}

export async function transitionRentalContract(id: string, transition: "activate" | "finish",
  _previous: ContractFormState, formData: FormData): Promise<ContractFormState> {
  if (!z.string().uuid().safeParse(id).success) return { error: "El contrato no es válido." };
  const note = z.string().trim().min(5, "Escribí una nota de al menos 5 caracteres.").max(1000)
    .safeParse(formData.get("note"));
  if (!note.success) return { error: note.error.issues[0].message };
  try {
    await apiFetch(`/v1/rental-contracts/${id}/${transition}`, { method: "POST", body: { note: note.data } });
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : "No pudimos cambiar el estado del contrato." };
  }
  revalidatePath("/alquileres/contratos");
  revalidatePath(`/alquileres/contratos/${id}`);
  return {};
}
