import Link from "next/link";
import { apiFetch } from "@/lib/api";
import type { Client } from "@/lib/clients";
export async function LeadClients({ leadId }: { leadId: string }) {
  const { data } = await apiFetch<{ data: { person: Client }[] }>(`/v1/clients/operations/${leadId}/people`);
  return <div className="flex flex-wrap items-center gap-2 text-sm"><span className="text-muted-foreground">Clientes vinculados:</span>{data.length ? data.map(({ person }) => <Link key={person.id} className="underline" href={`/clientes/${person.id}?seccion=operaciones`}>{person.nombre}</Link>) : <Link href="/clientes" className="underline">Vincular desde la ficha de Clientes</Link>}</div>;
}
