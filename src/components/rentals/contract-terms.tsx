"use client";
import { useActionState, useState } from "react";
import { saveContractTerms } from "@/actions/rental-financials";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableHead, TableRow, TableCell, TableBody } from "@/components/ui/table";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog";
import { contractAmount } from "@/lib/rental-contracts";

export type ContractTerms = { id: string; effectivePeriod: string; commissionRate: string; commissionBasis: string;
  adjustmentMethod: string; frequencyMonths: number | null; firstAdjustmentPeriod: string | null;
  fixedPercent: string | null; note: string; createdAt: string };
export type TermsOverview = { versions: ContractTerms[]; applicable: ContractTerms | null; nextAdjustmentPeriod: string | null;
  suggestedAmount: string | null; currentPeriod: string; overdue: boolean; status: string };
export const adjustmentLabels: Record<string, string> = { sin_actualizacion: "Sin actualización", manual: "Acuerdo manual", ICL: "ICL", IPC: "IPC", fijo: "Porcentaje fijo", otro: "Otro índice / acuerdo" };
export const commissionLabels: Record<string, string> = { alquiler_cobrado: "Alquiler cobrado", alquiler_periodo: "Alquiler del período" };
function TermsForm({ contractId, overview }: { contractId: string; overview: TermsOverview }) {
  const initial = overview.applicable;
  const [method, setMethod] = useState(initial?.adjustmentMethod ?? "sin_actualizacion");
  const [state, action, pending] = useActionState(saveContractTerms.bind(null, contractId), {});
  return <form action={action} className="space-y-4">
    <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="terms-effective">Condiciones desde el período</Label><Input id="terms-effective" type="month" name="effective_period" required defaultValue={overview.currentPeriod.slice(0,7)} /></div><div className="space-y-2"><Label htmlFor="terms-rate">Comisión de administración (%)</Label><Input id="terms-rate" name="commission_rate" required inputMode="decimal" pattern="[0-9]+(\.[0-9]{1,2})?" defaultValue={initial?.commissionRate ?? ""} placeholder="8.00" /></div></div>
    <div className="space-y-2"><Label htmlFor="terms-basis">Base de la comisión</Label><Select id="terms-basis" name="commission_basis" defaultValue={initial?.commissionBasis ?? "alquiler_cobrado"}>{Object.entries(commissionLabels).map(([key,label]) => <option value={key} key={key}>{label}</option>)}</Select><p className="text-xs text-muted-foreground">Sólo alquiler: excluye servicios, expensas y otros conceptos. Las liquidaciones siguen requiriendo el cobro completo.</p></div>
    <div className="space-y-2"><Label htmlFor="terms-method">Método de actualización</Label><Select id="terms-method" name="adjustment_method" value={method} onChange={e => setMethod(e.target.value)}>{Object.entries(adjustmentLabels).map(([key,label]) => <option key={key} value={key}>{label}</option>)}</Select></div>
    {method !== "sin_actualizacion" && <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="terms-frequency">Frecuencia (meses)</Label><Input id="terms-frequency" name="frequency_months" type="number" min={1} max={36} required defaultValue={initial?.frequencyMonths ?? 3} /></div><div className="space-y-2"><Label htmlFor="terms-first">Primera actualización</Label><Input id="terms-first" name="first_adjustment_period" type="month" required defaultValue={initial?.firstAdjustmentPeriod?.slice(0,7)} /></div></div>}
    {method === "fijo" && <div className="space-y-2"><Label htmlFor="terms-fixed">Aumento por actualización (%)</Label><Input id="terms-fixed" name="fixed_percent" required inputMode="decimal" defaultValue={initial?.fixedPercent ?? ""} /></div>}
    {["ICL","IPC","otro"].includes(method) && <p className="text-sm text-muted-foreground">Se agenda la revisión. El importe debe calcularse y confirmarse antes de registrar el ajuste; no se consultan índices externos.</p>}
    <div className="space-y-2"><Label htmlFor="terms-note">Acuerdo / motivo del cambio</Label><Textarea id="terms-note" name="note" required minLength={5} maxLength={1000} placeholder="Condiciones pactadas y motivo de esta versión" /></div>
    {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}{state.success && <p role="status" className="text-sm">{state.success}</p>}
    <Button disabled={pending || Boolean(state.success)}>{pending ? "Guardando…" : "Guardar condiciones"}</Button>
  </form>;
}
export function ContractTermsPanel({ contractId, overview }: { contractId: string; overview: TermsOverview }) {
  const current = overview.applicable;
  return <section className="space-y-4 rounded-xl border p-5"><header className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold">Comisión y reglas de actualización</h2><p className="text-sm text-muted-foreground">Condiciones por período, con historial de versiones. Los cambios no recalculan liquidaciones registradas.</p></div>{overview.status !== "finalizado" && <Dialog><DialogTrigger asChild><Button variant="outline">Configurar condiciones</Button></DialogTrigger><DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>Condiciones del contrato</DialogTitle><DialogDescription>Cada guardado crea una versión. Si corregís el mismo período, se utiliza la última versión guardada. No se permiten cambios que afecten liquidaciones activas.</DialogDescription></DialogHeader><TermsForm contractId={contractId} overview={overview} /></DialogContent></Dialog>}</header>
    {current ? <div className="grid gap-4 sm:grid-cols-3"><div><p className="text-sm text-muted-foreground">Comisión vigente</p><p>{current.commissionRate}% · {commissionLabels[current.commissionBasis]}</p></div><div><p className="text-sm text-muted-foreground">Actualización</p><p>{adjustmentLabels[current.adjustmentMethod]}{current.frequencyMonths ? ` · cada ${current.frequencyMonths} meses` : ""}{current.fixedPercent !== null ? ` · ${current.fixedPercent}%` : ""}</p></div><div><p className="text-sm text-muted-foreground">Próxima revisión</p><p>{overview.nextAdjustmentPeriod?.slice(0,7) ?? "Sin revisión pendiente"}</p>{overview.overdue && <Badge variant="outline" className="mt-1 border-amber-300 bg-amber-50 text-amber-900">Revisar actualización</Badge>}{overview.suggestedAmount && <p className="text-xs text-muted-foreground">Importe sugerido: {contractAmount(overview.suggestedAmount)}</p>}</div></div> : <p className="text-sm text-muted-foreground">No hay condiciones vigentes para el período actual. La comisión se registra manualmente hasta configurarlas.</p>}
    {!!overview.versions.length && <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Desde</TableHead><TableHead>Comisión</TableHead><TableHead>Actualización</TableHead><TableHead>Primera revisión</TableHead><TableHead>Motivo</TableHead></TableRow></TableHeader><TableBody>{overview.versions.map(v => <TableRow key={v.id}><TableCell>{v.effectivePeriod.slice(0,7)}<p className="text-xs text-muted-foreground">Registrado {new Date(v.createdAt).toLocaleString("es-AR", {timeZone:"America/Argentina/Buenos_Aires"})}</p></TableCell><TableCell>{v.commissionRate}%<p className="text-xs">{commissionLabels[v.commissionBasis]}</p></TableCell><TableCell>{adjustmentLabels[v.adjustmentMethod]}{v.frequencyMonths ? ` · ${v.frequencyMonths} meses` : ""}{v.fixedPercent !== null ? ` · ${v.fixedPercent}%` : ""}</TableCell><TableCell>{v.firstAdjustmentPeriod?.slice(0,7) ?? "—"}</TableCell><TableCell className="max-w-xs whitespace-normal">{v.note}</TableCell></TableRow>)}</TableBody></Table></div>}
  </section>;
}
