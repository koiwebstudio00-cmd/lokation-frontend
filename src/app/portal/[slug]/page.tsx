import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, Building2, FileText, MessageSquare, ShieldCheck } from "lucide-react";
import { ApiError } from "@/lib/api";
import { portalOverview } from "@/lib/rental-portal";
import { contractAmount, contractDate } from "@/lib/rental-contracts";
import { PortalWorkspace } from "@/components/rentals/portal-workspace";

export const metadata = { title: "Mi portal de alquileres — Lokation" };
export default async function PortalHomePage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ vista?: string }> }) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  let overview;
  try { overview = await portalOverview(slug); }
  catch (error) { if (error instanceof ApiError && error.status === 401) redirect(`/portal/${slug}/ingresar`); throw error; }
  const { details } = overview;
  const roles = [...new Set(details.map((d) => d.role))];
  const roleLabel = roles.length === 1 ? (roles[0] === "inquilino" ? "inquilino" : "propietario") : "cliente";
  const metrics = [
    { label: "Contratos vigentes", value: details.filter((d) => d.contract.status === "vigente").length, icon: Building2 },
    { label: "Documentos disponibles", value: details.reduce((n, d) => n + d.documents.length, 0), icon: FileText },
    { label: "Consultas en seguimiento", value: details.reduce((n, d) => n + d.inquiries.filter((i) => i.status !== "resuelta" && i.status !== "cerrada").length, 0), icon: MessageSquare },
  ];
  return <PortalWorkspace slug={slug}><div className="space-y-8">
    <header className="rounded-2xl border bg-background p-6 shadow-sm sm:p-8"><div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium"><ShieldCheck className="size-4" />Tu espacio de {roleLabel}</div>
      <h1 className="text-3xl font-semibold tracking-tight">{query.vista === "contratos" ? "Mis contratos" : "Todo sobre tus alquileres"}</h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Consultá tus propiedades, seguí el estado de cada contrato y mantené el contacto con tu inmobiliaria.</p></header>
    {query.vista !== "contratos" && <div className="grid gap-4 sm:grid-cols-3">{metrics.map((metric) => <section key={metric.label} className="rounded-2xl border bg-background p-5"><metric.icon className="mb-4 size-5 text-primary" aria-hidden="true" /><p className="text-3xl font-semibold">{metric.value}</p><h2 className="mt-1 text-sm text-muted-foreground">{metric.label}</h2></section>)}</div>}
    <section><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">Tus propiedades y contratos</h2><span className="text-xs text-muted-foreground">{details.length} en total</span></div>
      {details.length ? <ul className="grid gap-4 md:grid-cols-2">{details.map(({ contract, role }) => <li key={contract.id}><Link href={`/portal/${slug}/contratos/${contract.id}`} className="group block h-full rounded-2xl border bg-background p-6 shadow-sm transition hover:border-primary hover:shadow-md">
        <div className="mb-5 flex items-center justify-between"><Building2 className="size-9 rounded-lg bg-primary/10 p-2 text-primary" aria-hidden="true" /><span className="rounded-full bg-muted px-3 py-1 text-xs capitalize">{contract.status}</span></div>
        <p className="text-xs font-medium text-muted-foreground">Tu rol: {role === "inquilino" ? "Inquilino" : "Propietario"}</p><h3 className="mt-1 text-lg font-semibold">{contract.property.titulo}</h3>
        <p className="mt-3 text-xs text-muted-foreground">{contractDate(contract.startDate)} — {contractDate(contract.endDate)}</p>
        <div className="mt-5 flex items-end justify-between border-t pt-4"><div><p className="text-xs text-muted-foreground">Alquiler inicial mensual</p><p className="mt-1 font-semibold">{contract.currency} {contractAmount(contract.monthlyRent)}</p></div><ArrowUpRight className="size-5 text-primary" aria-hidden="true" /></div>
      </Link></li>)}</ul> : <p className="rounded-xl border bg-background p-6 text-sm text-muted-foreground">No hay contratos habilitados para esta cuenta. Consultá con tu inmobiliaria para vincularlos.</p>}
    </section>
  </div></PortalWorkspace>;
}
