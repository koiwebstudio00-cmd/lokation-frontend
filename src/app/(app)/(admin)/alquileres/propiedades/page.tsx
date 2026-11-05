import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { ManagedPropertyActions } from "@/components/rentals/managed-property-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
export const metadata = { title: "Propiedades en administración" };
export default async function ManagedProperties({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.slice(0,160) : "";
  const n = Number(params.page); const page = Number.isSafeInteger(n) && n > 0 && n <= 100000 ? n : 1;
  const result = await apiFetch<{ data: { id: string; titulo: string; direccion: string | null; administrationOnly: boolean }[]; meta: { total: number; limit: number } }>("/v1/rental-properties", { query: { q, page } });
  const href = (p: number) => `?${new URLSearchParams({ q, page: String(p) })}`;
  return <div className="mx-auto max-w-6xl space-y-5"><header className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-semibold">Propiedades en administración</h1><p className="text-sm text-muted-foreground">{result.meta.total} propiedades. La administración es independiente de la comercialización.</p></div><ManagedPropertyActions /></header><form className="flex gap-2"><Input aria-label="Buscar propiedad" name="q" defaultValue={q} placeholder="Nombre o dirección" /><Button>Buscar</Button><Button asChild variant="ghost"><Link href="/alquileres/propiedades">Limpiar</Link></Button></form><div className="rounded-xl border"><Table><TableHeader><TableRow><TableHead>Propiedad</TableHead><TableHead>Visibilidad</TableHead><TableHead>Acciones</TableHead></TableRow></TableHeader><TableBody>{result.data.map(p => <TableRow key={p.id}><TableCell><p className="font-medium">{p.titulo}</p><p className="text-muted-foreground">{p.direccion || "Dirección pendiente"}</p></TableCell><TableCell><Badge variant="secondary">{p.administrationOnly ? "Sólo administración" : "Según ficha comercial"}</Badge></TableCell><TableCell><Button asChild variant="outline"><Link href={`/propiedades/${p.id}`}>Ver ficha</Link></Button></TableCell></TableRow>)}</TableBody></Table>{!result.data.length && <p className="p-8 text-center text-muted-foreground">No hay propiedades con estos filtros.</p>}</div><nav className="flex items-center justify-center gap-3" aria-label="Paginación">{page > 1 && <Link href={href(page-1)}>Anterior</Link>}<span>Página {page}</span>{page * result.meta.limit < result.meta.total && <Link href={href(page+1)}>Siguiente</Link>}</nav></div>;
}
