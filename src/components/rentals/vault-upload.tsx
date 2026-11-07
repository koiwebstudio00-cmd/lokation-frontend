"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {useRouter} from "next/navigation";
import {VaultUploadQueue} from "./vault-upload-queue";
import { dossierLabels } from "@/lib/rental-dossiers";
import { Upload } from "lucide-react";
import { uploadVaultFile } from "@/lib/upload-private-file";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";

export type DossierUploadContext = { contractId: string; people: { id: string; nombre: string }[] };

function UploadForm({ onDone, dossier, folderId }: { folderId?: string; onDone: () => void; dossier?: DossierUploadContext }) {
  const [state, action, pending] = useActionState(uploadVaultFile, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.success) { ref.current?.reset(); onDone(); } }, [state, onDone]);
  return <form ref={ref} action={action} className="space-y-4">
    {folderId && <input type="hidden" name="folderId" value={folderId} />}
    <div className="space-y-2"><Label htmlFor="vault-title">Nombre del archivo</Label><Input id="vault-title" name="title" required minLength={3} maxLength={160} /></div>
    {dossier && <><input type="hidden" name="contractId" value={dossier.contractId} /><input type="hidden" name="kind" value="otro" /><div className="space-y-2"><Label htmlFor="dossier-person">Persona del legajo</Label><Select id="dossier-person" name="personId" required>{dossier.people.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}</Select></div><div className="space-y-2"><Label htmlFor="dossier-kind">Documentación</Label><Select id="dossier-kind" name="dossierKind">{Object.entries(dossierLabels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</Select></div></>}
    {!dossier && <div className="space-y-2"><Label htmlFor="vault-kind">Categoría</Label><Select id="vault-kind" name="kind" defaultValue="otro">{["contrato", "comprobante", "inventario", "otro"].map(kind => <option key={kind} value={kind}>{kind}</option>)}</Select></div>}
    <div className="space-y-2"><Label htmlFor="vault-file">Archivo</Label><Input id="vault-file" name="file" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" required /><p className="text-xs text-muted-foreground">PDF, JPG, PNG o WebP. Hasta 10 MB. No se publica ni se muestra en portales.</p></div>
    {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
    <Button type="submit" disabled={pending}>{pending ? "Subiendo…" : "Guardar archivo"}</Button>
  </form>;
}
export function VaultUpload({ dossier, folderId }: { dossier?: DossierUploadContext; folderId?: string }) {
  const [open, setOpen] = useState(false);
  const [busy,setBusy]=useState(false);
  const saved=useRef(false);
  const router=useRouter();
  function changeOpen(next:boolean){if(busy)return;setOpen(next);if(!next&&saved.current){saved.current=false;router.refresh();}}
  return <Dialog open={open} onOpenChange={changeOpen}><DialogTrigger asChild><Button><Upload className="size-4" />Subir archivo</Button></DialogTrigger><DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl"><DialogHeader><DialogTitle>Subir a la bóveda</DialogTitle><DialogDescription>{dossier ? "Documentación del legajo, privada para los administradores de tu inmobiliaria." : folderId ? "El archivo heredará los permisos de esta carpeta." : "Archivo independiente, privado para los administradores de tu inmobiliaria."}</DialogDescription></DialogHeader>{dossier?<UploadForm folderId={folderId} dossier={dossier} onDone={() => setOpen(false)} />:<VaultUploadQueue folderId={folderId} onBusy={setBusy} onSaved={()=>{saved.current=true;}}/>}</DialogContent></Dialog>;
}
