import { apiFetch } from "@/lib/api";
import type { RentalPerson } from "@/components/rentals/person-form";

type PropertyOption = { id: string; titulo: string; operacion: "venta" | "alquiler" | "ambos" };

export async function getRentalContractOptions() {
  const [properties, people] = await Promise.all([
    apiFetch<{ data: PropertyOption[]; meta: { total: number } }>("/v1/properties", { query: { limit: 100 } }),
    apiFetch<{ data: RentalPerson[]; meta: { total: number } }>("/v1/rental-people", { query: { limit: 100 } })
  ]);
  return {
    properties: properties.data.filter((item) => item.operacion !== "venta")
      .map((item) => ({ id: item.id, label: item.titulo })),
    owners: people.data.filter((item) => item.roles.includes("propietario"))
      .map((item) => ({ id: item.id, label: item.nombre })),
    tenants: people.data.filter((item) => item.roles.includes("inquilino"))
      .map((item) => ({ id: item.id, label: item.nombre })),
    truncated: properties.meta.total > 100 || people.meta.total > 100
  };
}
