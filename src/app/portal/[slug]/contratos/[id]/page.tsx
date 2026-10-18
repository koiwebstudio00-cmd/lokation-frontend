import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PortalInquiries } from "@/components/rentals/portal-inquiries";
import { ApiError } from "@/lib/api";
import { contractAmount, contractDate } from "@/lib/rental-contracts";
import { portalDetail, type PortalDetail } from "@/lib/rental-portal";

import { PortalWorkspace } from "@/components/rentals/portal-workspace";
const portalSections = ["resumen", "contrato", "pagos", "documentos", "servicios", "mantenimiento", "consultas"] as const;
import { Building2, FileText, MessageSquare, Wallet, Wrench } from "lucide-react";

export const metadata = { title: "Detalle del alquiler — Lokation" };
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="space-y-3 rounded-2xl border bg-background p-6 shadow-sm"><h2 className="text-lg font-semibold">{title}</h2>{children}</section>;
}
export default async function PortalContractPage({ params, searchParams }: { params: Promise<{ slug: string; id: string }>; searchParams: Promise<{ seccion?: string }> }) {
  const [{ slug, id }, query] = await Promise.all([params, searchParams]);
  const section = portalSections.find((s) => s === query.seccion) ?? "resumen";
  let detail: PortalDetail;
  try { detail = await portalDetail(slug, id); }
  catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect(`/portal/${slug}/ingresar`);
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  const { contract, role, charges, adjustments, settlements, services, maintenance, inquiries, documents } = detail;
  const sectionTitle = { resumen: "Resumen del alquiler", contrato: "Propiedad y contrato", pagos: role === "inquilino" ? "Cargos y pagos" : "Liquidaciones y cargos", documentos: "Documentos", servicios: "Servicios", mantenimiento: "Mantenimiento", consultas: "Consultas y reclamos" }[section];
  return <PortalWorkspace slug={slug}><div className="space-y-6">
    <Link href={`/portal/${slug}`} className="text-sm underline">← Mis alquileres</Link>
    <header className="rounded-2xl border bg-background p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap gap-2"><span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">{role === "inquilino" ? "Sos el inquilino" : "Sos el propietario"}</span><span className="rounded-full bg-muted px-3 py-1 text-xs capitalize">Contrato {contract.status}</span></div>
      <p className="text-sm text-muted-foreground">{contract.property.titulo}</p><h1 className="mt-1 text-2xl font-semibold tracking-tight">{sectionTitle}</h1>
      <p className="mt-3 text-xs text-muted-foreground">Vigencia: {contractDate(contract.startDate)} — {contractDate(contract.endDate)}</p>
    </header>
    {section === "resumen" && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[
      { title: role === "inquilino" ? "Cargos y pagos" : "Liquidaciones", value: role === "inquilino" ? charges.length : settlements.length, icon: Wallet, key: "pagos" },
      { title: "Documentos", value: documents.length, icon: FileText, key: "documentos" },
      { title: "Mantenimiento abierto", value: maintenance.filter((m) => ["abierta", "en_gestion"].includes(m.status)).length, icon: Wrench, key: "mantenimiento" },
      { title: "Consultas", value: inquiries.length, icon: MessageSquare, key: "consultas" },
    ].map((item) => <Link key={item.key} href={`?seccion=${item.key}`} className="rounded-2xl border bg-background p-5 transition hover:border-primary"><item.icon className="mb-4 size-5 text-primary" aria-hidden="true" /><p className="text-3xl font-semibold">{item.value}</p><p className="mt-1 text-xs text-muted-foreground">{item.title}</p></Link>)}</div>}
    {(section === "resumen" || section === "contrato") && <>
    <Section title="Propiedad y contrato"><dl className="grid gap-3 text-sm sm:grid-cols-2">
      <div><dt className="text-muted-foreground">Estado</dt><dd className="capitalize">{contract.status}</dd></div>
      <div><dt className="text-muted-foreground">Vigencia</dt><dd>{contractDate(contract.startDate)} al {contractDate(contract.endDate)}</dd></div>
      <div><dt className="text-muted-foreground">Alquiler inicial</dt><dd>{contract.currency} {contractAmount(contract.monthlyRent)}</dd></div>
      <div><dt className="text-muted-foreground">Vencimiento</dt><dd>Día {contract.dueDay}</dd></div>
      <div><dt className="text-muted-foreground">{role === "inquilino" ? "Propietario" : "Inquilino"}</dt>
        <dd>{role === "inquilino" ? contract.owner.nombre : contract.tenantPerson.nombre}</dd></div>
    </dl></Section>
    </>}
    {(section === "contrato" || section === "pagos") && <Section title="Ajustes de alquiler">
      {adjustments.length ? <ul className="space-y-2 text-sm">{adjustments.map((item) => <li key={item.id}>
        Desde {contractDate(item.effectivePeriod)} · {contract.currency} {contractAmount(item.amount)} · {item.reason}
      </li>)}</ul> : <p className="text-sm text-muted-foreground">Sin ajustes registrados.</p>}
    </Section>}
    {section === "pagos" && <><Section title={role === "inquilino" ? "Cargos y pagos informados" : "Cargos de alquiler"}>
      {charges.length ? <ul className="divide-y text-sm">{charges.map((item) => <li key={item.id} className="space-y-1 py-3 first:pt-0 last:pb-0">
        <strong>{contractDate(item.period)} · {item.currency} {contractAmount(item.amount)}</strong>
        <p>Vence {contractDate(item.dueDate)}</p>
        {role === "inquilino" && <p className="font-medium">Saldo registrado: {item.currency} {contractAmount(Math.max(0, Number(item.amount) - item.payments.reduce((sum, payment) => sum + Number(payment.amount), 0)).toFixed(2))}</p>}
        {role === "inquilino" && <div role="meter" aria-label={`Porcentaje pagado del cargo de ${contractDate(item.period)}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Number(item.amount) > 0 ? Math.min(100, Math.round(item.payments.reduce((sum, payment) => sum + Number(payment.amount), 0) / Number(item.amount) * 100)) : 0} className="my-3 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Number(item.amount) > 0 ? Math.min(100, item.payments.reduce((sum, payment) => sum + Number(payment.amount), 0) / Number(item.amount) * 100) : 0}%` }} /></div>}
        {role === "inquilino" && item.payments.map((payment, index) => <p key={`${item.id}-${index}`} className="text-muted-foreground">
          Pago informado {contractDate(payment.paidAt)} · {item.currency} {contractAmount(payment.amount)} · {payment.method}
        </p>)}
      </li>)}</ul> : <p className="text-sm text-muted-foreground">Todavía no hay cargos.</p>}
      {role === "inquilino" && <p className="text-xs text-muted-foreground">Los pagos mostrados son registros informados por la inmobiliaria.</p>}
    </Section>
    {role === "propietario" && <Section title="Liquidaciones al propietario">
      {settlements.length ? <ul className="space-y-2 text-sm">{settlements.map((item) => <li key={item.id} className="rounded-lg border p-3">
        <strong>{contractDate(item.charge.period)} · neto {item.currency} {contractAmount(item.net)}</strong>
        <p>Cobrado {contractAmount(item.gross)} · comisión {contractAmount(item.commission)} · gastos {contractAmount(item.expenses)}</p>
        <p>{item.status === "pagada" ? "Pagada" : "Preparada"}{item.paidAt ? ` · Pago informado ${contractDate(item.paidAt)}` : ""}</p>
      </li>)}</ul> : <p className="text-sm text-muted-foreground">Todavía no hay liquidaciones.</p>}
    </Section>}
    </>}
    {section === "documentos" && <Section title="Documentos">
      {documents.length ? <ul className="space-y-2 text-sm">{documents.map((item) => <li key={item.id}>
        <a className="underline" href={`/portal/${slug}/documentos/${item.id}/descargar`}>{item.title} · PDF</a>
      </li>)}</ul> : <p className="text-sm text-muted-foreground">No hay documentos compartidos.</p>}
    </Section>}
    {section === "servicios" && <Section title="Servicios">
      {services.length ? <ul className="grid gap-3 text-sm sm:grid-cols-2">{services.map((item) => <li key={item.id} className="rounded-lg border p-3">
        <strong className="capitalize">{item.type} · {item.provider}</strong>
        {item.accountNumber && <p>Cuenta: {item.accountNumber}</p>}{item.meterNumber && <p>Medidor: {item.meterNumber}</p>}
      </li>)}</ul> : <p className="text-sm text-muted-foreground">Sin servicios compartidos.</p>}
    </Section>}
    {section === "mantenimiento" && <Section title="Mantenimiento">
      {maintenance.length ? <ul className="space-y-2 text-sm">{maintenance.map((item) => <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
        {item.title}<span className="rounded-full bg-muted px-3 py-1 text-xs">{({ abierta: "Abierta", en_gestion: "En gestión", resuelta: "Resuelta", cancelada: "Cancelada" } as Record<string, string>)[item.status] ?? item.status}</span>
      </li>)}</ul> : <p className="text-sm text-muted-foreground">Sin pedidos de mantenimiento.</p>}
    </Section>}
    {section === "consultas" && <PortalInquiries slug={slug} contractId={id} propertyTitle={contract.property.titulo} active={contract.status === "vigente"} inquiries={inquiries} />}
    <p className="flex items-center gap-2 text-xs text-muted-foreground"><Building2 className="size-4 shrink-0" aria-hidden="true" />Información compartida por tu inmobiliaria para este contrato.</p>
  </div></PortalWorkspace>;
}
