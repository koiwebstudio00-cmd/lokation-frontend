import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { contractDate, type RentalContract } from "@/lib/rental-contracts";

export const metadata = { title: "Contratos de alquiler — Lokation" };

export default async function ContractsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams;
  const requestedPage = Number(params.page);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const result = await apiFetch<{ data: RentalContract[]; meta: { page: number; total: number; limit: number } }>(
    "/v1/rental-contracts", { query: { page } }
  );
  const pages = Math.max(1, Math.ceil(result.meta.total / result.meta.limit));
  return <div className="mx-auto max-w-5xl space-y-5">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><h1 className="text-2xl font-semibold">Contratos de alquiler</h1>
        <p className="text-sm text-muted-foreground">Registro administrativo. {result.meta.total} en total.</p></div>
      <Link href="/alquileres/contratos/nuevo" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Nuevo borrador</Link>
    </div>
    {result.data.length ? <ul className="divide-y rounded-xl border">{result.data.map((contract) =>
      <li key={contract.id} className="flex flex-wrap justify-between gap-2 p-4">
        <div><Link href={`/alquileres/contratos/${contract.id}`} className="font-medium hover:underline">{contract.property.titulo}</Link>
          <p className="text-sm text-muted-foreground">{contract.owner.nombre} · {contract.tenantPerson.nombre} · {contractDate(contract.startDate)} al {contractDate(contract.endDate)}</p></div>
        <span className="text-sm capitalize">{contract.status}</span>
      </li>)}</ul> : <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Todavía no hay contratos registrados.</p>}
    {pages > 1 && <nav aria-label="Páginas de contratos" className="flex justify-center gap-4 text-sm">
      {page > 1 && <Link href={`?page=${page - 1}`}>Anterior</Link>}
      <span>Página {page} de {pages}</span>
      {page < pages && <Link href={`?page=${page + 1}`}>Siguiente</Link>}
    </nav>}
  </div>;
}
