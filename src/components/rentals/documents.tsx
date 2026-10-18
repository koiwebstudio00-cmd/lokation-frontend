"use client";

import { useActionState, useEffect, useRef } from "react";
import { deleteRentalDocument, uploadRentalDocument } from "@/actions/rental-documents";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export type RentalDocument = { id: string; title: string; kind: string; visibility: string; size: number; createdAt: string };
function DeleteDocument({ contractId, id }: { contractId: string; id: string }) {
  const [state, action, pending] = useActionState(deleteRentalDocument.bind(null, contractId, id), {});
  return <form action={action} className="inline-flex items-center gap-2">
    <Button type="submit" variant="outline" size="sm" disabled={pending}>Eliminar</Button>
    {state.error && <span role="alert" className="text-xs text-destructive">{state.error}</span>}
    {state.success && <span role="status" className="text-xs">{state.success}</span>}
  </form>;
}
export function RentalDocuments({ contractId, documents }: { contractId: string; documents: RentalDocument[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(uploadRentalDocument.bind(null, contractId), {});
  useEffect(() => { if (state.success) formRef.current?.reset(); }, [state.success]);
  return <section className="space-y-4 rounded-xl border p-5">
    <div><h2 className="font-semibold">Documentos privados</h2>
      <p className="text-sm text-muted-foreground">Sólo PDF. Elegí quién puede verlo en su portal. La descarga requiere sesión y permiso del contrato.</p></div>
    {documents.length ? <ul className="space-y-2 text-sm">{documents.map((item) => <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3">
      <div><a href={`/api/rental-documents/${item.id}`} className="font-medium underline">{item.title}</a>
        <p className="text-muted-foreground">{item.kind} · visible para {item.visibility} · {formatDate(item.createdAt)}</p></div>
      <DeleteDocument contractId={contractId} id={item.id} />
    </li>)}</ul> : <p className="text-sm text-muted-foreground">No hay documentos.</p>}
    <form ref={formRef} action={action} className="grid gap-3 border-t pt-4 sm:grid-cols-2">
      <label className="text-sm">Título<input name="title" required minLength={3} maxLength={160}
        className="mt-1 w-full rounded-md border bg-background p-2" /></label>
      <label className="text-sm">Tipo<select name="kind" className="mt-1 w-full rounded-md border bg-background p-2">
        <option value="contrato">Contrato</option><option value="comprobante">Comprobante</option>
        <option value="inventario">Inventario</option><option value="otro">Otro</option>
      </select></label>
      <label className="text-sm">Visibilidad<select name="visibility" defaultValue="interna" className="mt-1 w-full rounded-md border bg-background p-2">
        <option value="interna">Sólo inmobiliaria</option><option value="inquilino">Inquilino</option>
        <option value="propietario">Propietario</option><option value="ambos">Ambos</option>
      </select></label>
      <label className="text-sm">Archivo PDF<input name="file" type="file" accept="application/pdf,.pdf" required
        className="mt-1 w-full rounded-md border bg-background p-2" /></label>
      {state.error && <p role="alert" className="text-sm text-destructive sm:col-span-2">{state.error}</p>}
      {state.success && <p role="status" className="text-sm sm:col-span-2">{state.success}</p>}
      <Button disabled={pending} className="sm:col-span-2">{pending ? "Subiendo…" : "Guardar documento"}</Button>
    </form>
  </section>;
}
