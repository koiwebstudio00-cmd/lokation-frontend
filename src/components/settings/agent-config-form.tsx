"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";
import { saveAgentConfig, type FollowupSettingsState } from "@/actions/followups";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { FollowupSettings } from "@/lib/queries";

export function AgentConfigForm({ config }: { config: FollowupSettings["agentConfig"] }) {
  const [state, formAction, pending] = useActionState<FollowupSettingsState, FormData>(saveAgentConfig, {});
  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="agent-model">Modelo de OpenAI</Label>
        <Input id="agent-model" name="model" defaultValue={config?.model ?? ""}
          placeholder="gpt-5-mini" maxLength={120} required />
        <p className="text-xs text-muted-foreground">
          Usá un identificador habilitado en la cuenta OpenAI de la plataforma, sin prefijo de proveedor.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="agent-instructions">Instrucciones de tu inmobiliaria</Label>
        <Textarea id="agent-instructions" name="instructions"
          defaultValue={config?.instructions ?? ""} minLength={20} maxLength={6000} required
          rows={9} placeholder="Describí cómo debe presentarse, el tono de atención y cuándo pasar la conversación a una persona." />
        <p className="text-xs text-muted-foreground">
          Evitá incluir contraseñas o datos privados. El agente usará estas instrucciones en futuras conversaciones.
        </p>
      </div>
      {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
      {state.success && <p role="status" className="text-sm text-emerald-700">{state.success}</p>}
      <Button type="submit" disabled={pending}><Save /> {pending ? "Guardando..." : "Guardar comportamiento"}</Button>
    </form>
  );
}
