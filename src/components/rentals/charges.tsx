"use client";

import { useActionState } from "react";
import { createRentalCharge, recordRentalPayment, voidRentalPayment } from "@/actions/rental-charges";
import { Button } from "@/components/ui/button";
import { contractAmount, contractDate } from "@/lib/rental-contracts";

export type RentalCharge = {
  id: string; period: string; dueDate: string; amount: string; currency: "ARS" | "USD";
  paid: string; balance: string;
  payments: { id: string; amount: string; paidAt: string; method: string; reference: string | null;
    voidedAt: string | null; voidReason: string | null }[];
};

function PaymentForm({ contractId, chargeId, idempotencyKey }: { contractId: string; chargeId: string; idempotencyKey: string }) {
  const [state, action, pending] = useActionState(recordRentalPayment.bind(null, contractId, chargeId), {});
  return <form action={action} className="mt-3 grid gap-2 border-t pt-3 sm:grid-cols-2">
    <input type="hidden" name="idempotency_key" value={idempotencyKey} />
    <label className="text-sm">Importe cobrado<input name="amount" inputMode="decimal" required placeholder="150000.00" className="mt-1 w-full rounded-md border bg-background p-2" /></label>
    <label className="text-sm">Fecha del cobro<input name="paid_at" type="date" required className="mt-1 w-full rounded-md border bg-background p-2" /></label>
    <label className="text-sm">Medio<input name="method" required placeholder="Transferencia" className="mt-1 w-full rounded-md border bg-background p-2" /></label>
    <label className="text-sm">Referencia<input name="reference" maxLength={160} placeholder="Número de operación" className="mt-1 w-full rounded-md border bg-background p-2" /></label>
    <label className="text-sm sm:col-span-2">Nota<input name="note" maxLength={1000} className="mt-1 w-full rounded-md border bg-background p-2" /></label>
    {state.error && <p role="alert" className="text-sm text-destructive sm:col-span-2">{state.error}</p>}
    <Button type="submit" disabled={pending} className="sm:col-span-2">{pending ? "Guardando…" : "Registrar cobro"}</Button>
  </form>;
}

function VoidPayment({ contractId, id }: { contractId: string; id: string }) {
  const [state, action, pending] = useActionState(voidRentalPayment.bind(null, contractId, id), {});
  return <form action={action} className="mt-1 flex flex-wrap items-end gap-2">
    <label className="text-xs">Motivo del reverso<input name="reason" required minLength={5} maxLength={1000}
      className="mt-1 rounded-md border bg-background p-2" /></label>
    <Button type="submit" size="sm" variant="outline" disabled={pending}>Revertir cobro</Button>
    {state.error && <p role="alert" className="text-xs text-destructive">{state.error}</p>}
  </form>;
}

export function RentalCharges({ contractId, status, charges, paymentKeys, settledChargeIds = [] }: {
  contractId: string; status: string; charges: RentalCharge[]; paymentKeys: Record<string, string>;
  settledChargeIds?: string[]
}) {
  const [state, action, pending] = useActionState(createRentalCharge.bind(null, contractId), {});
  return <section className="space-y-4 rounded-xl border p-5">
    <div><h2 className="font-semibold">Cargos y cobros</h2>
      <p className="text-sm text-muted-foreground">Registro manual de importes. No inicia un cobro bancario ni emite un recibo fiscal.</p></div>
    {status === "vigente" && <form action={action} className="flex flex-wrap items-end gap-2">
      <label className="text-sm">Mes a liquidar<input name="period" type="month" required className="mt-1 block rounded-md border bg-background p-2" /></label>
      <Button type="submit" disabled={pending}>{pending ? "Guardando…" : "Generar cargo de alquiler"}</Button>
      {state.error && <p role="alert" className="w-full text-sm text-destructive">{state.error}</p>}
      {state.success && <p role="status" className="w-full text-sm">{state.success}</p>}
    </form>}
    {!charges.length && <p className="text-sm text-muted-foreground">Todavía no hay cargos.</p>}
    {charges.map((charge) => <div key={charge.id} className="rounded-lg border p-4 text-sm">
      <div className="flex flex-wrap justify-between gap-2"><strong>{contractDate(charge.period)} · vence {contractDate(charge.dueDate)}</strong>
        <span>{charge.currency} {contractAmount(charge.amount)} · saldo {contractAmount(charge.balance)}</span></div>
      <p className="mt-1 text-muted-foreground">Cobrado: {charge.currency} {contractAmount(charge.paid)}</p>
      {!!charge.payments.length && <ul className="mt-3 space-y-3 border-t pt-3">{charge.payments.map((payment) => <li key={payment.id}>
        <p>{contractDate(payment.paidAt)} · {payment.method} · {charge.currency} {contractAmount(payment.amount)}
          {payment.voidedAt ? ` · revertido: ${payment.voidReason}` : ""}</p>
        {payment.reference && <p className="text-muted-foreground">Referencia: {payment.reference}</p>}
        {!payment.voidedAt && !settledChargeIds.includes(charge.id) && <VoidPayment contractId={contractId} id={payment.id} />}
      </li>)}</ul>}
      {charge.balance !== "0.00" && <PaymentForm contractId={contractId} chargeId={charge.id} idempotencyKey={paymentKeys[charge.id]} />}
    </div>)}
  </section>;
}
