"use client";
import { useActionState } from "react";
import { verifySignIn, cancelSignIn } from "@/actions/login-flow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export function TwoFactorForm() {
  const [state, action, pending] = useActionState(verifySignIn, {});
  return <div className="space-y-4"><form action={action} className="space-y-4">
    <div className="space-y-2"><Label htmlFor="otp">Código de autenticación</Label><Input id="otp" name="otp" autoComplete="one-time-code" autoFocus required maxLength={100} aria-describedby="otp-help" /><p id="otp-help" className="text-sm text-muted-foreground">Ingresá el código de tu app autenticadora o uno de recuperación.</p></div>
    {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
    <Button className="w-full" disabled={pending}>{pending ? "Verificando…" : "Verificar y entrar"}</Button>
  </form><form action={cancelSignIn}><Button variant="ghost" className="w-full" disabled={pending}>Volver al inicio de sesión</Button></form></div>;
}
