import { PortalFrame } from "@/components/rentals/portal-frame";
import { notFound } from "next/navigation";
import { ApiError } from "@/lib/api";
import { portalBrand } from "@/lib/rental-portal";

export default async function PortalLayout({ children, params }: {
  children: React.ReactNode; params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  let brand;
  try { brand = await portalBrand(slug); }
  catch (error) { if (error instanceof ApiError && error.status === 404) notFound(); throw error; }
  return <PortalFrame brand={brand}>{children}</PortalFrame>;
}
