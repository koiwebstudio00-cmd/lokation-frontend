"use client";
import {useState,useTransition} from "react";
import {useRouter} from "next/navigation";
import {batchVaultFiles} from "@/actions/vault";
import {type VaultFolder,folderPath} from "@/lib/vault";
import {Button} from "@/components/ui/button";
import {Select} from "@/components/ui/select";
import {Label} from "@/components/ui/label";
import {Checkbox} from "@/components/ui/checkbox";
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from "@/components/ui/dialog";
export type VaultBatch={ids:string[];folderIds?:string[];folderId?:string|null;action:"move"|"trash"|"restore"};
export function VaultBatchDialog({batch,folders,onClose}:{batch:VaultBatch;folders:VaultFolder[];onClose:()=>void}){
 const [destination,setDestination]=useState(batch.folderId??""),[confirmed,setConfirmed]=useState(false),[error,setError]=useState("");
 const [pending,startTransition]=useTransition();const router=useRouter();
 const title=batch.action==="move"?"Mover elementos":batch.action==="trash"?"Enviar a la papelera":"Restaurar elementos";
 return <Dialog open onOpenChange={open=>{if(!open&&!pending)onClose();}}><DialogContent><DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{batch.ids.length+(batch.folderIds?.length??0)} elemento(s). {batch.action==="trash"?"Las carpetas incluyen sus subcarpetas y archivos activos. Dejarán de estar disponibles en contratos y portales. Podés restaurarlos desde la papelera; se conservan sus vínculos y permisos durante 30 días. Luego se eliminan definitivamente.":batch.action==="restore"?"Se recuperará el contenido eliminado junto con cada carpeta; los elementos que ya estaban en la papelera permanecerán allí. Volverán a su carpeta original y conservarán sus vínculos y reglas de acceso. Se aplicarán los permisos actuales de esa carpeta y la visibilidad del portal.":"Se conservan los vínculos y permisos explícitos; el acceso heredado depende de la carpeta de destino."}</DialogDescription></DialogHeader>
 {batch.action==="move"&&<><Label htmlFor="batch-destination">Carpeta destino</Label><Select id="batch-destination" value={destination} disabled={pending} onChange={e=>setDestination(e.target.value)}><option value="">Mi unidad</option>{folders.map(f=><option key={f.id} value={f.id}>{folderPath(f,folders)}</option>)}</Select><label className="flex items-start gap-2 text-sm"><Checkbox checked={confirmed} disabled={pending} onCheckedChange={v=>setConfirmed(v===true)}/>Confirmo el cambio de acceso heredado al mover los archivos.</label></>}
 {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
 <div className="flex justify-end gap-2"><Button variant="outline" disabled={pending} onClick={onClose}>Cancelar</Button><Button disabled={pending||(batch.action==="move"&&!confirmed)} onClick={()=>startTransition(async()=>{try{const result=await batchVaultFiles({...batch,...(batch.action==="move"?{folderId:destination||null,confirmAccessChange:confirmed}:{})});if(result.error){setError(result.error);return;}onClose();router.refresh();}catch{setError("No pudimos completar la operación. Intentá nuevamente.");}})}>{pending?"Procesando…":title}</Button></div>
 </DialogContent></Dialog>;
}
