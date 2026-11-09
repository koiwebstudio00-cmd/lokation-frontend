import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageSquare, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";

import { AdjuntosGallery } from "@/components/feedback/adjuntos-gallery";
import { Comentarios } from "@/components/feedback/comentarios";
import { EliminarFeedback } from "@/components/feedback/eliminar-feedback";
import { FeedbackEstadoBadge, FeedbackTipoBadge } from "@/components/feedback/estado-badge";
import { FeedbackEstadoSelect } from "@/components/feedback/estado-select";
import { getCurrentUser } from "@/lib/api";
import { getFeedbackItem } from "@/lib/queries";
import { formatDateTime } from "@/lib/utils";

export const metadata = { title: "Feedback — Cubiko AI" };

export default async function FeedbackDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [item, me] = await Promise.all([getFeedbackItem(id), getCurrentUser()]);
  if (!item) notFound();

  const admin = me?.rol === "super_admin";
  const esAutor = me?.id === item.autor?.id;
  const volver = "/feedback";

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Button asChild variant="outline" size="sm">
        <Link href={volver} prefetch={false}>
          <ArrowLeft /> Volver
        </Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h1 className="text-2xl font-semibold">{item.titulo}</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <FeedbackTipoBadge tipo={item.tipo} />
            <span>{item.autor?.nombre ?? "—"}</span>
            <span>{formatDateTime(item.created_at)}</span>
          </div>
        </div>
        {admin ? (
          <div className="w-44">
            <FeedbackEstadoSelect id={item.id} estado={item.estado} />
          </div>
        ) : (
          <FeedbackEstadoBadge estado={item.estado} />
        )}
      </div>

      <section className="space-y-4 border-t pt-5">
        <header className="py-1">
          <h2 className="text-base font-semibold">Publicación</h2>
        </header>
        <div className="space-y-3 pt-4">
          <p className="whitespace-pre-wrap text-sm">{item.descripcion}</p>
          {(item.url_contexto || item.user_agent) && (
            <dl className="space-y-1 border-t pt-3 text-xs text-muted-foreground">
              {item.url_contexto && (
                <div className="flex gap-2">
                  <dt>Pantalla:</dt>
                  <dd className="break-all">{item.url_contexto}</dd>
                </div>
              )}
              {item.user_agent && (
                <div className="flex gap-2">
                  <dt>Navegador:</dt>
                  <dd className="break-all">{item.user_agent}</dd>
                </div>
              )}
            </dl>
          )}
        </div>
      </section>

      {item.tipo === "error" && (
        <section className="space-y-4 border-t pt-5">
          <header className="flex items-center gap-2 space-y-0 py-1">
            <Paperclip className="size-5 text-primary" />
            <h2 className="text-base font-semibold">Imágenes</h2>
          </header>
          <div className="pt-4">
            <AdjuntosGallery
              feedbackId={item.id}
              adjuntos={item.adjuntos}
              puedeEliminar={admin || esAutor}
            />
          </div>
        </section>
      )}

      <section className="space-y-4 border-t pt-5">
        <header className="flex items-center gap-2 space-y-0 py-1">
          <MessageSquare className="size-5 text-primary" />
          <h2 className="text-base font-semibold">Respuestas</h2>
        </header>
        <div className="pt-4">
          <Comentarios id={item.id} comentarios={item.comentarios} />
        </div>
      </section>

      {admin && <EliminarFeedback id={item.id} tipo={item.tipo} />}
    </div>
  );
}
