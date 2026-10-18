import { redirect } from "next/navigation";
export default async function LegacyPeople({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const query = await searchParams;
  const params = new URLSearchParams();
  if (typeof query.q === "string") params.set("q", query.q);
  if (typeof query.page === "string") params.set("page", query.page);
  redirect(`/clientes?${params}`);
}
