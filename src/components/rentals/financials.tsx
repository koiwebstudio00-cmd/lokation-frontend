"use client";

import { useActionState } from "react";
import { createAdjustment, createSettlement, markSettlementPaid, cancelSettlement } from "@/actions/rental-financials";
import { Button } from "@/components/ui/button";
import { contractAmount, contractDate } from "@/lib/rental-contracts";
import type { RentalCharge } from "@/components/rentals/charges";

export type RentalAdjustment = { id: string; effectivePeriod: string; amount: string; reason: string };
export type RentalSettlement = { id: string; chargeId: string; gross: string; commission: string;
  expenses: string; net: string; currency: string; status: string; note: string | null;
  paidAt: string | null; paymentMethod: string | null; paymentReference: string | null;
  cancelReason: string | null; charge: { period: string } };

function AdjustmentForm({ contractId }: { contractId: string }) {
  const [state, action, pending] = useActionState(createAdjustment.bind(null, contractId), {});
  return <form action={action} className="grid gap-2 border-t pt-4 sm:grid-cols-2">
    <label className="text-sm">Desde el mes<input name="effective_period" type="month" required className="mt-1 w-full rounded-md border bg-background p-2" /></label>
    <label className="text-sm">Nuevo importe mensual<input name="amount" inputMode="decimal" required placeholder="450000.00" className="mt-1 w-full rounded-md border bg-background p-2" /></label>
    <label className="text-sm sm:col-span-2">Motivo<input name="reason" required minLength={5} maxLength={500} className="mt-1 w-full rounded-md border bg-background p-2" /></label>
    <Button disabled={pending} className="sm:col-span-2">{pending ? "Guardando…" : "Registrar ajuste"}</Button>
    {state.error && <p role="alert" className="text-sm text-destructive sm:col-span-2">{state.error}</p>}
    {state.success && <p role="status" className="text-sm sm:col-span-2">{state.success}</p>}
  </form>;
}

function SettlementForm({ contractId, chargeId }: { contractId: string; chargeId: string }) {
  const [state, action, pending] = useActionState(createSettlement.bind(null, contractId, chargeId), {});
  return <form action={action} className="mt-3 grid gap-2 border-t pt-3 sm:grid-cols-2">
    <label className="text-sm">Comisión acordada<input name="commission" defaultValue="0.00" required inputMode="decimal" className="mt-1 w-full rounded-md border bg-background p-2" /></label>
    <label className="text-sm">Gastos acordados<input name="expenses" defaultValue="0.00" required inputMode="decimal" className="mt-1 w-full rounded-md border bg-background p-2" /></label>
    <label className="text-sm sm:col-span-2">Nota<input name="note" maxLength={1000} className="mt-1 w-full rounded-md border bg-background p-2" /></label>
    <Button disabled={pending} className="sm:col-span-2">{pending ? "Guardando…" : "Preparar liquidación"}</Button>
    {state.error && <p role="alert" className="text-sm text-destructive sm:col-span-2">{state.error}</p>}
    {state.success && <p role="status" className="text-sm sm:col-span-2">{state.success}</p>}
  </form>;
}

function SettlementActions({ contractId, id }: { contractId: string; id: string }) {
  const [paid, paidAction, paidPending] = useActionState(markSettlementPaid.bind(null, contractId, id), {});
  const [cancel, cancelAction, cancelPending] = useActionState(cancelSettlement.bind(null, contractId, id), {});
  return <div className="mt-3 grid gap-3 border-t pt-3">
    <form action={paidAction} className="grid gap-2 sm:grid-cols-3">
      <label className="text-xs">Fecha de pago<input name="paid_at" type="date" required className="mt-1 w-full rounded-md border bg-background p-2" /></label>
      <label className="text-xs">Medio<input name="payment_method" required placeholder="Transferencia" className="mt-1 w-full rounded-md border bg-background p-2" /></label>
      <label className="text-xs">Referencia<input name="payment_reference" maxLength={160} className="mt-1 w-full rounded-md border bg-background p-2" /></label>
      <Button disabled={paidPending} className="sm:col-span-3">Registrar pago al propietario</Button>
      {paid.error && <p role="alert" className="text-sm text-destructive sm:col-span-3">{paid.error}</p>}
      {paid.success && <p role="status" className="text-sm sm:col-span-3">{paid.success}</p>}
    </form>
    <form action={cancelAction} className="flex flex-wrap items-end gap-2">
      <label className="grow text-xs">Motivo de cancelación<input name="reason" required minLength={5} maxLength={1000} className="mt-1 w-full rounded-md border bg-background p-2" /></label>
      <Button type="submit" variant="outline" disabled={cancelPending}>Cancelar liquidación</Button>
      {cancel.error && <p role="alert" className="w-full text-sm text-destructive">{cancel.error}</p>}
      {cancel.success && <p role="status" className="w-full text-sm">{cancel.success}</p>}
    </form>
  </div>;
}

export function RentalFinancials({ contractId, status, adjustments, charges, settlements }: {
  contractId: string; status: string; adjustments: RentalAdjustment[];
  charges: RentalCharge[]; settlements: RentalSettlement[]
}) {
  const activeChargeIds = new Set(settlements.filter((item) => item.status !== "cancelada").map((item) => item.chargeId));
  return <div className="space-y-5">
    <section className="space-y-3 rounded-xl border p-5">
      <h2 className="font-semibold">Ajustes de alquiler</h2>
      <p className="text-sm text-muted-foreground">El importe nuevo se usa al generar cargos de ese mes en adelante. Los cargos existentes conservan su importe.</p>
      {adjustments.length ? <ul className="space-y-2 text-sm">{adjustments.map((item) => <li key={item.id}>
        Desde {contractDate(item.effectivePeriod)} · {contractAmount(item.amount)} · {item.reason}
      </li>)}</ul> : <p className="text-sm text-muted-foreground">Sin ajustes registrados.</p>}
      {status === "vigente" && <AdjustmentForm contractId={contractId} />}
    </section>
    <section className="space-y-3 rounded-xl border p-5">
      <h2 className="font-semibold">Liquidaciones al propietario</h2>
      <p className="text-sm text-muted-foreground">Se preparan sobre cargos cobrados por completo. Comisión y gastos se ingresan manualmente según lo acordado; registrar un pago no transfiere dinero.</p>
      {charges.filter((charge) => charge.balance === "0.00" && !activeChargeIds.has(charge.id)).map((charge) => <div key={charge.id} className="rounded-lg border p-4 text-sm">
        <strong>Cargo de {contractDate(charge.period)} · {charge.currency} {contractAmount(charge.amount)}</strong>
        <SettlementForm contractId={contractId} chargeId={charge.id} />
      </div>)}
      {!settlements.length && <p className="text-sm text-muted-foreground">Todavía no hay liquidaciones.</p>}
      {settlements.map((item) => <div key={item.id} className="rounded-lg border p-4 text-sm">
        <div className="flex flex-wrap justify-between gap-2"><strong>Período {contractDate(item.charge.period)}</strong><span className="capitalize">{item.status}</span></div>
        <p className="mt-1">Cobrado {item.currency} {contractAmount(item.gross)} · comisión {contractAmount(item.commission)} · gastos {contractAmount(item.expenses)} · neto {contractAmount(item.net)}</p>
        {item.note && <p className="text-muted-foreground">{item.note}</p>}
        {item.status === "pagada" && <p>Pago informado: {contractDate(item.paidAt!)} · {item.paymentMethod}{item.paymentReference ? ` · ${item.paymentReference}` : ""}</p>}
        {item.status === "cancelada" && <p>Cancelada: {item.cancelReason}</p>}
        {item.status === "preparada" && <SettlementActions contractId={contractId} id={item.id} />}
      </div>)}
    </section>
  </div>;
}
