import Link from "next/link";
import { redirect } from "next/navigation";
import { UserRound, ShieldCheck } from "lucide-react";
import { ApiError } from "@/lib/api";
import { portalOverview } from "@/lib/rental-portal";
import { PortalWorkspace } from "@/components/rentals/portal-workspace";

export const metadata = { title: "Mi cuenta — Portal de alquileres" };
export default async function AccountPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let overview;
  try { overview = await portalOverview(slug); }
  catch (error) { if (error instanceof ApiError && error.status === 401) redirect(`/portal/${slug}/ingresar`); throw error; }
  const profiles = [...new Set(overview.details.map((d) => `${d.role === "inquilino" ? d.contract.tenantPerson.nombre : d.contract.owner.nombre} · ${d.role}`))];
  return <PortalWorkspace slug={slug}><div className="max-w-2xl space-y-6"><header><p className="text-sm text-muted-foreground">Tu acceso personal</p><h1 className="mt-1 text-3xl font-semibold">Mi cuenta</h1></header>
    <section className="space-y-5 rounded-2xl border bg-background p-6"><UserRound className="size-12 rounded-xl bg-primary/10 p-3 text-primary" /><h2 className="font-semibold">Datos de tu cuenta</h2><dl className="space-y-4 text-sm"><div><dt className="text-muted-foreground">Correo de acceso</dt><dd className="mt-1 break-all font-medium">{overview.email}</dd></div><div><dt className="text-muted-foreground">Perfiles vinculados a tus contratos</dt><dd className="mt-1 space-y-1">{profiles.length ? profiles.map((p) => <p key={p} className="capitalize">{p}</p>) : "Sin contratos vinculados"}</dd></div></dl><p className="border-t pt-4 text-xs leading-5 text-muted-foreground">Para corregir tus datos o los vínculos de tus contratos, contactá a tu inmobiliaria.</p></section>
    <section className="space-y-3 rounded-2xl border bg-background p-6"><ShieldCheck className="size-5 text-primary" /><h2 className="font-semibold">Seguridad</h2><p className="text-sm text-muted-foreground">Podés solicitar un enlace para restablecer tu contraseña.</p><Link href={`/portal/${slug}/recuperar`} className="inline-block rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">Restablecer contraseña</Link></section>
  </div></PortalWorkspace>;
}
