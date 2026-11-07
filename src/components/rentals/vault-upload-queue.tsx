"use client";
import {useRef,useState} from "react";
import {CheckCircle2,AlertCircle,Loader2,Upload,X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Select} from "@/components/ui/select";
import {MAX_VAULT_FILES,validateVaultFile,vaultFileTitle} from "@/lib/vault-upload-queue";
import {uploadVaultQueueFile} from "@/lib/upload-private-file";

type Item={id:string;file:File;title:string;status:"pending"|"uploading"|"done"|"error";error?:string;invalid?:boolean};
export function VaultUploadQueue({folderId,onBusy,onSaved}:{folderId?:string;onBusy:(busy:boolean)=>void;onSaved:()=>void}){
 const [items,setItems]=useState<Item[]>([]),[busy,setBusy]=useState(false),[dragging,setDragging]=useState(false),[notice,setNotice]=useState("");
 const lock=useRef(false);
 const [kind,setKind]=useState("otro");
 function add(files:File[]){
  if(lock.current)return;
  setItems(previous=>{
   const known=new Set(previous.map(i=>`${i.file.name}:${i.file.size}:${i.file.lastModified}`));
   const unique=files.filter(f=>{const key=`${f.name}:${f.size}:${f.lastModified}`;if(known.has(key))return false;known.add(key);return true;});
   return [...previous,...unique.slice(0,MAX_VAULT_FILES-previous.length).map(file=>{const error=validateVaultFile(file);return {id:crypto.randomUUID(),file,title:vaultFileTitle(file.name),status:error?"error" as const:"pending" as const,error,invalid:Boolean(error)};})];
  });
  setNotice("Hasta 20 archivos por lote. Los repetidos se omiten; si superás el límite, cargá el resto en otro lote.");
 }
 async function submit(){
  if(lock.current)return;
  lock.current=true;setBusy(true);onBusy(true);
  try {
   for(const item of items.filter(i=>i.status!=="done"&&!i.invalid)){
    setItems(prev=>prev.map(i=>i.id===item.id?{...i,status:"uploading",error:undefined}:i));
    const form=new FormData();form.set("file",item.file);form.set("title",item.title.trim());form.set("kind",kind);if(folderId)form.set("folderId",folderId);
    try {
     const result=await uploadVaultQueueFile(form);
     setItems(prev=>prev.map(i=>i.id===item.id?{...i,status:result.error?"error":"done",error:result.error}:i));
     if(!result.error)onSaved();
    }catch{setItems(prev=>prev.map(i=>i.id===item.id?{...i,status:"error",error:"No se pudo completar la carga. Reintentá este archivo."}:i));}
   }
  }finally{lock.current=false;setBusy(false);onBusy(false);}
 }
 const remaining=items.filter(i=>i.status!=="done"&&!i.invalid);
 return <div className="space-y-4">
  <div className={`rounded-md border-2 border-dashed p-5 text-center ${dragging?"border-primary bg-primary/5":"border-border"}`} onDragOver={e=>{e.preventDefault();if(!busy)setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={e=>{e.preventDefault();setDragging(false);add(Array.from(e.dataTransfer.files));}}>
   <Upload className="mx-auto mb-2 size-6 text-muted-foreground"/><Label htmlFor="vault-files">Arrastrá archivos aquí o seleccionalos</Label>
   <Input id="vault-files" className="mt-3" type="file" multiple disabled={busy} accept="application/pdf,image/jpeg,image/png,image/webp" onChange={e=>{add(Array.from(e.target.files??[]));e.target.value="";}}/>
   <p className="mt-2 text-xs text-muted-foreground">PDF, JPG, PNG o WebP. Hasta 10 MB por archivo. No se publican en portales.</p>
  </div>
  <div className="space-y-2"><Label htmlFor="vault-batch-kind">Categoría del lote</Label><Select id="vault-batch-kind" value={kind} onChange={e=>setKind(e.target.value)} disabled={busy}>{["contrato","comprobante","inventario","otro"].map(k=><option key={k} value={k}>{k}</option>)}</Select></div>
  {notice&&<p className="text-xs text-muted-foreground">{notice}</p>}
  <div className="max-h-64 space-y-3 overflow-y-auto" aria-live="polite">{items.map(item=><div key={item.id} className="rounded-md border p-3"><div className="flex items-center gap-2"><div className="min-w-0 flex-1"><p className="truncate text-xs text-muted-foreground" title={item.file.name}>{item.file.name}</p><Input aria-label={`Nombre de ${item.file.name}`} value={item.title} minLength={3} maxLength={160} disabled={busy||item.status==="done"} onChange={e=>setItems(prev=>prev.map(i=>i.id===item.id?{...i,title:e.target.value}:i))}/></div>{item.status==="done"?<CheckCircle2 className="size-5 text-green-600" aria-label="Guardado"/>:item.status==="uploading"?<Loader2 className="size-5 animate-spin" aria-label="Subiendo"/>:<Button size="icon" variant="ghost" disabled={busy} aria-label={`Quitar ${item.file.name}`} onClick={()=>setItems(prev=>prev.filter(i=>i.id!==item.id))}><X className="size-4"/></Button>}</div>{item.error&&<p className="mt-2 flex gap-1 text-xs text-destructive"><AlertCircle className="size-4 shrink-0"/>{item.error}</p>}</div>)}</div>
  <p role="status" className="text-sm text-muted-foreground">{items.filter(i=>i.status==="done").length} de {items.length} guardados</p>
  <Button onClick={submit} disabled={busy||!remaining.length||remaining.some(i=>i.title.trim().length<3)}>{busy?"Subiendo archivos…":items.some(i=>i.status==="error"&&!i.invalid)?"Reintentar pendientes":"Subir archivos"}</Button>
 </div>;
}
