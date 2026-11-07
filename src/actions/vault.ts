"use server";
import {revalidatePath} from "next/cache";
import {z} from "zod";
import {apiFetch,ApiError} from "@/lib/api";
export async function saveVaultItem(kind:"folder"|"file",id:string|null,body:unknown):Promise<{error?:string;success?:boolean}> {
  if(!["folder","file"].includes(kind)||(id&&!z.uuid().safeParse(id).success)||(!id&&kind!=="folder"))return {error:"Elemento inválido."};
  try{
    const result=await apiFetch<{document?:{id:string}}>(`/v1/${kind==="folder"?"vault-folders":"rental-documents"}${id?`/${id}`:""}`,{method:id?"PATCH":"POST",body});
    void result;
    revalidatePath("/archivos");
    revalidatePath("/alquileres/contratos","layout");
    return {success:true};
  }catch(error){return {error:error instanceof ApiError?error.message:"No pudimos guardar los cambios."};}
}

export async function loadVaultFiles(filters:Record<string,string>,folderId:string,page=1,limit=15) {
  try {
    const allowed=["state","q","kind","visibility","dossierKind","accessMode","modified","sort","direction"];
    const query=Object.fromEntries(Object.entries(filters).filter(([key,value])=>allowed.includes(key)&&value));
    const result=await apiFetch<{data:import("@/components/rentals/file-vault").VaultFile[];meta:{total:number}}>("/v1/rental-documents",{query:{...query,page,limit,...(!query.q&&query.state!=="trash"?{folderId:folderId||"root"}:{})}});
    return {data:result.data,total:result.meta.total};
  } catch(error) {
    return {error:error instanceof ApiError?error.message:"No pudimos cargar los archivos.",data:[],total:0};
  }
}

export async function batchVaultFiles(body:{ids:string[];folderIds?:string[];action:"move"|"trash"|"restore";folderId?:string|null;confirmAccessChange?:boolean}){
 try{
  await apiFetch('/v1/rental-documents/batch',{method:'POST',body});
  revalidatePath('/archivos');revalidatePath('/alquileres/contratos','layout');
  return {success:true};
 }catch(error){return {error:error instanceof ApiError?error.message:'No pudimos completar la operación.'};}
}

export async function loadVaultActivity(entityId?:string,page=1){
 try{return await apiFetch<{data:import('@/lib/vault').VaultActivity[];meta:{total:number}}>('/v1/vault-activity',{query:{...(entityId?{entityId}:{}),page}});}
 catch(error){return {error:error instanceof ApiError?error.message:'No pudimos cargar la actividad.',data:[],meta:{total:0}};}
}
