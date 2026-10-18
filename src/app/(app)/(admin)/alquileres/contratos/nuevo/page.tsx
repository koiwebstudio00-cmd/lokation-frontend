import Link from "next/link";
import { ContractForm } from "@/components/rentals/contract-form";
import { getRentalContractOptions } from "@/lib/rental-contract-options";

export const metadata = { title: "Nuevo contrato — Lokation" };

export default async function NewContractPage() {
  const options = await getRentalContractOptions();
  return <div className="mx-auto max-w-3xl space-y-5">
    <Link href="/alquileres/contratos" className="text-sm underline">← Contratos</Link>
    <div><h1 className="text-2xl font-semibold">Nuevo borrador de contrato</h1>
      <p className="text-sm text-muted-foreground">Vinculá una propiedad con un propietario y un inquilino de esta inmobiliaria.</p></div>
    {(!options.properties.length || !options.owners.length || !options.tenants.length) &&
      <p role="status" className="rounded-md border p-3 text-sm">Necesitás una propiedad de alquiler y personas clasificadas como propietario e inquilino. <Link href="/clientes" className="underline">Administrar clientes</Link></p>}
    {options.truncated &&
      <p className="text-sm text-amber-700">Este formulario muestra los primeros 100 registros. Para una cartera mayor, completaremos la búsqueda paginada antes de usarlo operativamente.</p>}
    <ContractForm {...options} />
  </div>;
}
