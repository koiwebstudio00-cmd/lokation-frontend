"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ApiError, apiBinary, apiFetch } from "@/lib/api";

type State = { error?: string; success?: string };
const uuid = z.uuid();
export async function uploadRentalDocument(contractId: string, _state: State, form: FormData): Promise<State> {
  void _state;
  if (!uuid.safeParse(contractId).success) return { error: "Contrato inválido." };
  const parsed = z.object({ title: z.string().trim().min(3).max(160),
    kind: z.enum(["contrato", "comprobante", "inventario", "otro"]),
    visibility: z.enum(["interna", "inquilino", "propietario", "ambos"]) })
    .safeParse({ title: form.get("title"), kind: form.get("kind"), visibility: form.get("visibility") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const file = form.get("file");
  if (!(file instanceof File) || file.type !== "application/pdf" || file.size === 0 || file.size > 10 * 1024 * 1024) {
    return { error: "Subí un PDF de hasta 10 MB." };
  }
  const query = new URLSearchParams(parsed.data).toString();
  try {
    await apiBinary(`/v1/rental-contracts/${contractId}/documents?${query}`, {
      method: "POST", contentType: "application/pdf", body: new Uint8Array(await file.arrayBuffer())
    });
    revalidatePath("/archivos");
    if (contractId) revalidatePath(`/alquileres/contratos/${contractId}`);
    return { success: "Documento privado guardado." };
  } catch (error) { return { error: error instanceof ApiError ? error.message : "No pudimos subir el documento." }; }
}

export async function deleteRentalDocument(contractId: string | null, documentId: string, _state: State): Promise<State> {
  void _state;
  if ((contractId !== null && !uuid.safeParse(contractId).success) || !uuid.safeParse(documentId).success) return { error: "Documento inválido." };
  try {
    await apiFetch(`/v1/rental-documents/${documentId}`, { method: "DELETE" });
    revalidatePath("/archivos");
    if (contractId) revalidatePath(`/alquileres/contratos/${contractId}`);
    return { success: "Documento eliminado." };
  } catch (error) { return { error: error instanceof ApiError ? error.message : "No pudimos eliminar el documento." }; }
}

export async function uploadVaultFile(_state: State, form: FormData): Promise<State> {
  const file = form.get("file");
  const parsed = z.object({ title: z.string().trim().min(3).max(160), kind: z.enum(["contrato", "comprobante", "inventario", "otro"]) })
    .safeParse({ title: form.get("title"), kind: form.get("kind") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (!(file instanceof File) || !file.size || file.size > 10 * 1024 * 1024) return { error: "Elegí un archivo de hasta 10 MB." };
  try {
    const query = new URLSearchParams({ ...parsed.data, originalName: file.name.slice(0, 255) });
    await apiBinary(`/v1/rental-documents?${query}`, { method: "POST", contentType: "application/octet-stream", body: new Uint8Array(await file.arrayBuffer()) });
    revalidatePath("/archivos");
    return { success: "Archivo privado guardado." };
  } catch (error) { return { error: error instanceof ApiError ? error.message : "No pudimos subir el archivo." }; }
}
