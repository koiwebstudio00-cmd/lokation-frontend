"use client";
import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { PersonForm } from "@/components/rentals/person-form";
import type { Client } from "@/lib/clients";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
export function ClientDialog({ person }: { person?: Client }) {
  const [open, setOpen] = useState(false);
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button variant={person ? "outline" : "default"}>{person ? <Pencil /> : <Plus />}{person ? "Editar cliente" : "Nuevo cliente"}</Button></DialogTrigger><DialogContent className="rounded-xl sm:max-w-xl"><DialogHeader><DialogTitle>{person ? "Editar cliente" : "Nuevo cliente"}</DialogTitle><DialogDescription>Una persona puede tener varios roles en tu inmobiliaria.</DialogDescription></DialogHeader><PersonForm person={person} onSuccess={() => { setOpen(false); toast.success(person ? "Cliente actualizado" : "Cliente agregado"); }} /></DialogContent></Dialog>;
}
