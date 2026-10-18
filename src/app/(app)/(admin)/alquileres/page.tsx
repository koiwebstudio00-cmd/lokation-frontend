import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { contractAmount, contractDate } from "@/lib/rental-contracts";

export const metadata = { title: "Alquileres — Lokation" };

type Overview = {
  contracts: Record<string, number>;
  expiring: { id: string; endDate: string; property: { titulo: string } }[];
  open_maintenance: number;
  balances: { currency: string; balance: string; overdue: string }[];
};

export default async function RentalsOverviewPage() {
  const overview = await apiFetch<Overview>("/v1/rental-overview");
  return <div className="mx-auto max-w-5xl space-y-6">
    <div><h1 className="text-2xl font-semibold">Alquileres</h1><p className="text-sm text-muted-foreground">Estado administrativo de la cartera.</p></div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Link href="/alquileres/contratos" className="rounded-xl border p-5"><strong className="block text-2xl">{overview.contracts.vigente ?? 0}</strong><span className="text-sm">Contratos vigentes</span></Link>
      <Link href="/alquileres/contratos" className="rounded-xl border p-5"><strong className="block text-2xl">{overview.contracts.borrador ?? 0}</strong><span className="text-sm">Borradores</span></Link>
      <Link href="/alquileres/mantenimiento" className="rounded-xl border p-5"><strong className="block text-2xl">{overview.open_maintenance}</strong><span className="text-sm">Pedidos de mantenimiento abiertos</span></Link>
      <div className="rounded-xl border p-5"><strong className="block text-2xl">{overview.expiring.length}</strong><span className="text-sm">Vencen en 30 días (máx. 10 mostrados)</span></div>
    </div>
    <section className="rounded-xl border p-5"><h2 className="font-semibold">Saldos de cargos registrados</h2>
      <p className="mt-1 text-sm text-muted-foreground">Se calculan con cobros manuales no revertidos; pueden requerir conciliación bancaria.</p>
      {overview.balances.length ? <ul className="mt-3 space-y-2">{overview.balances.map((row) => <li key={row.currency} className="text-sm">
        {row.currency}: pendiente {contractAmount(row.balance)} · vencido {contractAmount(row.overdue)}
      </li>)}</ul> : <p className="mt-3 text-sm">No hay cargos registrados.</p>}
    </section>
    <section className="rounded-xl border p-5"><h2 className="font-semibold">Próximos vencimientos de contrato</h2>
      {overview.expiring.length ? <ul className="mt-3 space-y-2 text-sm">{overview.expiring.map((item) => <li key={item.id}>
        <Link href={`/alquileres/contratos/${item.id}`} className="underline">{item.property.titulo}</Link> · {contractDate(item.endDate)}
      </li>)}</ul> : <p className="mt-3 text-sm text-muted-foreground">No hay contratos que venzan en los próximos 30 días.</p>}
    </section>
    <nav className="flex flex-wrap gap-4 text-sm"><Link href="/alquileres/contratos" className="underline">Ver contratos</Link>
      <Link href="/clientes" className="underline">Ver clientes</Link>
      <Link href="/alquileres/mantenimiento" className="underline">Ver mantenimiento</Link></nav>
  </div>;
}
