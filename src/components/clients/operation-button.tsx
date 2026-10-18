"use client";
import { useActionState } from "react";
import { changeClientOperation } from "@/actions/client-operations";
import { Button } from "@/components/ui/button";
export function OperationButton({ personId, leadId, unlink = false }: { personId: string; leadId: string; unlink?: boolean }) {
  const [state, action, pending] = useActionState(changeClientOperation.bind(null, personId, leadId, unlink), {});
  return <form action={action}><Button variant="outline" size="sm" disabled={pending}>{pending ? "Guardando…" : unlink ? "Desvincular" : "Vincular"}</Button>{state.error && <p role="alert" className="mt-2 text-xs text-destructive">{state.error}</p>}</form>;
}
