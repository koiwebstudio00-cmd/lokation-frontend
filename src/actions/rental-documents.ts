"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ApiError, apiFetch } from "@/lib/api";

type State = { error?: string; success?: string };
const uuid = z.uuid();
export async function prepareDocumentUpload(metadata: { folderId?: string; mode: "vault" | "contract"; title: string; kind: string; visibility?: string; originalName: string; size: number; contractId?: string; personId?: string; dossierKind?: string }): Promise<{ url?: string; token?: string; error?: string }> {
  try { return await apiFetch<{url:string;token:string}>("/v1/rental-documents/upload-ticket", { method: "POST", body: metadata }); }
  catch(error) { return { error: error instanceof ApiError ? error.message : "No pudimos autorizar la carga." }; }
}
export async function refreshDocumentViews(contractId?: string) {
  await apiFetch("/v1/auth/me");
  revalidatePath("/archivos");
  if(contractId && uuid.safeParse(contractId).success) revalidatePath(`/alquileres/contratos/${contractId}`);
}

export async function deleteRentalDocument(contractId: string | null, documentId: string, _state: State): Promise<State> {
  void _state;
  if ((contractId !== null && !uuid.safeParse(contractId).success) || !uuid.safeParse(documentId).success) return { error: "Documento inválido." };
  try {
    await apiFetch(`/v1/rental-documents/${documentId}`, { method: "DELETE" });
    revalidatePath("/archivos");
    if (contractId) revalidatePath(`/alquileres/contratos/${contractId}`);
    return { success: "Documento enviado a la papelera." };
  } catch (error) { return { error: error instanceof ApiError ? error.message : "No pudimos eliminar el documento." }; }
}

export async function linkGuarantor(contractId: string, _state: State, form: FormData): Promise<State> {
  void _state;
  const personId = String(form.get("personId") ?? "");
  if (!uuid.safeParse(contractId).success || !uuid.safeParse(personId).success) return { error: "Seleccioná un garante." };
  try {
    await apiFetch(`/v1/rental-contracts/${contractId}/guarantors`, { method: "POST", body: { personId } });
    revalidatePath(`/alquileres/contratos/${contractId}`);
    return { success: "Garante vinculado." };
  } catch(error) { return { error: error instanceof ApiError ? error.message : "No pudimos vincular el garante." }; }
}
export async function unlinkGuarantor(contractId: string, personId: string, _state: State): Promise<State> {
  void _state;
  if (!uuid.safeParse(contractId).success || !uuid.safeParse(personId).success) return { error: "Garante inválido." };
  try {
    await apiFetch(`/v1/rental-contracts/${contractId}/guarantors/${personId}`, { method: "DELETE" });
    revalidatePath(`/alquileres/contratos/${contractId}`);
    return { success: "Garante desvinculado." };
  } catch(error) { return { error: error instanceof ApiError ? error.message : "No pudimos quitar el vínculo." }; }
}
