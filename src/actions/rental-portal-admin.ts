"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ApiError, apiFetch } from "@/lib/api";

type State = { error?: string; success?: string; devUrl?: string };
export async function inviteRentalPerson(id: string, _state: State): Promise<State> {
  void _state;
  if (!z.uuid().safeParse(id).success) return { error: "Persona inválida." };
  try {
    const result = await apiFetch<{ sent: boolean; dev_accept_url?: string }>(`/v1/rental-people/${id}/portal-invite`, {
      method: "POST", body: {}
    });
    revalidatePath(`/alquileres/personas/${id}`);
    revalidatePath(`/clientes/${id}`);
    return { success: result.sent ? "Invitación enviada." : "Invitación preparada para desarrollo local.",
      devUrl: result.dev_accept_url };
  } catch (error) { return { error: error instanceof ApiError ? error.message : "No pudimos invitar a esta persona." }; }
}

export async function revokeRentalPerson(id: string, _state: State): Promise<State> {
  void _state;
  if (!z.uuid().safeParse(id).success) return { error: "Persona inválida." };
  try {
    await apiFetch(`/v1/rental-people/${id}/portal-access`, { method: "DELETE" });
    revalidatePath(`/alquileres/personas/${id}`);
    revalidatePath(`/clientes/${id}`);
    return { success: "Acceso revocado." };
  } catch (error) { return { error: error instanceof ApiError ? error.message : "No pudimos revocar el acceso." }; }
}
