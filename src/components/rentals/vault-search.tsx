"use client";
import {useEffect,useRef,useState} from "react";
import {Search,X,Folder,FileText} from "lucide-react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Skeleton} from "@/components/ui/skeleton";
import {loadVaultFiles} from "@/actions/vault";
import type {VaultFolder} from "@/lib/vault";
import type {VaultFile} from "./file-vault";

type Props={query:string;filters:Record<string,string>;folders:VaultFolder[];onSearch:(q:string)=>void;onFile:(file:VaultFile)=>void;onFolder:(folder:VaultFolder)=>void};
export function VaultSearch({query,filters,folders,onSearch,onFile,onFolder}:Props){
 const [text,setText]=useState(query),[focused,setFocused]=useState(false);
 const [result,setResult]=useState<{q:string;files:VaultFile[];error?:string}|null>(null);
 const root=useRef<HTMLDivElement>(null);
 const [asOf]=useState(()=>Date.now());
 const q=text.trim();
 const filterKey=JSON.stringify(filters);
 useEffect(()=>{
  if(!q)return;
  let active=true;
  const timer=setTimeout(async()=>{
   try {
    const response=await loadVaultFiles({...JSON.parse(filterKey),q},"",1,5);
    if(active)setResult({q,files:response.data,error:response.error});
   } catch { if(active)setResult({q,files:[],error:"No pudimos buscar. Intentá nuevamente."}); }
  },350);
  return ()=>{active=false;clearTimeout(timer);};
 },[q,filterKey]);
 const matchingFolders=folders.filter(f=>f.name.toLocaleLowerCase().includes(q.toLocaleLowerCase())&&(!filters.accessMode||f.accessMode===filters.accessMode)&&!(filters.kind||filters.visibility||filters.dossierKind)&&(!filters.modified||new Date(f.updatedAt??f.createdAt??0).getTime()>=asOf-(filters.modified==="day"?1:filters.modified==="week"?7:30)*86400000)).slice(0,3);
 const loading=result?.q!==q;
 return <div ref={root} className="relative w-full" onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setFocused(false);}} onKeyDown={e=>{if(e.key==="Escape")setFocused(false);}}>
  <form onSubmit={e=>{e.preventDefault();setFocused(false);onSearch(q);}} className="flex w-full items-center rounded-md bg-muted/60 p-1.5">
   <Search className="ml-3 size-5 shrink-0 text-muted-foreground"/>
   <Input name="q" aria-label="Buscar en la bóveda" aria-expanded={focused&&Boolean(q)} aria-controls="vault-suggestions" autoComplete="off" placeholder="Buscar archivos y carpetas" value={text} onFocus={()=>setFocused(true)} onChange={e=>{setText(e.target.value);setFocused(true);if(!e.target.value)onSearch("");}} maxLength={160} className="min-w-0 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"/>
   {text&&<Button type="button" variant="ghost" size="icon" className="shrink-0 rounded-md" aria-label="Limpiar búsqueda" onClick={()=>{setText("");setFocused(false);onSearch("");}}><X className="size-4"/></Button>}
  </form>
  {focused&&q&&<div id="vault-suggestions" aria-label="Sugerencias de búsqueda" className="absolute inset-x-0 top-full z-30 mt-2 rounded-xl border bg-popover p-2 text-popover-foreground shadow-lg">
   {loading?<div role="status" aria-label="Buscando coincidencias" className="space-y-2 p-2"><Skeleton className="h-10 w-full"/><Skeleton className="h-10 w-full"/></div>:result?.error?<p role="alert" className="p-3 text-sm text-destructive">{result.error}</p>:<>
    {matchingFolders.map(folder=><Button key={folder.id} type="button" variant="ghost" className="w-full justify-start" onClick={()=>{setFocused(false);onFolder(folder);}}><Folder className="size-4 shrink-0"/><span className="truncate">{folder.name}</span></Button>)}
    {result?.files.map(file=><Button key={file.id} type="button" variant="ghost" className="w-full justify-start" onClick={()=>{setFocused(false);onFile(file);}}><FileText className="size-4 shrink-0"/><span className="truncate">{file.title}</span></Button>)}
    {!matchingFolders.length&&!result?.files.length&&<p className="p-3 text-sm text-muted-foreground">No encontramos coincidencias.</p>}
   </>}
   <Button type="button" variant="ghost" className="mt-1 w-full justify-end text-primary" onClick={()=>{setFocused(false);onSearch(q);}}>Ver todos los resultados</Button>
  </div>}
 </div>;
}
