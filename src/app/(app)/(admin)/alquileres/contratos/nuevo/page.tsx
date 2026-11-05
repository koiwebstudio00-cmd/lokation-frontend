import Link from "next/link";
import { ContractForm } from "@/components/rentals/contract-form";

export const metadata = { title: "Nuevo contrato — Cubiko AI" };

export default async function NewContractPage() {
  return <div className="mx-auto max-w-3xl space-y-5">
    <Link href="/alquileres/contratos" className="text-sm underline">← Contratos</Link>
    <div><h1 className="text-2xl font-semibold">Nuevo borrador de contrato</h1>
      <p className="text-sm text-muted-foreground">Vinculá una propiedad con un propietario y un inquilino de esta inmobiliaria.</p></div>
    <p className="text-sm text-muted-foreground">Buscá propiedades y clientes sin límite de cartera. <Link href="/alquileres/propiedades" className="underline">Administrar propiedades privadas</Link> · <Link href="/clientes" className="underline">Clientes</Link></p>
    <ContractForm />
  </div>;
}
