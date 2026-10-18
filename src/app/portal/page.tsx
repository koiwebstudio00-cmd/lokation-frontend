import Link from "next/link";
import { redirect } from "next/navigation";
import { portalBrand } from "@/lib/rental-portal";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata = { title: "Acceso de inquilinos y propietarios — Lokation" };

export default async function PortalEntry({ searchParams }: {
  searchParams: Promise<{ inmobiliaria?: string }>
}) {
  const query = await searchParams;
  const slug = typeof query.inmobiliaria === "string" ? query.inmobiliaria.trim().toLowerCase() : "";
  let error = "";
  if (query.inmobiliaria !== undefined) {
    try { await portalBrand(slug); }
    catch (cause) {
      error = cause instanceof ApiError && cause.status === 404
        ? "No encontramos ese portal. Revisá el identificador con tu inmobiliaria."
        : "No pudimos consultar el portal. Intentá nuevamente.";
    }
    if (!error) redirect(`/portal/${slug}/ingresar`);
  }
  return <main className="flex min-h-screen items-center justify-center bg-secondary p-6">
    <section className="w-full max-w-md space-y-5 rounded-xl border bg-background p-6">
      <p className="font-semibold">Lokation</p>
      <h1 className="text-2xl font-semibold">Portal de alquileres</h1>
      <p className="text-sm text-muted-foreground">Acceso para inquilinos y propietarios. Usá el enlace de tu invitación o ingresá el identificador que te dio tu inmobiliaria.</p>
      <form action="/portal" method="get" className="space-y-3">
        <Label htmlFor="inmobiliaria">Identificador de la inmobiliaria</Label>
        <Input id="inmobiliaria" name="inmobiliaria" defaultValue={slug} required maxLength={49} placeholder="Ej.: demo-a" autoCapitalize="none" />
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full">Ir a mi portal</Button>
      </form>
      <Link href="/login" className="text-sm underline">Soy administrador o agente</Link>
    </section>
  </main>;
}
