"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { closeLeadOutcome, updateLeadEstado } from "@/actions/leads";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ESTADOS_LEAD, MOTIVOS_CIERRE, type EstadoLead } from "@/lib/types";

type Resultado = "ganada" | "perdida";
type Motivo = "no_califica" | "sin_respuesta" | "sin_interes" | "presupuesto" | "eligio_otra" | "otro";

export function LeadEstadoSelect({ leadId, estado }: { leadId: string; estado: EstadoLead }) {
  const [pending, startTransition] = useTransition();
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [operacion, setOperacion] = useState<"venta" | "alquiler" | "">("");
  const [motivo, setMotivo] = useState<Motivo | "">("");
  const [nota, setNota] = useState("");

  function cerrar() {
    if (resultado === "ganada" && !operacion) {
      toast.error("Indicá si se concretó una venta o un alquiler.");
      return;
    }
    if (resultado === "perdida" && !motivo) {
      toast.error("Indicá el motivo de la pérdida.");
      return;
    }
    if (!resultado) return;
    startTransition(async () => {
      const error = resultado === "ganada"
        ? await closeLeadOutcome(leadId, { resultado, operacion: operacion as "venta" | "alquiler", nota })
        : await closeLeadOutcome(leadId, { resultado, motivo: motivo as Motivo, nota });
      if (error) toast.error(error);
      else {
        toast.success("Cierre registrado");
        setResultado(null);
        setNota("");
      }
    });
  }

  return (
    <>
      <Select
        value={estado}
        disabled={pending}
        aria-label="Estado de la consulta"
        className="h-9 text-sm"
        onChange={(e) => {
          const value = e.target.value as EstadoLead;
          if (value === "ganada" || value === "perdida") {
            setResultado(value);
            return;
          }
          startTransition(async () => {
            const error = await updateLeadEstado(leadId, value);
            if (error) toast.error(error);
            else toast.success("Estado actualizado");
          });
        }}
      >
        {ESTADOS_LEAD.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
      </Select>
      {(estado === "ganada" || estado === "perdida") && (
        <Button type="button" size="sm" variant="ghost" disabled={pending} onClick={() => setResultado(estado)}>
          Corregir cierre
        </Button>
      )}
      <Dialog open={resultado !== null} onOpenChange={(open) => { if (!open && !pending) setResultado(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{resultado === "ganada" ? "Consulta ganada" : "Consulta perdida"}</DialogTitle>
            <DialogDescription>Registrá el resultado para que el equipo pueda consultar cómo terminó la gestión.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {resultado === "ganada" ? (
              <div className="space-y-2">
                <Label htmlFor="cierre-operacion">Operación concretada</Label>
                <Select id="cierre-operacion" value={operacion} onChange={(e) => setOperacion(e.target.value as typeof operacion)}>
                  <option value="">Elegí una opción</option>
                  <option value="venta">Venta</option>
                  <option value="alquiler">Alquiler</option>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="cierre-motivo">Motivo</Label>
                <Select id="cierre-motivo" value={motivo} onChange={(e) => setMotivo(e.target.value as Motivo | "")}>
                  <option value="">Elegí una opción</option>
                  {Object.entries(MOTIVOS_CIERRE).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="cierre-nota">Nota interna (opcional)</Label>
              <Textarea id="cierre-nota" value={nota} maxLength={1000} onChange={(e) => setNota(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={pending} onClick={() => setResultado(null)}>Cancelar</Button>
            <Button type="button" disabled={pending} onClick={cerrar}>{pending ? "Guardando..." : "Guardar cierre"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
