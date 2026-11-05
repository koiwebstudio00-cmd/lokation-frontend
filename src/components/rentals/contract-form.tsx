"use client";

import { RentalOptionPicker } from "./option-picker";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useActionState } from "react";
import { createRentalContract, updateRentalContract } from "@/actions/rental-contracts";
import { Button } from "@/components/ui/button";
import type { RentalContract } from "@/lib/rental-contracts";

export function ContractForm({ contract }: { contract?: RentalContract }) {
  const [state, action, pending] = useActionState(
    contract ? updateRentalContract.bind(null, contract.id) : createRentalContract, {}
  );
  return <form action={action} className="space-y-5 rounded-xl border p-5">
    <div className="grid gap-4 sm:grid-cols-2">
      <RentalOptionPicker name="property_id" title="Propiedad" kind="property" initial={contract ? { id: contract.property.id, label: contract.property.titulo } : undefined} />
      <RentalOptionPicker name="owner_person_id" title="Propietario" kind="propietario" initial={contract ? { id: contract.owner.id, label: contract.owner.nombre } : undefined} />
      <RentalOptionPicker name="tenant_person_id" title="Inquilino" kind="inquilino" initial={contract ? { id: contract.tenantPerson.id, label: contract.tenantPerson.nombre } : undefined} />
      <label className="space-y-1 text-sm">Importe mensual inicial
        <Input name="monthly_rent" required inputMode="decimal" pattern="[0-9]+(\.[0-9]{1,2})?" placeholder="420000.00" defaultValue={contract?.monthlyRent} className="w-full rounded-md border bg-background px-3 py-2" />
      </label>
      <label className="space-y-1 text-sm">Moneda
        <Select name="currency" defaultValue={contract?.currency ?? "ARS"} className="w-full rounded-md border bg-background px-3 py-2">
          <option value="ARS">ARS</option><option value="USD">USD</option>
        </Select>
      </label>
      <label className="space-y-1 text-sm">Día de vencimiento (1 a 28)
        <Input name="due_day" type="number" min={1} max={28} required defaultValue={contract?.dueDay ?? 10} className="w-full rounded-md border bg-background px-3 py-2" />
      </label>
      <label className="space-y-1 text-sm">Inicio
        <Input name="start_date" type="date" required defaultValue={contract?.startDate.slice(0, 10)} className="w-full rounded-md border bg-background px-3 py-2" />
      </label>
      <label className="space-y-1 text-sm">Fin
        <Input name="end_date" type="date" required defaultValue={contract?.endDate.slice(0, 10)} className="w-full rounded-md border bg-background px-3 py-2" />
      </label>
    </div>
    <p className="text-xs text-muted-foreground">Los cambios del borrador quedan auditados. No genera pagos, cargos ni una firma.</p>
    {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
    <Button type="submit" disabled={pending}>
      {pending ? "Guardando…" : contract ? "Guardar cambios" : "Crear borrador"}
    </Button>
  </form>;
}
