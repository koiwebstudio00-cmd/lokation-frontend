import Link from "next/link";
import { Logo } from "@/components/logo";
import { MobileNav } from "@/components/nav/mobile-nav";
import { Notifications } from "@/components/notifications";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ThemeSwitcher } from "@/components/nav/theme-switcher";
import { AppNav } from "@/components/nav/app-nav";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { getCurrentUser } from "@/lib/api";
import { getConsultasSinTomarCount } from "@/lib/queries";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // El middleware ya frena a quien no tiene sesión; esto cubre el caso de un
  // access vencido entre medio y le da a la navegación el rol para filtrarse.
  const me = await getCurrentUser();
  if (!me) redirect("/login");
  const consultasSinTomar = me.rol === "community" ? 0 : await getConsultasSinTomarCount();

  // `sidebar_state` la escribe el propio SidebarProvider al abrir o cerrar la
  // barra. Leerla acá, en el server, evita que la primera pintura muestre la
  // barra abierta y después salte a cerrada.
  const cookieStore = await cookies();
  const abiertaPorDefecto = cookieStore.get("sidebar_state")?.value !== "false";

  return (
    <SidebarProvider defaultOpen={abiertaPorDefecto}>
      <AppNav
        nombre={me.nombre}
        email={me.email}
        rol={me.rol}
        tenantNombre={me.tenant?.nombre ?? "Cubiko AI"}
        consultasSinTomar={consultasSinTomar}
      />
      <SidebarInset className="min-w-0 bg-muted/50 md:bg-background">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/85 px-4 backdrop-blur-lg print:hidden">
          <SidebarTrigger className="hidden md:inline-flex" />
          <Link href="/" prefetch={false} className="flex min-w-0 items-center gap-2 font-semibold md:hidden" aria-label="Cubiko AI · Inicio">
            <Logo className="size-7" />
            <span className="truncate">Cubiko AI</span>
          </Link>
          <div className="ml-auto flex shrink-0 items-center gap-1"><ThemeSwitcher />{me.rol !== "community" && <Notifications />}</div>
        </header>
        <div className="mx-auto w-full min-w-0 p-4 sm:p-6 print:p-0">{children}</div>
      <MobileNav rol={me.rol} count={consultasSinTomar}/>
      </SidebarInset>
    </SidebarProvider>
  );
}
