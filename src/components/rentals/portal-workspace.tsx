import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api";
import { portalBrand, portalOverview } from "@/lib/rental-portal";
import { PortalShell } from "./portal-shell";

export async function PortalWorkspace({ slug, children }: { slug: string; children: React.ReactNode }) {
  let data;
  try {
    data = await Promise.all([portalBrand(slug), portalOverview(slug)]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect(`/portal/${slug}/ingresar`);
    throw error;
  }
  const [brand, overview] = data;
  const first = overview.details[0];
  const nombre = first ? (first.role === "inquilino" ? first.contract.tenantPerson.nombre : first.contract.owner.nombre) : "Mi cuenta";
  return <PortalShell nombre={nombre} brand={brand} slug={slug} email={overview.email} contracts={overview.details.map(({ contract, role }) => ({ id: contract.id, title: contract.property.titulo, role, status: contract.status }))}>{children}</PortalShell>;
}
