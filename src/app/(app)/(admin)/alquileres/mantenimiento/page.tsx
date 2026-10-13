import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { getRentalContractOptions } from "@/lib/rental-contract-options";
import type { MaintenanceRequest } from "@/lib/maintenance";
import { MaintenanceCreateForm } from "@/components/rentals/maintenance-forms";

export const metadata = { title: "Mantenimiento — Lokation" };

export default async function MaintenancePage({ searchParams }: {
  searchParams: Promise<{ property_id?: string; contract_id?: string; page?: string }>
}) {
  const params = await searchParams;
  const options = await getRentalContractOptions();
  const page = Math.max(1, Number(params.page) || 1);
  const validProperty = options.properties.some((p) => p.id === params.property_id) ? params.property_id : undefined;
  const result = await apiFetch<{ data: MaintenanceRequest[]; meta: { total: number; limit: number } }>(
    "/v1/maintenance-requests", { query: { page, property_id: validProperty } }
  );
  return <div className="mx-auto max-w-4xl space-y-5">
    <div><h1 className="text-2xl font-semibold">Mantenimiento</h1>
      <p className="text-sm text-muted-foreground">Pedidos, prioridades y estado de las reparaciones. {result.meta.total} en esta vista.</p></div>
    <MaintenanceCreateForm properties={options.properties} propertyId={validProperty}
      contractId={validProperty ? params.contract_id : undefined} />
    {options.truncated && <p className="text-sm text-muted-foreground">La lista de propiedades muestra las primeras 100; abrí la ficha del contrato para acceder a una propiedad posterior.</p>}
    <ul className="divide-y rounded-xl border">{result.data.map((item) => <li key={item.id} className="flex flex-wrap justify-between gap-2 p-4">
      <div><Link className="font-medium underline" href={`/alquileres/mantenimiento/${item.id}`}>{item.title}</Link>
        <p className="text-sm text-muted-foreground">{item.property.titulo} · Prioridad {item.priority}</p></div>
      <span className="text-sm capitalize">{item.status.replace("_", " ")}</span>
    </li>)}</ul>
    {!result.data.length && <p className="text-sm text-muted-foreground">No hay pedidos en esta vista.</p>}
    {result.meta.total > result.meta.limit && <nav className="flex gap-4 text-sm" aria-label="Páginas de mantenimiento">
      {page > 1 && <Link href={`?page=${page - 1}`}>Anterior</Link>}
      <span>Página {page}</span>
      {page * result.meta.limit < result.meta.total && <Link href={`?page=${page + 1}`}>Siguiente</Link>}
    </nav>}
  </div>;
}
