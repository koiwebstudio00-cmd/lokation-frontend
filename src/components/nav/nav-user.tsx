"use client";

import Link from "next/link";
import { useTransition } from "react";
import { ChevronsUpDown, LogOut, UserCog } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { signOut } from "@/actions/auth";


/**
 * Pie de la barra lateral: identidad de quien está adentro y sus dos acciones.
 * Es el `nav-user` del bloque `sidebar-07` de shadcn, recortado a lo que el
 * panel tiene de verdad (perfil y salir) y con el avatar por iniciales, porque
 * no guardamos foto de usuario.
 */
function iniciales(nombre: string) {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function NavUser({ nombre, email, profileHref = "/perfil", onSignOut = signOut }: {
  nombre: string;
  email: string;
  profileHref?: string;
  onSignOut?: () => Promise<void>;
}) {
  const { isMobile, setOpenMobile } = useSidebar();
  const [pending, startTransition] = useTransition();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              type="button"
              aria-label="Mi cuenta"
              title="Mi cuenta"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="size-8">
                <AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">
                  {iniciales(nombre)}
                </AvatarFallback>
              </Avatar>
              <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{nombre}</span>
                <span className="truncate text-xs text-muted-foreground">{email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-60 max-w-[calc(100vw-1.5rem)]"
            side="top"
            align="start"
            collisionPadding={12}
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">
                    {iniciales(nombre)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{nombre}</span>
                  <span className="truncate text-xs text-muted-foreground">{email}</span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                {/* En el celular el cajón tapa la pantalla: al navegar hay que cerrarlo. */}
                <Link
                  href={profileHref}
                  prefetch={false}
                  onClick={() => isMobile && setOpenMobile(false)}
                >
                  <UserCog />
                  Mi perfil
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem disabled={pending} onSelect={(event) => {
              event.preventDefault();
              startTransition(() => onSignOut());
            }}>
              <LogOut />{pending ? "Cerrando sesión…" : "Cerrar sesión"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
