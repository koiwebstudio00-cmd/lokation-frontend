import Link from "next/link";
import { PortalForgotForm } from "@/components/rentals/portal-forms";

export const metadata = { title: "Recuperar acceso al portal — Lokation" };
export default async function PortalForgotPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <div className="mx-auto max-w-md space-y-5 rounded-xl border bg-background p-6">
    <h1 className="text-2xl font-semibold">Recuperar acceso</h1>
    <PortalForgotForm slug={slug} />
    <Link href={`/portal/${slug}/ingresar`} className="text-sm underline">Volver al ingreso</Link>
  </div>;
}
