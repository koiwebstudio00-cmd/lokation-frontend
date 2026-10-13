"use client";

import { useState } from "react";
import { contractAmount, contractDate } from "@/lib/rental-contracts";

type Period = { id: string; period: string; paid: string; currency: string };

function toCents(value: string): bigint | null {
  const normalized = value.trim().replace(",", ".");
  if (!/^\d{1,12}(\.\d{1,2})?$/.test(normalized)) return null;
  const [whole, cents = ""] = normalized.split(".");
  return BigInt(whole) * BigInt(100) + BigInt(cents.padEnd(2, "0"));
}

function display(cents: bigint) {
  return contractAmount(`${cents / BigInt(100)}.${String(cents % BigInt(100)).padStart(2, "0")}`);
}

export function SettlementPreview({ periods }: { periods: Period[] }) {
  const [selectedId, setSelectedId] = useState(periods[0]?.id ?? "");
  const [commission, setCommission] = useState("0");
  const [expenses, setExpenses] = useState("0");
  const selected = periods.find((period) => period.id === selectedId);
  const gross = toCents(selected?.paid ?? "0") ?? BigInt(0);
  const commissionCents = toCents(commission);
  const expensesCents = toCents(expenses);
  const net = commissionCents === null || expensesCents === null ? null : gross - commissionCents - expensesCents;

  return <section className="space-y-4 rounded-xl border p-5">
    <div><h2 className="font-semibold">Simulación de liquidación</h2>
      <p className="text-sm text-muted-foreground">Importes manuales para revisar cómo se vería la liquidación. Este cálculo no se guarda ni registra un pago al propietario.</p></div>
    {periods.length ? <>
      <label className="block text-sm">Período
        <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)} className="mt-1 block w-full rounded-md border bg-background p-2">
          {periods.map((period) => <option key={period.id} value={period.id}>{contractDate(period.period)} · cobrado {period.currency} {contractAmount(period.paid)}</option>)}
        </select>
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">Comisión (importe)
          <input value={commission} onChange={(event) => setCommission(event.target.value)} inputMode="decimal" aria-invalid={commissionCents === null}
            className="mt-1 block w-full rounded-md border bg-background p-2" />
        </label>
        <label className="text-sm">Gastos (importe)
          <input value={expenses} onChange={(event) => setExpenses(event.target.value)} inputMode="decimal" aria-invalid={expensesCents === null}
            className="mt-1 block w-full rounded-md border bg-background p-2" />
        </label>
      </div>
      {net === null ? <p role="alert" className="text-sm text-destructive">Ingresá importes válidos con hasta dos decimales.</p>
        : net < BigInt(0) ? <p role="alert" className="text-sm text-destructive">La comisión y los gastos superan el importe cobrado.</p>
          : <dl className="grid gap-3 border-t pt-4 text-sm sm:grid-cols-3">
            <div><dt className="text-muted-foreground">Cobrado</dt><dd className="font-medium">{selected?.currency} {display(gross)}</dd></div>
            <div><dt className="text-muted-foreground">Descuentos ingresados</dt><dd className="font-medium">{selected?.currency} {display(commissionCents! + expensesCents!)}</dd></div>
            <div><dt className="text-muted-foreground">Neto estimado</dt><dd className="text-lg font-semibold">{selected?.currency} {display(net)}</dd></div>
          </dl>}
    </> : <p className="text-sm text-muted-foreground">Todavía no hay cargos para simular una liquidación.</p>}
  </section>;
}
