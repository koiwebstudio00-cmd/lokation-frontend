import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { getApiKeys } from "@/lib/queries";
import { SiteForm, type SiteData } from "@/components/site/site-form";
import { WebsiteMode } from "@/components/site/website-mode";
import { ApiKeyForm } from "@/components/settings/api-key-form";
import { RevokeApiKeyButton } from "@/components/settings/revoke-api-key-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Mi sitio web — Lokation" };
export default async function MiSitioPage({ searchParams }: { searchParams: Promise<{ elegir?: string }> }) {
  const [{ tenant }, query] = await Promise.all([apiFetch<{ tenant: SiteData }>("/v1/tenants/current"), searchParams]);
  const mode = tenant.configSitio?.website_mode ?? (tenant.sitePublished ? "managed" : undefined);
  const choose = !mode || query.elegir === "1";
  const base = process.env.NEXT_PUBLIC_PUBLIC_SITE_URL ?? "http://localhost:3002";
  const api = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001").replace(/\/$/, "");
  const url = `${base.replace(/\/$/, "")}/s/${tenant.slug}`;
  const keys = !choose && mode === "custom" ? (await getApiKeys()).filter(key => key.scopes.includes("export:read")) : [];
  return <div className="mx-auto max-w-5xl space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-semibold">Mi sitio web</h1><p className="text-sm text-muted-foreground">{choose ? "Elegí cómo querés presentar tu inmobiliaria en Internet." : mode === "custom" ? "Conectá tu web a los datos de tu inmobiliaria." : "Completá tu presentación y publicala cuando esté lista."}</p></div>{!choose && <Button variant="outline" asChild><Link href="/mi-sitio?elegir=1">Cambiar opción</Link></Button>}</div>
    <div className="rounded-xl border bg-muted/30 p-4 text-sm"><Link href="/mi-sitio/api" className="font-medium text-primary underline underline-offset-4">Guía de integración de la API de Lokation</Link><p className="mt-1 text-muted-foreground">Ejemplos para mostrar propiedades en tu web y recibir consultas generales o por propiedad en el panel.</p></div>
    {choose ? <WebsiteMode /> : mode === "managed" ? <>
      <div className="rounded-xl border bg-muted/30 p-4 text-sm"><p>Estado: <strong>{tenant.sitePublished ? "Publicado" : "Borrador"}</strong></p><p className="mt-1 break-all">Dirección: {tenant.sitePublished ? <Link className="underline" href={url} target="_blank">{url}</Link> : url}</p>{tenant.sitePublished && <p className="mt-1"><a className="underline" href={`${api}/v1/public/sites/${tenant.slug}/export`}>Descargar catálogo JSON</a></p>}<p className="mt-2 text-muted-foreground">Tus propiedades disponibles aparecerán automáticamente.</p></div>
      <SiteForm site={tenant} />
    </> : <>
      {tenant.sitePublished && <p className="rounded-xl border bg-muted p-4 text-sm">Tu sitio de Lokation sigue publicado. Para retirarlo, cambiá a “Crear mi web con Lokation” y seleccioná “Retirar sitio”.</p>}
      <div className="grid min-w-0 gap-5 lg:grid-cols-2">
        <Card className="min-w-0"><CardHeader><CardTitle>1. Crear clave de conexión</CardTitle></CardHeader><CardContent><ApiKeyForm websiteOnly scopes={[{ scope: "export:read", label: "Leer información pública y catálogo de esta inmobiliaria" }]} /></CardContent></Card>
        <Card className="min-w-0"><CardHeader><CardTitle>2. Conectar desde tu servidor</CardTitle></CardHeader><CardContent className="space-y-4 text-sm"><p>Tu desarrollador debe guardar la clave como secreto en el servidor de tu web y enviarla en el encabezado <code>X-Api-Key</code>.</p><p>No necesitás publicar un sitio en Lokation para usar esta integración. La clave sólo permite leer datos de tu inmobiliaria.</p><div className="space-y-2 rounded-lg bg-muted p-3 font-mono text-xs break-all"><p>GET {api}/v1/export/site</p><p>GET {api}/v1/export/properties?page=1&amp;limit=24</p><p>GET {api}/v1/export/properties/SLUG</p></div><p>Consultá las páginas sucesivas del catálogo para obtener todas las propiedades. Nunca publiques la clave en el navegador.</p></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle>Claves con acceso al catálogo</CardTitle></CardHeader><CardContent className="space-y-3">{keys.length ? keys.map(key => <div key={key.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"><div className="min-w-0"><p className="break-words font-medium">{key.nombre}</p><p className="font-mono text-xs text-muted-foreground">{key.prefix}…</p><p className="text-xs text-muted-foreground">{key.scopes.join(", ")}</p></div><RevokeApiKeyButton id={key.id} nombre={key.nombre} /></div>) : <p className="text-sm text-muted-foreground">Todavía no creaste una clave para tu web.</p>}</CardContent></Card>
      <details className="rounded-xl border bg-background p-4"><summary className="cursor-pointer font-semibold">Información para tu web (opcional)</summary><p className="my-3 text-sm text-muted-foreground">Completá estos datos sólo si tu web los consulta desde la API. No son necesarios para mostrar propiedades ni recibir consultas.</p><SiteForm site={tenant} custom /></details>
    </>}
  </div>;
}
