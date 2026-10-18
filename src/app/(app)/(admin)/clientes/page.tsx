import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { clientRoleLabels, clientRoles, type Client } from "@/lib/clients";
import { ClientDialog } from "@/components/clients/client-dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
export const metadata = { title: "Clientes — Lokation" };
export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ q?: string; role?: string; page?: string }> }) {
  const query = await searchParams;
  const role = clientRoles.find((role) => role === query.role);
  const q = typeof query.q === "string" ? query.q.slice(0, 100) : "";
  const page = Math.max(1, Math.min(100000, Number.parseInt(query.page ?? "1", 10) || 1));
  const result = await apiFetch<{ data: Client[]; meta: { total: number; limit: number } }>("/v1/clients", { query: { q, role, page } });
  const pages = Math.max(1, Math.ceil(result.meta.total / result.meta.limit));
  const url = (n: number) => `/clientes?${new URLSearchParams({ q, ...(role ? { role } : {}), page: String(n) })}`;
  return <div className="space-y-6"><header className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-2xl font-semibold">Clientes</h1><p className="text-sm text-muted-foreground">Inquilinos, propietarios, compradores y vendedores en un solo lugar. {result.meta.total} {result.meta.total === 1 ? "resultado" : "resultados"}.</p></div><ClientDialog /></header>
    <form action="/clientes" className="flex flex-wrap items-end gap-3"><div className="min-w-48 flex-1"><Input name="q" aria-label="Buscar clientes" placeholder="Buscar por nombre o email" maxLength={100} defaultValue={q} /></div><Select name="role" aria-label="Filtrar por rol" defaultValue={role ?? ""}><option value="">Todos los roles</option>{clientRoles.map((r) => <option key={r} value={r}>{clientRoleLabels[r]}</option>)}</Select><Button type="submit" variant="outline">Buscar</Button></form>
    <div className="rounded-xl border bg-background"><Table aria-label="Clientes"><TableHeader><TableRow><TableHead>Cliente</TableHead><TableHead>Roles</TableHead><TableHead>Contacto</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader><TableBody>{result.data.map((person) => <TableRow key={person.id}><TableCell className="font-medium"><Link href={`/clientes/${person.id}`} className="hover:underline">{person.nombre}</Link></TableCell><TableCell><div className="flex flex-wrap gap-1">{person.roles.map((r) => <Badge key={r} variant="secondary">{clientRoleLabels[r]}</Badge>)}</div></TableCell><TableCell><p>{person.email || "Sin email"}</p><p className="text-xs text-muted-foreground">{person.telefono || "Sin teléfono"}</p></TableCell><TableCell className="text-right"><Button asChild variant="outline" size="sm"><Link href={`/clientes/${person.id}`}>Ver ficha</Link></Button></TableCell></TableRow>)}{!result.data.length && <TableRow><TableCell colSpan={4} className="h-32 text-center text-muted-foreground">No hay clientes con esos criterios.</TableCell></TableRow>}</TableBody></Table></div>
    {pages > 1 && <nav aria-label="Páginas de clientes" className="flex items-center justify-center gap-4">{page > 1 && <Button asChild variant="outline"><Link href={url(page - 1)}>Anterior</Link></Button>}<span className="text-sm">Página {page} de {pages}</span>{page < pages && <Button asChild variant="outline"><Link href={url(page + 1)}>Siguiente</Link></Button>}</nav>}
  </div>;
}
