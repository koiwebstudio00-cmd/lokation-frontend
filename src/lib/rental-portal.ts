import { cookies } from "next/headers";
import { cache } from "react";
import { ApiError } from "@/lib/api";
import { API_URL } from "@/lib/session-cookies";

export const PORTAL_COOKIE = "rental_portal_session";
const slugPattern = /^[a-z0-9][a-z0-9-]{1,48}$/;

export type PortalBrand = { nombre: string; logo_url: string | null; color_primario: string | null };
export type PortalContract = { id: string; status: string; startDate: string; endDate: string;
  monthlyRent: string; currency: string; dueDay: number; property: { titulo: string } };
export type PortalDetail = { contract: PortalContract & { owner: { nombre: string };
  tenantPerson: { nombre: string }; property: { id: string; titulo: string } }; role: "inquilino" | "propietario";
  charges: { id: string; period: string; dueDate: string; amount: string; currency: string;
    payments: { amount: string; paidAt: string; method: string; reference: string | null }[] }[];
  adjustments: { id: string; effectivePeriod: string; amount: string; reason: string }[];
  settlements: { id: string; net: string; gross: string; commission: string; expenses: string;
    currency: string; status: string; paidAt: string | null; charge: { period: string } }[];
  services: { id: string; type: string; provider: string; accountNumber: string | null; meterNumber: string | null }[];
  maintenance: { id: string; title: string; status: string; createdAt: string }[];
  inquiries: { id: string; title: string; description: string; category: string; status: string;
    response: string | null; createdAt: string }[];
  documents: { id: string; title: string; kind: string; size: number; createdAt: string }[] };

function checkSlug(slug: string) {
  if (!slugPattern.test(slug)) throw new ApiError("Portal no disponible.", 404);
  return slug;
}

export async function portalRequest<T>(slug: string, path: string, options: {
  method?: "GET" | "POST"; body?: unknown; authenticated?: boolean
} = {}): Promise<T> {
  checkSlug(slug);
  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.authenticated) {
    const token = (await cookies()).get(PORTAL_COOKIE)?.value;
    if (!token) throw new ApiError("Iniciá sesión en el portal.", 401);
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(`${API_URL}/v1/portal/${slug}${path}`, {
    method: options.method ?? "GET", headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body), cache: "no-store"
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({})) as { error?: { message?: string } };
    throw new ApiError(result.error?.message ?? "No pudimos consultar el portal.", response.status);
  }
  return response.json() as Promise<T>;
}

export const portalBrand = cache(async (slug: string) => {
  const { brand } = await portalRequest<{ brand: PortalBrand }>(slug, "/brand");
  return brand;
});

export const portalDetail = cache((slug: string, id: string) =>
  portalRequest<PortalDetail>(slug, `/contracts/${id}`, { authenticated: true }));

export const portalOverview = cache(async (slug: string) => {
  const [list, profile] = await Promise.all([
    portalRequest<{ data: PortalContract[] }>(slug, "/contracts", { authenticated: true }),
    portalRequest<{ account: { email: string } }>(slug, "/me", { authenticated: true }),
  ]);
  const details = await Promise.all(list.data.map((contract) => portalDetail(slug, contract.id)));
  return { details, email: profile.account.email };
});
