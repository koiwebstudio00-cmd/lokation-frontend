"use server";

import { revalidatePath } from "next/cache";
import { clientRoles } from "@/lib/clients";
import { z } from "zod";
import { ApiError, apiFetch } from "@/lib/api";

export type RentalPersonState = { error?: string; success?: string };

const schema = z.object({
  nombre: z.string().trim().min(1, "Ingresá un nombre.").max(200),
  email: z.union([z.literal(""), z.string().trim().email("Email inválido.").max(320)]),
  telefono: z.string().trim().max(50),
  roles: z.array(z.enum(clientRoles))
    .min(1, "Elegí al menos un rol.")
});

export async function saveRentalPerson(id: string | null, _previous: RentalPersonState, formData: FormData): Promise<RentalPersonState> {
  const parsed = schema.safeParse({
    nombre: formData.get("nombre"), email: formData.get("email"),
    telefono: formData.get("telefono"), roles: formData.getAll("roles")
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (id && !z.string().uuid().safeParse(id).success) return { error: "La persona no es válida." };
  try {
    await apiFetch(id ? `/v1/clients/${id}` : "/v1/clients", {
      method: id ? "PATCH" : "POST", body: parsed.data
    });
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : "No pudimos guardar la persona." };
  }
  revalidatePath("/clientes");
  if (id) revalidatePath(`/clientes/${id}`);
  revalidatePath("/alquileres/personas");
  if (id) revalidatePath(`/alquileres/personas/${id}`);
  return { success: id ? "Datos actualizados." : "Cliente agregado." };
}
