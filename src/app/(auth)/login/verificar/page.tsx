import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { pendingCookie } from "@/lib/login-flow";
import { TwoFactorForm } from "@/components/two-factor-form";
export default async function VerifyPage() {
  if (!(await cookies()).has(pendingCookie)) redirect("/login");
  return <div className="space-y-5"><div className="space-y-2"><h1 className="text-2xl font-semibold">Verificación en dos pasos</h1><p className="text-sm text-muted-foreground">Confirmá tu identidad para completar el acceso. Este paso vence en 5 minutos.</p></div><TwoFactorForm /></div>;
}
