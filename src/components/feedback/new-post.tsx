"use client";
import {useState} from 'react';
import {MessageSquarePlus} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import {Select} from '@/components/ui/select';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription,DialogTrigger} from '@/components/ui/dialog';
import {ReporteForm} from './reporte-form';
import {SugerenciaForm} from './sugerencia-form';
export function NewFeedbackPost(){
 const [type,setType]=useState('sugerencia');
 return <Dialog><DialogTrigger asChild><Button><MessageSquarePlus/>Nueva publicación</Button></DialogTrigger><DialogContent className="max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle>Publicar feedback</DialogTitle><DialogDescription>Compartí una idea o reportá un problema con la comunidad de Cubiko.</DialogDescription></DialogHeader><div className="space-y-2"><Label htmlFor="feedback-type">Tipo de publicación</Label><Select id="feedback-type" value={type} onChange={e=>setType(e.target.value)}><option value="sugerencia">Idea o sugerencia</option><option value="error">Problema o error</option></Select></div>{type==='error'?<ReporteForm/>:<SugerenciaForm/>}</DialogContent></Dialog>;
}
