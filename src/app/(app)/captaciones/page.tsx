import Link from 'next/link';
import {redirect} from 'next/navigation';
import {Plus} from 'lucide-react';
import {apiFetch,getCurrentUser} from '@/lib/api';
import {captationStatuses,captationTypes,type Captation} from '@/lib/captations';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Select} from '@/components/ui/select';
import {Badge} from '@/components/ui/badge';
import {Table,TableHeader,TableBody,TableRow,TableHead,TableCell} from '@/components/ui/table';
import {formatDate} from '@/lib/utils';
export const metadata={title:'Captaciones — Cubiko AI'};
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}){
 const me=await getCurrentUser();if(!me||!['admin','agente'].includes(me.rol))redirect('/');
 const p=await searchParams,q=(p.q??'').slice(0,160),status=p.status&&p.status in captationStatuses?p.status:'',page=Math.max(1,Math.min(100000,Number(p.page)||1));
 const result=await apiFetch<{data:Captation[];meta:{total:number;limit:number}}>('/v1/captations',{query:{q:q||undefined,status:status||undefined,page}});
 const href=(n:number)=>`/captaciones?${new URLSearchParams({q,status,page:String(n)})}`;
 return <div className="space-y-6"><header className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-semibold">Captaciones</h1><p className="text-sm text-muted-foreground">{me.rol==='admin'?'Inmuebles en evaluación y preparación del equipo.':'Las captaciones a tu cargo.'}</p></div><Button asChild><Link href="/captaciones/nueva"><Plus/>Nueva captación</Link></Button></header>
 <form action="/captaciones" className="flex flex-wrap gap-3"><Input className="min-w-48 flex-1" name="q" aria-label="Buscar captaciones" placeholder="Buscar por título o dirección" defaultValue={q}/><Select name="status" aria-label="Estado de captación" defaultValue={status}><option value="">Todos los estados</option>{Object.entries(captationStatuses).map(([v,l])=><option key={v} value={v}>{l}</option>)}</Select><Button type="submit" variant="outline">Filtrar</Button>{(q||status)&&<Button asChild variant="ghost"><Link href="/captaciones">Limpiar</Link></Button>}</form>
 <Table><TableHeader><TableRow><TableHead>Inmueble</TableHead><TableHead>Estado</TableHead>{me.rol==='admin'&&<TableHead>Responsable</TableHead>}<TableHead>Actualizada</TableHead></TableRow></TableHeader><TableBody>{result.data.map(c=><TableRow key={c.id}><TableCell className="py-4"><Link href={`/captaciones/${c.id}`} className="font-medium hover:underline">{c.title}</Link><p className="mt-1 text-xs text-muted-foreground">{captationTypes[c.type]} · {c.address} · {c.city}</p></TableCell><TableCell><Badge variant="secondary">{captationStatuses[c.status]}</Badge></TableCell>{me.rol==='admin'&&<TableCell>{c.assignedTo?.nombre??'—'}</TableCell>}<TableCell className="text-xs text-muted-foreground">{formatDate(c.updatedAt)}</TableCell></TableRow>)}{!result.data.length&&<TableRow><TableCell colSpan={me.rol==='admin'?4:3} className="py-14 text-center text-muted-foreground">No hay captaciones con estos filtros.</TableCell></TableRow>}</TableBody></Table>
 <footer className="flex items-center justify-between border-t pt-4 text-sm text-muted-foreground"><span>{result.meta.total} captaciones</span><nav aria-label="Páginas de captaciones" className="flex gap-3">{page>1&&<Button asChild variant="outline"><Link href={href(page-1)}>Anterior</Link></Button>}{page*result.meta.limit<result.meta.total&&<Button asChild variant="outline"><Link href={href(page+1)}>Siguiente</Link></Button>}</nav></footer></div>;
}
