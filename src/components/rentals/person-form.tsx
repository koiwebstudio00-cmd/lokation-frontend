"use client";

import { useActionState, useEffect, useRef } from "react";
import { saveRentalPerson } from "@/actions/rental-people";
import { Button } from "@/components/ui/button";

export type RentalPerson = {
  id: string; nombre: string; email: string | null; telefono: string | null;
  roles: ("propietario" | "inquilino" | "garante" | "contacto")[];
};

const roleLabels = { propietario: "Propietario", inquilino: "Inquilino", garante: "Garante", contacto: "Contacto" };

export function PersonForm({ person }: { person?: RentalPerson }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(saveRentalPerson.bind(null, person?.id ?? null), {});
  useEffect(() => { if (state.success && !person) formRef.current?.reset(); }, [state.success, person]);

  return (
    <form ref={formRef} action={action} className="space-y-4 rounded-xl border p-5">
      <h2 className="text-lg font-semibold">{person ? "Editar persona" : "Agregar persona"}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">Nombre completo
          <input name="nombre" required maxLength={200} defaultValue={person?.nombre} className="w-full rounded-md border bg-background px-3 py-2" />
        </label>
        <label className="space-y-1 text-sm">Email
          <input name="email" type="email" maxLength={320} defaultValue={person?.email ?? ""} className="w-full rounded-md border bg-background px-3 py-2" />
        </label>
        <label className="space-y-1 text-sm">Teléfono
          <input name="telefono" type="tel" maxLength={50} defaultValue={person?.telefono ?? ""} className="w-full rounded-md border bg-background px-3 py-2" />
        </label>
      </div>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Roles previstos</legend>
        <div className="flex flex-wrap gap-4">
          {Object.entries(roleLabels).map(([role, label]) => (
            <label key={role} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="roles" value={role} defaultChecked={person?.roles.includes(role as keyof typeof roleLabels)} />{label}
            </label>
          ))}
        </div>
      </fieldset>
      <p className="text-xs text-muted-foreground">Estos roles organizan contactos. El acceso a contratos se definirá cuando exista un vínculo vigente.</p>
      {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
      {state.success && <p role="status" className="text-sm text-emerald-700">{state.success}</p>}
      <Button type="submit" disabled={pending}>{pending ? "Guardando…" : "Guardar persona"}</Button>
    </form>
  );
}
