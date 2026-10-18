import { redirect } from "next/navigation";
export default async function LegacyPerson({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/clientes/${encodeURIComponent(id)}`);
}
