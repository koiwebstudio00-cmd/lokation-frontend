"use client";
import { useActionState } from "react";
import { googleSignIn } from "@/actions/login-flow";
import { Button } from "@/components/ui/button";
export function GoogleLogin({ enabled }: { enabled: boolean }) {
  const [state, action, pending] = useActionState(googleSignIn, {});
  return <div className="space-y-2"><form action={action}>
    <Button variant="outline" className="w-full" disabled={!enabled || pending}>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4"><path fill="currentColor" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.36ZM12 22c2.7 0 4.96-.9 6.62-2.41l-3.24-2.51c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.6-4.12H3.06v2.59A10 10 0 0 0 12 22Zm-5.6-8.08a6 6 0 0 1 0-3.84V7.49H3.06a10 10 0 0 0 0 9.02l3.34-2.59ZM12 5.96c1.47 0 2.79.5 3.83 1.51l2.87-2.87A9.61 9.61 0 0 0 12 2a10 10 0 0 0-8.94 5.49l3.34 2.59c.8-2.36 3-4.12 5.6-4.12Z" /></svg>
      {pending ? "Conectando con Google…" : "Continuar con Google"}
    </Button>
  </form>{!enabled && <p className="text-center text-xs text-muted-foreground">Google estará disponible cuando se complete su configuración.</p>}
    {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
  </div>;
}
