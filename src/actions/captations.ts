"use server";
import {apiFetch,ApiError} from '@/lib/api';
import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
export async function saveCaptation(id:string|null,_state:{error?:string},form:FormData):Promise<{error?:string}>{
 const string=(key:string)=>String(form.get(key)??'').trim();
 const details:Record<string,unknown>={};
 for(const key of ['amenities','services','term','adjustment','deposit','guarantees','availability','keys','visits','notes','publication','currency'])details[key]=string(key);
 for(const key of ['bedrooms','bathrooms','coveredArea','totalArea','price','expenses'])details[key]=string(key)===''?null:Number(string(key));
 const body={title:string('title'),address:string('address'),city:string('city'),zone:string('zone'),type:string('type'),operation:string('operation'),status:string('status'),details,
 ...(form.has('assignedToId')?{assignedToId:string('assignedToId')}:{}),
 ...(form.has('ownerPersonId')?{ownerPersonId:string('ownerPersonId')||null}:{}),...(form.has('propertyId')?{propertyId:string('propertyId')||null}:{})};
 let saved:string;
 try{const {item}=await apiFetch<{item:{id:string}}>(id?`/v1/captations/${encodeURIComponent(id)}`:'/v1/captations',{method:id?'PATCH':'POST',body});saved=item.id;}
 catch(e){return {error:e instanceof ApiError?e.message:'No se pudo guardar la captación.'};}
 revalidatePath('/captaciones'); if(id)revalidatePath(`/captaciones/${id}`);redirect(`/captaciones/${saved}`);
}
