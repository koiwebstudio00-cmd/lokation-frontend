"use client";
import { useActionState } from "react";
import { Globe, Code2 } from "lucide-react";
import { chooseWebsiteMode, type SiteState } from "@/actions/site";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
export function WebsiteMode() {
  const [state, action, pending] = useActionState<SiteState, FormData>(chooseWebsiteMode, {});
  return <form action={action} className="space-y-4">
    <div className="grid gap-4 md:grid-cols-2">
      <Card><CardHeader><Globe className="mb-2 size-7 text-primary" /><CardTitle>Crear mi web con Lokation</CardTitle><CardDescription>Personalizá el sitio de tu inmobiliaria y publicá tu catálogo desde este panel.</CardDescription></CardHeader><CardContent className="space-y-4"><p className="text-sm text-muted-foreground">Logo, colores, presentación y propiedades actualizadas automáticamente. Sin desarrollo a medida.</p><Button name="mode" value="managed" disabled={pending} className="w-full">Crear mi sitio</Button></CardContent></Card>
      <Card><CardHeader><Code2 className="mb-2 size-7 text-primary" /><CardTitle>Conectar mi web propia</CardTitle><CardDescription>Conservá tu diseño y conectá tu web al catálogo de Lokation.</CardDescription></CardHeader><CardContent className="space-y-4"><p className="text-sm text-muted-foreground">Generá una API key de lectura para que tu desarrollador consulte los datos de la inmobiliaria y sus propiedades.</p><Button name="mode" value="custom" disabled={pending} variant="outline" className="w-full">Conectar mi web</Button></CardContent></Card>
    </div>
    <p className="text-sm text-muted-foreground">Podés cambiar de opción después. Tu inventario se conserva y un sitio ya publicado permanece activo hasta que lo retires.</p>
    {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
  </form>;
}
