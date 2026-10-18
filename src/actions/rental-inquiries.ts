"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ApiError, apiFetch } from "@/lib/api";

type State = { error?: string; success?: string };
export async function answerRentalInquiry(id: string, _state: State, form: FormData): Promise<State> {
  if (!z.uuid().safeParse(id).success) return { error: "Consulta inválida." };
  const parsed = z.object({ status: z.enum(["en_gestion", "resuelta"]),
    response: z.string().trim().min(5).max(5000) }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  try {
    await apiFetch(`/v1/rental-inquiries/${id}/respond`, { method: "POST", body: parsed.data });
    revalidatePath("/alquileres/consultas");
    return { success: "Respuesta registrada." };
  } catch (error) { return { error: error instanceof ApiError ? error.message : "No pudimos responder." }; }
}
