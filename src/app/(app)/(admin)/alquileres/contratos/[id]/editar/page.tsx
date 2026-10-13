import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { ContractForm } from "@/components/rentals/contract-form";
import { getRentalContractOptions } from "@/lib/rental-contract-options";
import type { RentalContract } from "@/lib/rental-contracts";

export const metadata = { title: "Editar contrato — Lokation" };

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
  const options = await getRentalContractOptions();
  return <div className="mx-auto max-w-3xl space-y-5">
    <Link href={`/alquileres/contratos/${id}`} className="text-sm underline">← Volver al borrador</Link>
    <h1 className="text-2xl font-semibold">Editar borrador</h1>
    {options.truncated && <p className="text-sm text-amber-700">La lista muestra los primeros 100 inmuebles y personas.</p>}
    <ContractForm {...options} contract={contract} />
  </div>;
}
