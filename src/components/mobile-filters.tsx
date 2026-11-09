"use client";
import {useState,type ReactNode} from 'react';
import {SlidersHorizontal} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Sheet,SheetContent,SheetHeader,SheetTitle,SheetDescription,SheetTrigger,SheetClose} from '@/components/ui/sheet';
import {useIsMobile} from '@/hooks/use-mobile';
export function MobileFilters({children,count}:{children:ReactNode;count:number}){
 const mobile=useIsMobile(),[open,setOpen]=useState(false);
 if(!mobile)return <>{children}</>;
 return <Sheet open={open} onOpenChange={setOpen}><SheetTrigger asChild><Button variant="outline" className="min-h-11"><SlidersHorizontal/>Filtros{count>0?` (${count})`:''}</Button></SheetTrigger><SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto pb-[max(1rem,env(safe-area-inset-bottom))]"><SheetHeader><SheetTitle>Filtrar resultados</SheetTitle><SheetDescription>Los filtros se aplican al elegir una opción.</SheetDescription></SheetHeader><div className="space-y-4 px-4">{children}<SheetClose asChild><Button className="w-full min-h-11">Ver resultados</Button></SheetClose></div></SheetContent></Sheet>;
}
