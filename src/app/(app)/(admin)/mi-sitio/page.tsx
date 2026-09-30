import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { SiteForm, type SiteData } from "@/components/site/site-form";

export const metadata = { title: "Mi sitio web — Ubikka" };

export default async function MiSitioPage() {
  const { tenant } = await apiFetch<{ tenant: SiteData }>("/v1/tenants/current");
  const base = process.env.NEXT_PUBLIC_PUBLIC_SITE_URL ?? "http://localhost:3002";
  const url = `${base.replace(/\/$/, "")}/s/${tenant.slug}`;
  return <div className="mx-auto max-w-5xl space-y-5">
    <div><h1 className="text-2xl font-semibold">Mi sitio web</h1>
      <p className="text-sm text-muted-foreground">Completá la presentación de tu inmobiliaria y publicala cuando esté lista.</p></div>
    <div className="border bg-muted/30 p-4 text-sm">
      <p>Estado: <strong>{tenant.sitePublished ? "Publicado" : "Borrador"}</strong></p>
      <p className="mt-1 break-all">Dirección: {tenant.sitePublished
        ? <Link className="underline" href={url} target="_blank">{url}</Link> : url}</p>
      {tenant.sitePublished && <p className="mt-1"><a className="underline" href={`${(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001").replace(/\/$/, "")}/v1/public/sites/${tenant.slug}/export`}>Descargar catálogo JSON</a></p>}
      <p className="mt-2 text-muted-foreground">Las propiedades disponibles que cargues en el dashboard aparecerán automáticamente.</p>
    </div>
    <SiteForm site={tenant} />
  </div>;
}
