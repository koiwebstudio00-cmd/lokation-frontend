import { PortalAcceptForm } from "@/components/rentals/portal-forms";

export const metadata = { title: "Activar acceso al portal — Lokation" };
export default async function PortalActivatePage({ params, searchParams }: {
  params: Promise<{ slug: string }>; searchParams: Promise<{ token?: string }>
}) {
  const [{ slug }, { token }] = await Promise.all([params, searchParams]);
  return <div className="mx-auto max-w-md space-y-5 rounded-xl border bg-background p-6">
    <h1 className="text-2xl font-semibold">Activar acceso</h1>
    {token && /^[a-f0-9]{64}$/.test(token) ? <PortalAcceptForm slug={slug} token={token} />
      : <p role="alert" className="text-sm">El enlace de invitación no es válido.</p>}
  </div>;
}
