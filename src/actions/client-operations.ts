"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { ApiError, apiFetch } from "@/lib/api";
type State = { error?: string; success?: string };
export async function changeClientOperation(personId: string, leadId: string, unlink: boolean, _state: State): Promise<State> {
  void _state;
  if (!z.uuid().safeParse(personId).success || !z.uuid().safeParse(leadId).success) return { error: "Vínculo inválido." };
  try {
    await apiFetch(`/v1/clients/${personId}/operations${unlink ? `/${leadId}` : ""}`, { method: unlink ? "DELETE" : "POST", ...(unlink ? {} : { body: { lead_id: leadId } }) });
    revalidatePath(`/clientes/${personId}`);
    revalidatePath(`/consultas/${leadId}`);
    return { success: unlink ? "Vínculo retirado. La operación se conserva." : "Operación vinculada." };
  } catch (error) { return { error: error instanceof ApiError ? error.message : "No pudimos actualizar el vínculo." }; }
}
