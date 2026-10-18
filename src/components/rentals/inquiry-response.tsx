"use client";

import { useActionState } from "react";
import { answerRentalInquiry } from "@/actions/rental-inquiries";
import { Button } from "@/components/ui/button";

export function InquiryResponse({ id, status }: { id: string; status: string }) {
  const [state, action, pending] = useActionState(answerRentalInquiry.bind(null, id), {});
  if (status === "resuelta") return null;
  return <form action={action} className="mt-3 grid gap-2 border-t pt-3">
    <label className="text-sm">Respuesta<textarea name="response" required minLength={5} maxLength={5000} rows={3}
      className="mt-1 w-full rounded-md border bg-background p-2" /></label>
    <label className="text-sm">Nuevo estado<select name="status" defaultValue="en_gestion"
      className="mt-1 w-full rounded-md border bg-background p-2">
      <option value="en_gestion">En gestión</option><option value="resuelta">Resuelta</option>
    </select></label>
    {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
    {state.success && <p role="status" className="text-sm">{state.success}</p>}
    <Button disabled={pending}>{pending ? "Guardando…" : "Registrar respuesta"}</Button>
  </form>;
}
