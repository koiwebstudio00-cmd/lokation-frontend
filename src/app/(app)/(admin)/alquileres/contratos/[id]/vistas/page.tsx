import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { contractAmount, contractDate, type RentalContract } from "@/lib/rental-contracts";
import type { MaintenanceRequest } from "@/lib/maintenance";
import type { RentalCharge } from "@/components/rentals/charges";
import type { RentalServiceAccount } from "@/components/rentals/service-account-form";
import { SettlementPreview } from "@/components/rentals/settlement-preview";

export const metadata = { title: "Vistas de alquiler — Lokation" };

type Role = "inquilino" | "propietario";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="space-y-3 rounded-xl border p-5"><h2 className="font-semibold">{title}</h2>{children}</section>;
}

export default async function RentalViewsPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ rol?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const role: Role = query.rol === "propietario" ? "propietario" : "inquilino";
  let contract: RentalContract;
  try {
    ({ contract } = await apiFetch<{ contract: RentalContract }>(`/v1/rental-contracts/${id}`));
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const [servicesResult, chargesResult, maintenanceResult] = await Promise.all([
    apiFetch<{ data: RentalServiceAccount[] }>(`/v1/rental-properties/${contract.property.id}/services`),
    apiFetch<{ data: RentalCharge[]; meta: { total: number; limit: number } }>(`/v1/rental-contracts/${id}/charges`),
    apiFetch<{ data: MaintenanceRequest[]; meta: { total: number; limit: number } }>(
      "/v1/maintenance-requests", { query: { property_id: contract.property.id, limit: 100 } }
    ),
  ]);
  const services = servicesResult.data.filter((item) => item.active && (item.visibility === "ambos" || item.visibility === role));
  const maintenance = maintenanceResult.data.filter((item) => role === "propietario" || item.contractId === id);
  const charges = chargesResult.data;
  const isTenant = role === "inquilino";

  return <div className="mx-auto max-w-4xl space-y-5">
    <Link href={`/alquileres/contratos/${id}`} className="text-sm underline">← Volver al contrato</Link>
    <header className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Vista previa para la inmobiliaria</p>
      <h1 className="text-2xl font-semibold">{isTenant ? "Panel del inquilino" : "Panel del propietario"}</h1>
      <p className="text-sm text-muted-foreground">Así se organizaría la información de {contract.property.titulo}. El acceso directo para inquilinos y propietarios todavía no está habilitado.</p>
    </header>
    <nav aria-label="Elegir vista previa" className="flex gap-2 text-sm">
      {(["inquilino", "propietario"] as const).map((item) => <Link key={item} href={`?rol=${item}`}
        aria-current={role === item ? "page" : undefined}
        className={`rounded-md border px-4 py-2 ${role === item ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
        {item === "inquilino" ? "Inquilino" : "Propietario"}</Link>)}
    </nav>

    <Section title="Propiedad y contrato">
      <dl className="grid gap-4 text-sm sm:grid-cols-2">
        <div><dt className="text-muted-foreground">Propiedad</dt><dd className="font-medium">{contract.property.titulo}</dd></div>
        <div><dt className="text-muted-foreground">Estado del contrato</dt><dd className="font-medium capitalize">{contract.status}</dd></div>
        <div><dt className="text-muted-foreground">Vigencia</dt><dd>{contractDate(contract.startDate)} al {contractDate(contract.endDate)}</dd></div>
        <div><dt className="text-muted-foreground">Alquiler mensual</dt><dd>{contract.currency} {contractAmount(contract.monthlyRent)}</dd></div>
        <div><dt className="text-muted-foreground">Vencimiento mensual</dt><dd>Día {contract.dueDay}</dd></div>
        <div><dt className="text-muted-foreground">{isTenant ? "Propietario" : "Inquilino"}</dt><dd>{isTenant ? contract.owner.nombre : contract.tenantPerson.nombre}</dd></div>
      </dl>
    </Section>

    <Section title={isTenant ? "Alquileres y pagos" : "Cobros registrados"}>
      {charges.length ? <ul className="divide-y text-sm">{charges.map((charge) => <li key={charge.id} className="space-y-1 py-3 first:pt-0 last:pb-0">
        <div className="flex flex-wrap justify-between gap-2"><strong>Período {contractDate(charge.period)}</strong><span>Vence {contractDate(charge.dueDate)}</span></div>
        <p>Alquiler {charge.currency} {contractAmount(charge.amount)} · cobrado {charge.currency} {contractAmount(charge.paid)} · pendiente {charge.currency} {contractAmount(charge.balance)}</p>
        {isTenant && charge.payments.filter((payment) => !payment.voidedAt).map((payment) => <p key={payment.id} className="text-muted-foreground">Pago informado: {contractDate(payment.paidAt)} · {payment.method} · {charge.currency} {contractAmount(payment.amount)}</p>)}
      </li>)}</ul> : <p className="text-sm text-muted-foreground">Todavía no hay cargos registrados.</p>}
      {chargesResult.meta.total > chargesResult.meta.limit && <p className="text-xs text-muted-foreground">Se muestran los últimos {chargesResult.meta.limit} períodos. El historial completo está en la administración del contrato.</p>}
      <p className="text-xs text-muted-foreground">Los cobros son registros de la inmobiliaria y pueden requerir conciliación bancaria.</p>
    </Section>

    <Section title="Servicios de la propiedad">
      {services.length ? <ul className="grid gap-3 text-sm sm:grid-cols-2">{services.map((item) => <li key={item.id} className="rounded-lg border p-3">
        <strong className="capitalize">{item.type} · {item.provider}</strong>
        {item.accountNumber && <p>Cuenta: {item.accountNumber}</p>}
        {item.meterNumber && <p>Medidor: {item.meterNumber}</p>}
      </li>)}</ul> : <p className="text-sm text-muted-foreground">No hay servicios visibles para este perfil.</p>}
    </Section>

    <Section title="Mantenimiento y reparaciones">
      {maintenance.length ? <ul className="divide-y text-sm">{maintenance.map((item) => <li key={item.id} className="flex flex-wrap justify-between gap-2 py-3 first:pt-0 last:pb-0">
        <span className="font-medium">{item.title}</span><span className="capitalize">{item.status.replace("_", " ")}</span>
      </li>)}</ul> : <p className="text-sm text-muted-foreground">No hay pedidos de mantenimiento para mostrar.</p>}
      {maintenanceResult.meta.total > maintenanceResult.meta.limit && <p className="text-xs text-muted-foreground">Se muestran los pedidos más recientes de la propiedad.</p>}
    </Section>

    {!isTenant && <div className="space-y-2"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Herramienta interna de la inmobiliaria</p>
      <SettlementPreview periods={charges.map((charge) => ({ id: charge.id, period: charge.period, paid: charge.paid, currency: charge.currency }))} />
    </div>}
  </div>;
}
