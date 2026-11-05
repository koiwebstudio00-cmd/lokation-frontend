"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import { linkGuarantor, unlinkGuarantor } from "@/actions/rental-documents";
import { RentalOptionPicker } from "./option-picker";
import { FileVault, type VaultFile } from "./file-vault";
import { dossierLabels } from "@/lib/rental-dossiers";
import { VaultUpload } from "./vault-upload";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";

type Person = { id: string; nombre: string; email: string | null; telefono: string | null };
export type DossierPeople = { tenant: Person; guarantors: Person[] };
function AddGuarantor({ contractId }: { contractId: string }) {
  const [state, action, pending] = useActionState(linkGuarantor.bind(null, contractId), {});
  return <form action={action} className="space-y-4"><RentalOptionPicker name="personId" title="Garante" kind="garante" />
    <p className="text-sm text-muted-foreground">El cliente debe tener el rol Garante. Podés crearlo o actualizar sus roles desde <Link href="/clientes" className="underline">Clientes</Link>.</p>
    {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}{state.success && <p role="status" className="text-sm">{state.success}</p>}
    <Button disabled={pending}>{pending ? "Vinculando…" : "Vincular garante"}</Button>
  </form>;
}
function RemoveGuarantor({ contractId, personId }: { contractId: string; personId: string }) {
  const [state, action, pending] = useActionState(unlinkGuarantor.bind(null, contractId, personId), {});
  return <form action={action}><Button size="sm" variant="ghost" disabled={pending}>Quitar vínculo</Button>{state.error && <p role="alert" className="text-xs text-destructive">{state.error}</p>}</form>;
}
export function ContractDossier({ contractId, people, files, status }: { contractId: string; people: DossierPeople; files: VaultFile[]; status: string }) {
  const [personFilter, setPersonFilter] = useState("");
  const [category, setCategory] = useState("");
  const currentPeople = [people.tenant, ...people.guarantors];
  const historical = files.flatMap(f => f.person && !currentPeople.some(p => p.id === f.person!.id) ? [f.person] : []);
  const allPeople = [...new Map([...currentPeople, ...historical].map(p => [p.id, p])).values()];
  const visible = files.filter(f => (!personFilter || f.personId === personFilter) && (!category || f.dossierKind === category));
  return <section id="legajos" className="space-y-4 rounded-xl border p-5">
    <header className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold">Legajos de inquilino y garantes</h2><p className="text-sm text-muted-foreground">Documentación interna del contrato, disponible también en la bóveda. No se comparte con los portales.</p></div><div className="flex flex-wrap gap-2"><VaultUpload dossier={{ contractId, people: currentPeople }} />{status !== "finalizado" && <Dialog><DialogTrigger asChild><Button variant="outline">Agregar garante</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Vincular garante</DialogTitle><DialogDescription>Seleccioná un cliente de tu inmobiliaria para este contrato.</DialogDescription></DialogHeader><AddGuarantor contractId={contractId} /></DialogContent></Dialog>}</div></header>
    <ul className="space-y-2">{currentPeople.map(person => <li key={person.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"><div><Link className="font-medium underline" href={`/clientes/${person.id}`}>{person.nombre}</Link><Badge variant="secondary" className="ml-2">{person.id === people.tenant.id ? "Inquilino" : "Garante"}</Badge><p className="text-xs text-muted-foreground">{files.filter(f => f.personId === person.id).length} archivos · {[person.email, person.telefono].filter(Boolean).join(" · ") || "Sin datos de contacto"}</p></div>{person.id !== people.tenant.id && status !== "finalizado" && <RemoveGuarantor contractId={contractId} personId={person.id} />}</li>)}</ul>
    {historical.length > 0 && <p className="text-sm text-muted-foreground">Se conserva documentación de personas vinculadas anteriormente. Podés consultarla con los filtros.</p>}
    <div className="grid gap-3 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="dossier-person-filter">Persona</Label><Select id="dossier-person-filter" value={personFilter} onChange={e => setPersonFilter(e.target.value)}><option value="">Todas</option>{allPeople.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}</Select></div><div className="space-y-2"><Label htmlFor="dossier-category-filter">Documentación</Label><Select id="dossier-category-filter" value={category} onChange={e => setCategory(e.target.value)}><option value="">Todas las categorías</option>{Object.entries(dossierLabels).map(([key,label]) => <option key={key} value={key}>{label}</option>)}</Select></div></div>
    {files.length ? <FileVault files={visible} compact /> : <p className="text-sm text-muted-foreground">El legajo todavía no tiene archivos. Subí documentación de identidad, ingresos o garantía.</p>}
  </section>;
}
