"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ApiError, apiFetch } from "@/lib/api";

export type FinancialState = { error?: string; success?: string };
const uuid = z.string().uuid();
const money = z.string().regex(/^\d{1,12}(\.\d{1,2})?$/);
const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

async function submit(contractId: string, path: string, body: unknown, success: string): Promise<FinancialState> {
  try {
    await apiFetch(path, { method: "POST", body });
    revalidatePath("/alquileres/contratos");
    revalidatePath(`/alquileres/contratos/${contractId}`);
    revalidatePath(`/alquileres/contratos/${contractId}/vistas`);
    return { success };
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : "No pudimos guardar el cambio." };
  }
}

export async function createAdjustment(contractId: string, _state: FinancialState, form: FormData): Promise<FinancialState> {
  if (!uuid.safeParse(contractId).success) return { error: "Contrato inválido." };
  const parsed = z.object({ effective_period: month, amount: money,
    reason: z.string().trim().min(5).max(500) }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  return submit(contractId, `/v1/rental-contracts/${contractId}/adjustments`, parsed.data, "Ajuste registrado.");
}

export async function createSettlement(contractId: string, chargeId: string,
  _state: FinancialState, form: FormData): Promise<FinancialState> {
  if (![contractId, chargeId].every((id) => uuid.safeParse(id).success)) return { error: "Cargo inválido." };
  const parsed = z.object({ commission: money.optional(), expenses: money,
    use_agreed_commission: z.boolean(), expected_terms_id: uuid.optional(),
    note: z.string().trim().max(1000) }).safeParse({ ...Object.fromEntries(form),
      use_agreed_commission: form.get("mode") === "acordada",
      commission: form.get("mode") === "acordada" ? undefined : form.get("commission"),
      expected_terms_id: form.get("expected_terms_id") || undefined });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  return submit(contractId, `/v1/rental-charges/${chargeId}/settlements`, parsed.data, "Liquidación preparada.");
}

export async function markSettlementPaid(contractId: string, settlementId: string,
  _state: FinancialState, form: FormData): Promise<FinancialState> {
  if (![contractId, settlementId].every((id) => uuid.safeParse(id).success)) return { error: "Liquidación inválida." };
  const parsed = z.object({ paid_at: date, payment_method: z.string().trim().min(1).max(80),
    payment_reference: z.string().trim().max(160) }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  return submit(contractId, `/v1/rental-settlements/${settlementId}/paid`, parsed.data, "Pago al propietario registrado.");
}

export async function cancelSettlement(contractId: string, settlementId: string,
  _state: FinancialState, form: FormData): Promise<FinancialState> {
  if (![contractId, settlementId].every((id) => uuid.safeParse(id).success)) return { error: "Liquidación inválida." };
  const parsed = z.object({ reason: z.string().trim().min(5).max(1000) }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  return submit(contractId, `/v1/rental-settlements/${settlementId}/cancel`, parsed.data, "Liquidación cancelada.");
}

export async function saveContractTerms(contractId: string, _state: FinancialState, form: FormData): Promise<FinancialState> {
  if (!uuid.safeParse(contractId).success) return { error: "Contrato inválido." };
  const method = String(form.get("adjustment_method"));
  return submit(contractId, `/v1/rental-contracts/${contractId}/terms`, {
    effective_period: form.get("effective_period"), commission_rate: form.get("commission_rate"),
    commission_basis: form.get("commission_basis"), adjustment_method: method,
    frequency_months: method === "sin_actualizacion" ? null : Number(form.get("frequency_months")),
    first_adjustment_period: method === "sin_actualizacion" ? null : form.get("first_adjustment_period"),
    fixed_percent: method === "fijo" ? form.get("fixed_percent") : null,
    note: form.get("note")
  }, "Condiciones guardadas. Los cargos y liquidaciones anteriores conservan sus importes.");
}
