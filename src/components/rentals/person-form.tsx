"use client";

import { useActionState } from "react";
import { saveRentalPerson } from "@/actions/rental-people";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { clientRoles, clientRoleLabels, type Client } from "@/lib/clients";
export type RentalPerson = Client;

export function PersonForm({ person, onSuccess }: { person?: Client; onSuccess?: () => void }) {
  const [state, action, pending] = useActionState(async (previous: Awaited<ReturnType<typeof saveRentalPerson>>, form: FormData) => {
    const result = await saveRentalPerson(person?.id ?? null, previous, form);
    if (result.success) onSuccess?.();
    return result;
  }, {});

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Label className="grid gap-2">Nombre completo
          <Input name="nombre" required maxLength={200} defaultValue={person?.nombre} className="w-full rounded-md border bg-background px-3 py-2" />
        </Label>
        <Label className="grid gap-2">Email
          <Input name="email" type="email" maxLength={320} defaultValue={person?.email ?? ""} className="w-full rounded-md border bg-background px-3 py-2" />
        </Label>
        <Label className="grid gap-2">Teléfono
          <Input name="telefono" type="tel" maxLength={50} defaultValue={person?.telefono ?? ""} className="w-full rounded-md border bg-background px-3 py-2" />
        </Label>
      </div>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Roles del cliente</legend>
        <div className="flex flex-wrap gap-4">
          {clientRoles.map((role) => (
            <Label key={role} className="flex items-center gap-2 text-sm">
              <Checkbox name="roles" value={role} defaultChecked={person?.roles.includes(role)} />{clientRoleLabels[role]}
            </Label>
          ))}
        </div>
      </fieldset>
      <p className="text-xs text-muted-foreground">Estos roles organizan contactos. El acceso real al portal se concede por invitación y vínculo de contrato.</p>
      {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
      {state.success && <p role="status" className="text-sm text-emerald-700">{state.success}</p>}
      <Button type="submit" disabled={pending}>{pending ? "Guardando…" : "Guardar cliente"}</Button>
    </form>
  );
}
