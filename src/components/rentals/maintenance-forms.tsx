"use client";

import { useActionState } from "react";
import { createMaintenanceRequest, transitionMaintenance } from "@/actions/maintenance";
import { Button } from "@/components/ui/button";

export function MaintenanceCreateForm({ properties, propertyId, contractId }: {
  properties: { id: string; label: string }[]; propertyId?: string; contractId?: string
}) {
  const [state, action, pending] = useActionState(createMaintenanceRequest, {});
  return <form action={action} className="grid gap-3 rounded-xl border p-5 sm:grid-cols-2">
    <h2 className="font-semibold sm:col-span-2">Nuevo pedido</h2>
    <label className="text-sm sm:col-span-2">Propiedad<select name="property_id" defaultValue={propertyId || ""} required className="mt-1 w-full rounded-md border bg-background p-2">
      <option value="">Seleccionar propiedad</option>{properties.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
    </select></label>
    <input type="hidden" name="contract_id" value={contractId || ""} />
    <label className="text-sm sm:col-span-2">Título<input name="title" required maxLength={160} className="mt-1 w-full rounded-md border bg-background p-2" /></label>
    <label className="text-sm sm:col-span-2">Descripción<textarea name="description" required maxLength={5000} rows={3} className="mt-1 w-full rounded-md border bg-background p-2" /></label>
    <label className="text-sm">Prioridad<select name="priority" defaultValue="normal" className="mt-1 w-full rounded-md border bg-background p-2">
      <option value="baja">Baja</option><option value="normal">Normal</option><option value="alta">Alta</option><option value="urgente">Urgente</option>
    </select></label>
    <label className="text-sm">Nota inicial<input name="note" required minLength={5} maxLength={2000} placeholder="Origen del reporte" className="mt-1 w-full rounded-md border bg-background p-2" /></label>
    {state.error && <p role="alert" className="text-sm text-destructive sm:col-span-2">{state.error}</p>}
    <Button type="submit" disabled={pending} className="sm:col-span-2">{pending ? "Guardando…" : "Registrar pedido"}</Button>
  </form>;
}

export function MaintenanceTransition({ id, status }: { id: string; status: "abierta" | "en_gestion" }) {
  const [state, action, pending] = useActionState(transitionMaintenance.bind(null, id), {});
  return <form action={action} className="space-y-3 rounded-xl border p-5">
    <h2 className="font-semibold">Actualizar estado</h2>
    <label className="block text-sm">Nuevo estado<select name="status" required className="mt-1 w-full rounded-md border bg-background p-2">
      {status === "abierta" && <option value="en_gestion">En gestión</option>}
      {status === "en_gestion" && <option value="resuelta">Resuelta</option>}
      <option value="cancelada">Cancelada</option>
    </select></label>
    <label className="block text-sm">Nota<textarea name="note" required minLength={5} maxLength={2000} rows={2} className="mt-1 w-full rounded-md border bg-background p-2" /></label>
    {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
    <Button type="submit" disabled={pending}>{pending ? "Guardando…" : "Actualizar"}</Button>
  </form>;
}
