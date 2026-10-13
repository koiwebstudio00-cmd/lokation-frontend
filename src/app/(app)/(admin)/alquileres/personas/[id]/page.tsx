import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { PersonForm, type RentalPerson } from "@/components/rentals/person-form";

export const metadata = { title: "Persona de alquiler — Lokation" };

export default async function RentalPersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let person: RentalPerson;
  try {
    ({ person } = await apiFetch<{ person: RentalPerson }>(`/v1/rental-people/${id}`));
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  return <div className="mx-auto max-w-3xl space-y-6">
    <Link href="/alquileres/personas" className="text-sm underline">← Personas de alquiler</Link>
    <div><h1 className="text-2xl font-semibold">{person.nombre}</h1>
      <p className="text-sm text-muted-foreground">Ficha interna. Todavía no hay contratos vinculados.</p></div>
    <PersonForm person={person} />
  </div>;
}
