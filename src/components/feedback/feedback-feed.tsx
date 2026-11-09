import Link from 'next/link';
import {MessageSquare,Paperclip} from 'lucide-react';
import {Avatar,AvatarFallback} from '@/components/ui/avatar';
import {FeedbackEstadoBadge,FeedbackTipoBadge} from './estado-badge';
import type {FeedbackItem} from '@/lib/types';
import {formatDateTime} from '@/lib/utils';
export function FeedbackFeed({items}:{items:FeedbackItem[]}){
 return <ul className="divide-y border-y">{items.map(item=><li key={item.id}><Link aria-label={`Abrir publicación: ${item.titulo}`} href={`/feedback/${item.id}`} className="flex gap-3 py-5 px-2 transition-colors hover:bg-muted/40 focus-visible:outline-ring"><Avatar className="size-9 shrink-0"><AvatarFallback>{(item.autor?.nombre??'S').slice(0,2).toUpperCase()}</AvatarFallback></Avatar><article className="min-w-0 flex-1 space-y-2"><header className="flex flex-wrap items-center gap-x-3 gap-y-2"><span className="text-sm font-medium">{item.autor?.nombre??'Soporte'}</span><time className="text-xs text-muted-foreground" dateTime={item.created_at}>{formatDateTime(item.created_at)}</time><FeedbackTipoBadge tipo={item.tipo}/><FeedbackEstadoBadge estado={item.estado}/></header><h2 className="font-medium break-words">{item.titulo}</h2><p className="line-clamp-3 whitespace-pre-wrap break-words text-sm text-muted-foreground">{item.descripcion}</p><footer className="flex gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-1"><MessageSquare className="size-3.5"/>{item.comentarios_count?`${item.comentarios_count} ${item.comentarios_count === 1 ? "respuesta" : "respuestas"}`:'Responder'}</span>{item.adjuntos_count>0&&<span className="flex items-center gap-1"><Paperclip className="size-3.5"/>{item.adjuntos_count} adjuntos</span>}</footer></article></Link></li>)}</ul>;
}
