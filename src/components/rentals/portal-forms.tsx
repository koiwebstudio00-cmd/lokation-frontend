"use client";

import { useActionState } from "react";
import { portalAccept, portalForgotPassword, portalInquiry, portalLogin, portalResetPassword } from "@/actions/rental-portal";
import { Button } from "@/components/ui/button";

export function PortalLoginForm({ slug }: { slug: string }) {
  const [state, action, pending] = useActionState(portalLogin.bind(null, slug), {});
  return <form action={action} className="space-y-4">
    <label className="block text-sm">Correo electrónico<input name="email" type="email" autoComplete="email" required
      className="mt-1 w-full rounded-md border bg-background p-2" /></label>
    <label className="block text-sm">Contraseña<input name="password" type="password" autoComplete="current-password" required
      className="mt-1 w-full rounded-md border bg-background p-2" /></label>
    {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
    <Button disabled={pending} className="w-full">{pending ? "Ingresando…" : "Ingresar"}</Button>
  </form>;
}

export function PortalAcceptForm({ slug, token }: { slug: string; token: string }) {
  const [state, action, pending] = useActionState(portalAccept.bind(null, slug, token), {});
  return <form action={action} className="space-y-4">
    <label className="block text-sm">Contraseña de acceso<input name="password" type="password"
      autoComplete="new-password" minLength={10} required className="mt-1 w-full rounded-md border bg-background p-2" /></label>
    <p className="text-xs text-muted-foreground">Si ya tenés una cuenta del portal con este correo, ingresá su contraseña actual.</p>
    {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
    <Button disabled={pending} className="w-full">{pending ? "Activando…" : "Activar acceso"}</Button>
  </form>;
}

export function PortalInquiryForm({ slug, contractId, onSuccess }: { slug: string; contractId: string; onSuccess?: () => void }) {
  const [state, action, pending] = useActionState(async (previous: Awaited<ReturnType<typeof portalInquiry>>, form: FormData) => {
    const result = await portalInquiry(slug, contractId, previous, form);
    if (result.success) onSuccess?.();
    return result;
  }, {});
  return <form action={action} className="grid gap-3">
    <label className="text-sm">Tipo<select name="category" className="mt-1 w-full rounded-md border bg-background p-2">
      <option value="consulta">Consulta</option><option value="reclamo">Queja o reclamo</option>
    </select></label>
    <label className="text-sm">Asunto<input name="title" minLength={5} maxLength={160} required
      className="mt-1 w-full rounded-md border bg-background p-2" /></label>
    <label className="text-sm">Detalle<textarea name="description" minLength={10} maxLength={5000} required rows={4}
      className="mt-1 w-full rounded-md border bg-background p-2" /></label>
    {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
    {state.success && <p role="status" className="text-sm">{state.success}</p>}
    <Button disabled={pending}>{pending ? "Enviando…" : "Enviar a la inmobiliaria"}</Button>
  </form>;
}

export function PortalForgotForm({ slug }: { slug: string }) {
  const [state, action, pending] = useActionState(portalForgotPassword.bind(null, slug), {});
  return <form action={action} className="space-y-4">
    <label className="block text-sm">Correo electrónico<input name="email" type="email" autoComplete="email" required
      className="mt-1 w-full rounded-md border bg-background p-2" /></label>
    {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
    {state.success && <p role="status" className="text-sm">{state.success}</p>}
    {state.devUrl && <a className="text-sm underline" href={state.devUrl}>Enlace local de restablecimiento</a>}
    <Button disabled={pending} className="w-full">{pending ? "Enviando…" : "Enviar enlace"}</Button>
  </form>;
}

export function PortalResetForm({ slug, token }: { slug: string; token: string }) {
  const [state, action, pending] = useActionState(portalResetPassword.bind(null, slug, token), {});
  return <form action={action} className="space-y-4">
    <label className="block text-sm">Contraseña nueva<input name="password" type="password" autoComplete="new-password"
      minLength={10} required className="mt-1 w-full rounded-md border bg-background p-2" /></label>
    {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
    <Button disabled={pending} className="w-full">{pending ? "Guardando…" : "Cambiar contraseña"}</Button>
  </form>;
}
