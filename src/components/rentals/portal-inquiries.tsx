"use client";

import { useRef, useState } from "react";
import { CheckCircle2, CircleHelp, Clock3, Eye, MessageSquare, Plus } from "lucide-react";
import { toast } from "sonner";
import type { PortalDetail } from "@/lib/rental-portal";
import { contractDate } from "@/lib/rental-contracts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PortalInquiryForm } from "./portal-forms";
import { usePortalTheme } from "./portal-shell";

type Inquiry = PortalDetail["inquiries"][number];
const states = {
  abierta: { label: "Abierta", icon: CircleHelp, className: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200" },
  en_gestion: { label: "En gestión", icon: Clock3, className: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200" },
  resuelta: { label: "Resuelta", icon: CheckCircle2, className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200" },
};
function InquiryStatus({ status }: { status: string }) {
  const state = states[status as keyof typeof states] ?? { label: status, icon: CircleHelp, className: "bg-muted text-muted-foreground" };
  return <Badge className={`gap-1.5 whitespace-nowrap ${state.className}`}><state.icon className="size-3.5" aria-hidden="true" />{state.label}</Badge>;
}

export function PortalInquiries({ slug, contractId, propertyTitle, active, inquiries }: {
  slug: string; contractId: string; propertyTitle: string; active: boolean; inquiries: Inquiry[];
}) {
  const detailTrigger = useRef<HTMLButtonElement>(null);
  const [creating, setCreating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = inquiries.find((item) => item.id === selectedId);
  const theme = usePortalTheme();
  return <section className="space-y-5 rounded-2xl border bg-background p-5 shadow-sm sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><h2 className="text-lg font-semibold">Registro de consultas</h2><p className="mt-1 text-sm text-muted-foreground">Seguí el estado y consultá la respuesta de tu inmobiliaria.</p></div>
      {active && <Dialog open={creating} onOpenChange={setCreating}>
        <DialogTrigger asChild><Button><Plus className="size-4" aria-hidden="true" />Nueva consulta</Button></DialogTrigger>
        <DialogContent style={theme} className="rounded-xl"><DialogHeader><DialogTitle>Nueva consulta o reclamo</DialogTitle><DialogDescription>{propertyTitle}. Contanos qué necesitás y tu inmobiliaria recibirá el mensaje.</DialogDescription></DialogHeader>
          <PortalInquiryForm slug={slug} contractId={contractId} onSuccess={() => { setCreating(false); toast.success("Consulta enviada. Podés seguirla en el registro."); }} />
        </DialogContent>
      </Dialog>}
    </div>
    {!active && <p className="text-sm text-muted-foreground">Este contrato está finalizado. Podés consultar los registros existentes.</p>}
    {inquiries.length ? <Table aria-label="Registro de consultas y reclamos"><TableHeader><TableRow>
      <TableHead>Asunto</TableHead><TableHead>Tipo</TableHead><TableHead>Fecha</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Acciones</TableHead>
    </TableRow></TableHeader><TableBody>{inquiries.map((item) => <TableRow key={item.id}>
      <TableCell className="min-w-44 max-w-sm whitespace-normal font-medium break-words">{item.title}</TableCell>
      <TableCell>{item.category === "reclamo" ? "Reclamo" : "Consulta"}</TableCell><TableCell>{contractDate(item.createdAt)}</TableCell><TableCell><InquiryStatus status={item.status} /></TableCell>
      <TableCell className="text-right"><Button variant="outline" size="sm" aria-label={`Ver detalle: ${item.title}`} onClick={(event) => { detailTrigger.current = event.currentTarget; setSelectedId(item.id); }}><Eye className="size-4" aria-hidden="true" />Ver detalle</Button></TableCell>
    </TableRow>)}</TableBody></Table> : <div className="rounded-xl border border-dashed p-8 text-center"><MessageSquare className="mx-auto mb-3 size-7 text-muted-foreground" aria-hidden="true" /><p className="font-medium">Todavía no hay consultas</p><p className="mt-1 text-sm text-muted-foreground">{active ? "Usá Nueva consulta para contactar a tu inmobiliaria." : "No se registraron consultas para este contrato."}</p></div>}
    <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelectedId(null); }}>
      <DialogContent style={theme} onCloseAutoFocus={(event) => { event.preventDefault(); detailTrigger.current?.focus(); }} className="rounded-xl sm:max-w-2xl"><DialogHeader><DialogTitle className="break-words pr-5">{selected?.title}</DialogTitle><DialogDescription>Detalle de la consulta · {propertyTitle}</DialogDescription></DialogHeader>
        {selected && <div className="space-y-5"><dl className="grid gap-4 text-sm sm:grid-cols-3"><div><dt className="mb-1 text-muted-foreground">Estado actual</dt><dd><InquiryStatus status={selected.status} /></dd></div><div><dt className="mb-1 text-muted-foreground">Tipo</dt><dd>{selected.category === "reclamo" ? "Queja o reclamo" : "Consulta"}</dd></div><div><dt className="mb-1 text-muted-foreground">Fecha de creación</dt><dd>{contractDate(selected.createdAt)}</dd></div></dl>
          <div className="rounded-xl border p-4"><h3 className="mb-2 text-sm font-semibold">Tu mensaje</h3><p className="whitespace-pre-wrap break-words text-sm leading-6">{selected.description}</p></div>
          <div className="rounded-xl border bg-muted/40 p-4"><h3 className="mb-2 text-sm font-semibold">Respuesta de la inmobiliaria</h3><p className="whitespace-pre-wrap break-words text-sm leading-6">{selected.response || "Todavía no hay una respuesta registrada."}</p></div>
          <p className="break-all text-xs text-muted-foreground">Referencia: {selected.id}</p>
        </div>}
      </DialogContent>
    </Dialog>
  </section>;
}
