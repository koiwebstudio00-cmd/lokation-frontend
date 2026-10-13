"use client";

import { useActionState } from "react";
import { createRentalContract, updateRentalContract } from "@/actions/rental-contracts";
import { Button } from "@/components/ui/button";
import type { RentalContract } from "@/lib/rental-contracts";

type Option = { id: string; label: string };

export function ContractForm({ properties, owners, tenants, contract }: {
  properties: Option[]; owners: Option[]; tenants: Option[]; contract?: RentalContract;
}) {
  const [state, action, pending] = useActionState(
    contract ? updateRentalContract.bind(null, contract.id) : createRentalContract, {}
  );
  return <form action={action} className="space-y-5 rounded-xl border p-5">
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="space-y-1 text-sm">Propiedad
        <select name="property_id" required defaultValue={contract?.property.id ?? ""} className="w-full rounded-md border bg-background px-3 py-2">
          <option value="" disabled>Elegí una propiedad</option>
          {properties.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
      </label>
      <label className="space-y-1 text-sm">Propietario
        <select name="owner_person_id" required defaultValue={contract?.owner.id ?? ""} className="w-full rounded-md border bg-background px-3 py-2">
          <option value="" disabled>Elegí un propietario</option>
          {owners.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
      </label>
      <label className="space-y-1 text-sm">Inquilino
        <select name="tenant_person_id" required defaultValue={contract?.tenantPerson.id ?? ""} className="w-full rounded-md border bg-background px-3 py-2">
          <option value="" disabled>Elegí un inquilino</option>
          {tenants.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
      </label>
      <label className="space-y-1 text-sm">Importe mensual
        <input name="monthly_rent" required inputMode="decimal" pattern="[0-9]+(\.[0-9]{1,2})?" placeholder="420000.00" defaultValue={contract?.monthlyRent} className="w-full rounded-md border bg-background px-3 py-2" />
      </label>
      <label className="space-y-1 text-sm">Moneda
        <select name="currency" defaultValue={contract?.currency ?? "ARS"} className="w-full rounded-md border bg-background px-3 py-2">
          <option value="ARS">ARS</option><option value="USD">USD</option>
        </select>
      </label>
      <label className="space-y-1 text-sm">Día de vencimiento (1 a 28)
        <input name="due_day" type="number" min={1} max={28} required defaultValue={contract?.dueDay ?? 10} className="w-full rounded-md border bg-background px-3 py-2" />
      </label>
      <label className="space-y-1 text-sm">Inicio
        <input name="start_date" type="date" required defaultValue={contract?.startDate.slice(0, 10)} className="w-full rounded-md border bg-background px-3 py-2" />
      </label>
      <label className="space-y-1 text-sm">Fin
        <input name="end_date" type="date" required defaultValue={contract?.endDate.slice(0, 10)} className="w-full rounded-md border bg-background px-3 py-2" />
      </label>
    </div>
    <p className="text-xs text-muted-foreground">Los cambios del borrador quedan auditados. No genera pagos, cargos ni una firma.</p>
    {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
    <Button type="submit" disabled={pending || !properties.length || !owners.length || !tenants.length}>
      {pending ? "Guardando…" : contract ? "Guardar cambios" : "Crear borrador"}
    </Button>
  </form>;
}
