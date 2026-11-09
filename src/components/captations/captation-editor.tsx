import Link from 'next/link';
import {redirect,notFound} from 'next/navigation';
import {apiFetch,ApiError,getCurrentUser} from '@/lib/api';
import {CaptationForm} from './captation-form';
import type {Captation} from '@/lib/captations';
import {Button} from '@/components/ui/button';
export async function CaptationEditor({id}:{id?:string}){
 const me=await getCurrentUser(); if(!me||!['admin','agente'].includes(me.rol))redirect('/');
 const admin=me.rol==='admin';
 let item:Captation|undefined;
 if(id){try{item=(await apiFetch<{item:Captation}>(`/v1/captations/${id}`)).item;}catch(e){if(e instanceof ApiError&&e.status===404)notFound();throw e;}}
 const [users,client,property]=await Promise.all([
 admin?apiFetch<{data:{id:string;nombre:string;rol:string}[]}>('/v1/users',{query:{estado:'activo'}}):Promise.resolve({data:[]}),
 admin&&item?.ownerPersonId?apiFetch<{person:{id:string;nombre:string}}>(`/v1/clients/${item.ownerPersonId}`):Promise.resolve(null),
 admin&&item?.propertyId?apiFetch<{property:{id:string;titulo:string}}>(`/v1/properties/${item.propertyId}`):Promise.resolve(null),
 ]);
 return <div className="mx-auto max-w-3xl space-y-6"><header><Button asChild variant="ghost" size="sm"><Link href={id?`/captaciones/${id}`:'/captaciones'}>Volver</Link></Button><h1 className="mt-3 text-2xl font-semibold">{id?'Editar captación':'Nueva captación'}</h1><p className="mt-1 text-sm text-muted-foreground">Registrá la información antes de ofrecer o publicar un inmueble.</p></header><CaptationForm item={item} members={users.data.filter(u=>['admin','agente'].includes(u.rol))} admin={admin} userId={me.id} initialClient={client?{id:client.person.id,label:client.person.nombre}:undefined} initialProperty={property?{id:property.property.id,label:property.property.titulo}:undefined}/></div>;
}
