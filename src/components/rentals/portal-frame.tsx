"use client";
import { usePathname } from "next/navigation";
import type { PortalBrand } from "@/lib/rental-portal";
import { PortalIdentity, portalTheme } from "./portal-shell";

export function PortalFrame({ brand, children }: { brand: PortalBrand; children: React.ReactNode }) {
  const path = usePathname();
  const authPage = /\/(ingresar|activar|recuperar|restablecer)$/.test(path);
  if (!authPage) return children;
  return <main style={portalTheme(brand)} className="min-h-dvh bg-secondary p-5">
    <header className="mx-auto max-w-md py-8"><PortalIdentity brand={brand} /></header>
    {children}
    <p className="mt-6 text-center text-xs text-muted-foreground">Acceso privado · Tecnología de Lokation</p>
  </main>;
}
