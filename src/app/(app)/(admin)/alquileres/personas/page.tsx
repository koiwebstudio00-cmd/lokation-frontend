import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { PersonForm, type RentalPerson } from "@/components/rentals/person-form";

export const metadata = { title: "Personas de alquiler — Lokation" };

export default async function RentalPeoplePage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const params = await searchParams;
  const requestedPage = Number(params.page);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const result = await apiFetch<{ data: RentalPerson[]; meta: { total: number; page: number; limit: number } }>(
    "/v1/rental-people", { query: { q: params.q, page } }
  );
  const pages = Math.max(1, Math.ceil(result.meta.total / result.meta.limit));
  const pageUrl = (number: number) => `/alquileres/personas?${new URLSearchParams({ ...(params.q ? { q: params.q } : {}), page: String(number) })}`;

  return <div className="mx-auto max-w-5xl space-y-6">
    <div><h1 className="text-2xl font-semibold">Personas de alquiler</h1>
      <p className="text-sm text-muted-foreground">Registro interno de propietarios, inquilinos, garantes y contactos. {result.meta.total} en total.</p></div>
    <PersonForm />
    <form className="flex gap-2" action="/alquileres/personas">
      <input name="q" aria-label="Buscar por nombre o email" placeholder="Buscar por nombre o email" maxLength={100} defaultValue={params.q ?? ""} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
      <button className="rounded-md border px-4 text-sm" type="submit">Buscar</button>
    </form>
    {result.data.length ? <ul className="divide-y rounded-xl border">{result.data.map((person) =>
      <li key={person.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
        <div><Link className="font-medium underline-offset-2 hover:underline" href={`/alquileres/personas/${person.id}`}>{person.nombre}</Link>
          <p className="text-sm text-muted-foreground">{person.roles.join(" · ")}{person.email ? ` · ${person.email}` : ""}</p></div>
        <Link className="text-sm underline" href={`/alquileres/personas/${person.id}`}>Ver y editar</Link>
      </li>)}</ul> : <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">No hay personas con esos criterios.</p>}
    {pages > 1 && <nav aria-label="Páginas de personas" className="flex items-center justify-center gap-4 text-sm">
      {page > 1 && <Link href={pageUrl(page - 1)}>Anterior</Link>}
      <span>Página {result.meta.page} de {pages}</span>
      {page < pages && <Link href={pageUrl(page + 1)}>Siguiente</Link>}
    </nav>}
  </div>;
}
