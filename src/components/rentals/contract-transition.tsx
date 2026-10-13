"use client";

import { useActionState } from "react";
import { transitionRentalContract } from "@/actions/rental-contracts";
import { Button } from "@/components/ui/button";

export function ContractTransition({ id, transition }: { id: string; transition: "activate" | "finish" }) {
  const [state, action, pending] = useActionState(transitionRentalContract.bind(null, id, transition), {});
  const activate = transition === "activate";
  return <form action={action} className="space-y-3 rounded-xl border p-5">
    <h2 className="font-semibold">{activate ? "Activar contrato" : "Finalizar contrato"}</h2>
    <p className="text-sm text-muted-foreground">{activate
      ? "Usá esta opción sólo cuando el contrato ya esté formalizado por fuera de Lokation. La fecha actual debe estar dentro de su vigencia."
      : "Registrá el motivo de finalización. Los datos y el historial permanecerán consultables."}</p>
    <label className="block space-y-1 text-sm">Nota obligatoria
      <textarea name="note" required minLength={5} maxLength={1000} rows={2}
        className="w-full rounded-md border bg-background px-3 py-2" />
    </label>
    {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
    <Button type="submit" disabled={pending} variant={activate ? "default" : "outline"}>
      {pending ? "Guardando…" : activate ? "Marcar vigente" : "Finalizar contrato"}
    </Button>
  </form>;
}
