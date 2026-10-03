"use client";

import { useActionState } from "react";
import { saveSite, type SiteState } from "@/actions/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface SiteData {
  nombre: string;
  slug: string;
  logoUrl: string | null;
  sitePublished: boolean;
  configSitio: {
    descripcion?: string; telefono?: string; email?: string;
    direccion?: string; ciudad?: string; imagen_portada_url?: string;
    website_mode?: "managed" | "custom";
    lema?: string; color_primario?: string;
  } | null;
}

export function SiteForm({ site, custom = false }: { site: SiteData; custom?: boolean }) {
  const [state, action, pending] = useActionState<SiteState, FormData>(saveSite, {});
  const config = site.configSitio ?? {};
  return (
    <form action={action} className="rounded-xl space-y-5 border bg-background p-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2"><Label htmlFor="site-name">Nombre de la inmobiliaria</Label>
          <Input id="site-name" name="nombre" defaultValue={site.nombre} maxLength={120} required /></div>
        <div className="space-y-2"><Label htmlFor="site-city">Ciudad</Label>
          <Input id="site-city" name="ciudad" defaultValue={config.ciudad ?? ""} maxLength={100} /></div>
      </div>
      <div className="grid gap-5 md:grid-cols-[1fr_auto]">
        <div className="space-y-2"><Label htmlFor="site-tagline">Lema de portada</Label>
          <Input id="site-tagline" name="lema" defaultValue={config.lema ?? ""} maxLength={100}
            placeholder="Encontrá tu próximo lugar" />
          <p className="text-xs text-muted-foreground">Una frase breve que aparece sobre la presentación.</p></div>
        <div className="space-y-2"><Label htmlFor="site-color">Color principal</Label>
          <Input id="site-color" name="color_primario" type="color"
            defaultValue={config.color_primario ?? "#1b5148"} className="h-10 w-24 p-1" /></div>
      </div>
      <div className="space-y-2"><Label htmlFor="site-description">Descripción pública</Label>
        <Textarea id="site-description" name="descripcion" defaultValue={config.descripcion ?? ""}
          minLength={30} maxLength={500} rows={4} required
          placeholder="Contá qué hace tu inmobiliaria y en qué zonas trabaja." />
        <p className="text-xs text-muted-foreground">Aparece en la portada y en el resumen para buscadores.</p></div>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2"><Label htmlFor="site-phone">Teléfono</Label>
          <Input id="site-phone" name="telefono" defaultValue={config.telefono ?? ""} maxLength={40} /></div>
        <div className="space-y-2"><Label htmlFor="site-email">Email de contacto</Label>
          <Input id="site-email" name="email" type="email" defaultValue={config.email ?? ""} /></div>
      </div>
      <div className="space-y-2"><Label htmlFor="site-address">Dirección</Label>
        <Input id="site-address" name="direccion" defaultValue={config.direccion ?? ""} maxLength={200} /></div>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2"><Label htmlFor="site-logo">URL del logo</Label>
          <Input id="site-logo" name="logo_url" type="url" defaultValue={site.logoUrl ?? ""} /></div>
        <div className="space-y-2"><Label htmlFor="site-cover">URL de la imagen de portada</Label>
          <Input id="site-cover" name="imagen_portada_url" type="url"
            defaultValue={config.imagen_portada_url ?? ""} /></div>
      </div>
      {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
      {state.success && <p role="status" className="text-sm text-emerald-700">{state.success}</p>}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" name="intent" value="save" disabled={pending}>{custom ? "Guardar información" : "Guardar borrador"}</Button>
        {!custom && <Button type="submit" name="intent" value={site.sitePublished ? "unpublish" : "publish"}
          variant={site.sitePublished ? "outline" : "default"} disabled={pending}>
          {site.sitePublished ? "Retirar sitio" : "Publicar sitio"}
        </Button>}
      </div>
    </form>
  );
}
