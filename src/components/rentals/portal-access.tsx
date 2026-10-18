"use client";

import Link from "next/link";
import { useActionState } from "react";
import { inviteRentalPerson, revokeRentalPerson } from "@/actions/rental-portal-admin";
import { Button } from "@/components/ui/button";

export function PortalAccess({ personId, email, access }: { personId: string; email: string | null;
  access: { active: boolean; account: { email: string } } | null }) {
  const [invited, invite, inviting] = useActionState(inviteRentalPerson.bind(null, personId), {});
  const [revoked, revoke, revoking] = useActionState(revokeRentalPerson.bind(null, personId), {});
  return <section className="space-y-3 rounded-xl border p-5">
    <h2 className="font-semibold">Acceso al portal</h2>
    <p className="text-sm text-muted-foreground">La invitación requiere un contrato vigente. La persona verá sólo sus contratos y los datos compartidos con su perfil.</p>
    <p className="text-sm">Estado: {access?.active ? `Activo · ${access.account.email}` : "Sin acceso activo"}</p>
    {!email && <p className="text-sm text-destructive">Agregá un correo a la ficha antes de invitarla.</p>}
    <div className="flex flex-wrap gap-2">
      <form action={invite}><Button disabled={!email || inviting} type="submit">{inviting ? "Enviando…" : access?.active ? "Reenviar invitación" : "Invitar al portal"}</Button></form>
      {access?.active && <form action={revoke}><Button disabled={revoking} type="submit" variant="outline">Revocar acceso</Button></form>}
    </div>
    {invited.error && <p role="alert" className="text-sm text-destructive">{invited.error}</p>}
    {invited.success && <p role="status" className="text-sm">{invited.success}</p>}
    {invited.devUrl && <p className="text-sm">Enlace local: <Link className="underline" href={invited.devUrl}>activar acceso</Link></p>}
    {revoked.error && <p role="alert" className="text-sm text-destructive">{revoked.error}</p>}
    {revoked.success && <p role="status" className="text-sm">{revoked.success}</p>}
  </section>;
}
