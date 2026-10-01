"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function ThemeSwitcher() {
  const { setTheme } = useTheme();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon" aria-label="Cambiar tema" title="Cambiar tema">
          <Sun className="size-4 dark:hidden" />
          <Moon className="hidden size-4 dark:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" collisionPadding={12}>
        <DropdownMenuItem onSelect={() => setTheme("light")}><Sun />Tema claro</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setTheme("dark")}><Moon />Tema oscuro</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setTheme("system")}><Monitor />Usar tema del dispositivo</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
