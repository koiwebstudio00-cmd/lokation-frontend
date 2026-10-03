import { Users } from "lucide-react";

export const metadata = { title: "Clientes — Lokation" };

export default function ClientesPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-semibold">Clientes</h1>
      <div className="rounded-xl flex items-start gap-3 border bg-muted/40 p-5">
        <Users className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
        <div>
          <p className="font-medium">Módulo en preparación</p>
          <p className="mt-1 text-sm text-muted-foreground">
            El historial de clientes estará disponible cuando se implemente con datos de tu inmobiliaria.
          </p>
        </div>
      </div>
    </div>
  );
}
