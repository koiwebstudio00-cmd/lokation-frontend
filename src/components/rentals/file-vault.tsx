"use client";

import Image from "next/image";
import Link from "next/link";
import { FileText, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { DeleteDocument, RentalDocuments, type RentalDocument } from "@/components/rentals/documents";
import { formatDate } from "@/lib/utils";

export type VaultFile = RentalDocument & { mimeType: string; originalName: string | null; contractId: string | null; contract: null | {
  property: { id: string; titulo: string }; owner: { nombre: string }; tenantPerson: { nombre: string };
} };

export function FileVault({ files }: { files: VaultFile[] }) {
  if (!files.length) return <div className="rounded-xl border border-dashed p-12 text-center">
    <FileText className="mx-auto mb-3 size-8 text-muted-foreground" aria-hidden />
    <h2 className="font-medium">No hay archivos para mostrar</h2>
    <p className="mt-2 text-sm text-muted-foreground">Probá otros filtros o subí un archivo a la bóveda.</p>
    <Button asChild variant="outline" className="mt-4"><Link href="/alquileres/contratos">Ir a contratos</Link></Button>
  </div>;
  return <div className="rounded-xl border"><Table>
    <TableHeader><TableRow><TableHead>Archivo</TableHead><TableHead>Propiedad</TableHead><TableHead>Visibilidad</TableHead><TableHead>Fecha</TableHead><TableHead><span className="sr-only">Acciones</span></TableHead></TableRow></TableHeader>
    <TableBody>{files.map(file => <TableRow key={file.id}>
      <TableCell><div className="flex items-center gap-3"><FileText className="size-5 shrink-0 text-primary" aria-hidden /><div><p className="font-medium">{file.title}</p><p className="text-xs text-muted-foreground capitalize">{file.kind} · {file.mimeType.split("/")[1].toUpperCase()} · {(file.size / 1024).toFixed(1)} KB</p></div></div></TableCell>
      <TableCell>{file.contract ? <><Link className="hover:underline" href={`/alquileres/contratos/${file.contractId}`}>{file.contract.property.titulo}</Link><p className="text-xs text-muted-foreground">{file.contract?.owner.nombre ?? "—"}</p></> : <span className="text-muted-foreground">Independiente</span>}</TableCell>
      <TableCell><Badge variant="secondary" className="capitalize">{file.visibility}</Badge></TableCell>
      <TableCell>{formatDate(file.createdAt)}</TableCell>
      <TableCell><div className="flex justify-end gap-2">
        <Button asChild variant="ghost" size="icon"><a href={`/api/rental-documents/${file.id}`} aria-label={`Descargar ${file.title}`}><Download className="size-4" /></a></Button>
        <Dialog><DialogTrigger asChild><Button variant="outline" size="sm"><Eye className="size-4" />Ver detalle</Button></DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>{file.title}</DialogTitle><DialogDescription>{file.contract ? `Vinculado a ${file.contract.property.titulo}` : "Archivo independiente · Acceso interno"}</DialogDescription></DialogHeader>
            <dl className="grid gap-4 text-sm sm:grid-cols-2"><div><dt className="text-muted-foreground">Propietario</dt><dd>{file.contract?.owner.nombre ?? "—"}</dd></div><div><dt className="text-muted-foreground">Inquilino</dt><dd>{file.contract?.tenantPerson.nombre ?? "—"}</dd></div><div><dt className="text-muted-foreground">Tamaño</dt><dd>{(file.size / 1024).toFixed(1)} KB</dd></div><div><dt className="text-muted-foreground">Cargado</dt><dd>{formatDate(file.createdAt)}</dd></div></dl>
            {file.originalName && <p className="break-all text-sm text-muted-foreground">Nombre original: {file.originalName}</p>}
            {file.mimeType.startsWith("image/") && <Image src={`/api/rental-documents/${file.id}?preview=1`} alt={file.title} width={800} height={600} unoptimized className="max-h-80 w-full rounded-lg object-contain" />}
            {file.contractId ? <RentalDocuments contractId={file.contractId} documents={[file]} /> : <div className="flex gap-2"><Button asChild><a href={`/api/rental-documents/${file.id}`}>Descargar</a></Button><DeleteDocument contractId={null} id={file.id} /></div>}
            {file.contractId && <Button asChild variant="outline"><Link href={`/alquileres/contratos/${file.contractId}`}>Abrir contrato completo</Link></Button>}
          </DialogContent>
        </Dialog>
      </div></TableCell>
    </TableRow>)}</TableBody>
  </Table></div>;
}
