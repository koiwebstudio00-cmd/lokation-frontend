"use client";
import {useState,useTransition,useId} from "react";
import {useRouter} from "next/navigation";
import {FolderPlus,Settings2} from "lucide-react";
import {saveVaultItem} from "@/actions/vault";
import {type VaultAccess,type VaultFolder,type VaultUser,accessLabels,folderPath} from "@/lib/vault";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Select} from "@/components/ui/select";
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription,DialogTrigger} from "@/components/ui/dialog";

type Item=VaultAccess & {id:string;name:string;parentId:string|null};
type Props={open?:boolean;onOpenChange?:(open:boolean)=>void;kind:"folder"|"file";item?:Item;parentId?:string|null;folders:VaultFolder[];users:VaultUser[];admin:boolean};
export function VaultItemEditor(props:Props){
 const [internalOpen,setInternalOpen]=useState(false);
 const open=props.open??internalOpen;
 const setOpen=props.onOpenChange??setInternalOpen;
 return <Dialog open={open} onOpenChange={setOpen}>{props.open===undefined&&<DialogTrigger asChild><Button variant="outline" size={props.item?"sm":"default"}>{props.item?<Settings2 className="size-4"/>:<FolderPlus className="size-4"/>}{props.item?"Organizar":"Nueva carpeta"}</Button></DialogTrigger>}<DialogContent className="max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>{props.item?`Organizar ${props.kind==="file"?"archivo":"carpeta"}`:"Nueva carpeta"}</DialogTitle><DialogDescription>Los vínculos con contratos y la visibilidad en portales se conservan. Los administradores siempre tienen acceso.</DialogDescription></DialogHeader><EditorForm {...props} onDone={()=>setOpen(false)}/></DialogContent></Dialog>;
}
function EditorForm({kind,item,parentId,folders,users,admin,onDone}:Props & {onDone:()=>void}){
 const prefix=useId(),router=useRouter();
 const [name,setName]=useState(item?.name??"");
 const [parent,setParent]=useState(item?.parentId??parentId??"");
 const [access,setAccess]=useState<VaultAccess>(item??{accessMode:parentId?"inherit":"admin",teamPermission:"read",grants:[]});
 const [confirmed,setConfirmed]=useState(false),[error,setError]=useState("");
 const [pending,startTransition]=useTransition();
 const moved=Boolean(item&&parent!==(item.parentId??""));
 const descendants=new Set<string>();
 if(kind==="folder"&&item){descendants.add(item.id);let changed=true;while(changed){changed=false;for(const f of folders)if(f.parentId&&descendants.has(f.parentId)&&!descendants.has(f.id)){descendants.add(f.id);changed=true;}}}
 const destinations=folders.filter(f=>f.canEdit&&!descendants.has(f.id));
 return <form className="space-y-4" onSubmit={event=>{event.preventDefault();setError("");startTransition(async()=>{
   const body=item?{[kind==="folder"?"name":"title"]:name,...(admin?{[kind==="folder"?"parentId":"folderId"]:parent||null,access,confirmAccessChange:confirmed}:{})}:{name,parentId:parent||null};
   const result=await saveVaultItem(kind,item?.id??null,body);if(result.error)setError(result.error);else{router.refresh();onDone();}
 });}}>
 <div className="space-y-2"><Label htmlFor={`${prefix}-name`}>Nombre</Label><Input id={`${prefix}-name`} required minLength={kind==="file"?3:1} maxLength={160} value={name} onChange={e=>setName(e.target.value)}/></div>
 {(admin||!item)&&<div className="space-y-2"><Label htmlFor={`${prefix}-parent`}>Ubicación</Label><Select id={`${prefix}-parent`} value={parent} onChange={e=>{setParent(e.target.value);setConfirmed(false);if(!e.target.value&&access.accessMode==="inherit")setAccess({...access,accessMode:"admin"});}}>{admin&&<option value="">Todos los archivos (raíz)</option>}{destinations.map(f=><option key={f.id} value={f.id}>{folderPath(f,folders)}</option>)}</Select></div>}
 {admin&&item&&<fieldset className="space-y-3 rounded-lg border p-3"><legend className="px-1 text-sm font-medium">Acceso del equipo</legend>
 <Label htmlFor={`${prefix}-mode`}>Quién puede acceder</Label><Select id={`${prefix}-mode`} value={access.accessMode} onChange={e=>setAccess({...access,accessMode:e.target.value as VaultAccess["accessMode"]})}>{Object.entries(accessLabels).filter(([key])=>key!=="inherit"||parent).map(([key,label])=><option key={key} value={key}>{label}</option>)}</Select>
 {access.accessMode==="team"&&<><Label htmlFor={`${prefix}-team`}>Permiso del equipo</Label><Select id={`${prefix}-team`} value={access.teamPermission} onChange={e=>setAccess({...access,teamPermission:e.target.value as "read"|"edit"})}><option value="read">Lectura y descarga</option><option value="edit">Edición</option></Select></>}
 {access.accessMode==="selected"&&<div className="space-y-3">{users.map(user=>{const grant=access.grants.find(g=>g.userId===user.id);return <div key={user.id} className="grid grid-cols-2 items-center gap-2"><Label htmlFor={`${prefix}-${user.id}`}>{user.nombre}</Label><Select id={`${prefix}-${user.id}`} value={grant?.permission??"none"} onChange={e=>setAccess({...access,grants:[...access.grants.filter(g=>g.userId!==user.id),...(e.target.value==="none"?[]:[{userId:user.id,permission:e.target.value as "read"|"edit"}])]})}><option value="none">Sin acceso</option><option value="read">Lectura</option><option value="edit">Edición</option></Select></div>;})}</div>}
 <p className="text-xs text-muted-foreground">Las carpetas superiores también deben permitir el acceso. Lectura permite descargar; edición permite renombrar, subir archivos y crear subcarpetas. Solo administradores pueden mover, compartir o eliminar.</p>
 </fieldset>}
 {!item&&<p className="text-sm text-muted-foreground">La carpeta heredará el acceso de su ubicación. En la raíz será privada para administradores. Luego podés administrar sus permisos.</p>}
 {moved&&<div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm"><p>Mover cambia los permisos heredados, también en el contenido de una carpeta. Revisá quién podrá acceder en el destino.</p><Label className="mt-3 flex items-center gap-2"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/>Confirmo el cambio de ubicación y acceso</Label></div>}
 {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
 <Button type="submit" disabled={pending||(moved&&!confirmed)}>{pending?"Guardando…":"Guardar cambios"}</Button>
 </form>;
}
