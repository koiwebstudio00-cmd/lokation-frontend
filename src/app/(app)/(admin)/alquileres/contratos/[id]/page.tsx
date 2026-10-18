import Link from "next/link";
import { randomUUID } from "node:crypto";
import { notFound } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { contractAmount, contractDate, type RentalContract } from "@/lib/rental-contracts";
import { formatDate } from "@/lib/utils";
import { ContractTransition } from "@/components/rentals/contract-transition";
import { ServiceAccounts, type RentalServiceAccount } from "@/components/rentals/service-account-form";
import { RentalCharges, type RentalCharge } from "@/components/rentals/charges";
import { RentalFinancials, type RentalAdjustment, type RentalSettlement } from "@/components/rentals/financials";
import { RentalDocuments, type RentalDocument } from "@/components/rentals/documents";

export const metadata = { title: "Contrato de alquiler — Lokation" };

export default async function ContractPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let contract: RentalContract;
  try {
    ({ contract } = await apiFetch<{ contract: RentalContract }>(`/v1/rental-contracts/${id}`));
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  const [services, charges, adjustments, settlements, documents] = await Promise.all([
    apiFetch<{ data: RentalServiceAccount[] }>(`/v1/rental-properties/${contract.property.id}/services`),
    apiFetch<{ data: RentalCharge[] }>(`/v1/rental-contracts/${id}/charges`),
    apiFetch<{ data: RentalAdjustment[] }>(`/v1/rental-contracts/${id}/adjustments`),
    apiFetch<{ data: RentalSettlement[] }>(`/v1/rental-contracts/${id}/settlements`),
    apiFetch<{ data: RentalDocument[] }>(`/v1/rental-contracts/${id}/documents`)
  ]);
  return <div className="mx-auto max-w-3xl space-y-5">
    <Link href="/alquileres/contratos" className="text-sm underline">← Contratos</Link>
    <div className="flex flex-wrap justify-between gap-3"><div><h1 className="text-2xl font-semibold">{contract.property.titulo}</h1>
      <p className="text-sm text-muted-foreground">Estado: {contract.status} · creado el {formatDate(contract.createdAt)}</p></div>
      {contract.status === "borrador" && <Link href={`/alquileres/contratos/${id}/editar`} className="text-sm underline">Editar borrador</Link>}</div>
    <dl className="grid gap-4 rounded-xl border p-5 sm:grid-cols-2">
      <div><dt className="text-sm text-muted-foreground">Propietario</dt><dd><Link className="underline" href={`/clientes/${contract.owner.id}`}>{contract.owner.nombre}</Link></dd></div>
      <div><dt className="text-sm text-muted-foreground">Inquilino</dt><dd><Link className="underline" href={`/clientes/${contract.tenantPerson.id}`}>{contract.tenantPerson.nombre}</Link></dd></div>
      <div><dt className="text-sm text-muted-foreground">Vigencia prevista</dt><dd>{contractDate(contract.startDate)} al {contractDate(contract.endDate)}</dd></div>
      <div><dt className="text-sm text-muted-foreground">Importe mensual</dt><dd>{contract.currency} {contractAmount(contract.monthlyRent)}</dd></div>
      <div><dt className="text-sm text-muted-foreground">Día de vencimiento</dt><dd>{contract.dueDay}</dd></div>
      <div><dt className="text-sm text-muted-foreground">Estado</dt><dd className="capitalize">{contract.status}</dd></div>
    </dl>
    <nav aria-label="Vistas previas del contrato" className="flex flex-wrap gap-3 text-sm">
      <Link href={`/alquileres/contratos/${id}/vistas?rol=inquilino`} className="rounded-md border px-3 py-2 hover:bg-muted">Vista de inquilino</Link>
      <Link href={`/alquileres/contratos/${id}/vistas?rol=propietario`} className="rounded-md border px-3 py-2 hover:bg-muted">Vista de propietario</Link>
    </nav>
    {contract.status === "borrador" && <ContractTransition id={id} transition="activate" />}
    {contract.status === "vigente" && <ContractTransition id={id} transition="finish" />}
    <ServiceAccounts propertyId={contract.property.id} contractId={id} accounts={services.data} />
    <RentalCharges contractId={id} status={contract.status} charges={charges.data}
      settledChargeIds={settlements.data.filter((item) => item.status !== "cancelada").map((item) => item.chargeId)}
      paymentKeys={Object.fromEntries(charges.data.map((charge) => [charge.id, randomUUID()]))} />
    <RentalFinancials contractId={id} status={contract.status} adjustments={adjustments.data}
      charges={charges.data} settlements={settlements.data} />
    <RentalDocuments contractId={id} documents={documents.data} />
    <Link href={`/alquileres/mantenimiento?property_id=${contract.property.id}&contract_id=${id}`} className="inline-block text-sm underline">Ver o registrar mantenimiento de esta propiedad</Link>
    {!!contract.events?.length && <section className="rounded-xl border p-5"><h2 className="font-semibold">Historial</h2>
      <ul className="mt-3 space-y-2 text-sm">{contract.events.map((event) => <li key={event.id}>
        {event.action === "edited" ? "Borrador editado" : event.action === "activated" ? "Marcado vigente" : "Finalizado"}
        {event.details.note ? ` · ${event.details.note}` : ""} · {formatDate(event.createdAt)}
      </li>)}</ul></section>}
    <p className="text-sm text-muted-foreground">Lokation registra el estado administrativo y los cobros informados por la inmobiliaria. No firma documentos ni realiza cobros bancarios o transferencias al propietario.</p>
  </div>;
}
