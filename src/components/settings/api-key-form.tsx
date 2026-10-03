"use client";

import { useActionState, useState } from "react";
import { Check, Copy, KeyRound, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createApiKey, createWebsiteApiKey, type ApiKeyState } from "@/actions/api-keys";
import type { ScopeOption } from "@/lib/types";

/**
 * La key completa vuelve una sola vez, en la respuesta del alta: la API guarda
 * solo el hash. Por eso queda en pantalla hasta que la persona la descarta a
 * mano, en lugar de desaparecer sola.
 *
 * Los permisos (`scopes`) llegan como prop desde la página, que los pide a
 * `GET /v1/integrations/scopes`: las etiquetas las escribe el backend una sola
 * vez y el panel no las duplica.
 */
export function ApiKeyForm({ scopes, websiteOnly = false }: { scopes: ScopeOption[]; websiteOnly?: boolean }) {
  const [state, formAction, pending] = useActionState<ApiKeyState, FormData>(
    websiteOnly ? createWebsiteApiKey : createApiKey,
    {}
  );
  const [copiada, setCopiada] = useState(false);
  const [descartada, setDescartada] = useState<string | null>(null);
  const [elegidos, setElegidos] = useState<string[]>(websiteOnly ? ["export:read"] : []);

  const mostrarKey = state.key && state.key !== descartada;
  const esDelAgente = state.scopes?.some((s) => s.startsWith("agent:"));

  function alternar(scope: string, marcado: boolean) {
    setElegidos((prev) =>
      marcado ? [...prev, scope] : prev.filter((s) => s !== scope)
    );
  }

  async function copiar() {
    if (!state.key) return;
    try {
      await navigator.clipboard.writeText(state.key);
      setCopiada(true);
      setTimeout(() => setCopiada(false), 2000);
    } catch {
      // Sin permiso de portapapeles queda la opción de seleccionarla a mano.
      setCopiada(false);
    }
  }

  if (mostrarKey) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl flex items-start gap-2 border border-[var(--estado-reservada-fg)]/30 bg-[var(--estado-reservada-bg)]/40 p-3">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-[var(--estado-reservada-fg)]" />
          <p className="text-sm">
            Copiala ahora: es la única vez que se muestra completa. Después solo
            vas a ver sus primeros caracteres.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="key-nueva">Key de «{state.nombre}»</Label>
          <div className="flex gap-2">
            <Input
              id="key-nueva"
              readOnly
              value={state.key}
              className="font-mono text-sm"
              onFocus={(e) => e.currentTarget.select()}
            />
            <Button type="button" variant="outline" onClick={copiar}>
              {copiada ? <Check /> : <Copy />}
              <span className="sr-only sm:not-sr-only">
                {copiada ? "Copiada" : "Copiar"}
              </span>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {esDelAgente ? (
              <>
                Va en la credencial del agente, como header <code>X-Api-Key</code>.
              </>
            ) : (
              <>
                Guardala como secreto en el servidor de tu web y enviala en el header <code>X-Api-Key</code>. Nunca la incluyas en JavaScript del navegador ni en variables VITE_* o NEXT_PUBLIC_*.
              </>
            )}
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setDescartada(state.key!);
            setElegidos(websiteOnly ? ["export:read"] : []);
          }}
        >
          Listo, ya la guardé
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre</Label>
        <Input
          id="nombre"
          name="nombre"
          placeholder="Sitio público"
          autoComplete="off"
          required
        />
        <p className="text-xs text-muted-foreground">
          Es solo para reconocerla después, cuando haya más de una.
        </p>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Permisos</legend>
        <p className="text-xs text-muted-foreground">
          Dale lo mínimo que necesite. Si se filtra, se revoca y se crea otra.
        </p>
        <div className="space-y-2 pt-1">
          {scopes.map(({ scope, label }) => (
            <label
              key={scope}
              htmlFor={`scope-${scope}`}
              className="rounded-xl flex cursor-pointer items-start gap-3 border p-3 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5"
            >
              <input
                type="checkbox"
                id={`scope-${scope}`}
                name="scopes"
                value={scope}
                checked={elegidos.includes(scope)}
                disabled={websiteOnly}
                onChange={(e) => alternar(scope, e.currentTarget.checked)}
                className="mt-0.5 size-4 shrink-0 accent-primary"
              />
              <span>
                <span className="font-mono text-xs">{scope}</span>
                <span className="mt-0.5 block text-muted-foreground">{label}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending || elegidos.length === 0}>
        <KeyRound /> {pending ? "Creando..." : "Crear key"}
      </Button>
    </form>
  );
}
