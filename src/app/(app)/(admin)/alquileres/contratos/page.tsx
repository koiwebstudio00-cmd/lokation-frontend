import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { contractDate, contractAmount, type RentalContract } from "@/lib/rental-contracts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
export const metadata = { title: "Contratos de alquiler — Cubiko AI" };
export default async function ContractsPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const params = await searchParams;
  const requestedPage = Number(params.page);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const q = typeof params.q === "string" ? params.q.slice(0,160) : "";
  const result = await apiFetch<{ data: RentalContract[]; meta: { page: number; total: number; limit: number } }>("/v1/rental-contracts", { query: { page, q } });
  const pages = Math.max(1, Math.ceil(result.meta.total / result.meta.limit));
  const href = (p: number) => `?${new URLSearchParams({ q, page: String(p) })}`;
  return <div className="mx-auto max-w-7xl space-y-5"><header className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-semibold">Contratos de alquiler</h1><p className="text-sm text-muted-foreground">{result.meta.total} contratos. Importes iniciales e importes vigentes según ajustes registrados.</p></div><Button asChild><Link href="/alquileres/contratos/nuevo">Nuevo borrador</Link></Button></header><form className="flex gap-2"><Input aria-label="Buscar contratos" name="q" defaultValue={q} placeholder="Propiedad, propietario o inquilino" /><Button>Buscar</Button><Button asChild variant="ghost"><Link href="/alquileres/contratos">Limpiar</Link></Button></form>
    <div className="rounded-xl border"><Table><TableHeader><TableRow><TableHead>Propiedad</TableHead><TableHead>Propietario / Inquilino</TableHead><TableHead>Vigencia</TableHead><TableHead>Importe inicial</TableHead><TableHead>Importe vigente</TableHead><TableHead>Administración</TableHead><TableHead>Actualización</TableHead><TableHead>Estado</TableHead><TableHead>Acciones</TableHead></TableRow></TableHeader><TableBody>{result.data.map(c => <TableRow key={c.id}><TableCell className="font-medium">{c.property.titulo}</TableCell><TableCell><p>{c.owner.nombre}</p><p className="text-muted-foreground">{c.tenantPerson.nombre}</p></TableCell><TableCell>{contractDate(c.startDate)}<br />{contractDate(c.endDate)}</TableCell><TableCell>{c.currency} {contractAmount(c.monthlyRent)}</TableCell><TableCell>{c.currency} {contractAmount(c.currentRent ?? c.monthlyRent)}<p className="text-xs text-muted-foreground">Desde {contractDate(c.currentRentSince ?? c.startDate)}</p></TableCell><TableCell>{c.terms?.[0] ? `${c.terms[0].commissionRate}%` : "Sin configurar"}</TableCell><TableCell>{c.terms?.[0] ? `${c.terms[0].adjustmentMethod === "sin_actualizacion" ? "Sin actualización" : c.terms[0].adjustmentMethod}${c.terms[0].frequencyMonths ? ` · cada ${c.terms[0].frequencyMonths} meses` : ""}` : "Sin configurar"}</TableCell><TableCell><Badge variant="secondary">{c.status}</Badge></TableCell><TableCell><Button asChild variant="outline" size="sm"><Link href={`/alquileres/contratos/${c.id}`}>Ver detalle</Link></Button></TableCell></TableRow>)}</TableBody></Table>{!result.data.length && <p className="p-8 text-center text-muted-foreground">No hay contratos con estos filtros.</p>}</div>
    {pages > 1 && <nav aria-label="Páginas de contratos" className="flex justify-center gap-4 text-sm">{page > 1 && <Link href={href(page - 1)}>Anterior</Link>}<span>Página {page} de {pages}</span>{page < pages && <Link href={href(page + 1)}>Siguiente</Link>}</nav>}
  </div>;
}
