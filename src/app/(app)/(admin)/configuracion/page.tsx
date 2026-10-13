import { KeyRound, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ApiKeyDialog } from "@/components/settings/api-key-dialog";
import { RevokeApiKeyButton } from "@/components/settings/revoke-api-key-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getApiKeys, getApiKeyScopes, getPropertyCopyUsage } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Configuración — Lokation" };

export default async function ConfiguracionPage() {
  const [keys, scopes, copyUsage] = await Promise.all([getApiKeys(), getApiKeyScopes(), getPropertyCopyUsage()]);

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Configuración</h1>
          <p className="text-sm text-muted-foreground">
            Las keys que usan el sitio público y el agente para comunicarse con el sistema.
          </p>
        </div>
        <ApiKeyDialog scopes={scopes} />
      </div>

      <section className="rounded-xl border bg-background">
        <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-3">
          <KeyRound className="size-5 text-primary" />
          <h2 className="font-semibold">Keys activas ({keys.length})</h2>
        </div>
        <div>
          {keys.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">
              No hay ninguna key activa. Creá una si necesitás conectar una web propia o una integración.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Permisos</TableHead>
                  <TableHead>Prefijo</TableHead>
                  <TableHead>Creada</TableHead>
                  <TableHead>Último uso</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((k) => (
                  <TableRow key={k.id}>
                    <TableCell className="min-w-[12rem] font-medium">
                      {k.nombre}
                    </TableCell>
                    <TableCell>
                      <div className="flex min-w-[13rem] flex-wrap gap-1">
                        {k.scopes.map((scope) => (
                          <Badge key={scope} variant="outline" className="font-mono">
                            {scope}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {k.prefix}...
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {formatDate(k.created_at)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {k.last_used_at ? formatDate(k.last_used_at) : "Todavía sin usar"}
                    </TableCell>
                    <TableCell className="text-right">
                      <RevokeApiKeyButton id={k.id} nombre={k.nombre} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </section>

      <section className="rounded-xl border bg-background" aria-labelledby="copy-usage-title">
        <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-3">
          <Sparkles className="size-5 text-primary" />
          <h2 id="copy-usage-title" className="font-semibold">IA para fichas · últimos 30 días</h2>
        </div>
        {copyUsage ? (
          <>
            <div className="grid gap-4 p-4 text-sm sm:grid-cols-3">
              <div><p className="text-muted-foreground">Borradores generados</p><p className="text-xl font-semibold">{copyUsage.generations.toLocaleString("es-AR")}</p></div>
              <div><p className="text-muted-foreground">Tokens de entrada</p><p className="text-xl font-semibold">{copyUsage.input_tokens.toLocaleString("es-AR")}</p></div>
              <div><p className="text-muted-foreground">Tokens de salida</p><p className="text-xl font-semibold">{copyUsage.output_tokens.toLocaleString("es-AR")}</p></div>
            </div>
            <p className="px-4 pb-4 text-xs text-muted-foreground">Incluye sólo borradores de títulos y descripciones. Los tokens se suman cuando el proveedor informa su consumo; no representa un importe facturado.</p>
          </>
        ) : (
          <p className="p-4 text-sm text-muted-foreground">No pudimos cargar el consumo de IA. Intentá actualizar la página.</p>
        )}
      </section>

      <p className="text-xs text-muted-foreground">
        Cada key ve solo lo que le habilitan sus permisos, y siempre dentro de
        esta inmobiliaria. Guardá las claves únicamente en el servidor de tu web o integración, incluso las de solo lectura.
        Nunca uses acá una contraseña ni compartas tu sesión del panel.
      </p>
    </div>
  );
}
