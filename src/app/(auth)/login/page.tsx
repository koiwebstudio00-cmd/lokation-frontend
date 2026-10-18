import Link from "next/link";
import { passwordSignIn } from "@/actions/login-flow";
import { GoogleLogin } from "@/components/google-login";
import { googleEnabled } from "@/lib/google-auth";
import { AuthForm } from "@/components/auth/auth-form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";

export const metadata = { title: "Iniciar sesión — Lokation" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ clave?: string; google?: string }>;
}) {
  const { clave, google } = await searchParams;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Acceso de inmobiliarias</h1>
      <p className="text-sm text-muted-foreground">Ingresá con tu cuenta de administrador o agente.</p>
      <div className="rounded-lg border p-3 text-sm">
        <p>¿Sos inquilino o propietario?</p>
        <Link href="/portal" className="font-medium text-primary underline">Ingresar al portal de alquileres</Link>
      </div>
      {clave === "actualizada" && (
        <p className="text-sm text-primary">
          Listo, cambiamos tu contraseña. Entrá con la nueva.
        </p>
      )}
      {google === "error" && <p role="alert" className="text-sm text-destructive">No se pudo completar el acceso con Google. Usá el email de una cuenta habilitada en este panel o ingresá con contraseña.</p>}
      <AuthForm action={passwordSignIn} submitLabel="Entrar" pendingLabel="Entrando...">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            required
          />
        </div>
      </AuthForm>
      <GoogleLogin enabled={googleEnabled} />
      <div className="space-y-1 text-sm">
        <p>
          <Link href="/recuperar" className="text-primary hover:underline">
            Olvidé mi contraseña
          </Link>
        </p>
        <p className="text-muted-foreground">
          Las cuentas las crea un administrador: si no tenés uno, pedile que te
          invite.
        </p>
      </div>
    </div>
  );
}
