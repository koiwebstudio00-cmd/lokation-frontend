"use client";
import { useState, useTransition } from "react";
import { searchRentalOptions, type RentalOption } from "@/actions/rental-options";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function RentalOptionPicker({ name, title, kind, initial }: { name: string; title: string; kind: "property" | "propietario" | "inquilino" | "garante" | "all-properties"; initial?: RentalOption }) {
  const [selected, setSelected] = useState(initial);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<{ options: RentalOption[]; more: boolean; error?: string }>({ options: [], more: false });
  const [pending, start] = useTransition();
  function load(q: string, next: number) { start(async () => { const data = await searchRentalOptions(kind, q, next); setResult(data); setPage(next); setAppliedQuery(q); }); }
  return <div className="space-y-2"><Label htmlFor={`${name}-picker`}>{title}</Label><input type="hidden" name={name} value={selected?.id ?? ""} />
    <Button id={`${name}-picker`} type="button" variant="outline" className="h-auto min-h-11 w-full justify-start whitespace-normal text-left" onClick={() => { setOpen(true); load(query, 1); }}>{selected?.label ?? `Elegí ${title.toLowerCase()}`}</Button>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>Seleccionar {title.toLowerCase()}</DialogTitle><DialogDescription>Buscá registros de tu inmobiliaria. La selección se conserva al cambiar de página.</DialogDescription></DialogHeader>
      <div className="flex gap-2"><Input aria-label={`Buscar ${title.toLowerCase()}`} value={query} onChange={e => setQuery(e.target.value)} maxLength={160} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); if (!pending) load(query, 1); } }} /><Button type="button" disabled={pending} onClick={() => load(query, 1)}>Buscar</Button></div>
      {result.error && <p role="alert">{result.error}</p>}
      <div className="max-h-72 space-y-2 overflow-y-auto" aria-busy={pending}>{pending ? <p role="status">Cargando…</p> : result.options.length ? result.options.map(option => <Button key={option.id} type="button" variant="outline" className="h-auto w-full justify-start whitespace-normal text-left" onClick={() => { setSelected(option); setOpen(false); }}>{option.label}</Button>) : <p className="text-sm text-muted-foreground">No hay resultados.</p>}</div>
      <div className="flex items-center justify-between"><Button type="button" variant="outline" disabled={pending || page <= 1} onClick={() => load(appliedQuery, page - 1)}>Anterior</Button><span className="text-sm">Página {page}</span><Button type="button" variant="outline" disabled={pending || !result.more} onClick={() => load(appliedQuery, page + 1)}>Siguiente</Button></div>
    </DialogContent></Dialog>
  </div>;
}
