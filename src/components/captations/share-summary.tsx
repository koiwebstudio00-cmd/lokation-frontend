"use client";
import {useState} from 'react';
import {Copy,Check} from 'lucide-react';
import {Button} from '@/components/ui/button';
export function ShareSummary({text}:{text:string}){
 const [copied,setCopied]=useState(false),[error,setError]=useState('');
 return <div className="space-y-3"><p className="text-xs text-muted-foreground">El resumen incluye observaciones internas y datos de visitas. Revisalo antes de compartirlo.</p><pre className="whitespace-pre-wrap break-words font-sans text-sm leading-6">{text}</pre><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={async()=>{try{await navigator.clipboard.writeText(text);setCopied(true);setError('');}catch{setError('No pudimos copiar. Seleccioná el texto para copiarlo manualmente.');}}}>{copied?<Check/>:<Copy/>}{copied?'Copiado':'Copiar resumen'}</Button><Button asChild variant="secondary"><a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer">Compartir por WhatsApp</a></Button></div>{error&&<p role="alert" className="text-sm text-destructive">{error}</p>}</div>;
}
