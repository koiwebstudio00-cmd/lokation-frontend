import { dossierLabels } from "@/lib/rental-dossiers";
import { VaultUpload } from "@/components/rentals/vault-upload";
import Link from "next/link";
import { FolderLock } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { FileVault, type VaultFile } from "@/components/rentals/file-vault";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export const metadata = { title: "Bóveda de archivos" };
export default async function FilesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const value = (key: string) => typeof params[key] === "string" ? params[key] as string : "";
  const q = value("q").slice(0, 160);
  const kind = ["contrato", "comprobante", "inventario", "otro"].includes(value("kind")) ? value("kind") : "";
  const visibility = ["interna", "inquilino", "propietario", "ambos"].includes(value("visibility")) ? value("visibility") : "";
  const dossierKind = Object.hasOwn(dossierLabels, value("dossierKind")) ? value("dossierKind") : "";
  const requested = Number(value("page"));
  const page = Number.isSafeInteger(requested) && requested > 0 && requested <= 100000 ? requested : 1;
  const query = { ...(dossierKind ? { dossierKind } : {}), ...(q ? { q } : {}), ...(kind ? { kind } : {}), ...(visibility ? { visibility } : {}), page };
  const result = await apiFetch<{ data: VaultFile[]; meta: { total: number; limit: number } }>("/v1/rental-documents", { query });
  const pages = Math.max(1, Math.ceil(result.meta.total / result.meta.limit));
  const href = (next: number) => `?${new URLSearchParams({ q, kind, visibility, dossierKind, page: String(next) })}`;
  return <div className="mx-auto max-w-7xl space-y-6">
    <header className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="flex items-center gap-2 text-2xl font-semibold"><FolderLock className="text-primary" />Bóveda de archivos</h1><p className="mt-1 text-sm text-muted-foreground">Documentos y fotos privados de tu inmobiliaria. {result.meta.total} archivos encontrados.</p></div><VaultUpload /></header>
    <form key={`${q}:${kind}:${visibility}:${dossierKind}`} className="grid items-end gap-4 rounded-xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-2"><Label htmlFor="file-search">Buscar</Label><Input id="file-search" name="q" defaultValue={q} placeholder="Archivo, propiedad o persona" maxLength={160} /></div>
      <div className="space-y-2"><Label htmlFor="file-kind">Tipo de documento</Label><Select id="file-kind" name="kind" defaultValue={kind || "todos"}>{["todos", "contrato", "comprobante", "inventario", "otro"].map(item => <option key={item} value={item}>{item === "todos" ? "Todos los tipos" : item}</option>)}</Select></div>
      <div className="space-y-2"><Label htmlFor="file-visibility">Visibilidad</Label><Select id="file-visibility" name="visibility" defaultValue={visibility || "todas"}>{["todas", "interna", "inquilino", "propietario", "ambos"].map(item => <option key={item} value={item}>{item === "todas" ? "Todas" : item}</option>)}</Select></div>
      <div className="space-y-2"><Label htmlFor="file-dossier">Legajo</Label><Select id="file-dossier" name="dossierKind" defaultValue={dossierKind}><option value="">Todos los archivos</option>{Object.entries(dossierLabels).map(([key,label]) => <option key={key} value={key}>{label}</option>)}</Select></div>
      <div className="flex gap-2"><Button type="submit">Filtrar</Button><Button asChild variant="ghost"><Link href="/archivos">Limpiar</Link></Button></div>
    </form>
    <FileVault files={result.data} />
    <nav aria-label="Páginas de archivos" className="flex items-center justify-center gap-4">
      {page > 1 && <Button asChild variant="outline"><Link href={href(page - 1)}>Anterior</Link></Button>}
      <span className="text-sm text-muted-foreground">Página {page} · {pages} páginas con resultados</span>
      {page < pages && <Button asChild variant="outline"><Link href={href(page + 1)}>Siguiente</Link></Button>}
    </nav>
  </div>;
}
