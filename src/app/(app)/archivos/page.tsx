import {Suspense} from "react";
import {cookies} from "next/headers";
import {notFound} from "next/navigation";
import {apiFetch,getCurrentUser} from "@/lib/api";
import {type VaultFolder,type VaultUser} from "@/lib/vault";
import {dossierLabels} from "@/lib/rental-dossiers";
import {type VaultFile} from "@/components/rentals/file-vault";
import {VaultBrowser} from "@/components/rentals/vault-browser";
import Loading from "./loading";
export const metadata={title:"Bóveda de archivos"};
type Params=Record<string,string|string[]|undefined>;
export default async function FilesPage({searchParams}:{searchParams:Promise<Params>}){
 const params=await searchParams;
 return <Suspense fallback={<Loading/>}><Contents params={params}/></Suspense>;
}
async function Contents({params}:{params:Params}){
 const value=(key:string)=>typeof params[key]==="string"?params[key] as string:"";
 const choice=(key:string,allowed:string[],fallback="")=>allowed.includes(value(key))?value(key):fallback;
 const filters={state:choice("state",["active","trash"],"active"),q:value("q").slice(0,160),kind:choice("kind",["contrato","comprobante","inventario","otro"]),visibility:choice("visibility",["interna","inquilino","propietario","ambos"]),dossierKind:choice("dossierKind",Object.keys(dossierLabels)),accessMode:choice("accessMode",["admin","inherit","team","selected"]),modified:choice("modified",["day","week","month"]),sort:choice("sort",["name","modified","size"],"name"),direction:choice("direction",["asc","desc"],"asc")};
 const preferred=(await cookies()).get("vault-view")?.value;
 const view=choice("view",["list","grid"],preferred==="grid"?"grid":"list") as "list"|"grid";
 const folderId=filters.state==="trash"?"":value("folder");
 const me=await getCurrentUser(),admin=me?.rol==="admin";
 const [{data:folders,asOf},usersResult]=await Promise.all([apiFetch<{data:VaultFolder[];asOf:string}>("/v1/vault-folders",{query:{state:admin?"all":"active"}}),admin?apiFetch<{data:(VaultUser & {rol?:string})[]}>("/v1/users",{query:{estado:"activo"}}):Promise.resolve({data:[] as (VaultUser & {rol?:string})[]})]);
 if(folderId&&!folders.some(f=>f.id===folderId&&!f.deletedAt))notFound();
 const result=await apiFetch<{data:VaultFile[];meta:{total:number;limit:number}}>("/v1/rental-documents",{query:{...filters,page:1,limit:15,...(!filters.q&&filters.state!=="trash"?{folderId:folderId||"root"}:{})}});
 const days=filters.modified==="day"?1:filters.modified==="week"?7:30;
 const visibleFolders=folders.filter(f=>(filters.state==="trash"?Boolean(f.deletedAt):!f.deletedAt)&&!(filters.kind||filters.visibility||filters.dossierKind)&&(filters.q?f.name.toLocaleLowerCase().includes(filters.q.toLocaleLowerCase()):(filters.state==="trash"||f.parentId===(folderId||null)))&&(!filters.accessMode||f.accessMode===filters.accessMode)&&(!filters.modified||new Date(f.updatedAt??f.createdAt??0).getTime()>=new Date(asOf).getTime()-days*86400000)).sort((a,b)=>{
  const comparison=filters.sort==="modified"?new Date(a.updatedAt??0).getTime()-new Date(b.updatedAt??0).getTime():a.name.localeCompare(b.name,"es");
  return (filters.direction==="asc"?1:-1)*(comparison||a.id.localeCompare(b.id));
 });
 return <VaultBrowser files={result.data} folders={folders} visibleFolders={visibleFolders} users={usersResult.data.filter(u=>u.rol!=="admin"&&u.rol!=="community")} admin={admin} community={me?.rol === "community"} folderId={folderId} view={view} filters={filters} total={result.meta.total}/>;
}
