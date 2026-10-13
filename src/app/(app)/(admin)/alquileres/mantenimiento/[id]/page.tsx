import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { MaintenanceRequest } from "@/lib/maintenance";
import { MaintenanceTransition } from "@/components/rentals/maintenance-forms";

export const metadata = { title: "Pedido de mantenimiento — Lokation" };

export default async function MaintenanceDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let item: MaintenanceRequest;
  try {
    ({ item } = await apiFetch<{ item: MaintenanceRequest }>(`/v1/maintenance-requests/${id}`));
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  return <div className="mx-auto max-w-3xl space-y-5">
    <Link href="/alquileres/mantenimiento" className="text-sm underline">← Mantenimiento</Link>
    <div><h1 className="text-2xl font-semibold">{item.title}</h1><p className="text-sm text-muted-foreground">{item.property.titulo} · {item.status.replace("_", " ")} · prioridad {item.priority}</p></div>
    <section className="rounded-xl border p-5"><h2 className="font-semibold">Descripción</h2><p className="mt-2 whitespace-pre-wrap text-sm">{item.description}</p>
      {item.contractId && <Link className="mt-3 inline-block text-sm underline" href={`/alquileres/contratos/${item.contractId}`}>Ver contrato asociado</Link>}</section>
    {(item.status === "abierta" || item.status === "en_gestion") && <MaintenanceTransition id={id} status={item.status} />}
    <section className="rounded-xl border p-5"><h2 className="font-semibold">Historial</h2>
      <ul className="mt-3 space-y-2 text-sm">{item.events?.map((event) => <li key={event.id}>
        {event.toState.replace("_", " ")} · {event.note} · {formatDate(event.createdAt)}
      </li>)}</ul></section>
  </div>;
}
