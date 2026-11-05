"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { uploadVaultFile } from "@/actions/rental-documents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";

function UploadForm({ onDone }: { onDone: () => void }) {
  const [state, action, pending] = useActionState(uploadVaultFile, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.success) { ref.current?.reset(); onDone(); } }, [state, onDone]);
  return <form ref={ref} action={action} className="space-y-4">
    <div className="space-y-2"><Label htmlFor="vault-title">Nombre del archivo</Label><Input id="vault-title" name="title" required minLength={3} maxLength={160} /></div>
    <div className="space-y-2"><Label htmlFor="vault-kind">Categoría</Label><Select id="vault-kind" name="kind" defaultValue="otro">{["contrato", "comprobante", "inventario", "otro"].map(kind => <option key={kind} value={kind}>{kind}</option>)}</Select></div>
    <div className="space-y-2"><Label htmlFor="vault-file">Archivo</Label><Input id="vault-file" name="file" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" required /><p className="text-xs text-muted-foreground">PDF, JPG, PNG o WebP. Hasta 10 MB. No se publica ni se muestra en portales.</p></div>
    {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
    <Button type="submit" disabled={pending}>{pending ? "Subiendo…" : "Guardar archivo"}</Button>
  </form>;
}
export function VaultUpload() {
  const [open, setOpen] = useState(false);
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button><Upload className="size-4" />Subir archivo</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Subir a la bóveda</DialogTitle><DialogDescription>Archivo independiente, privado para los administradores de tu inmobiliaria.</DialogDescription></DialogHeader><UploadForm onDone={() => setOpen(false)} /></DialogContent></Dialog>;
}
