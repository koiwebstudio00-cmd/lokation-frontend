"use client";

import Image from "next/image";
import Link from "next/link";
import { createContext, useContext, useState, type CSSProperties, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Building2, FileText, LayoutDashboard, MessageSquare, Receipt, Wallet, Wrench, Zap } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarGroup, SidebarGroupLabel, SidebarInset, SidebarProvider, SidebarRail, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { NavUser } from "@/components/nav/nav-user";
import { ThemeSwitcher } from "@/components/nav/theme-switcher";
import { Logo } from "@/components/logo";
import { portalLogout } from "@/actions/rental-portal";
import type { PortalBrand } from "@/lib/rental-portal";

export type PortalNavigationContract = { id: string; title: string; role: "inquilino" | "propietario"; status: string };
export const portalSections = ["resumen", "contrato", "pagos", "documentos", "servicios", "mantenimiento", "consultas"] as const;
export type PortalSection = typeof portalSections[number];

export function PortalIdentity({ brand }: { brand: PortalBrand }) {
  const [failed, setFailed] = useState<string | null>(null);
  return <div className="flex min-w-0 items-center gap-3">
    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-white p-2">
      {brand.logo_url && failed !== brand.logo_url ? <Image src={brand.logo_url} alt={`Logo de ${brand.nombre}`} width={36} height={36} unoptimized onError={() => setFailed(brand.logo_url)} className="max-h-9 object-contain" /> : <Logo className="size-7" />}
    </span>
    <div className="min-w-0"><p className="truncate text-sm font-semibold">{brand.nombre || "Lokation"}</p><p className="text-xs text-muted-foreground">Portal de alquileres</p></div>
  </div>;
}

export function portalTheme(brand: PortalBrand): CSSProperties {
  const color = /^#[0-9a-f]{6}$/i.test(brand.color_primario ?? "") ? brand.color_primario! : "#635bdb";
  const channels = [1, 3, 5].map((i) => { const v = parseInt(color.slice(i, i + 2), 16) / 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; });
  const luminance = channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
  return { "--primary": color, "--ring": color, "--primary-foreground": luminance > .179 ? "#111827" : "#ffffff" } as CSSProperties;
}

const PortalThemeContext = createContext<CSSProperties>({});
export const usePortalTheme = () => useContext(PortalThemeContext);

type PortalShellProps = { brand: PortalBrand; slug: string; email: string; nombre: string; contracts: PortalNavigationContract[]; children: ReactNode };
export function PortalShell(props: PortalShellProps) {
  const theme = portalTheme(props.brand);
  return <PortalThemeContext.Provider value={theme}><SidebarProvider style={theme}><PortalShellContent {...props} /></SidebarProvider></PortalThemeContext.Provider>;
}

function PortalShellContent({ brand, slug, email, nombre, contracts, children }: PortalShellProps) {
  const pathname = usePathname();
  const query = useSearchParams();
  const { setOpenMobile } = useSidebar();
  const base = `/portal/${slug}`;
  const selected = contracts.find((c) => pathname === `${base}/contratos/${c.id}`);
  const current = selected ?? contracts.find((c) => c.status === "vigente") ?? contracts[0];
  const roles = [...new Set(contracts.map((c) => c.role))];
  const role = selected?.role ?? (roles.length === 1 ? roles[0] : undefined);
  const label = role === "inquilino" ? "Portal del inquilino" : role === "propietario" ? "Portal del propietario" : roles.length > 1 ? "Portal de inquilino y propietario" : "Portal de clientes";
  const detailBase = current ? `${base}/contratos/${current.id}` : base;
  const sections = [
    { key: "resumen", title: "Resumen del contrato", icon: LayoutDashboard },
    { key: "contrato", title: "Propiedad y contrato", icon: Building2 },
    { key: "pagos", title: current?.role === "propietario" ? "Liquidaciones y cargos" : "Cargos y pagos", icon: Wallet },
    { key: "documentos", title: "Documentos", icon: FileText },
    { key: "servicios", title: "Servicios", icon: Zap },
    { key: "mantenimiento", title: "Mantenimiento", icon: Wrench },
    { key: "consultas", title: "Consultas y reclamos", icon: MessageSquare },
  ];
  function navLink(href: string, title: string, Icon: typeof Building2, active: boolean) {
    return <SidebarMenuItem key={href}><SidebarMenuButton asChild isActive={active} tooltip={title}>
      <Link href={href} onClick={() => setOpenMobile(false)} aria-current={active ? "page" : undefined}><Icon aria-hidden="true" /><span>{title}</span></Link>
    </SidebarMenuButton></SidebarMenuItem>;
  }
  return <>
    <a href="#portal-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-background focus:p-3">Saltar al contenido</a>
    <Sidebar collapsible="offcanvas">
      <div style={portalTheme(brand)} className="flex h-full min-h-0 flex-col">
        <SidebarHeader className="p-4"><PortalIdentity brand={brand} /><p className="mt-3 text-xs font-semibold">{label}</p></SidebarHeader>
        <SidebarContent>
          <nav aria-label="Navegación del portal">
            <SidebarGroup><SidebarMenu>
              {navLink(base, "Resumen", LayoutDashboard, pathname === base && query.get("vista") !== "contratos")}
              {navLink(`${base}?vista=contratos`, "Mis contratos", Receipt, pathname === base && query.get("vista") === "contratos")}
            </SidebarMenu></SidebarGroup>
            {current && <SidebarGroup><SidebarGroupLabel>{selected ? "Contrato seleccionado" : "Acceso a tu contrato"}</SidebarGroupLabel><p className="px-2 pb-3 text-xs">{current.title}</p><SidebarMenu>
              {sections.map((s) => navLink(`${detailBase}?seccion=${s.key}`, s.title, s.icon, !!selected && (query.get("seccion") ?? "resumen") === s.key))}
            </SidebarMenu></SidebarGroup>}
          </nav>
        </SidebarContent>
        <SidebarFooter><NavUser nombre={nombre} email={email} profileHref={`${base}/cuenta`} onSignOut={portalLogout.bind(null, slug)} /></SidebarFooter>
      </div>
      <SidebarRail />
    </Sidebar>
    <SidebarInset className="min-w-0 bg-secondary/60">
      <header className="flex flex-wrap items-center gap-3 border-b bg-background/80 px-5 py-4 lg:px-9">
        <SidebarTrigger />
        <div className="min-w-0 flex-1"><p className="text-xs text-muted-foreground">{brand.nombre || "Lokation"}</p><p className="mt-1 font-semibold">{label}</p></div>
        <ThemeSwitcher />
      </header>
      <div id="portal-content" className="mx-auto w-full max-w-6xl px-5 py-7 lg:px-9 lg:py-9">{children}</div>
    </SidebarInset>
  </>;
}
