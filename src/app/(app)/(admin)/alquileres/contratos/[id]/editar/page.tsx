import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { ContractForm } from "@/components/rentals/contract-form";
import type { RentalContract } from "@/lib/rental-contracts";

export const metadata = { title: "Editar contrato — Cubiko AI" };

export default async function EditContractPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let contract: RentalContract;
  try {
    ({ contract } = await apiFetch<{ contract: RentalContract }>(`/v1/rental-contracts/${id}`));
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  if (contract.status !== "borrador") notFound();
  return <div className="mx-auto max-w-3xl space-y-5">
    <Link href={`/alquileres/contratos/${id}`} className="text-sm underline">← Volver al borrador</Link>
    <h1 className="text-2xl font-semibold">Editar borrador</h1>
    <ContractForm contract={contract} />
  </div>;
}
