import Link from 'next/link';
import {notFound,redirect} from 'next/navigation';
import {apiFetch,ApiError,getCurrentUser} from '@/lib/api';
import {captationSummary,captationStatuses,type Captation} from '@/lib/captations';
import {ShareSummary} from '@/components/captations/share-summary';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
export const metadata={title:'Captación — Cubiko AI'};
export default async function Page({params}:{params:Promise<{id:string}>}){
 const me=await getCurrentUser();if(!me||!['admin','agente'].includes(me.rol))redirect('/');
 const {id}=await params;let item:Captation;
 try{item=(await apiFetch<{item:Captation}>(`/v1/captations/${id}`)).item;}catch(e){if(e instanceof ApiError&&e.status===404)notFound();throw e;}
 return <div className="mx-auto max-w-3xl space-y-6"><Button asChild variant="ghost" size="sm"><Link href="/captaciones">Volver a captaciones</Link></Button><header className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-semibold">{item.title}</h1><div className="mt-2 flex flex-wrap gap-3"><Badge variant="secondary">{captationStatuses[item.status]}</Badge><span className="text-sm text-muted-foreground">{item.assignedTo?.nombre}</span></div></div><Button asChild variant="outline"><Link href={`/captaciones/${id}/editar`}>Editar captación</Link></Button></header><section className="border-y py-6"><h2 className="mb-4 font-semibold">Ficha y resumen</h2><ShareSummary text={captationSummary(item)}/></section>{me.rol==='admin'&&<section><h2 className="mb-3 font-semibold">Vínculos</h2><div className="flex flex-wrap gap-2">{item.ownerPersonId?<Button asChild variant="outline"><Link href={`/clientes/${item.ownerPersonId}`}>Ver cliente</Link></Button>:<p className="text-sm text-muted-foreground">Sin cliente vinculado.</p>}{item.propertyId?<Button asChild variant="outline"><Link href={`/propiedades/${item.propertyId}`}>Ver propiedad</Link></Button>:<p className="text-sm text-muted-foreground">Sin propiedad vinculada.</p>}</div></section>}</div>;
}
