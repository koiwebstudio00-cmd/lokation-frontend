import Link from "next/link";
import { PortalLoginForm } from "@/components/rentals/portal-forms";

export const metadata = { title: "Ingresar al portal de alquileres — Lokation" };
export default async function PortalLoginPage({ params, searchParams }: {
  params: Promise<{ slug: string }>; searchParams: Promise<{ activado?: string; clave?: string }>
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  return <div className="mx-auto max-w-md space-y-5 rounded-xl border bg-background p-6">
    <h1 className="text-2xl font-semibold">Ingresar</h1>
    {query.activado && <p role="status" className="text-sm">Acceso activado. Ya podés iniciar sesión.</p>}
    {query.clave && <p role="status" className="text-sm">Contraseña actualizada. Ingresá con la nueva.</p>}
    <PortalLoginForm slug={slug} />
    <Link href={`/portal/${slug}/recuperar`} className="text-sm underline">Olvidé mi contraseña</Link>
    <p className="text-sm text-muted-foreground">¿Todavía no tenés acceso? Solicitá una invitación a tu inmobiliaria.</p>
    <Link href={`/portal/${slug}`} className="text-sm underline">Volver al portal</Link>
  </div>;
}
