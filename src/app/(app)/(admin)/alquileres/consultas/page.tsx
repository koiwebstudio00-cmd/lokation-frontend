import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { InquiryResponse } from "@/components/rentals/inquiry-response";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Consultas de alquiler — Lokation" };
type Inquiry = { id: string; contractId: string; title: string; description: string; category: string;
  status: string; response: string | null; createdAt: string; account: { email: string };
  contract: { property: { titulo: string } } };
export default async function RentalInquiriesPage() {
  const { data } = await apiFetch<{ data: Inquiry[] }>("/v1/rental-inquiries");
  return <div className="mx-auto max-w-4xl space-y-5">
    <div><h1 className="text-2xl font-semibold">Consultas y reclamos de alquiler</h1>
      <p className="text-sm text-muted-foreground">Mensajes enviados desde el portal de propietarios e inquilinos.</p></div>
    {!data.length && <p className="rounded-xl border p-5 text-sm">Todavía no hay consultas de alquiler.</p>}
    {data.map((item) => <article key={item.id} className="space-y-2 rounded-xl border p-5 text-sm">
      <div className="flex flex-wrap justify-between gap-2"><h2 className="font-semibold">{item.title}</h2>
        <span className="capitalize">{item.category} · {item.status.replace("_", " ")}</span></div>
      <p><Link href={`/alquileres/contratos/${item.contractId}`} className="underline">{item.contract.property.titulo}</Link> · {item.account.email} · {formatDate(item.createdAt)}</p>
      <p>{item.description}</p>
      {item.response && <p className="border-t pt-2">Respuesta: {item.response}</p>}
      <InquiryResponse id={item.id} status={item.status} />
    </article>)}
  </div>;
}
