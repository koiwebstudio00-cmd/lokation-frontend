"use client";
import { FeedbackVisibilityNotice } from "./visibility-notice";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/utils";
import { agregarComentario } from "@/actions/feedback";
import type { FeedbackComentario } from "@/lib/types";

/** Hilo de comentarios internos del ítem + alta de uno nuevo. */
export function Comentarios({
  id,
  comentarios,
}: {
  id: string;
  comentarios: FeedbackComentario[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLTextAreaElement>(null);

  function enviar() {
    const cuerpo = ref.current?.value.trim() ?? "";
    if (!cuerpo) return;
    setError(null);
    startTransition(async () => {
      const err = await agregarComentario(id, cuerpo);
      if (err) {
        setError(err);
        return;
      }
      if (ref.current) ref.current.value = "";
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      {comentarios.length === 0 ? (
        <p className="text-sm text-muted-foreground">Todavía no hay respuestas.</p>
      ) : (
        <ul className="space-y-3">
          {comentarios.map((c) => (
            <li key={c.id} className="border-l-2 pl-4 py-2">
              <p className="whitespace-pre-wrap text-sm">{c.cuerpo}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {c.autor ?? "—"} · {formatDateTime(c.created_at)}
              </p>
            </li>
          ))}
        </ul>
      )}
      <div className="space-y-2">
        <FeedbackVisibilityNotice />
        <Textarea ref={ref} rows={3} aria-label="Tu respuesta" placeholder="Escribí una respuesta…" maxLength={5000} />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button size="sm" onClick={enviar} disabled={pending}>
          {pending ? "Guardando..." : "Responder"}
        </Button>
      </div>
    </div>
  );
}
