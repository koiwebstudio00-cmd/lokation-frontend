"use client";

import { useActionState } from "react";
import { createRentalService, deactivateRentalService } from "@/actions/rental-services";
import { Button } from "@/components/ui/button";

export type RentalServiceAccount = {
  id: string; type: string; provider: string; accountNumber: string | null;
  meterNumber: string | null; holderName: string | null; visibility: string;
  active: boolean;
};

function DeactivateService({ propertyId, contractId, id }: { propertyId: string; contractId: string; id: string }) {
  const [state, action, pending] = useActionState(
    deactivateRentalService.bind(null, propertyId, contractId, id), {}
  );
  return <form action={action} className="mt-2"><Button type="submit" size="sm" variant="outline" disabled={pending}>
    {pending ? "Guardando…" : "Desactivar"}</Button>{state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
  </form>;
}

export function ServiceAccounts({ propertyId, contractId, accounts }: {
  propertyId: string; contractId: string; accounts: RentalServiceAccount[]
}) {
  const [state, action, pending] = useActionState(createRentalService.bind(null, propertyId, contractId), {});
  return <section className="space-y-4 rounded-xl border p-5">
    <div><h2 className="font-semibold">Servicios de la propiedad</h2>
      <p className="text-sm text-muted-foreground">Números de cuenta y medidor para la administración del alquiler. La visibilidad preparada se usará en los portales de inquilinos y propietarios.</p></div>
    {accounts.length ? <ul className="divide-y text-sm">{accounts.map((account) => <li key={account.id} className="py-3">
      <div className="flex flex-wrap justify-between gap-2"><strong className="capitalize">{account.type} · {account.provider}</strong>
        <span>{account.active ? "Activo" : "Inactivo"} · visible: {account.visibility}</span></div>
      <p>Cuenta: {account.accountNumber || "—"} · Medidor: {account.meterNumber || "—"}</p>
      {account.holderName && <p>Titular: {account.holderName}</p>}
      {account.active && <DeactivateService propertyId={propertyId} contractId={contractId} id={account.id} />}
    </li>)}</ul> : <p className="text-sm text-muted-foreground">Todavía no hay servicios cargados.</p>}
    <form action={action} className="grid gap-3 border-t pt-4 sm:grid-cols-2">
      <h3 className="font-medium sm:col-span-2">Agregar servicio</h3>
      <label className="text-sm">Tipo<select name="type" required className="mt-1 w-full rounded-md border bg-background p-2">
        {(["luz", "gas", "agua", "internet", "otro"] as const).map((type) => <option key={type} value={type}>{type}</option>)}
      </select></label>
      <label className="text-sm">Prestador<input name="provider" required maxLength={120} className="mt-1 w-full rounded-md border bg-background p-2" /></label>
      <label className="text-sm">Número de cuenta<input name="account_number" maxLength={100} className="mt-1 w-full rounded-md border bg-background p-2" /></label>
      <label className="text-sm">Número de medidor<input name="meter_number" maxLength={100} className="mt-1 w-full rounded-md border bg-background p-2" /></label>
      <label className="text-sm">Titular<input name="holder_name" maxLength={200} className="mt-1 w-full rounded-md border bg-background p-2" /></label>
      <label className="text-sm">Visibilidad futura<select name="visibility" className="mt-1 w-full rounded-md border bg-background p-2">
        <option value="interna">Solo inmobiliaria</option><option value="inquilino">Inquilino</option>
        <option value="propietario">Propietario</option><option value="ambos">Ambos</option>
      </select></label>
      {state.error && <p role="alert" className="text-sm text-destructive sm:col-span-2">{state.error}</p>}
      {state.success && <p role="status" className="text-sm sm:col-span-2">Servicio guardado.</p>}
      <Button type="submit" disabled={pending} className="sm:col-span-2">{pending ? "Guardando…" : "Agregar servicio"}</Button>
    </form>
  </section>;
}
