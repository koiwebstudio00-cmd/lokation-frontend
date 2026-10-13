"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ApiError, apiFetch } from "@/lib/api";

export type ChargeState = { error?: string; success?: string };
const uuid = z.string().uuid();
const amount = z.string().regex(/^\d{1,12}(\.\d{1,2})?$/);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export async function createRentalCharge(contractId: string, _previous: ChargeState, data: FormData): Promise<ChargeState> {
  if (!uuid.safeParse(contractId).success) return { error: "Contrato inválido." };
  const parsed = z.object({ period: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/) }).safeParse(Object.fromEntries(data));
  if (!parsed.success) return { error: "Ingresá un período válido." };
  try {
    const result = await apiFetch<{ created: boolean }>(`/v1/rental-contracts/${contractId}/charges`, {
      method: "POST", body: parsed.data
    });
    revalidatePath(`/alquileres/contratos/${contractId}`);
    return { success: result.created ? "Cargo generado." : "El cargo de ese período ya existía." };
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : "No pudimos generar el cargo." };
  }
}

export async function recordRentalPayment(contractId: string, chargeId: string,
  _previous: ChargeState, data: FormData): Promise<ChargeState> {
  if (![contractId, chargeId].every((value) => uuid.safeParse(value).success)) return { error: "Cargo inválido." };
  const parsed = z.object({ idempotency_key: uuid, amount, paid_at: date,
    method: z.string().trim().min(1).max(80), reference: z.string().trim().max(160),
    note: z.string().trim().max(1000) }).safeParse(Object.fromEntries(data));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  try {
    await apiFetch(`/v1/rental-charges/${chargeId}/payments`, {
      method: "POST", body: parsed.data
    });
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : "No pudimos registrar el cobro." };
  }
  revalidatePath(`/alquileres/contratos/${contractId}`);
  redirect(`/alquileres/contratos/${contractId}`);
}

export async function voidRentalPayment(contractId: string, paymentId: string,
  _previous: ChargeState, data: FormData): Promise<ChargeState> {
  if (![contractId, paymentId].every((value) => uuid.safeParse(value).success)) return { error: "Cobro inválido." };
  const parsed = z.object({ reason: z.string().trim().min(5).max(1000) }).safeParse(Object.fromEntries(data));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  try {
    await apiFetch(`/v1/rental-payments/${paymentId}/void`, { method: "POST", body: parsed.data });
    revalidatePath(`/alquileres/contratos/${contractId}`);
    return { success: "Cobro revertido." };
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : "No pudimos revertir el cobro." };
  }
}
