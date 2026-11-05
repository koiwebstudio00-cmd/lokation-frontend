"use client";
import { useActionState } from "react";
import { createManagedProperty, adoptManagedProperty } from "@/actions/rental-options";
import { RentalOptionPicker } from "./option-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
function NewPropertyForm() {
  const [state, action, pending] = useActionState(createManagedProperty, {});
  return <form action={action} className="space-y-4"><div className="space-y-2"><Label htmlFor="managed-title">Nombre</Label><Input id="managed-title" name="titulo" required minLength={3} maxLength={160} /></div><div className="space-y-2"><Label htmlFor="managed-address">Dirección</Label><Input id="managed-address" name="direccion" required minLength={3} maxLength={300} /></div><div className="space-y-2"><Label htmlFor="managed-type">Tipo</Label><Select name="tipo" id="managed-type">{["departamento", "casa", "monoambiente", "duplex", "local_comercial", "oficina", "galpon", "estacionamiento", "terreno", "otro"].map(type => <option key={type} value={type}>{type.replaceAll("_", " ")}</option>)}</Select></div>{state.error && <p role="alert">{state.error}</p>}{state.success && <p role="status">{state.success}</p>}<Button disabled={pending || Boolean(state.success)}>{pending ? "Guardando…" : "Crear propiedad privada"}</Button></form>;
}
function AdoptPropertyForm() {
  const [state, action, pending] = useActionState(adoptManagedProperty, {});
  return <form action={action} className="space-y-4"><RentalOptionPicker name="property_id" title="Propiedad" kind="all-properties" />{state.error && <p role="alert">{state.error}</p>}{state.success && <p role="status">{state.success}</p>}<Button disabled={pending}>Incorporar a administración</Button></form>;
}
export function ManagedPropertyActions() {
  return <div className="flex flex-wrap gap-2"><Dialog><DialogTrigger asChild><Button variant="outline">Incorporar existente</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Incorporar propiedad</DialogTitle><DialogDescription>Se conserva la ficha y su publicación comercial actual.</DialogDescription></DialogHeader><AdoptPropertyForm /></DialogContent></Dialog><Dialog><DialogTrigger asChild><Button>Nueva propiedad privada</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Propiedad en administración</DialogTitle><DialogDescription>Queda fuera de la web pública, exportaciones y recomendaciones del agente de IA. Podés completar su ficha después.</DialogDescription></DialogHeader><NewPropertyForm /></DialogContent></Dialog></div>;
}
